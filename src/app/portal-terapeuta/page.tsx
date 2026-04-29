import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { isAfter, isBefore } from 'date-fns';
import { Calendar, User as UserIcon, LogOut, Sparkles, Settings } from 'lucide-react';
import Link from 'next/link';
import PaginatedAppointments from '@/components/PaginatedAppointments';
import PaginatedHistory from '@/components/PaginatedHistory';

export const metadata = {
  title: 'Portal do Terapeuta - Academia Lótus',
  description: 'Gerencie sua agenda e pacientes.',
};

export default async function PortalTerapeutaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/portal-terapeuta');
  }

  // 1. Verificar se o usuário logado é um terapeuta pelo E-mail
  const { data: therapist, error: therapistError } = await supabase
    .from('therapists')
    .select('*')
    .eq('email', user.email)
    .single();

  if (therapistError || !therapist) {
    return (
      <main className="min-h-screen pt-32 pb-20 bg-midnight-950 flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <UserIcon size={40} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-serif text-white mb-2">Acesso Restrito</h1>
        <p className="text-slate-400 max-w-md">
          Sua conta não está vinculada a um perfil de terapeuta. Se você é um terapeuta da Academia Lótus, entre em contato com o administrador para vincular sua conta.
        </p>
        <form action="/auth/signout" method="POST" className="mt-8">
          <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-full transition-colors border border-white/10">
            Sair e voltar ao início
          </button>
        </form>
      </main>
    );
  }

  // 2. Buscar agendamentos deste terapeuta
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select('*')
    .eq('therapist_id', therapist.id)
    .order('start_time', { ascending: true });

  const now = new Date();
  
  // Separar agendamentos em futuros e passados
  const upcomingAppointments = appointments?.filter(app => isAfter(new Date(app.start_time), now)) || [];
  const pastAppointments = appointments?.filter(app => isBefore(new Date(app.start_time), now)).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()) || [];

  // Injetar o email do terapeuta nos agendamentos para o componente de cancelamento
  const upcomingWithEmail = upcomingAppointments.map(app => ({ ...app, therapist_email: therapist.email }));

  return (
    <main className="min-h-screen pt-24 pb-20 bg-midnight-950 font-sans text-white selection:bg-gold-500/30 overflow-hidden relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-emerald-900/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        
        {/* Cabeçalho do Terapeuta */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 mb-16 pt-8">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.15)] flex-shrink-0 bg-midnight-900 flex items-center justify-center">
            {therapist.photo_url ? (
              <img src={therapist.photo_url} alt={therapist.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={48} className="text-emerald-400/50" />
            )}
          </div>
          
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium tracking-widest text-emerald-400 uppercase mb-4">
              <Sparkles size={14} /> Portal do Terapeuta
            </div>
            <h1 className="font-serif text-3xl md:text-5xl text-white mb-2">
              Olá, {therapist.name.split(' ')[0]}
            </h1>
            <p className="text-slate-400 font-light text-lg">
              Gerencie seus atendimentos e conecte-se com seus pacientes.
            </p>
          </div>
          
          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <Link
              href="/portal-terapeuta/configuracoes"
              className="flex items-center gap-2 px-5 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 rounded-xl transition-all text-sm font-medium border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
            >
              <Settings size={16} /> Configurações
            </Link>
            <form action="/auth/signout" method="POST">
              <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors text-sm font-medium border border-red-500/20">
                <LogOut size={16} /> Sair
              </button>
            </form>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Coluna Principal: Próximos Atendimentos */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-white flex items-center gap-3">
                <Calendar className="text-emerald-500" size={24} /> Próximos Atendimentos
              </h2>
              {upcomingAppointments.length > 0 && (
                <span className="text-xs text-slate-500 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                  {upcomingAppointments.length} agendado{upcomingAppointments.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="bg-midnight-900/50 border border-white/5 rounded-3xl p-10 text-center relative overflow-hidden backdrop-blur-sm">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
                  <Calendar size={32} />
                </div>
                <h3 className="text-xl text-white mb-2">Agenda Livre</h3>
                <p className="text-slate-400 font-light mb-6 max-w-md mx-auto">
                  Você não tem nenhum atendimento marcado para o futuro próximo.
                </p>
              </div>
            ) : (
              <PaginatedAppointments
                appointments={upcomingWithEmail}
                variant="therapist"
                itemsPerPage={4}
                accentColor="emerald"
              />
            )}
          </div>

          {/* Coluna Lateral: Histórico Rápido */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl text-white flex items-center gap-3 mb-6">
               Histórico Recente
            </h2>

            <div className="bg-midnight-900/30 border border-white/5 rounded-3xl p-6">
              <PaginatedHistory
                items={pastAppointments}
                variant="therapist"
                initialVisible={5}
                stepSize={5}
              />
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
