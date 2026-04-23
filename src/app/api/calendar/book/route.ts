import { NextResponse } from "next/server";
import { calendar } from "@/lib/google-calendar";
import { createClient } from "@supabase/supabase-js";
import { addMinutes, addHours } from "date-fns";

// Instância de Admin do Supabase (para furar RLS e inserir do servidor de forma segura)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Fallback para dev local
);

export async function POST(request: Request) {
  try {
    const { therapistId, therapistEmail, clientName, clientEmail, startTime, requestedService } = await request.json();

    if (!therapistEmail || !clientName || !clientEmail || !startTime) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const start = new Date(startTime);
    // Assumindo padrão de 1 hora de consulta
    const end = addHours(start, 1);

    // 1. Criar o evento no Google Calendar Master do Terapeuta
    const event = await calendar.events.insert({
      calendarId: therapistEmail,
      sendUpdates: "all", // Manda e-mail de notificação para ambos!
      requestBody: {
        summary: requestedService ? `${requestedService} - ${clientName}` : `Sessão Lótus - ${clientName}`,
        description: `Email do cliente: ${clientEmail}`,
        start: {
          dateTime: start.toISOString(),
          timeZone: "America/Sao_Paulo",
        },
        end: {
          dateTime: end.toISOString(),
          timeZone: "America/Sao_Paulo",
        }
      }
    });

    // 2. Registrar no nosso Supabase
    if (therapistId) {
      const { error: dbError } = await supabaseAdmin.from('appointments').insert({
        therapist_id: therapistId,
        client_name: clientName,
        client_email: clientEmail,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        google_event_id: event.data.id,
      });
      if (dbError) console.error("Falha ao salvar no banco (RLS?):", dbError);
    }

    return NextResponse.json({ 
      success: true, 
      eventId: event.data.id,
      meetLink: event.data.hangoutLink
    });

  } catch (error: any) {
    console.error("Erro ao agendar Google:", error);
    return NextResponse.json({ error: error.message || JSON.stringify(error) }, { status: 500 });
  }
}
