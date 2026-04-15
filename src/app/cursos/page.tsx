"use client";

import { RevealText } from "@/components/ui/RevealText";
import { BookOpen, Sparkles, MoveRight } from "lucide-react";
import Image from "next/image";

export default function CursosPage() {
  return (
    <div className="min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gold-900/10 via-midnight-950 to-midnight-950 -z-10" />

      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <RevealText delay={0.1} element="div" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-medium tracking-widest uppercase mb-6">
            Expansão da Consciência
          </RevealText>
          <RevealText delay={0.2} element="h1" className="font-serif text-5xl md:text-7xl text-white mb-6">
            Cursos & <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 italic px-2">Livros</span>
          </RevealText>
          <RevealText delay={0.3} element="p" className="text-lg text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
            Adentre o conhecimento profundo dos mistérios cósmicos. Formações canalizadas para despertar o mestre que habita em você.
          </RevealText>
        </div>

        {/* Highlighted Book Section */}
        <RevealText delay={0.4}>
          <div className="bg-midnight-900/40 backdrop-blur-xl border border-gold-500/10 rounded-3xl p-8 md:p-12 max-w-6xl mx-auto mb-16 flex flex-col md:flex-row items-center gap-12 hover:border-gold-500/30 transition-colors duration-500 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-gold-500/5 blur-[80px] rounded-full" />
            
            <div className="w-full md:w-1/3 flex justify-center relative z-10">
              <div className="w-48 h-64 md:w-64 md:h-80 bg-midnight-950 border border-gold-500/20 rounded-lg shadow-2xl flex items-center justify-center relative group">
                <BookOpen size={48} className="text-gold-500/50 group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-lg" />
                <div className="absolute bottom-6 left-6 right-6 text-center">
                  <p className="font-serif text-gold-400 text-sm mb-1 uppercase tracking-widest">Livro</p>
                  <p className="text-white text-lg font-medium leading-tight">A Jornada<br/>Kármica da Alma</p>
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-2/3 flex flex-col relative z-10 text-center md:text-left">
              <div className="inline-flex items-center justify-center md:justify-start gap-2 text-gold-400 text-xs font-medium tracking-widest uppercase mb-4">
                <Sparkles size={14} /> Lançamento Oficial
              </div>
              <h2 className="font-serif text-3xl md:text-4xl text-slate-100 mb-6">A Jornada Kármica da Alma</h2>
              <p className="text-slate-400 font-light leading-relaxed mb-8 text-lg">
                "A Jornada Kármica da Alma" desvenda o esplendor e a profundidade da jornada espiritual da alma através das vastidões do cosmos e das múltiplas vidas. Este livro sagrado, fundamentado em textos canalizados pelo espírito de Óptia: Krown Journey, revela os acordos que escolhemos antes de reencarnar.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gold-600 to-gold-500 text-midnight-950 rounded-full hover:from-gold-500 hover:to-gold-400 transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] font-medium tracking-wide flex items-center justify-center gap-2">
                  Adquirir Livro
                  <MoveRight size={18} />
                </button>
                <button className="w-full sm:w-auto px-8 py-4 bg-transparent border border-white/10 text-white rounded-full hover:bg-white/5 transition-all text-sm tracking-wide">
                  Ler Primeiro Capítulo
                </button>
              </div>
            </div>
          </div>
        </RevealText>

        {/* Other Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <RevealText delay={0.5} className="h-full">
            <div className="h-full bg-midnight-900/30 backdrop-blur-md border border-white/5 rounded-3xl p-10 hover:border-gold-500/20 transition-all duration-500 flex flex-col">
              <div className="bg-gold-500/10 text-gold-400 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6 self-start">Formação</div>
              <h3 className="font-serif text-2xl text-slate-200 mb-4">Mesa Radiônica de Lótus</h3>
              <p className="text-slate-400 font-light leading-relaxed flex-grow mb-8">
                A formação completa para você se tornar um facilitador desta egrégora. Aprenda a operar todos os relógios, geometrias sagradas e comandos quânticos desta ferramenta canalizada.
              </p>
              <button className="text-gold-500 font-medium tracking-wider flex items-center gap-2 hover:text-gold-400 transition-colors uppercase text-xs">
                Ver Ementa do Curso <MoveRight size={16} />
              </button>
            </div>
          </RevealText>

          <RevealText delay={0.6} className="h-full">
            <div className="h-full bg-midnight-900/30 backdrop-blur-md border border-white/5 rounded-3xl p-10 hover:border-gold-500/20 transition-all duration-500 flex flex-col">
              <div className="bg-gold-500/10 text-gold-400 text-xs font-semibold tracking-widest uppercase px-3 py-1 rounded-full mb-6 self-start">Imersão</div>
              <h3 className="font-serif text-2xl text-slate-200 mb-4">Saberes da Terra</h3>
              <p className="text-slate-400 font-light leading-relaxed flex-grow mb-8">
                Cursos de Fitoterapia e Ervas Guiadas para a limpeza espiritual. Descubra como a natureza oferece os elementos necessários para a transmutação densa.
              </p>
              <button className="text-gold-500 font-medium tracking-wider flex items-center gap-2 hover:text-gold-400 transition-colors uppercase text-xs">
                Explorar Saberes <MoveRight size={16} />
              </button>
            </div>
          </RevealText>
        </div>
      </div>
    </div>
  );
}
