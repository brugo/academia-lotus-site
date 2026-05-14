// Helper para formatar links do WhatsApp corretamente (garantindo o +55)
export function formatWhatsAppLink(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  // Se já começa com 55 e tem tamanho adequado para um número brasileiro com código de país
  if (cleaned.startsWith('55') && cleaned.length >= 12) {
    return `https://wa.me/${cleaned}`;
  }
  // Caso contrário, assume que é número do Brasil sem o 55
  return `https://wa.me/55${cleaned}`;
}
