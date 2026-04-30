import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface BookingEmailData {
  clientName: string;
  clientEmail: string;
  clientWhatsapp: string;
  therapistName: string;
  therapistEmail: string;
  therapistWhatsapp: string;
  serviceName: string;
  dateFormatted: string;   // ex: "30 de abril de 2026"
  timeFormatted: string;   // ex: "14:00"
  dayOfWeek: string;       // ex: "quinta-feira"
}

// ═══════════════════════════════════════════════════════
//  EMAIL PARA O TERAPEUTA — Novo agendamento recebido
// ═══════════════════════════════════════════════════════
function buildTherapistEmailHtml(data: BookingEmailData): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#0a0a1a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a1a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #12122a 0%, #0a0a1a 100%); border: 1px solid rgba(212,175,55,0.3); border-radius: 16px; overflow: hidden;">
          
          <!-- Header com Logo -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid rgba(212,175,55,0.15);">
              <div style="font-size: 28px; font-weight: 300; color: #d4af37; letter-spacing: 4px; margin-bottom: 8px;">✦ ACADEMIA LÓTUS ✦</div>
              <div style="font-size: 12px; color: #94a3b8; letter-spacing: 3px; text-transform: uppercase;">Notificação de Novo Agendamento</div>
            </td>
          </tr>

          <!-- Saudação -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <h1 style="margin:0; font-size: 24px; font-weight: 400; color: #ffffff;">
                Olá, ${data.therapistName}! 🙏
              </h1>
              <p style="margin: 12px 0 0; font-size: 16px; color: #94a3b8; line-height: 1.6;">
                Você recebeu um <strong style="color: #d4af37;">novo agendamento</strong> pela plataforma Academia Lótus. Aqui estão os detalhes:
              </p>
            </td>
          </tr>

          <!-- Card de Detalhes -->
          <tr>
            <td style="padding: 10px 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;">
                
                <!-- Data e Hora -->
                <tr>
                  <td style="padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">📅 Data e Horário</div>
                    <div style="font-size: 18px; color: #ffffff; font-weight: 500;">${data.dayOfWeek}, ${data.dateFormatted}</div>
                    <div style="font-size: 16px; color: #d4af37; font-weight: 500; margin-top: 2px;">às ${data.timeFormatted} horas</div>
                  </td>
                </tr>

                <!-- Paciente -->
                <tr>
                  <td style="padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">👤 Paciente</div>
                    <div style="font-size: 16px; color: #ffffff; font-weight: 500;">${data.clientName}</div>
                    <div style="font-size: 14px; color: #94a3b8; margin-top: 2px;">${data.clientEmail}</div>
                  </td>
                </tr>

                <!-- WhatsApp do Paciente -->
                <tr>
                  <td style="padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">📱 WhatsApp do Paciente</div>
                    <div style="font-size: 16px; color: #22c55e; font-weight: 500;">${data.clientWhatsapp || 'Não informado'}</div>
                  </td>
                </tr>

                <!-- Técnica -->
                <tr>
                  <td style="padding: 20px 24px;">
                    <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">✨ Atendimento</div>
                    <div style="font-size: 16px; color: #ffffff; font-weight: 500;">${data.serviceName}</div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Botão WhatsApp -->
          ${data.clientWhatsapp ? `
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <a href="https://wa.me/${data.clientWhatsapp.replace(/\\D/g, '')}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #22c55e; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px; letter-spacing: 0.5px;">
                💬 Falar com o Paciente no WhatsApp
              </a>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(212,175,55,0.15); text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.6;">
                Este e-mail foi enviado automaticamente pela plataforma Academia Lótus.<br>
                O pagamento da taxa de reserva já foi confirmado via Stripe.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}


// ═══════════════════════════════════════════════════════
//  EMAIL PARA O CLIENTE — Confirmação do agendamento
// ═══════════════════════════════════════════════════════
function buildClientEmailHtml(data: BookingEmailData): string {
  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#0a0a1a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a1a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(180deg, #12122a 0%, #0a0a1a 100%); border: 1px solid rgba(212,175,55,0.3); border-radius: 16px; overflow: hidden;">
          
          <!-- Header com Logo -->
          <tr>
            <td style="padding: 40px 40px 20px; text-align: center; border-bottom: 1px solid rgba(212,175,55,0.15);">
              <div style="font-size: 28px; font-weight: 300; color: #d4af37; letter-spacing: 4px; margin-bottom: 8px;">✦ ACADEMIA LÓTUS ✦</div>
              <div style="font-size: 12px; color: #94a3b8; letter-spacing: 3px; text-transform: uppercase;">Confirmação de Agendamento</div>
            </td>
          </tr>

          <!-- Saudação -->
          <tr>
            <td style="padding: 40px 40px 20px;">
              <h1 style="margin:0; font-size: 24px; font-weight: 400; color: #ffffff;">
                Olá, ${data.clientName}! 🌸
              </h1>
              <p style="margin: 12px 0 0; font-size: 16px; color: #94a3b8; line-height: 1.6;">
                Seu agendamento foi <strong style="color: #d4af37;">confirmado com sucesso</strong>. Aqui estão os detalhes do seu atendimento:
              </p>
            </td>
          </tr>

          <!-- Card de Detalhes -->
          <tr>
            <td style="padding: 10px 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden;">
                
                <!-- Data e Hora -->
                <tr>
                  <td style="padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">📅 Data e Horário</div>
                    <div style="font-size: 18px; color: #ffffff; font-weight: 500;">${data.dayOfWeek}, ${data.dateFormatted}</div>
                    <div style="font-size: 16px; color: #d4af37; font-weight: 500; margin-top: 2px;">às ${data.timeFormatted} horas</div>
                  </td>
                </tr>

                <!-- Terapeuta -->
                <tr>
                  <td style="padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">🧘 Terapeuta</div>
                    <div style="font-size: 16px; color: #ffffff; font-weight: 500;">${data.therapistName}</div>
                  </td>
                </tr>

                <!-- WhatsApp do Terapeuta -->
                ${data.therapistWhatsapp ? `
                <tr>
                  <td style="padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">📱 WhatsApp do Terapeuta</div>
                    <div style="font-size: 16px; color: #22c55e; font-weight: 500;">${data.therapistWhatsapp}</div>
                  </td>
                </tr>
                ` : ''}

                <!-- Técnica -->
                <tr>
                  <td style="padding: 20px 24px;">
                    <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">✨ Atendimento</div>
                    <div style="font-size: 16px; color: #ffffff; font-weight: 500;">${data.serviceName}</div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Informação Importante -->
          <tr>
            <td style="padding: 0 40px 30px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.2); border-radius: 12px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <div style="font-size: 13px; font-weight: 600; color: #60a5fa; margin-bottom: 6px;">ℹ️ Informação importante:</div>
                    <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.6;">
                      O pagamento realizado garante a exclusividade da sua reserva na agenda do terapeuta. Ele não é uma taxa adicional: o valor será descontado do total da sessão. Na data do atendimento, você pagará apenas a diferença restante.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Botão WhatsApp do Terapeuta -->
          ${data.therapistWhatsapp ? `
          <tr>
            <td style="padding: 0 40px 30px; text-align: center;">
              <a href="https://wa.me/${data.therapistWhatsapp.replace(/\\D/g, '')}" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #22c55e; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 10px; letter-spacing: 0.5px;">
                💬 Falar com o Terapeuta no WhatsApp
              </a>
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; border-top: 1px solid rgba(212,175,55,0.15); text-align: center;">
              <p style="margin: 0 0 8px; font-size: 13px; color: #94a3b8;">
                Acompanhe seus agendamentos em <strong style="color: #d4af37;">Meu Perfil</strong> no site.
              </p>
              <p style="margin: 0; font-size: 12px; color: #475569; line-height: 1.6;">
                Este e-mail foi enviado automaticamente pela plataforma Academia Lótus.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}


// ═══════════════════════════════════════════════════════
//  FUNÇÃO PRINCIPAL — Enviar ambos os e-mails
// ═══════════════════════════════════════════════════════
export async function sendBookingNotificationEmails(data: BookingEmailData) {
  const fromAddress = 'Academia Lótus <onboarding@resend.dev>';

  try {
    // E-mail para o TERAPEUTA
    const therapistResult = await resend.emails.send({
      from: fromAddress,
      to: data.therapistEmail,
      subject: `🗓️ Novo Agendamento: ${data.clientName} — ${data.serviceName}`,
      html: buildTherapistEmailHtml(data),
    });
    console.log(`📧 E-mail enviado ao terapeuta (${data.therapistEmail}):`, therapistResult);
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail para o terapeuta:', error);
  }

  try {
    // E-mail para o CLIENTE
    const clientResult = await resend.emails.send({
      from: fromAddress,
      to: data.clientEmail,
      subject: `✅ Agendamento Confirmado — ${data.serviceName} | Academia Lótus`,
      html: buildClientEmailHtml(data),
    });
    console.log(`📧 E-mail enviado ao cliente (${data.clientEmail}):`, clientResult);
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail para o cliente:', error);
  }
}
