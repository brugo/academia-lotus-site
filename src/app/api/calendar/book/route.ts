import { NextResponse } from "next/server";
import { calendar } from "@/lib/google-calendar";
import { createClient } from "@/utils/supabase/server";
import { addMinutes, addHours } from "date-fns";

export async function POST(request: Request) {
  try {
    const { therapistId, therapistEmail, clientName, clientEmail, clientWhatsapp, startTime, requestedService } = await request.json();

    if (!therapistEmail || !clientName || !clientEmail || !clientWhatsapp || !startTime) {
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
        description: `Email do cliente: ${clientEmail}\nWhatsApp do cliente: ${clientWhatsapp}`,
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
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const { error: dbError } = await supabase.from('appointments').insert({
        therapist_id: therapistId,
        client_name: clientName,
        client_email: clientEmail,
        client_whatsapp: clientWhatsapp, // Adicionando WhatsApp
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        google_event_id: event.data.id,
        meet_link: event.data.hangoutLink,
      });
      
      if (dbError) {
        console.error("Falha ao salvar no banco (RLS?):", dbError);
        // Se houver erro de RLS, vamos avisar para debugar
        throw new Error("Agendado no Google, mas falha ao salvar no seu Histórico (Erro de Banco de Dados).");
      }
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
