import type { LucideIcon } from "lucide-react";

export type MenuItem = {
  id: string;
  label: string;
  icon: string;
  path: string;
  modulo: string;
  adminOnly?: boolean;
};

export const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: "LayoutDashboard", path: "/dashboard", modulo: "dashboard" },
  { id: "database", label: "Base de Datos", icon: "Database", path: "/database", modulo: "base_datos" },
  { id: "finanzas", label: "Finanzas", icon: "DollarSign", path: "/finanzas", modulo: "finanzas" },
  { id: "tareas", label: "Tareas", icon: "CheckSquare", path: "/tareas", modulo: "tareas" },
  { id: "seguridad", label: "Seguridad", icon: "Shield", path: "/seguridad", modulo: "seguridad" },
  { id: "vencimientos", label: "Vencimientos", icon: "Calendar", path: "/vencimientos", modulo: "vencimientos" },
  { id: "areas", label: "Áreas Comunes", icon: "Building2", path: "/areas-comunes", modulo: "areas_comunes" },
  { id: "camaras", label: "Cámaras", icon: "Monitor", path: "/camaras", modulo: "camaras" },
  { id: "cartelera", label: "Cartelera", icon: "ClipboardList", path: "/cartelera", modulo: "cartelera" },
  { id: "comunicaciones", label: "Comunicaciones", icon: "MessageSquare", path: "/comunicaciones", modulo: "comunicaciones" },
  { id: "archivos", label: "Archivos", icon: "FolderOpen", path: "/archivos", modulo: "archivos" },
  { id: "multi", label: "Multi-Copropiedad", icon: "Building", path: "/multi-copropiedad", modulo: "multi_copropiedad" },
];
