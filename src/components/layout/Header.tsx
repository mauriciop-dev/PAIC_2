import { Menu, Bell, LogOut } from "lucide-react";
import { useCopropiedad } from "@/context/CopropiedadContext";
import { useRouter } from "next/router";
import { signOut } from "@/services/auth";

type Props = { onToggleSidebar: () => void };

export default function Header({ onToggleSidebar }: Props) {
  const { actual } = useCopropiedad();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/auth/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-40 flex items-center justify-between px-4">
      <div className="flex items-center gap-3">
        <button onClick={onToggleSidebar} className="p-2 hover:bg-gray-100 rounded-lg"><Menu size={20} /></button>
        <h1 className="text-xl font-bold text-gray-900">PAIC 2.0</h1>
        {actual && <span className="text-sm text-gray-500 hidden sm:inline">| {actual.name}</span>}
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg relative"><Bell size={20} /><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" /></button>
        <button onClick={handleLogout} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"><LogOut size={20} /></button>
      </div>
    </header>
  );
}