export const dynamic = 'force-dynamic';

import { createClient } from "@/utils/supabase/server";
import { BookingFlow } from "@/components/booking/BookingFlow";

export default async function AgendamentoPage({ searchParams }: { searchParams: Promise<{ servico?: string, terapeutaId?: string }> }) {
  const awaitedParams = await searchParams;
  const supabase = await createClient();

  
  // Buscar terapeutas ativos
  const { data: therapists } = await supabase
    .from("therapists")
    .select("*")
    .eq("is_active", true);

  const { data: { user } } = await supabase.auth.getUser();

  // Fetch reservation fee
  const { data: feeData } = await supabase.from('system_settings').select('value').eq('id', 'reservation_fee').single();
  const reservationFee = feeData?.value?.amount || 50;

  return (
    <main className="min-h-screen pt-24 bg-midnight-950 font-sans text-white selection:bg-gold-500/30 overflow-hidden relative">
      {/* Glow de fundo luxuoso */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-gold-900/10 blur-[120px] rounded-full pointer-events-none -z-10" />
      
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-10">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-4">Escolha seu caminho</h1>
          <p className="text-slate-400 font-light max-w-2xl mx-auto">
            Sua jornada de transformação começa com a escolha de um mestre. Selecione um terapeuta para verificar a disponibilidade.
          </p>
        </div>

        <BookingFlow 
          initialTherapists={therapists || []} 
          requestedService={awaitedParams.servico} 
          requestedTherapistId={awaitedParams.terapeutaId}
          user={user} 
          reservationFee={reservationFee}
        />
      </div>
    </main>
  );
}
