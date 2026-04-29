"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { Clock, MessageCircle, User as UserIcon, X, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  service_name: string;
  client_name?: string;
  client_email?: string;
  client_whatsapp?: string;
  google_event_id?: string;
  therapists?: {
    name: string;
    specialty: string;
    photo_url: string;
    whatsapp: string;
    email?: string;
  };
  therapist_email?: string;
}

interface PaginatedAppointmentsProps {
  appointments: Appointment[];
  variant: 'client' | 'therapist';
  userAvatarUrl?: string;
  itemsPerPage?: number;
  accentColor?: string; // 'gold' or 'emerald'
}

export default function PaginatedAppointments({
  appointments: initialAppointments,
  variant,
  userAvatarUrl,
  itemsPerPage = 4,
  accentColor = 'gold',
}: PaginatedAppointmentsProps) {
  const [appointments, setAppointments] = useState(initialAppointments);
  const [currentPage, setCurrentPage] = useState(1);
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const totalPages = Math.ceil(appointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentAppointments = appointments.slice(startIndex, startIndex + itemsPerPage);

  const handleCancel = async (appointmentId: string, therapistEmail?: string) => {
    setCancelingId(appointmentId);
    try {
      const res = await fetch('/api/appointments/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId, therapistEmail }),
      });

      if (res.ok) {
        setAppointments(prev => prev.filter(a => a.id !== appointmentId));
        setConfirmCancelId(null);
        // Ajustar a página se ficou vazia
        const newTotal = Math.ceil((appointments.length - 1) / itemsPerPage);
        if (currentPage > newTotal && newTotal > 0) {
          setCurrentPage(newTotal);
        }
      } else {
        alert('Erro ao cancelar. Tente novamente.');
      }
    } catch {
      alert('Erro de conexão. Tente novamente.');
    } finally {
      setCancelingId(null);
    }
  };

  const isGold = accentColor === 'gold';
  const borderColor = isGold ? 'border-gold-500/20 hover:border-gold-500/40' : 'border-emerald-500/20 hover:border-emerald-500/40';
  const barColor = isGold ? 'bg-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.8)]' : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]';
  const textColor = isGold ? 'text-gold-400' : 'text-emerald-400';

  if (appointments.length === 0) {
    return null; // O componente pai já mostra o estado vazio
  }

  return (
    <div className="space-y-4">
      {currentAppointments.map((app) => (
        <div key={app.id} className={`bg-gradient-to-r from-midnight-900 to-midnight-950 border ${borderColor} transition-colors rounded-3xl p-6 relative overflow-hidden group`}>
          {/* Borda Glow */}
          <div className={`absolute top-0 left-0 w-1 h-full ${barColor}`} />

          {/* Modal de Confirmação de Cancelamento */}
          {confirmCancelId === app.id && (
            <div className="absolute inset-0 bg-midnight-950/95 backdrop-blur-sm z-20 flex items-center justify-center rounded-3xl p-4">
              <div className="text-center max-w-xs">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <AlertTriangle size={24} className="text-red-400" />
                </div>
                <p className="text-white font-medium mb-1 text-sm">Cancelar este agendamento?</p>
                <p className="text-slate-400 text-xs mb-4">O compromisso será removido da agenda do Google também.</p>
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => setConfirmCancelId(null)}
                    className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={() => handleCancel(app.id, app.therapists?.email || app.therapist_email)}
                    disabled={cancelingId === app.id}
                    className="px-4 py-2 text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors border border-red-500/30 disabled:opacity-50"
                  >
                    {cancelingId === app.id ? 'Cancelando...' : 'Sim, cancelar'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="flex-1">
              <div className={`flex items-center gap-2 ${textColor} text-sm font-medium mb-2`}>
                <Clock size={16} />
                {format(new Date(app.start_time), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
              </div>
              <h3 className="text-xl text-white font-medium mb-1">
                {app.service_name || 'Sessão Lótus'}
              </h3>
              {variant === 'client' ? (
                <p className="text-slate-400 text-sm">com {app.therapists?.name || 'Terapeuta'} • {app.therapists?.specialty || 'Especialista'}</p>
              ) : (
                <>
                  <p className="text-slate-300 text-sm mb-1">Paciente: {app.client_name}</p>
                  <p className="text-slate-400 text-sm">{app.client_email}</p>
                  {app.client_whatsapp && (
                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-sm border border-green-500/20">
                      <MessageCircle size={14} /> {app.client_whatsapp}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="flex-shrink-0 w-full md:w-auto flex flex-col gap-3">
              {/* Fotos dos participantes (só no modo cliente) */}
              {variant === 'client' && (
                <div className="flex -space-x-3 items-center justify-center md:justify-end">
                  <img src={app.therapists?.photo_url || '/placeholder.png'} alt="Terapeuta" className="w-12 h-12 rounded-full border-2 border-midnight-950 object-cover relative z-10" />
                  <div className="w-12 h-12 rounded-full border-2 border-midnight-950 bg-gold-900/50 flex items-center justify-center text-gold-400 relative z-0">
                    {userAvatarUrl ? (
                      <img src={userAvatarUrl} className="w-full h-full rounded-full object-cover opacity-80" alt="" referrerPolicy="no-referrer" />
                    ) : (
                      <UserIcon size={16} />
                    )}
                  </div>
                </div>
              )}

              {/* Botão WhatsApp */}
              {variant === 'client' ? (
                app.therapists?.whatsapp ? (
                  <a 
                    href={`https://wa.me/${app.therapists.whatsapp.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 rounded-xl transition-colors text-sm font-medium w-full md:w-auto"
                  >
                    <MessageCircle size={16} /> Falar no WhatsApp
                  </a>
                ) : (
                  <button disabled className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800/50 text-slate-500 border border-white/5 rounded-xl text-sm font-medium w-full md:w-auto cursor-not-allowed">
                    <MessageCircle size={16} /> WhatsApp não cadastrado
                  </button>
                )
              ) : (
                app.client_whatsapp ? (
                  <a 
                    href={`https://wa.me/${app.client_whatsapp.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white hover:bg-green-500 rounded-xl transition-colors text-sm font-medium w-full md:w-auto shadow-lg shadow-green-900/20"
                  >
                    <MessageCircle size={16} /> Chamar no WhatsApp
                  </a>
                ) : (
                  <button disabled className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800/50 text-slate-500 border border-white/5 rounded-xl text-sm font-medium w-full md:w-auto cursor-not-allowed">
                    <MessageCircle size={16} /> Sem WhatsApp
                  </button>
                )
              )}

              {/* Botão Cancelar */}
              <button
                onClick={() => setConfirmCancelId(app.id)}
                className="flex items-center justify-center gap-2 px-5 py-2 text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all text-xs font-medium w-full md:w-auto border border-transparent hover:border-red-500/20"
              >
                <X size={14} /> Cancelar Sessão
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* Paginação Elegante */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/10"
          >
            <ChevronLeft size={18} />
          </button>
          
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                  currentPage === page
                    ? isGold
                      ? 'bg-gold-600 text-midnight-950 shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                      : 'bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-white/10"
          >
            <ChevronRight size={18} />
          </button>

          <span className="text-slate-500 text-xs ml-2">
            {startIndex + 1}–{Math.min(startIndex + itemsPerPage, appointments.length)} de {appointments.length}
          </span>
        </div>
      )}
    </div>
  );
}
