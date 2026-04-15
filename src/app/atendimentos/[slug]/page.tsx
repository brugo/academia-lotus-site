import Link from "next/link";
import { RevealText } from "@/components/ui/RevealText";
import { Sparkles, ArrowLeft, Clock, CalendarHeart } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import type { DatabaseService } from "@/lib/types";

export const dynamic = 'force-dynamic';

export default async function AtendimentoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data: serviceRes } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .single();

  const service = serviceRes as DatabaseService | null;

  // Fallback se não encontrar
  const data = service || {
    title: slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    short_subtitle: "A Jornada de Cura Começa Aqui",
    description: "Esta é uma técnica sagrada desenhada para restabelecer o balanço entre seu corpo, mente e alma. Nossos terapeutas conduzirão você através dos limiares da sua consciência para encontrar as respostas que você tanto busca nas galáxias interiores do seu próprio ser.",
    duration: "1h a 2h",
    benefits: ["Paz interior imediata", "Autoconhecimento expandido", "Desbloqueio do fluxo energético", "Maior conexão espiritual com as esferas"]
  };

  return (
    <div className="min-h-screen bg-midnight-950 selection:bg-gold-500/30 selection:text-white">
      {/* Hero Section */}
      <div className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Camadas Mágicas de Fundo */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-midnight-950/40 via-midnight-950/60 to-midnight-950 z-10" />
          <div className="w-full h-full bg-midnight-900 flex items-center justify-center">
            {/* Mock: Um gradiente rotativo que simula uma aura ou poeira cósmica */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-900/20 via-midnight-900/80 to-midnight-950 animate-[spin_60s_linear_infinite] opacity-50 blur-[100px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-gold-600/5 rounded-full blur-[120px] animate-pulse" />
          </div>
        </div>
        
        <div className="relative z-20 text-center px-6 mt-16 max-w-4xl mx-auto flex flex-col items-center">
          <Link href="/" className="self-start sm:self-center mb-8 inline-flex items-center gap-2 text-slate-400 hover:text-gold-400 transition-colors">
             <ArrowLeft size={16} /> <span className="text-sm tracking-widest uppercase">Voltar ao Início</span>
          </Link>

          <RevealText element="div" delay={0.1} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-medium tracking-widest uppercase mb-6">
            <Sparkles size={14} /> Atendimentos Lótus
          </RevealText>
          
          <RevealText element="h1" delay={0.2} className="font-serif text-5xl md:text-7xl lg:text-8xl text-transparent bg-clip-text bg-gradient-to-r from-white via-gold-100 to-gold-400 mb-6 drop-shadow-sm">
            {data.title}
          </RevealText>
          
          <RevealText element="p" delay={0.3} className="text-xl md:text-2xl text-gold-200/80 font-light italic mb-12">
            {data.short_subtitle}
          </RevealText>
        </div>
      </div>

      {/* Seção de Conteúdo e Explicação */}
      <div className="relative z-20 -mt-24 pb-32">
        <div className="container mx-auto px-6">
          <div className="max-w-5xl mx-auto bg-midnight-900/60 backdrop-blur-2xl border border-white/5 shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-3xl p-8 md:p-16 relative overflow-hidden">
            {/* Brilho Mágico no card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="flex flex-col md:flex-row gap-12 relative z-10">
              <div className="flex-1 space-y-8">
                <RevealText element="h3" delay={0.4} className="font-serif text-3xl text-white">Sobre a Técnica</RevealText>
                <RevealText element="p" delay={0.5} className="text-slate-300 font-light leading-relaxed text-lg text-justify">
                  {data.description}
                </RevealText>
              </div>

              {/* Sidebar do Card com Detalhes */}
              <div className="md:w-1/3 flex flex-col gap-6">
                 <RevealText delay={0.6} className="bg-midnight-950/80 border border-white/5 rounded-2xl p-6 flex items-start gap-4 hover:border-gold-500/20 transition-colors">
                    <Clock className="text-gold-500 mt-1" size={24} />
                    <div>
                      <h4 className="text-white font-medium mb-1">Duração Média</h4>
                      <p className="text-slate-400 font-light text-sm">{data.duration}</p>
                    </div>
                 </RevealText>
                 
                 <RevealText delay={0.7} className="bg-midnight-950/80 border border-white/10 rounded-2xl p-6 relative overflow-hidden group hover:border-gold-500/20 transition-colors">
                    <div className="absolute inset-0 bg-gradient-to-br from-gold-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <h4 className="text-gold-400 font-medium mb-4 uppercase tracking-widest text-xs flex items-center gap-2">
                      <Sparkles size={14} /> Benefícios
                    </h4>
                    <ul className="space-y-4">
                      {data.benefits.map((benefit, i) => (
                        <li key={i} className="text-slate-300 font-light text-sm flex items-start gap-3">
                           <div className="w-1.5 h-1.5 rounded-full bg-gold-500/50 mt-1.5 shrink-0 shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                           {benefit}
                        </li>
                      ))}
                    </ul>
                 </RevealText>
              </div>
            </div>

            {/* Chamada para Ação */}
            <RevealText delay={0.8} className="mt-16 sm:mt-24 flex justify-center border-t border-white/5 pt-16">
               <div className="text-center group">
                 <h2 className="font-serif text-2xl text-white mb-8">Sente o chamado no seu coração?</h2>
                 <Link 
                    href={`/agendamento?servico=${encodeURIComponent(data.title)}`}
                    className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 text-midnight-950 px-10 py-5 rounded-full font-bold uppercase tracking-widest shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:shadow-[0_0_60px_rgba(212,175,55,0.5)] hover:-translate-y-1 transition-all duration-300"
                  >
                   <CalendarHeart size={20} className="group-hover:scale-110 transition-transform" />
                   Agendar Agora
                 </Link>
               </div>
            </RevealText>
          </div>
        </div>
      </div>
    </div>
  );
}
