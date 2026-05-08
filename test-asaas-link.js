const key = "$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmUzNDAxOTgwLTdiY2YtNGJmNC1iYmJmLTY0MzliMTA3OWVjZDo6JGFhY2hfZjkyZjZkMTAtZjlkMC00MDI4LWE0MzctZmIyNWNjMmEyM2Q1";
const headers = { 'access_token': key, 'Content-Type': 'application/json' };

async function test() {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const dueDateLimitDays = 1;

  const linkRes = await fetch('https://api.asaas.com/v3/paymentLinks', {
    method: 'POST', headers, body: JSON.stringify({
      billingType: 'PIX',
      chargeType: 'DETACHED',
      name: 'Agendamento - Humberto Teste',
      description: 'Taxa de Reserva',
      endDate: today.toISOString().split('T')[0],
      value: 1.00,
      dueDateLimitDays: dueDateLimitDays,
      callback: {
        successUrl: 'https://academiaespiritualdelotus.com/agendamento/sucesso',
        autoRedirect: true
      }
    })
  });
  const link = await linkRes.json();
  console.log('Payment Link:', link);
}
test();
