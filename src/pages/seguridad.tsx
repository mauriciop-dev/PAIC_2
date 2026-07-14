import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { adminInsforge } from "@/lib/insforge";
import { useCopropiedad } from "@/context/CopropiedadContext";

const SecurityPanel = dynamic(() => import("@/components/seguridad/SecurityPanel"), { ssr: false });

export default function SeguridadPage() {
  const { actual } = useCopropiedad();
  const [visitors, setVisitors] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!actual) return;
    Promise.all([
      adminInsforge!.database.from("visitor_logs").select("*").eq("conjunto_id", actual.id).order("created_at", { ascending: false }).limit(20),
      adminInsforge!.database.from("package_logs").select("*").eq("conjunto_id", actual.id).order("created_at", { ascending: false }).limit(20),
    ]).then(([v, p]) => { setVisitors(v.data ?? []); setPackages(p.data ?? []); setLoading(false); });
  }, [actual]);
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Seguridad</h1>
      {!loading && <SecurityPanel visitors={visitors} packages={packages} />}
    </div>
  );
}
