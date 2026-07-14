import { useRouter } from "next/router";
import { menuItems } from "@/data/menu-items";
import { useCopropiedad } from "@/context/CopropiedadContext";
import { X } from "lucide-react";
import {
  LayoutDashboard, Database, DollarSign, CheckSquare, Shield, Calendar,
  Building2, Monitor, ClipboardList, MessageSquare, FolderOpen, Building, Settings,
} from "lucide-react";

type Props = { isOpen: boolean; onClose: () => void };

const ICONS: Record<string, any> = {
  LayoutDashboard, Database, DollarSign, CheckSquare, Shield, Calendar,
  Building2, Monitor, ClipboardList, MessageSquare, FolderOpen, Building,
};

export default function Sidebar({ isOpen, onClose }: Props) {
  const router = useRouter();
  const { actual, lista, setActual } = useCopropiedad();

  const isActive = (path: string) => router.pathname === path;

  return (
    <>
      {isOpen && <div className="fixed inset-0 bg-black/20 z-40 lg:hidden" onClick={onClose} />}
      <aside className={"fixed top-16 left-0 bottom-0 w-64 bg-white border-r z-50 transform transition-transform lg:translate-x-0 lg:static lg:z-auto overflow-y-auto " + (isOpen ? "translate-x-0" : "-translate-x-full")}>
        <div className="p-4">
          {lista.length > 1 && (
            <div className="mb-4">
              <select value={actual?.id ?? ""} onChange={(e) => setActual(lista.find((c) => c.id === e.target.value)!)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                {lista.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>
          )}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = ICONS[item.icon];
              return (
                <button key={item.id} onClick={() => { router.push(item.path); onClose(); }}
                  className={"w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition " + (isActive(item.path) ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")}>
                  {Icon && <Icon size={18} />}
                  {item.label}
                </button>
              );
            })}
            <button onClick={() => { router.push("/settings"); onClose(); }}
              className={"w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition " + (isActive("/settings") ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900")}>
              <Settings size={18} />Configuración
            </button>
          </nav>
        </div>
      </aside>
    </>
  );
}
