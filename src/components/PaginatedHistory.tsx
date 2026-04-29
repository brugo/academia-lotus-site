"use client";

import { useState } from 'react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface HistoryItem {
  id: string;
  start_time: string;
  service_name?: string;
  client_name?: string;
  therapists?: {
    name: string;
    specialty: string;
  };
}

interface PaginatedHistoryProps {
  items: HistoryItem[];
  variant: 'client' | 'therapist';
  initialVisible?: number;
  stepSize?: number;
}

export default function PaginatedHistory({
  items,
  variant,
  initialVisible = 5,
  stepSize = 5,
}: PaginatedHistoryProps) {
  const [visibleCount, setVisibleCount] = useState(initialVisible);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;
  const canCollapse = visibleCount > initialVisible;

  return (
    <div className="space-y-6">
      {items.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-8">
          {variant === 'client' ? 'Nenhum encontro anterior registrado.' : 'Nenhum atendimento anterior.'}
        </p>
      ) : (
        <>
          <div className="space-y-6">
            {visibleItems.map((app) => (
              <div key={app.id} className="relative pl-6 border-l border-white/10 last:border-l-transparent">
                <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-700 border-2 border-midnight-950" />
                <div className="mb-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
                  {format(new Date(app.start_time), "dd MMM yyyy", { locale: ptBR })}
                </div>
                <div className="text-white font-medium text-sm">
                  {variant === 'client'
                    ? app.therapists?.name || 'Terapeuta'
                    : `${app.service_name || 'Sessão'} • ${app.client_name}`
                  }
                </div>
                <div className="text-slate-400 text-xs mt-1">
                  {variant === 'client'
                    ? app.therapists?.specialty || 'Sessão concluída'
                    : format(new Date(app.start_time), "HH:mm", { locale: ptBR })
                  }
                </div>
              </div>
            ))}
          </div>

          {/* Botões Ver Mais / Ver Menos */}
          <div className="flex flex-col gap-2 pt-2">
            {hasMore && (
              <button
                onClick={() => setVisibleCount(prev => Math.min(prev + stepSize, items.length))}
                className="flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/5 hover:border-white/10"
              >
                <ChevronDown size={14} />
                Ver mais ({items.length - visibleCount} restantes)
              </button>
            )}
            {canCollapse && (
              <button
                onClick={() => setVisibleCount(initialVisible)}
                className="flex items-center justify-center gap-1.5 w-full py-2 text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors"
              >
                <ChevronUp size={14} />
                Recolher
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
