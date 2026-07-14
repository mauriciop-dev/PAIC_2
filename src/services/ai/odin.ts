import OpenAI from "openai";
import { adminInsforge } from "@/lib/insforge";
import { buscarEnCursos } from "@/data/cursos";

const ODIN_MODEL = process.env.ODIN_MODEL ?? "openai/gpt-4o";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: { "HTTP-Referer": "https://paic2.app", "X-Title": "PAIC 2.0 - ODÍN" },
});

export type OdinMessage = {
  role: "system" | "user" | "assistant" | "tool";
  content: string;
  tool_call_id?: string;
};

export type OdinRequest = {
  messages: OdinMessage[];
  modo?: "chat" | "curso" | "agente";
  conjunto_id?: string;
};

const TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
  { type: "function", function: { name: "consultar_db", description: "Consulta datos de la base de datos de la copropiedad.", parameters: { type: "object", properties: { tabla: { type: "string", enum: ["residents","unidades","providers","internal_staff","incomes","expenses","tasks","visitor_logs","package_logs","due_dates","common_areas","reservations","camaras","carteleria_contenidos","conjuntos"] }, filtros: { type: "object" }, limite: { type: "number" } }, required: ["tabla"] } } },
  { type: "function", function: { name: "contar_db", description: "Cuenta registros en una tabla.", parameters: { type: "object", properties: { tabla: { type: "string", enum: ["residents","unidades","providers","internal_staff","incomes","expenses","tasks","visitor_logs","package_logs","due_dates","common_areas","reservations"] }, filtros: { type: "object" } }, required: ["tabla"] } } },
  { type: "function", function: { name: "sumar_columna", description: "Suma valores numéricos de una columna.", parameters: { type: "object", properties: { tabla: { type: "string", enum: ["incomes","expenses"] }, columna: { type: "string" }, filtros: { type: "object" } }, required: ["tabla","columna"] } } },
  { type: "function", function: { name: "guardar_memoria", description: "Guarda información en la memoria persistente.", parameters: { type: "object", properties: { tipo: { type: "string", enum: ["conversacion","decision","hecho","contexto"] }, contenido: { type: "string" } }, required: ["tipo","contenido"] } } },
  { type: "function", function: { name: "buscar_memoria", description: "Busca información en la memoria persistente.", parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } } },
  { type: "function", function: { name: "leer_logs", description: "Lee logs del sistema para diagnóstico.", parameters: { type: "object", properties: { fuente: { type: "string", enum: ["insforge.logs","postgREST.logs","postgres.logs","function.logs"] }, limite: { type: "number" } } } } },
  { type: "function", function: { name: "buscar_en_curso", description: "Busca en el curso de copropiedades.", parameters: { type: "object", properties: { query: { type: "string" } }, required: ["query"] } } },
];

const FK_MAP: Record<string, string> = { residents: "conjunto_id", unidades: "copropiedad_id", tasks: "conjunto_id", providers: "conjunto_id", internal_staff: "conjunto_id", visitor_logs: "conjunto_id", package_logs: "conjunto_id", incomes: "conjunto_id", expenses: "conjunto_id", due_dates: "conjunto_id", common_areas: "conjunto_id", reservations: "conjunto_id", camaras: "conjunto_id", carteleria_contenidos: "conjunto_id" };

