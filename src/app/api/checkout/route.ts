import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/utils/supabase/server';

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

    // Criar a sessão de checkout no Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: clientEmail,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Sessão com ${therapistName}`,
              description: `${requestedService || 'Atendimento Terapêutico'} - ${new Date(startTime).toLocaleString('pt-BR')}`,
            },
            unit_amount: Math.round(price * 100), // Stripe usa centavos (R$ 100,00 = 10000)
          },
          quantity: 1,
        },
      ],
      // Metadados são cruciais! Eles passam os dados para o webhook após o pagamento.
      metadata: {
        therapistId,
        therapistEmail,
        clientName,
        clientEmail,
        clientWhatsapp,
        startTime,
        requestedService: requestedService || '',
        userId: user?.id || '',
        therapistName: therapistName || '',
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/agendamento/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/terapeutas`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Erro ao criar checkout:', error);
    return NextResponse.json(
      { error: 'Erro ao processar pagamento.' },
      { status: 500 }
    );
  }
}
