import { ReactNode, useEffect } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

export function MainLayout({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Track unique visitor once per session
    if (!sessionStorage.getItem("visit_tracked")) {
      fetch("/api/visit", { method: "POST" }).catch(() => {});
      sessionStorage.setItem("visit_tracked", "1");
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
