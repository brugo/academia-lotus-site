const key = "$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmUzNDAxOTgwLTdiY2YtNGJmNC1iYmJmLTY0MzliMTA3OWVjZDo6JGFhY2hfZjkyZjZkMTAtZjlkMC00MDI4LWE0MzctZmIyNWNjMmEyM2Q1";
const headers = { 'access_token': key, 'Content-Type': 'application/json' };

async function test() {
  // Create customer
  const custRes = await fetch('https://api.asaas.com/v3/customers', {
    method: 'POST', headers, body: JSON.stringify({ name: 'João Teste', cpfCnpj: '00000000000' })
  });
  const cust = await custRes.json();
  console.log('Customer:', cust);

  // Note: Since CPF is invalid, Asaas will likely reject the customer creation.
  // Wait, Asaas allows creating a customer without CPF!
  const custRes2 = await fetch('https://api.asaas.com/v3/customers', {
    method: 'POST', headers, body: JSON.stringify({ name: 'João Teste' })
  });
  const cust2 = await custRes2.json();
  console.log('Customer without CPF:', cust2);

  if (cust2.id) {
    // Create payment
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const dueDate = today.toISOString().split('T')[0];

    const paymentRes = await fetch('https://api.asaas.com/v3/payments', {
      method: 'POST', headers, body: JSON.stringify({
        customer: cust2.id,
        billingType: 'UNDEFINED',
        value: 1.00,
        dueDate: dueDate,
        description: 'Teste de Agendamento',
        callback: {
          successUrl: 'https://academiaespiritualdelotus.com/agendamento/sucesso',
          autoRedirect: true
        }
      })
    });
    const payment = await paymentRes.json();
    console.log('Payment:', payment);
  }
}
test();
