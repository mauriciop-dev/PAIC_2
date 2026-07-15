import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { insforge } from "@/lib/insforge";

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  useEffect(() => {
    const { insforge_code, error: err } = router.query;
    if (err) { setError("Error de autenticación"); return; }
    if (!insforge_code) return;
    insforge.auth.exchangeOAuthCode(insforge_code as string).then(({ error }) => {
      if (error) setError(error.message);
      else router.push("/dashboard");
    });
  }, [router.query]);
  return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">{error || "Procesando autenticación..."}</p></div>;
}
