"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith('/admin') || pathname.startsWith('/login')) {
    return null;
  }

  return (
    <footer className="bg-midnight-950 text-slate-300 py-20 border-t border-white/5 flex-shrink-0 relative z-10 overflow-hidden">
      <div className="absolute inset-0 bg-gold-900/5 blur-[120px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] pointer-events-none -z-10" />
      
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 z-10 relative">
        <div className="col-span-1 md:col-span-2">
           <Link href="/" className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-midnight-900 text-gold-400 flex items-center justify-center border border-white/10">
              <span className="font-serif text-xl italic mt-1 mr-1">L</span>
            </div>
            <span className="font-serif text-2xl text-gold-400 tracking-wide">Academia Lótus</span>
          </Link>
          <p className="text-slate-400 text-sm max-w-md leading-relaxed font-light">
            Um espaço dedicado ao seu desenvolvimento espiritual, autoconhecimento e bem-estar integral através de cursos e terapias conectadas com sua essência primária.
          </p>
        </div>
        <div>
          <h3 className="font-serif text-xl mb-8 text-gold-400 tracking-wide">Jornadas</h3>
          <ul className="space-y-4 text-sm font-light text-slate-400">
            <li><Link href="/cursos" className="hover:text-gold-300 hover:translate-x-1 inline-block transition-transform">Cursos e Formações</Link></li>
            <li><Link href="/atendimentos" className="hover:text-gold-300 hover:translate-x-1 inline-block transition-transform">Nossos Atendimentos</Link></li>
            <li><Link href="/terapeutas" className="hover:text-gold-300 hover:translate-x-1 inline-block transition-transform">Clínica de Terapeutas</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-serif text-xl mb-8 text-gold-400 tracking-wide">Conexão</h3>
          <ul className="space-y-4 text-sm font-light text-slate-400">
            <li className="flex items-center gap-3">
              <span className="text-gold-500/50">@</span> contato@academialotus.com.br
            </li>
            <li className="flex items-center gap-3">
              <span className="text-gold-500/50">#</span> (11) 99999-9999
            </li>
            <li className="flex items-center gap-3 mt-4 text-slate-500 italic">
              São Paulo, SP - Brasil
            </li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500 font-light z-10 relative">
        <div>&copy; {new Date().getFullYear()} Academia Espiritual de Lótus. Amor e Luz em todo direito reservado.</div>
        <div className="flex gap-6">
          <Link href="/privacidade" className="hover:text-slate-300 transition-colors">Privacidade</Link>
          <Link href="/termos" className="hover:text-slate-300 transition-colors">Termos</Link>
        </div>
      </div>
    </footer>
  );
}
