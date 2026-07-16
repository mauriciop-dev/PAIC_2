import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { insforge } from "@/lib/insforge";

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  useEffect(() => {
    if (!router.isReady) return;
    const { error: err } = router.query;
    if (err) { setError("Error de autenticación"); return; }

    let cancelled = false;
    async function waitForSession() {
      for (let i = 0; i < 30; i++) {
        if (cancelled) return;
        await new Promise((r) => setTimeout(r, 1000));
        const { data } = await insforge.auth.getCurrentUser();
        if (data?.user) {
          router.replace("/dashboard");
          return;
        }
      }
      if (!cancelled) setError("La sesión no se estableció. Intenta de nuevo.");
    }
    waitForSession();
    return () => { cancelled = true; };
  }, [router.isReady]);
  return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">{error || "Procesando autenticación..."}</p></div>;
}
