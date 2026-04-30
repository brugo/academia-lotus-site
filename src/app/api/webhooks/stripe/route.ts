import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { calendar } from '@/lib/google-calendar';
import { createClient } from '@supabase/supabase-js';
import { addMinutes, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { sendBookingNotificationEmails } from '@/lib/email';

// Cria um cliente Supabase com a Service Role para bypassar RLS, pois o webhook
// não tem o cookie de autenticação do usuário.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Trava em memória para evitar processamento simultâneo do mesmo evento
const processingEvents = new Set<string>();

function parseDuration(durationStr: string): number {
  let minutes = 60; // default 1h
  if (!durationStr) return minutes;
  
  const hMatch = durationStr.match(/(\d+)h/i);
  const mMatch = durationStr.match(/(\d+)m/i);
  
  minutes = 0;
  if (hMatch) minutes += parseInt(hMatch[1]) * 60;
  if (mMatch) minutes += parseInt(mMatch[1]);
  
  if (minutes === 0) minutes = 60;
  return minutes;
}

export async function POST(req: Request) {
  const bodyBuffer = Buffer.from(await req.arrayBuffer());
  const signature = req.headers.get('stripe-signature') as string;
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim() as string;
  
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      bodyBuffer,
      signature,
      secret
    );
  } catch (error: any) {
    console.error(`Erro no Webhook: ${error.message}`);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Só processar checkout.session.completed — ignorar todos os outros eventos
  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as any;
  const stripeSessionId = session.id as string;

  // TRAVA 1: Se este exato evento já está sendo processado neste instante, ignorar
  if (processingEvents.has(stripeSessionId)) {
    console.log(`[DUPLICATA BLOQUEADA] Evento ${stripeSessionId} já está sendo processado.`);
    return NextResponse.json({ received: true, duplicate: true });
  }
  processingEvents.add(stripeSessionId);

  try {
    // Extrai os metadados que enviamos na hora de criar o checkout
    const {
      therapistId,
      therapistEmail,
      therapistName,
      clientName,
      clientEmail,
      clientWhatsapp,
      startTime,
      requestedService
    } = session.metadata;

    console.log(`Pagamento confirmado para: ${clientName} com terapeuta: ${therapistEmail} (sessão: ${stripeSessionId})`);

    let durationMinutes = 60;
    let serviceTitle = requestedService || "Sessão Lótus";

    if (requestedService) {
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

    // TRAVA 2: Verificar no banco se já existe agendamento para este mesmo horário/terapeuta/cliente
    const { data: existingAppts } = await supabase
      .from('appointments')
      .select('id')
      .eq('therapist_id', therapistId)
      .eq('start_time', start.toISOString())
      .eq('client_email', clientEmail);

    if (existingAppts && existingAppts.length > 0) {
      console.log(`[DUPLICATA BLOQUEADA] Já existe agendamento no banco para ${clientEmail} às ${start.toISOString()}`);
      return NextResponse.json({ received: true, duplicate: true });
    }

    // PASSO 1: Salvar no banco PRIMEIRO (para que a segunda requisição encontre o registro)
    let appointmentId: string | null = null;
    if (therapistId) {
      const { data: inserted, error: dbError } = await supabase.from('appointments').insert({
        therapist_id: therapistId,
        client_name: clientName,
        client_email: clientEmail,
        client_whatsapp: clientWhatsapp,
        service_name: serviceTitle,
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        google_event_id: 'pending',
        meet_link: null,
      }).select('id').single();

      if (dbError) {
        console.error("Erro ao salvar no banco (Supabase):", dbError);
      } else {
        appointmentId = inserted?.id;
      }
    }

    // PASSO 2: Criar no Google Calendar
    const gcalEvent = await calendar.events.insert({
      calendarId: therapistEmail,
      sendUpdates: "all",
      requestBody: {
        summary: `${serviceTitle} - ${clientName}`,
        description: `Email do cliente: ${clientEmail}\nWhatsApp: ${clientWhatsapp}\nPagamento confirmado via Stripe.`,
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

    // PASSO 3: Atualizar o banco com os dados do Google Calendar
    if (appointmentId && gcalEvent.data.id) {
      await supabase.from('appointments')
        .update({
          google_event_id: gcalEvent.data.id,
          meet_link: gcalEvent.data.hangoutLink,
        })
        .eq('id', appointmentId);
    }

    console.log(`✅ Agendamento criado com sucesso: ${serviceTitle} - ${clientName} em ${start.toISOString()}`);

    // PASSO 4: Buscar dados do terapeuta (whatsapp) e enviar e-mails de notificação
    let therapistDisplayName = therapistName || 'Terapeuta';
    let therapistWhatsapp = '';
    if (therapistId) {
      const { data: therapistData } = await supabase
        .from('therapists')
        .select('name, whatsapp')
        .eq('id', therapistId)
        .single();
      if (therapistData) {
        therapistDisplayName = therapistData.name || therapistDisplayName;
        therapistWhatsapp = therapistData.whatsapp || '';
      }
    }

    await sendBookingNotificationEmails({
      clientName,
      clientEmail,
      clientWhatsapp: clientWhatsapp || '',
      therapistName: therapistDisplayName,
      therapistEmail,
      therapistWhatsapp,
      serviceName: serviceTitle,
      dateFormatted: format(start, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }),
      timeFormatted: format(start, 'HH:mm', { locale: ptBR }),
      dayOfWeek: format(start, 'EEEE', { locale: ptBR }),
    });

  } catch (error) {
    console.error("Erro ao processar agendamento pós-pagamento:", error);
  } finally {
    // Liberar a trava após finalizar (com ou sem erro)
    processingEvents.delete(stripeSessionId);
  }

  return NextResponse.json({ received: true });
}
