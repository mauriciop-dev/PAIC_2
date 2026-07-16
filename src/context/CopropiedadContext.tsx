import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

type Copropiedad = { id: string; name: string; address?: string; ciudad?: string; subscription_plan?: string; role?: string };
type CopropiedadCtx = { actual: Copropiedad | null; lista: Copropiedad[]; loading: boolean; setActual: (c: Copropiedad) => void; refresh: () => Promise<void> };

const Context = createContext<CopropiedadCtx>({ actual: null, lista: [], loading: true, setActual: () => {}, refresh: async () => {} });

export function CopropiedadProvider({ children }: { children: ReactNode }) {
  const [lista, setLista] = useState<Copropiedad[]>([]);
  const [actual, setActual] = useState<Copropiedad | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/copropiedades");
      const j = await r.json();
      const data = j.data ?? [];
      setLista(data);
      if (data.length > 0 && !actual) {
        const saved = typeof window !== "undefined" ? localStorage.getItem("paic-conjunto-activo") : null;
        const found = saved ? data.find((c: Copropiedad) => c.id === saved) : null;
        setActual(found ?? data[0]);
      }
    } catch {}
    setLoading(false);
  }, [actual]);
  useEffect(() => { refresh(); }, []);
  useEffect(() => { if (actual) localStorage.setItem("paic-conjunto-activo", actual.id); }, [actual]);
  return (<Context.Provider value={{ actual, lista, loading, setActual, refresh }}>{children}</Context.Provider>);
}

export function useCopropiedad() { return useContext(Context); }