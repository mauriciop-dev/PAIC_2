import { useState, useEffect } from "react";
import { useCopropiedad } from "@/context/CopropiedadContext";
import { adminInsforge } from "@/lib/insforge";
import dynamic from "next/dynamic";

const TaskBoard = dynamic(() => import("@/components/tareas/TaskBoard"), { ssr: false });

export default function TareasPage() {
  const { actual } = useCopropiedad();
  const [tasks, setTasks] = useState<any[]>([]);
  useEffect(() => {
    if (!actual) return;
    adminInsforge!.database.from("tasks").select("*").eq("conjunto_id", actual.id).order("created_at", { ascending: false }).then(({ data }) => setTasks(data ?? []));
  }, [actual]);
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tareas</h1>
      <TaskBoard tasks={tasks} />
    </div>
  );
}
