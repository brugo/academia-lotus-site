import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { calendar } from '@/lib/google-calendar';

// Service Role para bypassar RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const { appointmentId, therapistEmail } = await req.json();

    if (!appointmentId) {
      return NextResponse.json({ error: 'ID do agendamento é obrigatório.' }, { status: 400 });
    }

    // 1. Buscar o agendamento no banco para pegar o google_event_id
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', appointmentId)
      .single();

    if (fetchError || !appointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 });
    }

    // 2. Remover do Google Calendar se possível
    const calendarId = therapistEmail || appointment.therapist_email;
    if (appointment.google_event_id && appointment.google_event_id !== 'pending' && calendarId) {
      try {
        // Buscar o e-mail do terapeuta se não foi enviado
        let calEmail = calendarId;
        if (!calEmail) {
          const { data: therapist } = await supabase
            .from('therapists')
            .select('email')
            .eq('id', appointment.therapist_id)
            .single();
          calEmail = therapist?.email;
        }

        if (calEmail) {
          await calendar.events.delete({
            calendarId: calEmail,
            eventId: appointment.google_event_id,
            sendUpdates: 'all',
          });
          console.log(`✅ Evento removido do Google Calendar: ${appointment.google_event_id}`);
        }
      } catch (gcalError: any) {
        console.error('Aviso: Não foi possível remover do Google Calendar:', gcalError.message);
        // Continuar mesmo se falhar a remoção do Google (o evento pode já ter sido removido manualmente)
      }
    }

    // 3. Remover do banco Supabase
    const { error: deleteError } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentId);

    if (deleteError) {
      console.error('Erro ao deletar agendamento:', deleteError);
      return NextResponse.json({ error: 'Erro ao cancelar agendamento.' }, { status: 500 });
    }

    console.log(`✅ Agendamento ${appointmentId} cancelado com sucesso.`);
    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Erro ao cancelar agendamento:', error);
    return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 500 });
  }
}
