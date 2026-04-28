import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { ArrowLeft, Settings, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AvailabilityManager } from '@/components/terapeuta/AvailabilityManager';

export const metadata = {
  title: 'Configurações do Terapeuta - Academia Lótus',
  description: 'Gerencie sua disponibilidade e configurações de agenda.',
};

export default async function ConfiguracoesTerapeutaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/portal-terapeuta/configuracoes');
  }

  const { data: therapist } = await supabase
    .from('therapists')
    .select('*')
    .eq('email', user.email)
    .single();

  if (!therapist) {
    redirect('/portal-terapeuta');
  }

  return (
    <main className="min-h-screen pt-24 pb-20 bg-midnight-950 font-sans text-white selection:bg-emerald-500/30 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-emerald-900/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        {/* Navigation */}
        <Link
          href="/portal-terapeuta"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group text-sm"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Voltar ao Portal
        </Link>

        {/* Header */}
        <div className="flex flex-col md:flex-row items-start gap-6 mb-12">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)] flex-shrink-0 bg-midnight-900 flex items-center justify-center">
            {therapist.photo_url && therapist.photo_url !== '/user-placeholder.png' ? (
              <img src={therapist.photo_url} alt={therapist.name} className="w-full h-full object-cover" />
            ) : (
              <Settings size={28} className="text-emerald-400/50" />
            )}
          </div>

          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium tracking-widest text-emerald-400 uppercase mb-3">
              <Sparkles size={12} /> Configurações
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-white mb-2">
              Minha Agenda
            </h1>
            <p className="text-slate-400 font-light">
              Defina seus horários de atendimento e gerencie bloqueios de datas.
              As configurações aqui serão refletidas automaticamente na página de agendamento.
            </p>
          </div>
        </div>

        {/* Availability Manager */}
        <div className="bg-midnight-900/40 border border-white/5 rounded-3xl p-6 md:p-10 backdrop-blur-sm shadow-2xl">
          <AvailabilityManager therapistId={therapist.id} />
        </div>
      </div>
    </main>
  );
}
