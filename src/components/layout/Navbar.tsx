"use client";

import Link from 'next/link';
import { Home, BookOpen, Heart, Users, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin') || pathname.startsWith('/login')) {
    return null;
  }

  return (
    <>
      {/* ===== TOP BAR (visível em todos os tamanhos) ===== */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-midnight-950/70 backdrop-blur-xl">
        <div className="container mx-auto px-6 h-20 md:h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-midnight-900 border border-white/10 text-gold-400 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.1)] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-all duration-500">
              <span className="font-serif text-xl md:text-2xl italic text-gold-400 mr-1 mt-1">L</span>
            </div>
            <span className="font-serif tracking-widest text-slate-200 group-hover:text-gold-400 transition-colors uppercase text-xs md:text-sm">Academia Lótus</span>
          </Link>
          
          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium tracking-wide text-slate-300">
            <Link href="/" className="hover:text-gold-400 hover:tracking-widest transition-all duration-300">Início</Link>
            <Link href="/cursos" className="hover:text-gold-400 hover:tracking-widest transition-all duration-300">Cursos</Link>
            <Link href="/atendimentos" className="hover:text-gold-400 hover:tracking-widest transition-all duration-300">Atendimentos</Link>
            <Link href="/terapeutas" className="hover:text-gold-400 hover:tracking-widest transition-all duration-300">Terapeutas</Link>
          </nav>
          
          {/* Desktop login button */}
          <Link href="/login" className="hidden md:flex items-center gap-2 text-sm font-medium px-5 py-2.5 text-gold-400 border border-gold-500/30 rounded-full hover:bg-gold-500/10 hover:border-gold-400 transition-all duration-300 shadow-sm leading-none">
            <User size={16} />
            <span className="mb-[-2px]">Entrar</span>
          </Link>
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
          
          <Link 
            href="/login" 
            className={`flex flex-col items-center justify-center gap-1 transition-colors ${
              pathname === '/login' ? 'text-gold-400' : 'text-slate-400'
            }`}
          >
            <User size={20} />
            <span className="text-[10px] font-medium">Entrar</span>
          </Link>
        </div>
      </nav>
    </>
  );
}


