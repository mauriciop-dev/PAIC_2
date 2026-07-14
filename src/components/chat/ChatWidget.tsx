import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Zap, BookOpen, Bot } from "lucide-react";

type Modo = "chat" | "curso" | "agente";
type Message = { role: "user" | "assistant"; content: string };

const MODOS: { id: Modo; label: string; icon: typeof Bot }[] = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "curso", label: "Curso", icon: BookOpen },
  { id: "agente", label: "ODÍN", icon: Zap },
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [modo, setModo] = useState<Modo>("chat");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "¡Hola! Soy PAIC-AI. ¿En qué puedo ayudarte?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [toolRunning, setToolRunning] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      if (modo === "agente") {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [userMsg], modo: "agente", stream: true }),
        });
        const reader = res.body?.getReader();
        if (!reader) return;
        const decoder = new TextDecoder();
        let fullText = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "text") {
                  fullText += data.content;
                  setMessages((prev) => {
                    const newMsgs = [...prev];
                    const last = newMsgs[newMsgs.length - 1];
                    if (last?.role === "assistant" && last.content.startsWith(fullText.slice(0, -data.content.length) || "")) {
                      newMsgs[newMsgs.length - 1] = { ...last, content: fullText };
                    } else {
                      newMsgs.push({ role: "assistant", content: fullText });
                    }
                    return newMsgs;
                  });
                } else if (data.type === "tool") {
                  setToolRunning(data.status === "start" ? data.name : null);
                }
              } catch {}
            }
          }
        }
        if (!fullText) {
          setMessages((prev) => [...prev, { role: "assistant", content: "No se pudo generar una respuesta." }]);
        }
      } else {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: [userMsg], modo, stream: true }),
        });
        const reader = res.body?.getReader();
        if (!reader) return;
        const decoder = new TextDecoder();
        let fullText = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value);
          for (const line of chunk.split("\n")) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.type === "error") {
                  setMessages((prev) => [...prev, { role: "assistant", content: "Error: " + data.content }]);
                  break;
                }
                if (data.content) {
                  fullText += data.content;
                  setMessages((prev) => {
                    const newMsgs = [...prev];
                    const last = newMsgs[newMsgs.length - 1];
                    if (last?.role === "assistant") {
                      newMsgs[newMsgs.length - 1] = { ...last, content: fullText };
                    } else {
                      newMsgs.push({ role: "assistant", content: fullText });
                    }
                    return newMsgs;
                  });
                }
              } catch {}
            }
          }
        }
        if (!fullText) {
          setMessages((prev) => [...prev, { role: "assistant", content: "No se pudo generar una respuesta." }]);
        }
      }
    } catch (err: any) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Error: " + err.message }]);
    }
    setLoading(false);
    setToolRunning(null);
  };

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)} className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition z-50">
          <MessageCircle size={24} />
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border flex flex-col z-50 overflow-hidden">
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold">PAIC-AI {modo === "agente" ? "ODÍN" : modo === "curso" ? "Curso" : ""}</span>
            <button onClick={() => setOpen(false)}><X size={20} /></button>
          </div>
          <div className="flex border-b">
            {MODOS.map((m) => {
              const Icon = m.icon;
              return (
                <button key={m.id} onClick={() => { setModo(m.id); setMessages([{ role: "assistant", content: m.id === "agente" ? "Soy ODÍN, tu agente inteligente. Puedo consultar la base de datos, memorizar información y mucho más." : "¡Hola! ¿En qué puedo ayudarte?" }]); }}
                  className={"flex-1 flex items-center justify-center gap-1 py-2 text-xs font-medium transition " + (modo === m.id ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-500 hover:text-gray-700")}>
                  <Icon size={14} />{m.label}
                </button>
              );
            })}
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {toolRunning && (
              <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                <Loader2 size={14} className="animate-spin" />
                Ejecutando: {toolRunning}...
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={"flex " + (msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={"max-w-[80%] rounded-2xl px-4 py-2 text-sm " + (msg.role === "user" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800")}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && !toolRunning && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-4 py-2"><Loader2 size={16} className="animate-spin text-gray-400" /></div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="border-t p-3 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} placeholder={modo === "agente" ? "Pregúntale a ODÍN..." : "Escribe tu mensaje..."} className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" disabled={loading} />
            <button onClick={sendMessage} disabled={loading || !input.trim()} className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 disabled:opacity-50"><Send size={18} /></button>
          </div>
        </div>
      )}
    </>
  );
}
