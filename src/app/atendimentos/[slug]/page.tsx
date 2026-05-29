import Link from "next/link";
import { RevealText } from "@/components/ui/RevealText";
import { Sparkles, Clock, CalendarHeart, MessageCircle } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import type { DatabaseService } from "@/lib/types";
import { formatWhatsAppLink } from "@/lib/whatsapp";

export const dynamic = 'force-dynamic';

export default async function AtendimentoPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ terapeuta?: string }> }) {
  const { slug } = await params;
  const awaitedParams = await searchParams;
  const terapeutaId = awaitedParams.terapeuta;
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const { data: serviceRes } = await supabase
    .from("services")
    .select("*")
    .eq("slug", slug)
    .single();

  const { data: feeData } = await supabase.from('system_settings').select('value').eq('id', 'reservation_fee').single();
  const reservationFee = feeData?.value?.amount || 50;

  const { data: whatsappSettingsData } = await supabase
    .from("system_settings")
    .select("value")
    .eq("id", "whatsapp_settings")
    .single();

  const globalWhatsapp = (whatsappSettingsData?.value as any)?.phone || "5511956589429";
  const cleanGlobalWhatsapp = globalWhatsapp.replace(/\D/g, "");
  const finalGlobalWhatsapp = cleanGlobalWhatsapp.startsWith("55") && cleanGlobalWhatsapp.length >= 12
    ? cleanGlobalWhatsapp
    : `55${cleanGlobalWhatsapp}`;
  const whatsappGlobalUrl = `https://wa.me/${finalGlobalWhatsapp}`;

  const service = serviceRes as DatabaseService | null;

  // Fallback se não encontrar
  const data = service || {
    title: slug.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()),
    short_subtitle: "A Jornada de Cura Começa Aqui",
    description: "Esta é uma técnica sagrada desenhada para restabelecer o balanço entre seu corpo, mente e alma. Nossos terapeutas conduzirão você através dos limiares da sua consciência para encontrar as respostas que você tanto busca nas galáxias interiores do seu próprio ser.",
    duration: "1h a 2h",
    benefits: ["Paz interior imediata", "Autoconhecimento expandido", "Desbloqueio do fluxo energético", "Maior conexão espiritual com as esferas"],
    image_url: null,
    base_price: 150,
    show_booking_button: true,
    whatsapp_number: undefined,
    whatsapp_button_text: undefined,
  };

  // Detecta se a descrição contém HTML (conteúdo do editor rico) ou texto simples
  const isHtml = /<[a-z][\s\S]*>/i.test(data.description || '');
  const showBooking = data.show_booking_button !== false;
  const hasWhatsApp = !!(data.whatsapp_number && data.whatsapp_number.trim());
  const whatsappLink = hasWhatsApp ? formatWhatsAppLink(data.whatsapp_number!) : '';
  const whatsappText = data.whatsapp_button_text || 'Fale Conosco';

  return (
    <div className="min-h-screen bg-midnight-950 selection:bg-gold-500/30 selection:text-white">
      {/* Hero Section */}
      <div className="relative min-h-[45vh] md:min-h-[55vh] pt-24 pb-16 md:py-32 flex items-center justify-center overflow-hidden">
        {/* Camadas Mágicas de Fundo */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-midnight-950/40 via-midnight-950/60 to-midnight-950 z-10" />
          <div className="w-full h-full bg-midnight-900 flex items-center justify-center">
            {/* Mock: Um gradiente rotativo que simula uma aura ou poeira cósmica */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vh] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold-900/20 via-midnight-900/80 to-midnight-950 animate-[spin_60s_linear_infinite] opacity-50 blur-[100px]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70vw] h-[70vw] bg-gold-600/5 rounded-full blur-[120px] animate-pulse" />
          </div>
        </div>
        
        <div className="relative z-20 text-center px-6 mt-4 md:mt-8 max-w-5xl mx-auto flex flex-col items-center pb-12 md:pb-20">
          <RevealText element="div" delay={0.1} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-400 text-xs font-medium tracking-widest uppercase mb-6">
            <Sparkles size={14} /> Atendimentos Lótus
          </RevealText>
          
          <RevealText element="h1" delay={0.2} className="font-serif text-4xl md:text-6xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-white via-gold-100 to-gold-400 mb-6 drop-shadow-sm leading-tight">
            {data.title}
          </RevealText>
          
          <RevealText element="p" delay={0.3} className="text-xl md:text-2xl text-gold-200/80 font-light italic">
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

            <div className="flex flex-col-reverse md:flex-row gap-12 relative z-10">
              <div className="flex-1 space-y-8">
                <RevealText element="h3" delay={0.4} className="font-serif text-3xl text-white">Sobre a Técnica</RevealText>
                
                {/* Renderização do conteúdo: HTML rico ou texto simples */}
                {isHtml ? (
                  <RevealText delay={0.5} className="rich-content">
                    <div dangerouslySetInnerHTML={{ __html: data.description }} />
                  </RevealText>
                ) : (
                  <RevealText element="p" delay={0.5} className="text-slate-300 font-light leading-relaxed text-lg text-justify whitespace-pre-wrap">
                    {data.description}
                  </RevealText>
                )}

                {data.image_url && (
                   <RevealText delay={0.8} className="mt-8 w-full h-[300px] sm:h-[400px] md:h-[450px] rounded-3xl relative overflow-hidden group shadow-2xl ring-1 ring-white/10 hover:ring-gold-500/30 transition-all duration-500">
                      <div className="absolute inset-0 bg-gold-500/10 mix-blend-overlay z-10 group-hover:opacity-0 transition-opacity duration-500" />
                      <img src={data.image_url} alt={data.title} className="w-full h-full object-cover group-hover:scale-105 group-hover:rotate-1 transition-transform duration-1000 ease-out" />
                   </RevealText>
                )}
              </div>

              {/* Sidebar do Card com Detalhes */}
              <div className="md:w-1/3 flex flex-col gap-6">
                 
                 <RevealText delay={0.65} className="bg-midnight-950/80 border border-white/5 rounded-2xl p-6 hover:border-gold-500/20 transition-colors">
                     <h4 className="text-white font-medium mb-3">Sobre o Atendimento</h4>
                     
                     {/* Preço e Duração Agrupados */}
                     <div className="flex flex-col gap-2.5 border-b border-white/10 pb-4">
                       <div className="flex justify-between items-center">
                         <span className="text-slate-400 font-light text-sm">Valor da Consulta</span>
                         <span className="text-gold-400 font-medium text-lg">R$ {data.base_price?.toFixed(2) || '150.00'}</span>
                       </div>
                       <div className="flex justify-between items-center text-xs">
                         <span className="text-slate-500 font-light">Duração Média</span>
                         <span className="text-slate-300 font-medium">{data.duration}</span>
                       </div>
                     </div>

                     {/* Botões de Ação Diretos */}
                     <div className="mt-5 flex flex-col gap-3">
                       {showBooking && (
                         <Link 
                           href={`/agendamento?servico=${encodeURIComponent(data.title)}${terapeutaId ? `&terapeutaId=${terapeutaId}` : ''}`}
                           className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 text-midnight-950 py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(212,175,55,0.15)] hover:shadow-[0_0_35px_rgba(212,175,55,0.35)] hover:-translate-y-0.5 transition-all duration-300"
                         >
                           <CalendarHeart size={16} />
                           Agendar Agora
                         </Link>
                       )}

                       {/* Separador ou */}
                       {showBooking && (
                         <div className="flex items-center justify-center gap-3 my-1">
                           <div className="h-[1px] bg-white/10 flex-1" />
                           <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">ou</span>
                           <div className="h-[1px] bg-white/10 flex-1" />
                         </div>
                       )}

                       {/* Botão de agendamento via WhatsApp utilizando o telefone global */}
                       <a 
                         href={whatsappGlobalUrl}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 text-white py-3.5 px-4 rounded-xl font-bold uppercase tracking-wider text-xs shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_35px_rgba(16,185,129,0.35)] hover:-translate-y-0.5 transition-all duration-300"
                       >
                         <MessageCircle size={16} />
                         Agendar via WhatsApp
                       </a>
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
            {(showBooking || hasWhatsApp) && (
              <RevealText delay={0.8} className="mt-16 sm:mt-24 flex justify-center border-t border-white/5 pt-16">
                 <div className="text-center group flex flex-col items-center gap-6">
                   <h2 className="font-serif text-2xl text-white mb-2">
                     {showBooking ? 'Sente o chamado no seu coração?' : 'Quer saber mais sobre essa técnica?'}
                   </h2>

                   <div className="flex flex-col sm:flex-row items-center gap-4">
                     {/* Botão Agendar Agora */}
                     {showBooking && (
                       <Link 
                          href={`/agendamento?servico=${encodeURIComponent(data.title)}${terapeutaId ? `&terapeutaId=${terapeutaId}` : ''}`}
                          className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400 text-midnight-950 px-10 py-5 rounded-full font-bold uppercase tracking-widest shadow-[0_0_40px_rgba(212,175,55,0.3)] hover:shadow-[0_0_60px_rgba(212,175,55,0.5)] hover:-translate-y-1 transition-all duration-300"
                        >
                         <CalendarHeart size={20} className="group-hover:scale-110 transition-transform" />
                         Agendar Agora
                       </Link>
                     )}

                     {/* Botão WhatsApp */}
                     {hasWhatsApp && (
                       <a 
                          href={whatsappLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-400 text-white px-10 py-5 rounded-full font-bold uppercase tracking-widest shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all duration-300"
                        >
                         <MessageCircle size={20} />
                         {whatsappText}
                       </a>
                     )}
                   </div>
                 </div>
              </RevealText>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
