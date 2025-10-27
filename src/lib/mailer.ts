import nodemailer from 'nodemailer'

function getBoolean(v?: string) {
  return v === 'true' || v === '1'
}

export function createTransport() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com'
  const port = Number(process.env.SMTP_PORT || 465)
  const secure = getBoolean(process.env.SMTP_SECURE || 'true') || port === 465
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!user || !pass) {
    throw new Error('SMTP_USER e SMTP_PASS não configurados. Configure EMAIL_FROM, SMTP_USER e SMTP_PASS no arquivo .env')
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  })
}

export async function sendInvitationEmail(params: {
  to: string
  inviterName: string
  companyName: string
  message?: string
  acceptUrl: string
}) {
  const transporter = createTransport()
  const from = process.env.EMAIL_FROM || `Glowy <${process.env.SMTP_USER}>`

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen,Ubuntu,Cantarell,'Helvetica Neue',sans-serif">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 20px">
      <tr>
        <td align="center">
          <!-- Container principal com max-width -->
          <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;position:relative">
            <tr>
              <td style="padding:20px">

                <!-- Borda externa (shadow) -->
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#e5e7eb;border-radius:18px">
                  <tr>
                    <td style="padding:0 3px 3px 0">

                      <!-- Card principal com borda -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;border:1px solid #d1d5db;border-radius:16px">
                        <tr>
                          <td style="position:relative;padding:0">


                            <!-- Conteúdo principal -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="position:relative">
                              <tr>
                                <td style="padding:40px 32px">

                                  <!-- Ícone com borda dupla -->
                                  <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td align="center" style="padding-bottom:24px">
                                        <!-- Shadow do ícone -->
                                        <table cellpadding="0" cellspacing="0" style="display:inline-block;background:#e5e7eb;border-radius:14px">
                                          <tr>
                                            <td style="padding:0 3px 3px 0">
                                              <!-- Ícone principal -->
                                              <table cellpadding="0" cellspacing="0" style="width:56px;height:56px;background:#ffffff;border:1px solid #d1d5db;border-radius:12px">
                                                <tr>
                                                  <td align="center" valign="middle" style="padding:0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#C5837B" style="display:block;margin:14px auto">
                                                      <path d="M14 2a3 3 0 0 1 3 3v1h2a3 3 0 0 1 3 3v9a3 3 0 0 1 -3 3h-14a3 3 0 0 1 -3 -3v-9a3 3 0 0 1 3 -3h2v-1a3 3 0 0 1 3 -3zm0 2h-4a1 1 0 0 0 -1 1v1h6v-1a1 1 0 0 0 -1 -1" />
                                                    </svg>
                                                  </td>
                                                </tr>
                                              </table>
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                  </table>

                                  <!-- Título -->
                                  <h1 style="margin:0 0 12px 0;font-size:24px;font-weight:700;color:#111827;text-align:center;line-height:1.3">
                                    Convite para participar da equipe
                                  </h1>

                                  <!-- Descrição -->
                                  <p style="margin:0 0 24px 0;font-size:15px;color:#6b7280;text-align:center;line-height:1.6">
                                    <strong style="color:#374151">${params.inviterName}</strong> convidou você para entrar na empresa <strong style="color:#374151">${params.companyName}</strong> no Glowy.
                                  </p>

                                  <!-- Mensagem personalizada (se houver) -->
                                  ${params.message ? `
                                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px">
                                    <tr>
                                      <td>
                                        <div style="padding:16px 20px;background:#fef2f2;border-left:4px solid #C5837B;border-radius:10px">
                                          <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;font-style:italic">
                                            "${params.message}"
                                          </p>
                                        </div>
                                      </td>
                                    </tr>
                                  </table>
                                  ` : ''}

                                  <!-- Botão CTA com borda dupla -->
                                  <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td align="center" style="padding:0 0 28px 0">
                                        <!-- Shadow do botão -->
                                        <table cellpadding="0" cellspacing="0" style="display:inline-block;background:#e5e7eb;border-radius:18px">
                                          <tr>
                                            <td style="padding:0 3px 3px 0">
                                              <!-- Botão principal -->
                                              <a href="${params.acceptUrl}" style="display:block;padding:12px 28px;background:#ffffff;color:#000000;text-decoration:none;border-radius:16px;font-weight:600;font-size:15px;border:1px solid #d1d5db">
                                                Aceitar convite
                                              </a>
                                            </td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                  </table>

                                  <!-- Link alternativo -->
                                  <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td style="padding:20px 0 0 0;border-top:1px solid #f3f4f6">
                                        <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;line-height:1.5">
                                          Se o botão não funcionar, copie e cole este link no seu navegador:
                                        </p>
                                        <p style="margin:8px 0 0 0;font-size:11px;color:#6b7280;text-align:center;word-break:break-all">
                                          <a href="${params.acceptUrl}" style="color:#C5837B;text-decoration:none">${params.acceptUrl}</a>
                                        </p>
                                      </td>
                                    </tr>
                                  </table>

                                </td>
                              </tr>
                            </table>

                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>
                </table>

                <!-- Footer -->
                <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px">
                  <tr>
                    <td align="center">
                      <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5">
                        Este é um email automático do <strong style="color:#6b7280">Glowy</strong>
                      </p>
                      <p style="margin:8px 0 0 0;font-size:11px;color:#d1d5db">
                        © ${new Date().getFullYear()} Glowy. Todos os direitos reservados.
                      </p>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>`

  const info = await transporter.sendMail({
    from,
    to: params.to,
    subject: `Convite para equipe – ${params.companyName}`,
    html,
  })
  return info
}
