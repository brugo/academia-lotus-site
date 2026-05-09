const ASAAS_SANDBOX_URL = 'https://sandbox.asaas.com/api/v3';
const ASAAS_PRODUCTION_URL = 'https://api.asaas.com/v3';

export function getAsaasBaseUrl(): string {
  const defaultEnv = process.env.NODE_ENV === 'production' ? 'production' : 'sandbox';
  const env = process.env.ASAAS_ENV || defaultEnv;
  return env === 'production' ? ASAAS_PRODUCTION_URL : ASAAS_SANDBOX_URL;
}

function getAsaasToken(): string {
  const token = process.env.ASAAS_API_KEY;
  if (!token) {
    console.warn('[Asaas] ASAAS_API_KEY não configurada no .env');
    return '';
  }
  return token;
}

/**
 * Função utilitária para chamadas autenticadas à API do Asaas
 */
async function asaasFetch(endpoint: string, options: RequestInit = {}) {
  const baseUrl = getAsaasBaseUrl();
  const token = getAsaasToken();

  const headers = new Headers(options.headers || {});
  headers.set('access_token', token);
  headers.set('Content-Type', 'application/json');

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  return response;
}

/**
 * Busca ou cria um cliente no Asaas pelo CPF.
 * @param name Nome do cliente
 * @param cpfCnpj CPF do cliente (somente números)
 * @param email Email (opcional)
 * @param phone Telefone (opcional)
 */
export async function getOrCreateAsaasCustomer(name: string, cpfCnpj: string, email?: string, phone?: string) {
  // 1. Tentar buscar cliente existente pelo CPF
  const searchRes = await asaasFetch(`/customers?cpfCnpj=${cpfCnpj}`);
  const searchData = await searchRes.json();
  
  if (searchData.data && searchData.data.length > 0) {
    const existingCustomer = searchData.data[0];
    // Se o cliente já existir mas estiver com notificações ativadas, nós desativamos
    if (!existingCustomer.notificationDisabled) {
      await asaasFetch(`/customers/${existingCustomer.id}`, {
        method: 'POST', // Asaas usa POST para atualização de customer também
        body: JSON.stringify({ notificationDisabled: true })
      });
    }
    return existingCustomer;
  }

  // 2. Se não existir, criar novo desabilitando as notificações automáticas do Asaas
  const createRes = await asaasFetch('/customers', {
    method: 'POST',
    body: JSON.stringify({
      name,
      cpfCnpj,
      email,
      mobilePhone: phone,
      notificationDisabled: true // Bloqueia os e-mails e eventos de calendário feios do Asaas
    })
  });
  
  const createData = await createRes.json();
  if (!createRes.ok) {
    console.error('[Asaas] Erro ao criar cliente:', createData);
    throw new Error(`Erro ao criar cliente no Asaas: ${JSON.stringify(createData.errors)}`);
  }
  
  return createData;
}

interface CreateAsaasPaymentProps {
  customerId: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  description: string;
  externalReference: string;
  successUrl: string;
}

/**
 * Cria uma cobrança (Payment) no Asaas.
 */
export async function createAsaasPayment({
  customerId,
  amount,
  dueDate,
  description,
  externalReference,
  successUrl
}: CreateAsaasPaymentProps) {
  const body = {
    customer: customerId,
    billingType: 'UNDEFINED', // Permite Cartão, Boleto ou PIX no checkout
    value: amount,
    dueDate: dueDate,
    description: description,
    externalReference: externalReference,
    callback: {
      successUrl: successUrl,
      autoRedirect: true
    }
  };

  const response = await asaasFetch('/payments', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[Asaas] Erro ao criar cobrança:', JSON.stringify(data, null, 2));
    throw new Error(`Asaas API Error: ${response.status} - ${JSON.stringify(data)}`);
  }

  return data;
}
