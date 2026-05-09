const key = "$aact_prod_000MzkwODA2MWY2OGM3MWRlMDU2NWM3MzJlNzZmNGZhZGY6OmUzNDAxOTgwLTdiY2YtNGJmNC1iYmJmLTY0MzliMTA3OWVjZDo6JGFhY2hfZjkyZjZkMTAtZjlkMC00MDI4LWE0MzctZmIyNWNjMmEyM2Q1";
const headers = { 'access_token': key, 'Content-Type': 'application/json' };

async function test() {
  const cpfCnpj = '32550239806';
  
  // 1. Tentar buscar cliente existente pelo CPF
  const searchRes = await fetch(`https://api.asaas.com/v3/customers?cpfCnpj=${cpfCnpj}`, { headers });
  const searchData = await searchRes.json();
  
  let customerId;

  if (searchData.data && searchData.data.length > 0) {
    customerId = searchData.data[0].id;
  } else {
    // 2. Se não existir, criar novo
    const createRes = await fetch('https://api.asaas.com/v3/customers', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        name: 'Humberto Ferranti',
        cpfCnpj,
        email: 'brugohb@gmail.com',
        mobilePhone: '32132132132'
      })
    });
    const createData = await createRes.json();
    console.log('Customer Creation:', createData);
    if (createData.id) {
      customerId = createData.id;
    }
  }

  if (customerId) {
    const today = new Date();
    today.setDate(today.getDate() + 2);
    
    const paymentRes = await fetch('https://api.asaas.com/v3/payments', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        customer: customerId,
        billingType: 'UNDEFINED',
        value: 5.00,
        dueDate: today.toISOString().split('T')[0],
        description: 'Taxa de Reserva',
        externalReference: 'test_ref_123',
        callback: {
          successUrl: 'https://academiaespiritualdelotus.com/agendamento/sucesso',
          autoRedirect: true
        }
      })
    });
    
    const paymentData = await paymentRes.json();
    console.log('Payment Creation:', paymentData);
  }
}

test();
