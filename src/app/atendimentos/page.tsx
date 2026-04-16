import { RevealText } from "@/components/ui/RevealText";
import { Sparkles, Star, Compass, Eye, Brain, Sun, Moon, Component as FallbackIcon } from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import type { DatabaseService } from "@/lib/types";
import { GoldenParticles } from "@/components/ui/GoldenParticles";

// Helper de mapeamento de ícones do DB
const iconMap: Record<string, any> = {
  Sparkles, Star, Compass, Eye, Brain, Sun, Moon
};

export const dynamic = 'force-dynamic';

export default async function AtendimentosPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data: servicesData } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("order_index", { ascending: true });
    
  const services = (servicesData as DatabaseService[]) || [];
  return (
    <div className="min-h-screen pt-32 pb-24 relative overflow-hidden">
      {/* Background animado e fundo paralax novo */}
      <GoldenParticles />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <RevealText delay={0.1} element="div" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-medium tracking-widest uppercase mb-6">
            Jornadas de Transmutação
          </RevealText>
          <RevealText delay={0.2} element="h1" className="font-serif text-5xl md:text-7xl text-white mb-6">
            Nossos <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-400 to-gold-600 italic px-2">Atendimentos</span>
          </RevealText>
          <RevealText delay={0.3} element="p" className="text-lg text-slate-400 font-light leading-relaxed max-w-2xl mx-auto">
            Terapias milenares e frequências canalizadas para realinhar seu propósito, remover traumas e abrir caminhos de prosperidade.
          </RevealText>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {services.map((service, index) => {
            const Icon = iconMap[service.icon] || FallbackIcon;
            return (
              <RevealText key={service.id} delay={0.2 + index * 0.1} className={`h-full ${service.is_featured ? 'md:col-span-2 lg:col-span-2' : ''}`}>
                <Link href={`/atendimentos/${service.slug}`} className="block group h-full bg-midnight-900/40 backdrop-blur-md border border-white/5 rounded-3xl p-8 hover:bg-midnight-800/60 hover:border-gold-500/30 transition-all duration-500 flex flex-col relative overflow-hidden cursor-pointer">
                  
                  {/* Decorative Background Image */}
                  {service.image_url && (
                    <div className="absolute inset-0 z-0">
                       <img src={service.image_url} alt="" className="w-full h-full object-cover grayscale mix-blend-overlay opacity-10 group-hover:opacity-20 group-hover:scale-105 transition-all duration-1000" />
                       <div className="absolute inset-0 bg-gradient-to-t from-midnight-900 via-transparent to-transparent opacity-80" />
                    </div>
                  )}

                  {/* Decorative glow on hover */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold-500/10 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700 z-10" />
                  
                  <div className="w-14 h-14 bg-midnight-950 border border-white/5 shadow-inner text-gold-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-gold-500/10 group-hover:border-gold-500/30 transition-all duration-500 relative z-10">
                    <Icon size={24} className="font-light" />
                  </div>
                  
                  <h3 className="font-serif text-2xl text-slate-100 mb-4 tracking-wide relative z-10">{service.title}</h3>
                  <p className="text-slate-400 font-light text-sm leading-relaxed flex-grow relative z-10">
                    {service.description.length > 270 ? service.description.substring(0, 270).trim() + "..." : service.description}
                  </p>
                  
                  <div className="mt-8 self-start text-xs text-gold-500 font-medium tracking-widest uppercase flex items-center gap-2 group-hover:text-gold-400 transition-colors relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-gold-500 group-hover:after:w-full after:transition-all after:duration-300 pb-1 z-10">
                    Saber Mais
                  </div>
                </Link>
              </RevealText>
            );
          })}
        </div>
      </div>
    </div>
  );
}
