import { adminInsforge } from "@/lib/insforge";

export type Plan = {
  id: string;
  nombre: string;
  precio: number;
  modulos: string[];
  descripcion: string;
  stripe_price_id?: string;
};

export const PLANES: Record<string, Plan> = {
  basico: {
    id: "basico",
    nombre: "Básico",
    precio: 0,
    modulos: ["dashboard", "base_datos"],
    descripcion: "Gestión básica de copropiedades",
  },
  full: {
    id: "full",
    nombre: "Full",
    precio: 99000,
    modulos: ["dashboard", "base_datos", "finanzas", "tareas", "seguridad", "vencimientos"],
    descripcion: "Administración completa",
  },
  total: {
    id: "total",
    nombre: "Total",
    precio: 149000,
    modulos: ["dashboard", "base_datos", "finanzas", "tareas", "seguridad", "vencimientos", "areas_comunes", "camaras", "cartelera", "comunicaciones", "archivos"],
    descripcion: "Todo incluido",
  },
  multi: {
    id: "multi",
    nombre: "Multi-Copropiedad",
    precio: 249000,
    modulos: ["dashboard", "base_datos", "finanzas", "tareas", "seguridad", "vencimientos", "areas_comunes", "camaras", "cartelera", "comunicaciones", "archivos", "multi_copropiedad"],
    descripcion: "Gestiona múltiples copropiedades",
  },
};

export const MODULOS_POR_PLAN: Record<string, string[]> = {
  basico: ["dashboard", "base_datos"],
  full: ["dashboard", "base_datos", "finanzas", "tareas", "seguridad", "vencimientos"],
  total: ["dashboard", "base_datos", "finanzas", "tareas", "seguridad", "vencimientos", "areas_comunes", "camaras", "cartelera", "comunicaciones", "archivos"],
  multi: ["dashboard", "base_datos", "finanzas", "tareas", "seguridad", "vencimientos", "areas_comunes", "camaras", "cartelera", "comunicaciones", "archivos", "multi_copropiedad"],
};

export async function getSubscription(conjuntoId: string) {
  const { data } = await adminInsforge!.database
    .from("suscripciones")
    .select("*")
    .eq("copropiedad_id", conjuntoId)
    .eq("estado", "activa")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();
  return data;
}

export function getModulosForPlan(planId: string): string[] {
  return MODULOS_POR_PLAN[planId] ?? MODULOS_POR_PLAN.basico;
}
