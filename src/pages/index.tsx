import { useRouter } from "next/router";
import { useEffect } from "react";
import { insforge } from "@/lib/insforge";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    async function check() {
      const { data } = await insforge.auth.getCurrentUser();
      if (data.user) router.push("/dashboard");
      else router.push("/auth/login");
    }
    check();
  }, [router]);
  return <div className="flex items-center justify-center min-h-screen"><p className="text-lg text-gray-500">Redirigiendo...</p></div>;
}
