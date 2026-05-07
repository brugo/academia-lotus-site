import { NextResponse } from 'next/server';
import { createPagBankCheckout, extractPaymentLink } from '@/lib/pagbank';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// Cliente Supabase com Service Role para bypassar RLS
const supabaseAdmin = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      therapistId, 
      therapistEmail,
      therapistName, 
      clientName, 
      clientEmail, 
      clientWhatsapp, 
      startTime, 
      requestedService,
      price 
    } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Buscar a taxa de agendamento (reservation fee) diretamente do banco (mais seguro que receber do client)
    const { data: feeData } = await supabase.from('system_settings').select('value').eq('id', 'reservation_fee').single();
    const reservationFee = feeData?.value?.amount || 50;

    // Gerar um reference_id único para vincular o checkout aos metadados do agendamento
    const referenceId = uuidv4();

    // Armazenar os metadados do agendamento no banco antes de criar o checkout
    // Isso substitui o metadata do Stripe — o webhook vai usar o reference_id para recuperar estes dados
    const { error: pendingError } = await supabaseAdmin.from('pending_checkouts').insert({
      reference_id: referenceId,
      therapist_id: therapistId,
      therapist_email: therapistEmail,
      therapist_name: therapistName || '',
      client_name: clientName,
      client_email: clientEmail,
      client_whatsapp: clientWhatsapp || '',
      start_time: startTime,
      requested_service: requestedService || '',
      user_id: user?.id || null,
      amount_cents: Math.round(reservationFee * 100),
      status: 'pending',
    });

    if (pendingError) {
      console.error('[Checkout] Erro ao salvar pending_checkout:', pendingError);
      return NextResponse.json(
        { error: 'Erro ao preparar pagamento.' },
        { status: 500 }
      );
    }

    // Se o usuário está logado, aproveitamos para atualizar o cadastro dele com Nome e WhatsApp
    if (user?.id) {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { 
          full_name: clientName, 
          whatsapp: clientWhatsapp 
        }
      });
    }

    const host = req.headers.get('host');
    const protocol = req.headers.get('x-forwarded-proto') || 'http';
    const originUrl = host ? `${protocol}://${host}` : (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000');
    
    // Webhook deve sempre usar a URL pública do túnel (configurada no .env)
    const webhookUrl = process.env.PAGBANK_WEBHOOK_URL || `${originUrl}/api/webhooks/pagbank`;
    
    // O PagBank exige URLs públicas até mesmo para o redirecionamento (bloqueia localhost).
    // Usamos a base da URL do webhook (o túnel do Cloudflare) para o redirectUrl.
    const redirectBaseUrl = process.env.PAGBANK_WEBHOOK_URL 
      ? process.env.PAGBANK_WEBHOOK_URL.replace('/api/webhooks/pagbank', '')
      : originUrl;

    // Criar o Checkout no PagBank
    const checkoutResponse = await createPagBankCheckout({
      referenceId,
      itemName: `Taxa de Reserva - ${requestedService || 'Atendimento Terapêutico'}`,
      itemDescription: `Sessão com ${therapistName} - ${new Date(startTime).toLocaleString('pt-BR')}`,
      amountInCents: Math.round(reservationFee * 100), // PagBank usa centavos
      redirectUrl: `${redirectBaseUrl}/agendamento/sucesso?ref=${referenceId}`,
      notificationUrls: [webhookUrl],
      paymentNotificationUrls: [webhookUrl],
      customerName: clientName,
      customerEmail: clientEmail,
      expirationMinutes: 120, // 2 horas
    });

    // Salvar o ID do checkout do PagBank para referência futura
    const pagbankCheckoutId = checkoutResponse.id;
    await supabaseAdmin.from('pending_checkouts')
      .update({ pagbank_checkout_id: pagbankCheckoutId })
      .eq('reference_id', referenceId);

    // Extrair o link de pagamento da resposta do PagBank
    const paymentUrl = extractPaymentLink(checkoutResponse);

    if (!paymentUrl) {
      console.error('[Checkout] Link de pagamento não encontrado na resposta:', checkoutResponse);
      return NextResponse.json(
        { error: 'Erro ao gerar link de pagamento.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: paymentUrl });
  } catch (error: any) {
    console.error('Erro ao criar checkout:', error);
    return NextResponse.json(
      { error: 'Erro ao processar pagamento.' },
      { status: 500 }
    );
  }
}