async function ejecutarTool(tool: OpenAI.Chat.ChatCompletionMessageFunctionToolCall, conjuntoId?: string): Promise<string> {
  const args = JSON.parse(tool.function.arguments);
  switch (tool.function.name) {
    case "consultar_db": {
      const limite = args.limite ?? 10;
      let q = adminInsforge!.database.from(args.tabla).select("*");
      if (FK_MAP[args.tabla] && conjuntoId) q = q.eq(FK_MAP[args.tabla], conjuntoId);
      if (args.filtros) { for (const [col, val] of Object.entries(args.filtros)) q = q.eq(col, val); }
      const { data, error } = await q.limit(limite);
      if (error) return "Error DB: " + error.message;
      return JSON.stringify(data ?? [], null, 2);
    }
    case "contar_db": {
      let q = adminInsforge!.database.from(args.tabla).select("*", { count: "exact", head: true });
      if (FK_MAP[args.tabla] && conjuntoId) q = q.eq(FK_MAP[args.tabla], conjuntoId);
      if (args.filtros) { for (const [col, val] of Object.entries(args.filtros)) q = q.eq(col, val); }
      const { count, error } = await q;
      if (error) return "Error DB: " + error.message;
      return "Total: " + (count ?? 0);
    }
    case "sumar_columna": {
      let q = adminInsforge!.database.from(args.tabla).select("*");
      if (FK_MAP[args.tabla] && conjuntoId) q = q.eq(FK_MAP[args.tabla], conjuntoId);
      if (args.filtros) { for (const [col, val] of Object.entries(args.filtros)) q = q.eq(col, val); }
      const { data, error } = await q;
      if (error) return "Error DB: " + error.message;
      const total = (data ?? []).reduce((s: number, r: any) => s + (Number(r[args.columna]) || 0), 0);
      return "Total: $" + total.toLocaleString("es-CO");
    }
    case "guardar_memoria": {
      const { data, error } = await adminInsforge!.database.from("odin_memoria").insert([{ tipo: args.tipo, contenido: args.contenido, conjunto_id: conjuntoId ?? null }]).select();
      if (error) return "Error al guardar memoria: " + error.message;
      return "Memoria guardada (id: " + data?.[0]?.id + ")";
    }
    case "buscar_memoria": {
      const { data, error } = await adminInsforge!.database.from("odin_memoria").select("*").eq("conjunto_id", conjuntoId ?? "").order("created_at", { ascending: false }).limit(10);
      if (error) return "Error al buscar memoria: " + error.message;
      const q = (args.query ?? "").toLowerCase();
      const filtrados = (data ?? []).filter((r: any) => r.contenido.toLowerCase().includes(q) || r.tipo.toLowerCase().includes(q));
      if (filtrados.length === 0) return "No se encontraron resultados en la memoria.";
      return filtrados.map((m: any) => "[" + m.tipo + "] " + m.contenido + " (" + m.created_at + ")").join("\n");
    }
    case "leer_logs": {
      const results: any[] = [];
      const key = process.env.INSFORGE_API_KEY;
      const fuentes = args.fuente ? [args.fuente] : ["insforge.logs","postgREST.logs","postgres.logs","function.logs"];
      for (const src of fuentes) {
        try {
          const r = await fetch("https://6vgumkqu.us-east.insforge.app/api/logs/" + src + "?limit=" + (args.limite ?? 10), { headers: { Authorization: "Bearer " + key } });
          if (r.ok) results.push({ fuente: src, logs: Array.isArray(await r.json()) ? (await r.json()).slice(0, args.limite ?? 10) : [] });
        } catch {}
      }
      return JSON.stringify({ contenedores: results }, null, 2);
    }
    case "buscar_en_curso": { const r = buscarEnCursos(args.query); return r || "No se encontraron resultados en el curso."; }
    default: return "Tool desconocida: " + tool.function.name;
  }
}

export async function* odinStream(request: OdinRequest): AsyncGenerator<{ type: "text"; content: string } | { type: "tool"; name: string; status: "start" | "end" }> {
  const { messages, modo, conjunto_id } = request;
  let systemContent = "Eres ODÍN, el agente principal de PAIC 2.0. Tienes acceso a herramientas para consultar la base de datos, memoria persistente y logs. IMPORTANTE: Cuando el usuario te pida datos concretos, USA las herramientas disponibles. No inventes datos. Para escritura en DB, SIEMPRE pide confirmación antes de ejecutar.";
  if (modo === "curso") {
    const userQuery = messages.find((m) => m.role === "user")?.content ?? "";
    systemContent += "\n\nContexto del curso:\n" + buscarEnCursos(userQuery);
  }
  const odinMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: "system", content: systemContent },
    ...messages.map((m) => m.role === "tool" ? { role: "tool" as const, content: m.content, tool_call_id: m.tool_call_id! } : { role: m.role as "user" | "assistant", content: m.content }),
  ];
  let respuesta = await openai.chat.completions.create({ model: ODIN_MODEL, messages: odinMessages, tools: modo === "agente" ? TOOLS : undefined, tool_choice: modo === "agente" ? "auto" : undefined });
  let mensaje = respuesta.choices[0]?.message;
  let iterations = 0;
  while (mensaje?.tool_calls && mensaje.tool_calls.length > 0 && iterations < 5) {
    iterations++;
    const toolResults: { role: "tool"; tool_call_id: string; content: string }[] = [];
    for (const tc of mensaje.tool_calls) {
      if (tc.type !== "function") continue;
      yield { type: "tool", name: tc.function.name, status: "start" };
      const result = await ejecutarTool(tc, conjunto_id);
      yield { type: "tool", name: tc.function.name, status: "end" };
      toolResults.push({ role: "tool", tool_call_id: tc.id, content: result });
    }
    odinMessages.push(mensaje as OpenAI.Chat.ChatCompletionMessageParam);
    for (const tr of toolResults) odinMessages.push(tr);
    respuesta = await openai.chat.completions.create({ model: ODIN_MODEL, messages: odinMessages, tools: TOOLS, tool_choice: "auto" });
    mensaje = respuesta.choices[0]?.message;
  }
  const textoFinal = mensaje?.content ?? "";
  if (textoFinal) yield { type: "text", content: textoFinal };
}
