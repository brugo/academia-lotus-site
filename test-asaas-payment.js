const key = "$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmUzNDAxOTgwLTdiY2YtNGJmNC1iYmJmLTY0MzliMTA3OWVjZDo6JGFhY2hfZjkyZjZkMTAtZjlkMC00MDI4LWE0MzctZmIyNWNjMmEyM2Q1";
const headers = { 'access_token': key, 'Content-Type': 'application/json' };

async function test() {
  const today = new Date();
  today.setDate(today.getDate() + 1);

  const paymentRes = await fetch('https://api.asaas.com/v3/payments', {
    method: 'POST', headers, body: JSON.stringify({
      customer: 'cus_000175241924',
      billingType: 'PIX',
      value: 5.00,
      dueDate: today.toISOString().split('T')[0],
      description: 'Taxa de Reserva',
      externalReference: 'checkout_123456'
    })
  });
  const payment = await paymentRes.json();
  console.log('Payment PIX:', payment);
}
test();
