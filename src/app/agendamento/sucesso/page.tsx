import { redirect } from "next/navigation";
import { CheckCircle2, ArrowRight, Calendar, Clock, User, Sparkles, Info } from "lucide-react";
import { stripe } from "@/lib/stripe";
import Link from "next/link";

export default async function SuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const resolvedSearchParams = await searchParams;
  const sessionId = resolvedSearchParams.session_id;

  if (!sessionId) {
    redirect("/");
  }

  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (error) {
    console.error("Erro ao recuperar sessão do Stripe:", error);
    redirect("/");
  }

  const metadata = session.metadata;
  
  if (!metadata) {
    return (
      <div className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center px-6 text-center">
        <h1 className="text-2xl text-white">Sessão não encontrada</h1>
      </div>
    );
  }

  const { startTime, requestedService, therapistName } = metadata;
  
  const dateObj = new Date(startTime);
  
  const dateFormatted = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj);

  const timeFormatted = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj);

  return (
    <div className="min-h-screen bg-midnight-950 flex flex-col items-center justify-center px-6 py-20 text-center relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-midnight-800/50 rounded-full blur-3xl pointer-events-none" />
      
      <div className="bg-gradient-to-b from-midnight-900 to-midnight-950 border border-gold-500/30 rounded-3xl p-8 md:p-12 max-w-2xl w-full shadow-[0_0_50px_rgba(212,175,55,0.15)] relative z-10 mt-12">
        <div className="w-20 h-20 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-gold-400" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-serif text-white mb-2">Pagamento Confirmado!</h1>
        <p className="text-slate-300 text-lg mb-8 font-light">
          Obrigado pelo seu agendamento. Aqui estão os detalhes:
        </p>
        
        {/* Reservation Details Card */}
        <div className="bg-midnight-950/50 rounded-2xl p-6 border border-slate-800/50 text-left mb-8">
          <div className="grid gap-4">
            <div className="flex items-start gap-4">
              <div className="bg-gold-500/10 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Data</p>
                <p className="text-white font-medium">{dateFormatted}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-gold-500/10 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Horário</p>
                <p className="text-white font-medium">{timeFormatted} horas</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-gold-500/10 p-2 rounded-lg">
                <User className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Terapeuta</p>
                <p className="text-white font-medium">{therapistName || "Terapeuta da Lótus"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="bg-gold-500/10 p-2 rounded-lg">
                <Sparkles className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <p className="text-slate-400 text-sm">Atendimento</p>
                <p className="text-white font-medium">{requestedService || "Terapia"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Info Alert */}
        <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-5 flex gap-4 text-left mb-10">
          <Info className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-blue-300 font-medium mb-1">Informação importante:</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              Este pagamento inicial garante a exclusividade da sua reserva na agenda do terapeuta. Ele não é uma taxa adicional: o valor será descontado do total da sessão. Assim, na data do atendimento, você pagará apenas a diferença restante.
            </p>
          </div>
        </div>
        
        <p className="text-slate-400 text-sm mb-6">
          Acompanhe estas e mais informações importantes como whatsapp do terapeuta no menu "Meu Perfil" na barra superior. Tenha um bom atendimento.
        </p>
        
        <Link 
          href="/jornada"
          className="w-full px-6 py-4 bg-gold-600 hover:bg-gold-500 text-midnight-950 font-medium rounded-xl transition-all flex items-center justify-center gap-2 group"
        >
          Acessar Meu Perfil 
          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
