import { NextResponse } from 'next/server';
import { getOrCreateAsaasCustomer, createTransparentAsaasPayment, getAsaasPixQrCode } from '@/lib/asaas';
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
      clientCpf,
      startTime, 
      requestedService,
      paymentMethod,
      creditCard,
      creditCardHolderInfo
    } = body;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Buscar a taxa de agendamento (reservation fee) diretamente do banco
    const { data: feeData } = await supabase.from('system_settings').select('value').eq('id', 'reservation_fee').single();
    const reservationFee = feeData?.value?.amount || 50;

    // Gerar um reference_id único para vincular o checkout aos metadados do agendamento
    const referenceId = uuidv4();

    // Armazenar os metadados do agendamento no banco antes de criar o checkout
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
      console.error('[Checkout Transparente] Erro ao salvar pending_checkout:', pendingError);
      return NextResponse.json(
        { error: 'Erro ao preparar pagamento.' },
        { status: 500 }
      );
    }

    // Se o usuário está logado, atualiza o cadastro
    if (user?.id) {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        user_metadata: { 
          full_name: clientName, 
          whatsapp: clientWhatsapp,
          cpf: clientCpf
        }
      });
    }

    // 1. Obter ou criar o cliente no Asaas usando o CPF
    const customer = await getOrCreateAsaasCustomer(clientName, clientCpf, clientEmail, clientWhatsapp);
    
    if (!customer || !customer.id) {
      throw new Error('Falha ao obter ID do cliente no Asaas.');
    }

    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    // 2. Criar a cobrança (Checkout) no Asaas
    const checkoutResponse = await createTransparentAsaasPayment({
      customerId: customer.id,
      billingType: paymentMethod as 'PIX' | 'CREDIT_CARD',
      amount: reservationFee,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +2 dias
      description: `Taxa de Reserva - ${requestedService || 'Atendimento Terapêutico'} com ${therapistName}`,
      externalReference: referenceId,
      remoteIp: ipAddress.split(',')[0].trim(),
      creditCard,
      creditCardHolderInfo
    });

    // Salvar o ID do checkout do Asaas para referência futura (usamos pagbank_checkout_id temporariamente)
    await supabaseAdmin.from('pending_checkouts')
      .update({ pagbank_checkout_id: checkoutResponse.id }) 
      .eq('reference_id', referenceId);

    if (paymentMethod === 'PIX') {
      // Buscar o QR Code do PIX
      const pixData = await getAsaasPixQrCode(checkoutResponse.id);
      
      return NextResponse.json({ 
        success: true, 
        paymentMethod: 'PIX',
        paymentId: checkoutResponse.id,
        referenceId,
        pix: {
          encodedImage: pixData.encodedImage, // Base64 da imagem do QR Code
          payload: pixData.payload, // Copia e Cola
          expirationDate: pixData.expirationDate
        }
      });
    }

    if (paymentMethod === 'CREDIT_CARD') {
      // Para cartão de crédito, o pagamento já foi processado ou está em análise
      return NextResponse.json({
        success: true,
        paymentMethod: 'CREDIT_CARD',
        paymentId: checkoutResponse.id,
        referenceId,
        status: checkoutResponse.status // Pode ser CONFIRMED, RECEIVED, PENDING, etc.
      });
    }

  } catch (error: any) {
    console.error('Erro ao criar checkout transparente:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar pagamento.' },
      { status: 500 }
    );
  }
}
