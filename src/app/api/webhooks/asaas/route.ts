import { NextResponse } from 'next/server';
import { calendar } from '@/lib/google-calendar';
import { createClient } from '@supabase/supabase-js';
import { addMinutes, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { sendBookingNotificationEmails } from '@/lib/email';

// Cliente Supabase com Service Role para bypassar RLS (webhook não tem sessão de usuário)
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

/**
 * Webhook handler para notificações do Asaas.
 */
export async function POST(req: Request) {
  const asaasToken = req.headers.get('asaas-access-token');
  const expectedToken = process.env.ASAAS_WEBHOOK_SECRET;

  if (expectedToken && asaasToken !== expectedToken) {
    console.error('[Asaas Webhook] Falha de autenticação: token inválido.');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: any;
  const contentType = req.headers.get('content-type') || '';

  try {
    if (contentType.includes('application/json')) {
      payload = await req.json();
    } else {
      const text = await req.text();
      payload = JSON.parse(text);
    }
  } catch (error) {
    console.error('[Asaas Webhook] Erro ao parsear body:', error);
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  console.log('[Asaas Webhook] Notificação recebida, Evento:', payload.event);

  // O Asaas envia webhooks de vários tipos. Queremos apenas pagamentos aprovados.
  if (payload.event !== 'PAYMENT_RECEIVED' && payload.event !== 'PAYMENT_CONFIRMED') {
    console.log('[Asaas Webhook] Evento ignorado:', payload.event);
    return NextResponse.json({ received: true });
  }

  const payment = payload.payment;
  if (!payment) {
    console.error('[Asaas Webhook] Objeto payment ausente');
    return NextResponse.json({ received: true, error: 'missing_payment' });
  }

  // externalReference contém o nosso reference_id do pending_checkouts
  const referenceId = payment.externalReference;

  if (!referenceId) {
    console.error('[Asaas Webhook] externalReference ausente no payload (não vinculado ao nosso sistema)');
    return NextResponse.json({ received: true, error: 'missing_reference_id' });
  }

  // TRAVA 1: Se este exato evento já está sendo processado neste instante, ignorar
  if (processingEvents.has(referenceId)) {
    console.log(`[DUPLICATA BLOQUEADA] Evento ${referenceId} já está sendo processado.`);
    return NextResponse.json({ received: true, duplicate: true });
  }
  processingEvents.add(referenceId);

  try {
    // Buscar os metadados do agendamento armazenados no banco durante o checkout
    const { data: pendingCheckout, error: fetchError } = await supabase
      .from('pending_checkouts')
      .select('*')
      .eq('reference_id', referenceId)
      .single();

    if (fetchError || !pendingCheckout) {
      console.error('[Asaas Webhook] pending_checkout não encontrado para reference_id:', referenceId, fetchError);
      return NextResponse.json({ received: true, error: 'checkout_not_found' });
    }

    // Se já foi processado, bloquear duplicata
    if (pendingCheckout.status === 'completed') {
      console.log(`[DUPLICATA BLOQUEADA] Checkout ${referenceId} já foi processado.`);
      return NextResponse.json({ received: true, duplicate: true });
    }

    const {
      therapist_id: therapistId,
      therapist_email: therapistEmail,
      therapist_name: therapistName,
      client_name: clientName,
      client_email: clientEmail,
      client_whatsapp: clientWhatsapp,
      start_time: startTime,
      requested_service: requestedService,
    } = pendingCheckout;

    console.log(`[Asaas Webhook] Pagamento confirmado para: ${clientName} com terapeuta: ${therapistEmail} (ref: ${referenceId})`);

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
      // Marcar como completed para evitar reprocessamento
      await supabase.from('pending_checkouts')
        .update({ status: 'completed' })
        .eq('reference_id', referenceId);
      return NextResponse.json({ received: true, duplicate: true });
    }

    // PASSO 1: Salvar no banco PRIMEIRO
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
        console.error("[Asaas Webhook] Erro ao salvar no banco (Supabase):", dbError);
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
        description: `Email do cliente: ${clientEmail}\nWhatsApp: ${clientWhatsapp}\nPagamento confirmado via Asaas.`,
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

    // PASSO 4: Marcar o checkout pendente como concluído
    await supabase.from('pending_checkouts')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        pagbank_order_id: payment.id || null, // Reusamos a coluna antiga
      })
      .eq('reference_id', referenceId);

    console.log(`✅ Agendamento criado com sucesso: ${serviceTitle} - ${clientName} em ${start.toISOString()}`);

    // PASSO 5: Buscar dados do terapeuta e enviar e-mails
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
    console.error("[Asaas Webhook] Erro ao processar agendamento pós-pagamento:", error);
  } finally {
    // Liberar a trava
    processingEvents.delete(referenceId);
  }

  return NextResponse.json({ received: true });
}
