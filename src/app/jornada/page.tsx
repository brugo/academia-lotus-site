import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { format, isAfter, isBefore } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { Calendar, Clock, MessageCircle, User as UserIcon, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Meu Perfil - Academia Lótus',
  description: 'Acompanhe seus agendamentos e histórico na Academia Espiritual de Lótus.',
};

export default async function JornadaPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/jornada');
  }

  // Verificar se o usuário logado é um terapeuta
  const { data: loggedTherapist } = await supabase
    .from('therapists')
    .select('id')
    .eq('email', user.email)
    .single();

  const isTherapist = !!loggedTherapist;

  // Buscar todos os agendamentos deste email, trazendo os dados do terapeuta relacionado
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      *,
      therapists (
        name,
        specialty,
        photo_url,
        whatsapp
      )
    `)
    .eq('client_email', user.email)
    .order('start_time', { ascending: true });

  const now = new Date();
  
  // Separar agendamentos em futuros e passados
  const upcomingAppointments = appointments?.filter(app => isAfter(new Date(app.start_time), now)) || [];
  const pastAppointments = appointments?.filter(app => isBefore(new Date(app.start_time), now)).sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()) || [];

  return (
    <main className="min-h-screen pt-24 pb-20 bg-midnight-950 font-sans text-white selection:bg-gold-500/30 overflow-hidden relative">
      {/* Background Decorativo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gold-900/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      <div className="container mx-auto px-4 md:px-8 max-w-5xl">
        
        {/* Cabeçalho do Usuário */}
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 mb-16 pt-8">
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-gold-500/30 shadow-[0_0_30px_rgba(212,175,55,0.15)] flex-shrink-0 bg-midnight-900 flex items-center justify-center">
            {user.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt={user.user_metadata?.full_name || 'Usuário'} className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={48} className="text-gold-400/50" />
            )}
          </div>
          
          <div className="text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-medium tracking-widest text-gold-400 uppercase mb-4">
              <Sparkles size={14} /> Portal do Cliente
            </div>
            <h1 className="font-serif text-3xl md:text-5xl text-white mb-2">
              Bem-vindo(a), {user.user_metadata?.full_name?.split(' ')[0] || 'Viajante'}
            </h1>
            <p className="text-slate-400 font-light text-lg">
              Esta é a sua jornada de autoconhecimento e transformação.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3 justify-center">
            {isTherapist && (
              <Link href="/portal-terapeuta" className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] text-sm flex items-center justify-center">
                Portal do Terapeuta
              </Link>
            )}
            {user.email === 'brugohb@gmail.com' && (
              <Link href="/admin" className="px-6 py-3 bg-gold-600 hover:bg-gold-500 text-midnight-950 font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] text-sm flex items-center justify-center">
                Painel Admin
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Coluna Principal: Próximos Encontros */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-white flex items-center gap-3">
                <Calendar className="text-gold-500" size={24} /> Próximos Encontros
              </h2>
            </div>

            {upcomingAppointments.length === 0 ? (
              <div className="bg-midnight-900/50 border border-white/5 rounded-3xl p-10 text-center relative overflow-hidden backdrop-blur-sm">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-500">
                  <Calendar size={32} />
                </div>
                <h3 className="text-xl text-white mb-2">Nenhum encontro agendado</h3>
                <p className="text-slate-400 font-light mb-6 max-w-md mx-auto">
                  Você ainda não tem nenhum agendamento futuro. Que tal dar o próximo passo na sua jornada?
                </p>
                <Link href="/agendamento" className="inline-flex px-6 py-3 bg-gold-600 text-midnight-950 hover:bg-gold-500 font-medium rounded-full transition-colors">
                  Explorar Terapias
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingAppointments.map((app) => (
                  <div key={app.id} className="bg-gradient-to-r from-midnight-900 to-midnight-950 border border-gold-500/20 hover:border-gold-500/40 transition-colors rounded-3xl p-6 relative overflow-hidden group">
                    {/* Borda Glow */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-gold-500 shadow-[0_0_10px_rgba(212,175,55,0.8)]" />
                    
                    <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 text-gold-400 text-sm font-medium mb-2">
                          <Clock size={16} />
                          {format(new Date(app.start_time), "EEEE, dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </div>
                        <h3 className="text-xl text-white font-medium mb-1">
                          {app.service_name || 'Sessão Lótus'}
                        </h3>
                        <p className="text-slate-400 text-sm">com {app.therapists?.name || 'Terapeuta'} • {app.therapists?.specialty || 'Especialista'}</p>
                      </div>
                      
                      <div className="flex-shrink-0 w-full md:w-auto flex flex-col gap-3">
                        <div className="flex -space-x-3 items-center justify-center md:justify-end">
                          <img src={app.therapists?.photo_url || '/placeholder.png'} alt="Terapeuta" className="w-12 h-12 rounded-full border-2 border-midnight-950 object-cover relative z-10" />
                          <div className="w-12 h-12 rounded-full border-2 border-midnight-950 bg-gold-900/50 flex items-center justify-center text-gold-400 relative z-0">
                            {user.user_metadata?.avatar_url ? (
                              <img src={user.user_metadata.avatar_url} className="w-full h-full rounded-full object-cover opacity-80" alt="" />
                            ) : (
                              <UserIcon size={16} />
                            )}
                          </div>
                        </div>
                        {app.therapists?.whatsapp ? (
                          <a 
                            href={`https://wa.me/${app.therapists.whatsapp.replace(/\D/g, '')}`} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 rounded-xl transition-colors text-sm font-medium w-full md:w-auto"
                          >
                            <MessageCircle size={16} /> Falar no WhatsApp
                          </a>
                        ) : (
                          <button 
                            disabled
                            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-800/50 text-slate-500 border border-white/5 rounded-xl text-sm font-medium w-full md:w-auto cursor-not-allowed"
                          >
                            <MessageCircle size={16} /> WhatsApp não cadastrado
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coluna Lateral: Histórico */}
          <div className="space-y-6">
            <h2 className="font-serif text-2xl text-white flex items-center gap-3 mb-6">
              <CheckCircle2 className="text-slate-500" size={24} /> Histórico
            </h2>

            <div className="bg-midnight-900/30 border border-white/5 rounded-3xl p-6">
              {pastAppointments.length === 0 ? (
                <p className="text-slate-500 text-sm text-center py-8">
                  Nenhum encontro anterior registrado.
                </p>
              ) : (
                <div className="space-y-6">
                  {pastAppointments.map((app, index) => (
                    <div key={app.id} className="relative pl-6 border-l border-white/10 last:border-l-transparent">
                      <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-slate-700 border-2 border-midnight-950" />
                      <div className="mb-1 text-xs font-medium text-slate-500 uppercase tracking-wider">
                        {format(new Date(app.start_time), "dd MMM yyyy", { locale: ptBR })}
                      </div>
                      <div className="text-white font-medium text-sm">
                        {app.therapists?.name || 'Terapeuta'}
                      </div>
                      <div className="text-slate-400 text-xs mt-1">
                        {app.therapists?.specialty || 'Sessão concluída'}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Suporte Card */}
            <div className="bg-gradient-to-br from-gold-900/20 to-transparent border border-gold-500/10 rounded-3xl p-6 text-center">
              <h3 className="text-white font-medium mb-2">Precisa de ajuda?</h3>
              <p className="text-slate-400 text-sm mb-4">
                Se precisar reagendar ou tiver alguma dúvida, entre em contato com nosso suporte.
              </p>
              <a href="#" className="inline-flex items-center text-gold-400 text-sm hover:text-gold-300 font-medium mb-6">
                Falar no WhatsApp <ChevronRight size={16} />
              </a>
              
              <div className="pt-6 border-t border-white/5">
                <form action="/auth/signout" method="POST">
                  <button type="submit" className="text-slate-500 text-sm hover:text-red-400 transition-colors">
                    Sair da minha conta
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}
