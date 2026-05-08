import { LotusParallax } from "@/components/ui/LotusParallax";
import { Sparkles, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Em Construção | Academia Espiritual de Lótus",
  description: "Uma nova experiência de cura e autoconhecimento está sendo preparada.",
};

export default function EmConstrucaoPage() {
  return (
    <div className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center relative overflow-hidden text-center px-6">
      <LotusParallax />
      
      <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
        <div className="w-24 h-24 bg-midnight-900 border border-gold-500/30 rounded-full flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(212,175,55,0.2)]">
          <span className="font-serif text-5xl text-gold-400 italic mt-2 mr-1">L</span>
        </div>
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-900/20 border border-gold-500/30 text-gold-400 text-sm font-medium mb-6">
          <Sparkles size={16} />
          <span>Aguarde</span>
        </div>

        <h1 className="font-serif text-4xl md:text-6xl text-white mb-6 leading-tight">
          Uma Nova Jornada <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">
            Está Sendo Preparada
          </span>
        </h1>
        
        <p className="text-slate-300 text-lg md:text-xl font-light max-w-xl mx-auto leading-relaxed mb-12">
          Estamos finalizando os últimos detalhes da nova experiência da Academia Lótus. 
          Em breve, um portal completo de cura, terapias e autoconhecimento estará disponível para você.
        </p>

        <div className="p-6 bg-midnight-900/50 backdrop-blur-md border border-white/5 rounded-2xl flex flex-col items-center max-w-md w-full">
          <p className="text-slate-400 text-sm mb-4">Acompanhe nossas novidades no Instagram</p>
          <a 
            href="https://instagram.com/academiaespiritualdelotus" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full py-4 bg-gold-600 hover:bg-gold-500 text-midnight-950 rounded-xl font-medium transition-all flex items-center justify-center gap-2 group"
          >
            Siga-nos no Instagram
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Decorative gradient orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] h-[60vw] bg-gold-600/5 blur-[120px] rounded-full pointer-events-none" />
    </div>
  );
}
