import { NextResponse } from "next/server";
import { calendar } from "@/lib/google-calendar";
import { createClient } from "@/utils/supabase/server";
import { addMinutes, addHours } from "date-fns";

function parseDuration(durationStr: string): number {
  let minutes = 60; // default 1h
  if (!durationStr) return minutes;
  
  const hMatch = durationStr.match(/(\d+)h/i);
  const mMatch = durationStr.match(/(\d+)m/i);
  
  minutes = 0;
  if (hMatch) minutes += parseInt(hMatch[1]) * 60;
  if (mMatch) minutes += parseInt(mMatch[1]);
  
  if (minutes === 0) minutes = 60; // fallback
  return minutes;
}

export async function POST(request: Request) {
  try {
    const { therapistId, therapistEmail, clientName, clientEmail, clientWhatsapp, startTime, requestedService } = await request.json();

    if (!therapistEmail || !clientName || !clientEmail || !clientWhatsapp || !startTime) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const supabase = await createClient();
    
    let durationMinutes = 60;
    let serviceTitle = requestedService || "Sessão Lótus";

    if (requestedService) {
      // Find the service by matching either slug or title
      const { data: services } = await supabase.from('services').select('slug, title, duration');
      const service = services?.find(s => s.slug === requestedService || s.title === requestedService);
      
      if (service) {
        serviceTitle = service.title;
        if (service.duration) {
          durationMinutes = parseDuration(service.duration);
        }
      }
    }

    const start = new Date(startTime);
    const end = addMinutes(start, durationMinutes);

    // 1. Criar o evento no Google Calendar Master do Terapeuta
    const event = await calendar.events.insert({
      calendarId: therapistEmail,
      sendUpdates: "all", // Manda e-mail de notificação para ambos!
      requestBody: {
        summary: `${serviceTitle} - ${clientName}`,
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
        service_name: serviceTitle, // Salvando o nome da técnica no banco
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
