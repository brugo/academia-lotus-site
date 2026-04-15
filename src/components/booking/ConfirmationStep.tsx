"use client";

import { useState } from "react";
import { format } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { ArrowLeft, CheckCircle2, Lock, Loader2, Video } from "lucide-react";

export function ConfirmationStep({ therapist, date, onBack, requestedService }: { therapist: any, date: Date, onBack: () => void, requestedService?: string }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [meetLink, setMeetLink] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const handleBookingClick = async () => {
    // Basic validation
    if (!formData.name || !formData.email) return;

    setLoading(true);

    try {
      // Chamada oficial para gravar no nosso Banco E No Google Calendar
      const res = await fetch("/api/calendar/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          therapistId: therapist.id,
          therapistEmail: therapist.google_calendar_id || therapist.email,
          clientName: formData.name,
          clientEmail: formData.email,
          startTime: date.toISOString(),
          requestedService: requestedService
        })
      });

      const result = await res.json();
      
      if (result.success) {
        setMeetLink(result.meetLink || "");
        setSuccess(true);
      } else {
        alert("Erro do Servidor: " + (result.error || "Tente outro horário."));
        onBack();
      }
    } catch (error: any) {
      console.error(error);
      alert("Houve um erro de comunicação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-xl mx-auto pb-32 pt-10">
        <div className="bg-gradient-to-b from-midnight-900 to-midnight-950 border border-gold-500/30 rounded-3xl p-10 text-center shadow-[0_0_50px_rgba(212,175,55,0.15)] relative overflow-hidden">
          <div className="w-20 h-20 bg-gold-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
             <CheckCircle2 size={40} className="text-gold-400" />
          </div>
          
          <h2 className="text-3xl font-serif text-white mb-4">Sessão Confirmada!</h2>
          <p className="text-slate-300 text-lg mb-8 font-light">
            Sua jornada com {therapist.name} está oficializada. Você e o terapeuta 
            acabaram de receber um e-mail de convite na Agenda do Google.
          </p>
          
          <div className="bg-black/30 rounded-2xl p-6 border border-white/5 mb-8 text-left">
            <p className="text-sm text-slate-400 mb-1">Data e Hora</p>
            <p className="text-lg text-white font-medium mb-4 capitalize">
              {format(date, "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
            </p>
            
            {meetLink && (
              <>
                <p className="text-sm text-slate-400 mb-1">Local da Conexão</p>
                <p className="text-md text-white flex items-center gap-2">
                  <Video size={18} className="text-emerald-400" /> Google Meet Automático
                </p>
              </>
            )}
          </div>
          
          <button 
            onClick={() => window.location.href = "/"}
            className="w-full px-6 py-4 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-all border border-white/10"
          >
            Voltar para a Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto pb-32">
      {/* TODO: EXPERIMENTO DO BOTAO ACCEPT - IGNORAR ESTA LINHA */}
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Voltar para a Agenda
      </button>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        
        {/* Formulário */}
        <div className="md:col-span-3 bg-midnight-900 border border-white/5 rounded-3xl p-8 shadow-2xl relative">
          <h2 className="text-2xl font-serif text-white mb-2">Seus Dados</h2>
          <p className="text-slate-400 text-sm mb-8">Nós usaremos seu e-mail para enviar o convite oficial do Google Calendar e o link do Meet automaticamente.</p>
          
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Nome Completo</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-midnight-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-gold-500 transition-colors" 
                placeholder="Ex: Clara Luz" 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">E-mail Principal</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-midnight-950/50 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:outline-none focus:border-gold-500 transition-colors" 
                placeholder="clara@email.com" 
              />
            </div>
          </div>
        </div>

        {/* Resumo e Pagamento (Mock) */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-gold-900/10 border border-gold-500/20 rounded-3xl p-6 relative overflow-hidden backdrop-blur-sm">
            <h3 className="text-white font-medium mb-6 flex items-center gap-2">
              Resumo do Encontro
            </h3>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <img src={therapist.photo_url} className="w-12 h-12 rounded-full object-cover" alt="" />
                <div>
                  <p className="text-white font-medium">{therapist.name}</p>
                  <p className="text-gold-400 text-sm">{requestedService || therapist.specialty}</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-slate-400 mb-1">Horário</p>
                <p className="text-white font-medium capitalize text-sm">
                  {format(date, "EEEE, dd/MM 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                <p className="text-slate-300">Total (Sinal)</p>
                <p className="text-gold-400 font-serif text-xl border-b border-gold-500/30">
                  R$ {therapist.base_price.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <button 
            disabled={loading || !formData.name || !formData.email}
            onClick={handleBookingClick}
            className="w-full px-6 py-4 bg-gold-600 hover:bg-gold-500 disabled:bg-slate-800 disabled:text-slate-500 text-midnight-950 font-medium rounded-2xl transition-all shadow-lg flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Lock size={18} />}
            {loading ? "Sincronizando..." : "Pagar Agora no Cartão"}
          </button>
          <p className="text-center text-xs text-slate-500 mt-2 flex justify-center gap-1">
            Integração futura com Stripe.
          </p>
        </div>

      </div>
    </div>
  );
}
