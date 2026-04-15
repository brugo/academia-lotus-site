"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, Clock, Loader2 } from "lucide-react";
import { format, addDays, isSameDay, startOfDay, parseISO, isBefore, addHours, isWithinInterval, endOfDay } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

export function CalendarSelection({ therapist, onBack, onDateSelect, requestedService }: { therapist: any, onBack: () => void, onDateSelect: (d: Date) => void, requestedService?: string }) {
  const [loading, setLoading] = useState(true);
  const [busySlots, setBusySlots] = useState<{start: string, end: string}[]>([]);
  const [pageOffset, setPageOffset] = useState(0); // 0 = hoje até 14 dias, 1 = 14 a 28 dias
  
  const [selectedDay, setSelectedDay] = useState<Date>(startOfDay(new Date()));
  
  const next14Days = Array.from({ length: 14 }).map((_, i) => addDays(startOfDay(new Date()), i + (pageOffset * 14)));
  const baseHours = [9, 10, 11, 13, 14, 15, 16, 17];

  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true);
      const targetEmail = therapist.google_calendar_id || therapist.email;
      const startParam = next14Days[0].toISOString();
      const endParam = endOfDay(next14Days[13]).toISOString();
      
      try {
        const res = await fetch(`/api/calendar/availability?email=${encodeURIComponent(targetEmail)}&start=${encodeURIComponent(startParam)}&end=${encodeURIComponent(endParam)}`);
        const data = await res.json();
        if (data.success) {
          setBusySlots(data.busySlots);
          // Auto-selecionar o primeiro dia da nova página
          setSelectedDay(next14Days[0]);
        }
      } catch (err) {
        console.error("Erro ao buscar agenda:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAvailability();
  }, [therapist.email, therapist.google_calendar_id, pageOffset]);

  // Lógica para saber se um slot está livre
  const isSlotFree = (hour: number, day: Date) => {
    const slotStart = addHours(day, hour);
    const slotEnd = addHours(day, hour + 1); // Consultas de 1 hora
    
    // Passado já foi
    if (isBefore(slotStart, new Date())) return false;

    // Checar contra o Google Calendar
    for (const busy of busySlots) {
      const bStart = parseISO(busy.start);
      const bEnd = parseISO(busy.end);
      
      // Se tiver sobreposição
      if (
         (slotStart >= bStart && slotStart < bEnd) || 
         (slotEnd > bStart && slotEnd <= bEnd) ||
         (slotStart <= bStart && slotEnd >= bEnd)
      ) {
         return false;
      }
    }
    return true;
  };

  const availableSlots = baseHours.map(h => ({
    hour: h,
    date: addHours(selectedDay, h),
    isFree: isSlotFree(h, selectedDay)
  }));

  return (
    <div className="w-full max-w-4xl mx-auto pb-32">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 
        Voltar para os Terapeutas
      </button>

      <div className="bg-midnight-900 border border-white/5 rounded-3xl p-6 md:p-10 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-gold-900/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-white/10 relative z-10">
           <div className="flex items-center gap-4">
             <img src={therapist.photo_url} alt={therapist.name} className="w-16 h-16 rounded-full object-cover border border-white/10 shadow-[0_0_20px_rgba(212,175,55,0.1)]" />
             <div>
               <h2 className="text-2xl font-serif text-white">{therapist.name}</h2>
               <p className="text-gold-400 text-sm">Selecione o momento da sua conexão</p>
             </div>
           </div>
           
           {requestedService && (
             <div className="bg-gradient-to-r from-midnight-950 to-midnight-900 border border-gold-500/20 px-5 py-3 rounded-2xl flex items-center gap-4 shadow-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] mb-0.5">Jornada Escolhida</span>
                  <span className="text-white font-medium tracking-wide text-sm">{requestedService}</span>
                </div>
             </div>
           )}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-gold-500" size={32} />
            <p className="text-slate-400">Sincronizando deuses do tempo (Google Agenda)...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Esquerda: Seletor de Dias (Grid original com blocos grandes) */}
            <div>
              <div className="flex items-center justify-between mb-6">
                 <h3 className="flex items-center gap-2 text-white font-medium capitalize">
                   <Calendar size={18} className="text-gold-500" /> 
                   {format(next14Days[0], "MMMM 'de' yyyy", { locale: ptBR })}
                 </h3>
                 <div className="flex items-center gap-2">
                   <button 
                     disabled={pageOffset === 0} 
                     onClick={() => setPageOffset(p => Math.max(0, p - 1))}
                     className="px-3 py-1.5 bg-midnight-800 disabled:opacity-30 border border-white/5 rounded text-xs text-white hover:bg-gold-500/20 hover:text-gold-400 transition-all font-medium uppercase"
                   >
                     {`< Anterior`}
                   </button>
                   <button 
                     onClick={() => setPageOffset(p => p + 1)}
                     className="px-3 py-1.5 bg-midnight-800 border border-white/5 rounded text-xs text-white hover:bg-gold-500/20 hover:text-gold-400 transition-all font-medium uppercase"
                   >
                     {`Próximos >`}
                   </button>
                 </div>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 gap-3">
                 {next14Days.map((day, idx) => {
                   const isSelected = isSameDay(day, selectedDay);
                   return (
                     <button
                       key={idx}
                       onClick={() => setSelectedDay(day)}
                       className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all border ${
                         isSelected 
                          ? 'bg-gold-500 text-midnight-950 border-gold-500 shadow-lg scale-105' 
                          : 'bg-white/5 text-slate-300 border-white/5 hover:border-white/20'
                       }`}
                     >
                       <span className={`text-xs uppercase font-medium mb-1 ${isSelected ? 'text-midnight-950/70' : 'text-slate-500'}`}>
                         {format(day, 'EEE', { locale: ptBR })}
                       </span>
                       <span className="text-xl font-serif">
                         {format(day, 'd')}
                       </span>
                     </button>
                   );
                 })}
              </div>
            </div>

            {/* Direita: Horários do dia selecionado */}
            <div>
              <h3 className="flex items-center gap-2 text-white font-medium mb-6">
                <Clock size={18} className="text-gold-500" /> Horários em {format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                 {availableSlots.length > 0 ? availableSlots.map((slot) => (
                   <button
                     key={slot.hour}
                     disabled={!slot.isFree}
                     onClick={() => onDateSelect(slot.date)}
                     className={`flex items-center justify-center py-4 rounded-xl transition-all border ${
                       slot.isFree
                        ? 'bg-midnight-800 border-white/10 hover:border-gold-500/50 hover:bg-gold-500/5 text-white shadow-sm'
                        : 'bg-transparent border-dashed border-white/5 text-slate-700 cursor-not-allowed opacity-50'
                     }`}
                   >
                     {slot.hour.toString().padStart(2, '0')}:00
                   </button>
                 )) : (
                    <p className="col-span-2 text-slate-500 italic py-4">Sem horários programados neste dia.</p>
                 )}
              </div>
              
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
