import { getDb } from '../database.js';

/**
 * Sends an email notification to the assigned broker for a new lead.
 * Uses Brevo HTTP API (port 443) instead of SMTP (ports 465/587)
 * because Render blocks outbound SMTP connections on free tier.
 */
export async function notifyCorretorNewLead(leadId) {
  const db = getDb();
  try {
    // 1. Fetch lead details with assigned broker info
    const lead = await db.queryOne(`
      SELECT l.*, e.nome as empreendimento_nome, u.nome as corretor_nome, u.email as corretor_email
      FROM leads l
      LEFT JOIN empreendimentos e ON l.empreendimento_interesse_id = e.id
      LEFT JOIN usuarios u ON l.corretor_id = u.id
      WHERE l.id = ?
    `, [leadId]);

    if (!lead || !lead.corretor_email) {
      console.log(`[Notification] Skip email. Lead ${leadId} has no assigned broker or broker has no email.`);
      return;
    }

    const {
      nome,
      telefone,
      email = 'Não informado',
      origem = 'meta_ads',
      empreendimento_nome = 'Ainda não definido / Aberto',
      corretor_nome,
      corretor_email
    } = lead;

    const origemLabel = origem === 'meta_ads' ? 'Meta Ads' : origem === 'google_ads' ? 'Google Ads' : 'Manual';

    console.log(`[Notification] Preparing email for ${corretor_nome} (${corretor_email}) regarding lead: ${nome}`);

    // 2. Check for Brevo API key
    const brevoApiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.SENDER_EMAIL || 'econnectmarketingdigital@gmail.com';
    const senderName = process.env.SENDER_NAME || 'CRM Royal Imobiliária';

    if (!brevoApiKey) {
      console.log('----------------------------------------------------');
      console.log('📢 [E-mail Simulado - BREVO_API_KEY Não Configurado]');
      console.log(`De: ${senderName} <${senderEmail}>`);
      console.log(`Para: ${corretor_email}`);
      console.log(`Assunto: 🔥 Novo Lead no CRM: ${nome}`);
      console.log(`Dados: Tel=${telefone}, Interesse=${empreendimento_nome}`);
      console.log('----------------------------------------------------');
      return;
    }

    // 3. Build HTML email body
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
          .header { background: #1e3344; padding: 30px 20px; text-align: center; border-bottom: 4px solid #c49653; }
          .logo { font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 1px; }
          .content { padding: 40px 30px; }
          .greeting { font-size: 20px; color: #1f2937; margin-bottom: 20px; font-weight: 600; }
          .message { font-size: 16px; color: #4b5563; line-height: 1.6; margin-bottom: 30px; }
          .lead-info { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
          .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #edf2f7; }
          .info-row:last-child { border-bottom: none; }
          .label { color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
          .val { color: #0f172a; font-weight: 600; font-size: 14px; text-align: right; }
          .btn { display: block; text-align: center; background-color: #c49653; color: #ffffff !important; font-weight: 800; text-decoration: none; padding: 14px 20px; border-radius: 6px; margin-top: 20px; box-shadow: 0 4px 6px rgba(196, 150, 83, 0.25); text-transform: uppercase; font-size: 14px; }
          .footer { background: #f1f5f9; padding: 20px; text-align: center; font-size: 13px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🏢 CRM Royal</div>
          </div>
          <div class="content">
            <div class="greeting">🔥 Atenção, ${corretor_nome}!</div>
            <div class="message">
              Um novo lead de interesse em imóveis foi distribuído para a sua carteira. Faça o primeiro contato o mais rápido possível!
            </div>
            
            <div class="lead-info">
              <div class="info-row">
                <span class="label">Nome</span>
                <span class="val">${nome}</span>
              </div>
              <div class="info-row">
                <span class="label">WhatsApp / Tel</span>
                <span class="val">${telefone}</span>
              </div>
              <div class="info-row">
                <span class="label">E-mail</span>
                <span class="val">${email || 'Não informado'}</span>
              </div>
              <div class="info-row">
                <span class="label">Origem</span>
                <span class="val">${origemLabel}</span>
              </div>
              <div class="info-row">
                <span class="label">Interesse</span>
                <span class="val">${empreendimento_nome}</span>
              </div>
            </div>

            <a href="https://royal.vercel.app/leads/${leadId}" class="btn">Visualizar Lead no CRM</a>
          </div>
          <div class="footer">
            Você está recebendo este alerta porque faz parte do rodízio da Royal Imobiliária.
          </div>
        </div>
      </body>
      </html>
    `;

    // 4. Send email via Brevo HTTP API (uses HTTPS port 443 — never blocked by cloud providers)
    console.log(`[Notification] Sending email via Brevo API to ${corretor_email}...`);

    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail
        },
        to: [
          { email: corretor_email, name: corretor_nome }
        ],
        subject: `🔥 Atenção: Novo Lead no CRM - ${nome}`,
        htmlContent: htmlBody
      })
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`[Notification] ✅ Email sent successfully to ${corretor_email} (Brevo messageId: ${result.messageId})`);
    } else {
      console.error(`[Notification] ❌ Brevo API error (${response.status}):`, JSON.stringify(result));
    }
  } catch (err) {
    console.error('[Notification] Failed to send email:', err.message);
  }
}
