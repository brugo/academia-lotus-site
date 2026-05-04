/**
 * PagBank API Client
 * 
 * Módulo responsável por encapsular a comunicação com a API do PagBank.
 * Suporta os ambientes Sandbox e Produção, alternando automaticamente
 * com base na variável PAGBANK_ENV.
 */

// URLs base dos ambientes PagBank
const PAGBANK_SANDBOX_URL = 'https://sandbox.api.pagseguro.com';
const PAGBANK_PRODUCTION_URL = 'https://api.pagseguro.com';

/**
 * Retorna a URL base da API de acordo com o ambiente configurado.
 */
export function getPagBankBaseUrl(): string {
  const env = process.env.PAGBANK_ENV || 'sandbox';
  return env === 'production' ? PAGBANK_PRODUCTION_URL : PAGBANK_SANDBOX_URL;
}

/**
 * Retorna o token de autenticação do PagBank.
 */
export function getPagBankToken(): string {
  return process.env.PAGBANK_TOKEN || '';
}

/**
 * Faz uma requisição autenticada para a API do PagBank.
 */
async function pagbankFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const baseUrl = getPagBankBaseUrl();
  const token = getPagBankToken();

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'x-api-version': '4.0',
      ...options.headers,
    },
  });

  return response;
}

/**
 * Cria um Checkout PagBank.
 * 
 * O Checkout redireciona o cliente para a página de pagamento do PagBank,
 * que suporta PIX, Cartão de Crédito, Cartão de Débito, Boleto, etc.
 * 
 * @param params - Parâmetros do checkout
 * @returns Objeto de resposta da API contendo o link de pagamento
 */
export async function createPagBankCheckout(params: {
  referenceId: string;
  itemName: string;
  itemDescription: string;
  amountInCents: number;
  redirectUrl: string;
  notificationUrls: string[];
  paymentNotificationUrls: string[];
  customerName?: string;
  customerEmail?: string;
  expirationMinutes?: number;
}) {
  const {
    referenceId,
    itemName,
    itemDescription,
    amountInCents,
    redirectUrl,
    notificationUrls,
    paymentNotificationUrls,
    customerName,
    customerEmail,
    expirationMinutes = 120, // 2 horas padrão
  } = params;

  // Calcula a data de expiração
  const expirationDate = new Date();
  expirationDate.setMinutes(expirationDate.getMinutes() + expirationMinutes);

  const body: any = {
    reference_id: referenceId,
    expiration_date: expirationDate.toISOString(),
    customer_modifiable: true,
    items: [
      {
        reference_id: referenceId,
        name: itemName,
        quantity: 1,
        unit_amount: amountInCents,
      },
    ],
    payment_methods: [
      { type: 'PIX' },
      { type: 'CREDIT_CARD' },
      { type: 'DEBIT_CARD' },
    ],
    payment_methods_configs: [
      {
        type: 'CREDIT_CARD',
        config_options: [
          { option: 'INSTALLMENTS_LIMIT', value: '1' }, // Sem parcelamento para taxa de reserva
        ],
      },
    ],
    redirect_url: redirectUrl,
    notification_urls: notificationUrls,
    payment_notification_urls: paymentNotificationUrls,
  };

  // Se dados do cliente disponíveis, preencher para pular step de dados pessoais
  if (customerName && customerEmail) {
    body.customer = {
      name: customerName,
      email: customerEmail,
    };
  }

  const response = await pagbankFetch('/checkouts', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[PagBank] Erro ao criar checkout:', JSON.stringify(data, null, 2));
    throw new Error(`PagBank API Error: ${response.status} - ${JSON.stringify(data)}`);
  }

  return data;
}

/**
 * Consulta um Checkout PagBank pelo ID.
 * 
 * @param checkoutId - ID do checkout (ex: CHEC_XXXX)
 * @returns Dados do checkout
 */
export async function getPagBankCheckout(checkoutId: string) {
  const response = await pagbankFetch(`/checkouts/${checkoutId}`, {
    method: 'GET',
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('[PagBank] Erro ao consultar checkout:', JSON.stringify(data, null, 2));
    throw new Error(`PagBank API Error: ${response.status} - ${JSON.stringify(data)}`);
  }

  return data;
}

/**
 * Extrai o link de pagamento (PAY) do objeto de checkout retornado pela API.
 * 
 * @param checkoutResponse - Resposta da API de Criar Checkout
 * @returns URL de pagamento ou null
 */
export function extractPaymentLink(checkoutResponse: any): string | null {
  if (!checkoutResponse?.links) return null;
  
  const payLink = checkoutResponse.links.find((link: any) => link.rel === 'PAY');
  return payLink?.href || null;
}
