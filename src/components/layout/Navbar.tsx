"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Home, BookOpen, Heart, Users, User, LogOut, Sparkles } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function Navbar({ user }: { user: SupabaseUser | null }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };


  if (pathname.startsWith('/admin') || pathname.startsWith('/login')) {
    return null;
  }

  return (
    <>
      {/* ===== TOP BAR (visível em todos os tamanhos) ===== */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-midnight-950/70 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 md:h-24 flex items-center justify-between md:justify-center relative">
          <Link href="/" className="flex items-center gap-3 group shrink-0 w-full md:w-auto md:absolute md:left-6 md:top-1/2 md:-translate-y-1/2">
            <div className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center transition-all duration-500 overflow-visible relative">
              <Image src="/logo.png" alt="Academia Espiritual de Lótus" width={80} height={80} className="object-contain w-full h-full transition-all duration-500" />
            </div>
            <span className="font-serif tracking-widest text-slate-200 group-hover:text-gold-400 transition-colors uppercase text-xs md:text-sm whitespace-nowrap">Academia Espiritual de Lótus</span>
          </Link>
          
          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6 xl:gap-10 text-sm font-medium tracking-wide text-slate-300">
            <Link href="/" className="hover:text-gold-400 hover:tracking-widest transition-all duration-300 whitespace-nowrap">Início</Link>
            <Link href="/cursos" className="hover:text-gold-400 hover:tracking-widest transition-all duration-300 whitespace-nowrap">Cursos</Link>
            <Link href="/atendimentos" className="hover:text-gold-400 hover:tracking-widest transition-all duration-300 whitespace-nowrap">Atendimentos</Link>
            <Link href="/terapeutas" className="hover:text-gold-400 hover:tracking-widest transition-all duration-300 whitespace-nowrap">Terapeutas</Link>
            {user && (
              <Link href="/jornada" className="text-gold-400 hover:text-gold-300 hover:tracking-widest transition-all duration-300 flex items-center gap-1.5 whitespace-nowrap shrink-0">
                <Sparkles size={14} className="shrink-0" />
                <span className="whitespace-nowrap">Meu Perfil</span>
              </Link>
            )}
          </nav>
          
          {/* Desktop login/user button */}
          {user ? (
            <div className="hidden md:flex items-center gap-4 md:absolute md:right-6 md:top-1/2 md:-translate-y-1/2">
              <Link href="/jornada" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full border border-gold-500/30 object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gold-900/50 flex items-center justify-center border border-gold-500/30 text-gold-400">
                    <User size={14} />
                  </div>
                )}
                <span className="text-sm text-slate-300 font-medium whitespace-nowrap">{user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0]}</span>
              </Link>
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors" title="Sair">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden md:flex items-center gap-2 text-sm font-medium px-5 py-2.5 text-gold-400 border border-gold-500/30 rounded-full hover:bg-gold-500/10 hover:border-gold-400 transition-all duration-300 shadow-sm leading-none md:absolute md:right-6 md:top-1/2 md:-translate-y-1/2">
              <User size={16} />
              <span className="mb-[-2px] whitespace-nowrap">Entrar</span>
            </Link>
          )}
        </div>
      </header>

      {/* ===== BOTTOM TAB BAR — MOBILE ONLY ===== */}
      {/* Navegação pura HTML/CSS sem JavaScript — funciona em qualquer celular */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-midnight-950/95 border-t border-white/10 safe-area-bottom">
        <div className="grid grid-cols-5 h-16">
          <Link 
            href="/" 
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              pathname === '/' ? 'text-gold-400' : 'text-slate-400'
            }`}
          >
            <Home size={20} />
            <span className="text-[10px] font-medium">Início</span>
          </Link>
          
          <Link 
            href="/cursos" 
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              pathname === '/cursos' ? 'text-gold-400' : 'text-slate-400'
            }`}
          >
            <BookOpen size={20} />
            <span className="text-[10px] font-medium">Cursos</span>
          </Link>
          
          <Link 
            href="/atendimentos" 
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              pathname === '/atendimentos' ? 'text-gold-400' : 'text-slate-400'
            }`}
          >
            <Heart size={20} />
            <span className="text-[10px] font-medium">Terapias</span>
          </Link>
          
          <Link 
            href="/terapeutas" 
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              pathname === '/terapeutas' ? 'text-gold-400' : 'text-slate-400'
            }`}
          >
            <Users size={20} />
            <span className="text-[10px] font-medium">Equipe</span>
          </Link>
          
          {user ? (
            <Link 
              href="/jornada"
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                pathname === '/jornada' ? 'text-gold-400' : 'text-slate-400'
              }`}
            >
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-5 h-5 rounded-full border border-gold-500/50 object-cover" referrerPolicy="no-referrer" />
              ) : (
                <Sparkles size={20} />
              )}
              <span className="text-[10px] font-medium">Perfil</span>
            </Link>
          ) : (
            <Link 
              href="/login" 
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                pathname === '/login' ? 'text-gold-400' : 'text-slate-400'
              }`}
            >
              <User size={20} />
              <span className="text-[10px] font-medium">Entrar</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
}


