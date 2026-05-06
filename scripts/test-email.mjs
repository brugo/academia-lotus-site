import { Resend } from 'resend';

// Sua chave de API configurada no .env.local
const resend = new Resend('re_CQQvY5Ey_AJHoDCKMxangTS6ExtNLNAC3');

async function sendTestEmail() {
  console.log('Iniciando teste de envio...');
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Academia Lótus <notificacoes@academiaespiritualdelotus.com>',
      to: ['lucyferranti10@gmail.com'],
      subject: 'Teste de Configuração - Academia Lótus',
      html: `
        <div style="font-family: sans-serif; color: #333; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 10px;">
          <h1 style="color: #6d28d9;">Olá Lucy!</h1>
          <p>Este é um e-mail de teste enviado diretamente do nosso novo servidor de e-mails da <strong>Academia Lótus</strong>.</p>
          <p>Se você recebeu esta mensagem, significa que a nossa configuração com a Hostinger e o Resend está funcionando perfeitamente!</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #777;">Este é um teste técnico isolado e não gerou nenhum registro no banco de dados.</p>
        </div>
      `,
    });

    if (error) {
      console.error('Erro ao enviar e-mail:', error);
      return;
    }

    console.log('E-mail enviado com sucesso! ID:', data.id);
    console.log('Verifique a caixa de entrada (e a pasta de spam/promoções) de lucyferranti10@gmail.com');
    
  } catch (err) {
    console.error('Ocorreu um erro inesperado:', err);
  }
}

sendTestEmail();
