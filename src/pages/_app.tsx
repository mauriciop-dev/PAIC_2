import type { AppProps } from "next/app";
import { CopropiedadProvider } from "@/context/CopropiedadContext";
import ChatWidget from "@/components/chat/ChatWidget";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import { useRouter } from "next/router";
import { useState } from "react";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isAuth = router.pathname.startsWith("/auth");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <CopropiedadProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {!isAuth && (
          <>
            <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          </>
        )}
        <div className={!isAuth ? "pt-16 lg:ml-64" : ""}>
          <main>
            <Component {...pageProps} />
          </main>
        </div>
        <ChatWidget />
      </div>
    </CopropiedadProvider>
  );
}