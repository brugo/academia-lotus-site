"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { LogOut, LayoutDashboard, Component, Settings, Home, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <AdminGuard>
      <div className="min-h-screen bg-midnight-950 text-slate-200 flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-64 bg-midnight-900/80 border-r border-white/5 flex flex-col z-20">
          <div className="h-20 flex items-center px-6 border-b border-white/5">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-midnight-950 text-gold-400 flex items-center justify-center border border-white/10 shadow-[0_0_10px_rgba(212,175,55,0.1)]">
                <span className="font-serif text-lg italic mt-0.5">L</span>
              </div>
              <span className="font-serif font-medium tracking-wide text-gold-400">Portal Lótus</span>
            </Link>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-2">
            <Link 
              href="/admin" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                pathname === "/admin" 
                  ? "bg-gold-500/10 text-gold-400 font-medium border border-gold-500/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <LayoutDashboard size={18} />
              Editor Home Page
            </Link>

            <Link 
              href="/admin/cursos" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                pathname === "/admin/cursos" 
                  ? "bg-gold-500/10 text-gold-400 font-medium border border-gold-500/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Component size={18} />
              Editor Cursos
            </Link>
            
            <Link 
              href="/admin/terapeutas" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                pathname.includes("/admin/terapeutas") 
                  ? "bg-gold-500/10 text-gold-400 font-medium border border-gold-500/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Users size={18} />
              Equipe / Terapeutas
            </Link>
            
            <Link 
              href="/admin/atendimentos" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                pathname.includes("/admin/atendimentos") 
                  ? "bg-gold-500/10 text-gold-400 font-medium border border-gold-500/20" 
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <Component size={18} />
              Técnicas / Serviços
            </Link>
            <Link 
              href="/" 
              target="_blank"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all mt-8"
            >
              <Home size={18} />
              Ver Site
            </Link>
          </nav>

          <div className="p-4 border-t border-white/5">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main data-lenis-prevent className="flex-1 flex flex-col relative max-h-screen overflow-y-auto">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gold-900/5 blur-[150px] rounded-full pointer-events-none" />
          
          <div className="p-6 md:p-10 relative z-10 w-full max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
