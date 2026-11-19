import { env } from "../config/env.js";

export interface SendContactParams {
  name: string;
  email: string;
  message: string;
  ip?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Escapes HTML characters for safe insertion into email templates.
 */
function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[m] || m));
}

/**
 * Service to send emails using Resend REST API (https://resend.com).
 * Uses native fetch (Node 20+) without requiring extra npm packages.
 */
export async function sendContactEmail(params: SendContactParams): Promise<SendEmailResult> {
  if (!env.RESEND_API_KEY) {
    console.warn("[EmailService] RESEND_API_KEY is not configured in environment variables.");
    return {
      success: false,
      error: "Resend API key is not configured on server.",
    };
  }

  const { name, email, message, ip } = params;
  const safeName = escapeHtml(name.trim());
  const safeEmail = escapeHtml(email.trim());
  const safeMessage = escapeHtml(message.trim()).replace(/\n/g, "<br/>");
  const timestamp = new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });

  const notificationHtml = `
  <!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pratinjau Email Notifikasi Admin — NestiaDev</title>
</head>
<body style="margin: 0; padding: 32px 16px; background-color: #FFF5F8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #3B1E26;">
  
  <!-- Wrapper Utama -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center">
        
        <!-- Kartu Utama dengan Efek Retro Shadow via Border Tebal Kanan & Bawah -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 580px; background-color: #ffffff; border-top: 2px solid #3B1E26; border-left: 2px solid #3B1E26; border-right: 6px solid #3B1E26; border-bottom: 6px solid #3B1E26; border-radius: 12px; overflow: hidden;">
          
          <!-- Header Bar Pastel Pink -->
          <tr>
            <td style="background-color: #F4B8C4; padding: 18px 24px; border-bottom: 2px solid #3B1E26;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-size: 16px; font-weight: bold; color: #3B1E26; letter-spacing: -0.3px;">
                    📬 Pesan Kontak Baru &mdash; Portofolio
                  </td>
                  <td align="right" style="vertical-align: middle;">
                    <span style="display: inline-block; background-color: #059669; color: #ffffff; font-size: 10px; font-weight: bold; padding: 3px 8px; border: 1.5px solid #3B1E26; border-radius: 4px; letter-spacing: 0.5px;">
                      RESEND INBOUND
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Isi Konten -->
          <tr>
            <td style="padding: 24px;">
              
              <!-- Field 1: Nama Pengirim -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #7A3047; padding-bottom: 5px; letter-spacing: 0.5px;">
                    Nama Pengirim
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 14px; color: #3B1E26; background-color: #FFF5F8; border: 1.5px solid #F4B8C4; border-radius: 6px; padding: 10px 14px;">
                    <strong>Budi Santoso</strong>
                  </td>
                </tr>
              </table>

              <!-- Field 2: Email Pengirim -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #7A3047; padding-bottom: 5px; letter-spacing: 0.5px;">
                    Email Pengirim (Reply-To)
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 14px; color: #3B1E26; background-color: #FFF5F8; border: 1.5px solid #F4B8C4; border-radius: 6px; padding: 10px 14px;">
                    <a href="mailto:budi.santoso@techcorp.io" style="color: #7A3047; font-weight: bold; text-decoration: underline;">budi.santoso@techcorp.io</a>
                  </td>
                </tr>
              </table>

              <!-- Field 3: Waktu & IP -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 16px;">
                <tr>
                  <td style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #7A3047; padding-bottom: 5px; letter-spacing: 0.5px;">
                    Waktu Diterima (WIB)
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #3B1E26; background-color: #FFF5F8; border: 1.5px solid #F4B8C4; border-radius: 6px; padding: 10px 14px;">
                    20/11/2026, 05.10.00 WIB &bull; <span style="color: #7A3047; font-family: monospace;">IP: 103.144.x.x</span>
                  </td>
                </tr>
              </table>

              <!-- Field 4: Isi Pesan -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 22px;">
                <tr>
                  <td style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #7A3047; padding-bottom: 5px; letter-spacing: 0.5px;">
                    Isi Pesan
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 14px; line-height: 1.65; color: #3B1E26; background-color: #ffffff; border-top: 2px solid #3B1E26; border-left: 4px solid #3B1E26; border-right: 2px solid #3B1E26; border-bottom: 2px solid #3B1E26; border-radius: 8px; padding: 14px 16px;">
                    Halo Christian, kami tertarik berdiskusi mengenai proyek pengembangan Full-Stack Web &amp; integrasi AI Assistant. Apakah minggu ini ada jadwal luang untuk panggilan singkat?
                  </td>
                </tr>
              </table>

              <!-- Button reply email -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="background-color: #F4B8C4; border-top: 2px solid #3B1E26; border-left: 2px solid #3B1E26; border-right: 4px solid #3B1E26; border-bottom: 4px solid #3B1E26; border-radius: 8px;">
                    <a href="mailto:budi.santoso@techcorp.io?subject=Re:%20[Portofolio]%20Pesan%20Baru%20dari%20Budi%20Santoso" style="display: inline-block; padding: 10px 18px; font-size: 13px; font-weight: bold; color: #3B1E26; text-decoration: none;">
                      ↩ Balas Email Pengirim Sekarang
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #FFF5F8; font-size: 11px; color: #7A3047; text-align: center; padding: 14px 20px; border-top: 1.5px dashed #F4B8C4;">
              Dikirim otomatis via API Gateway <strong>NestiaDev</strong> &bull; Sender: <code style="background-color: #ffffff; padding: 2px 5px; border: 1px solid #F4B8C4; border-radius: 4px; color: #3B1E26;">support@nestia.my.id</code>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;

  try {
    // 1. Send notification to site owner/support inbox
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: [env.CONTACT_TO_EMAIL],
        reply_to: email.trim(),
        subject: `[Portofolio] Pesan Baru dari ${safeName}`,
        html: notificationHtml,
      }),
    });

    const data = (await response.json()) as { id?: string; message?: string; name?: string };

    if (!response.ok) {
      console.error("[EmailService] Resend API error:", data);
      return {
        success: false,
        error: data.message || `Resend returned HTTP ${response.status}`,
      };
    }

    // 2. Send friendly confirmation to the sender (visitor)
    // Run asynchronously without blocking main response
    sendConfirmationToVisitor({ name: safeName, email: email.trim() }).catch((err) => {
      console.warn("[EmailService] Failed to send confirmation email to visitor:", err);
    });

    return {
      success: true,
      messageId: data.id,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error("[EmailService] Network exception calling Resend API:", errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

async function sendConfirmationToVisitor(params: {
  name: string;
  email: string;
  safeMessage: string;
}): Promise<void> {
  if (!env.RESEND_API_KEY) return;

  await new Promise((resolve) => setTimeout(resolve, 600));

  const confirmationHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 24px 12px; background-color: #FFF5F8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #3B1E26;">
  
  <!-- Wrapper Utama -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr>
      <td align="center">
        
        <!-- Kartu Utama dengan Efek Retro Shadow via Border Tebal Kanan & Bawah -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 540px; background-color: #ffffff; border-top: 2px solid #3B1E26; border-left: 2px solid #3B1E26; border-right: 6px solid #3B1E26; border-bottom: 6px solid #3B1E26; border-radius: 12px; overflow: hidden;">
          
          <!-- Header Bar Pastel Pink -->
          <tr>
            <td style="background-color: #F4B8C4; padding: 16px 24px; border-bottom: 2px solid #3B1E26;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="font-size: 15px; font-weight: bold; color: #3B1E26; letter-spacing: 0.3px;">
                    ✨ NestiaDev &mdash; Konfirmasi Pesan
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: #3B1E26; color: #FFF5F8; font-size: 10px; font-weight: bold; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.5px;">
                      TERKIRIM
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Isi Konten -->
          <tr>
            <td style="padding: 28px 24px;">
              <h2 style="margin: 0 0 14px 0; font-size: 20px; color: #3B1E26;">
                Halo ${params.name}! 👋
              </h2>
              <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.6; color: #3B1E26;">
                Terima kasih telah menghubungi saya melalui portofolio <strong>NestiaDev</strong>. Pesan Anda sudah masuk ke kotak masuk <strong>support@nestia.my.id</strong> dengan rincian berikut:
              </p>

              <!-- Kotak Kutipan Pesan Pengunjung -->
              <div style="background-color: #FFF5F8; border: 1.5px solid #F4B8C4; border-left: 4px solid #3B1E26; border-radius: 6px; padding: 14px 16px; margin: 18px 0; font-size: 13px; line-height: 1.6; color: #3B1E26;">
                ${params.safeMessage}
              </div>

              <p style="margin: 0 0 22px 0; font-size: 14px; line-height: 1.6; color: #3B1E26;">
                Saya akan meninjau pesan ini dan membalasnya secepat mungkin. Jika ada detail tambahan, Anda bisa langsung membalas (*reply*) email ini.
              </p>

              <!-- Tombol CTA Kembali ke Portofolio -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="background-color: #F4B8C4; border-top: 2px solid #3B1E26; border-left: 2px solid #3B1E26; border-right: 4px solid #3B1E26; border-bottom: 4px solid #3B1E26; border-radius: 8px;">
                    <a href="https://nestia.my.id" style="display: inline-block; padding: 10px 18px; font-size: 13px; font-weight: bold; color: #3B1E26; text-decoration: none;">
                      Kembali ke nestia.my.id &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <div style="border-top: 1.5px dashed #F4B8C4; padding-top: 16px; font-size: 12px; line-height: 1.6; color: #7A3047;">
                Salam hangat,<br/>
                <strong style="color: #3B1E26;">Yohanes Christian Devano (NestiaDev)</strong><br/>
                <a href="https://nestia.my.id" style="color: #7A3047; font-weight: bold; text-decoration: underline;">nestia.my.id</a> &bull; support@nestia.my.id
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.CONTACT_FROM_EMAIL,
      to: [params.email],
      reply_to: env.CONTACT_TO_EMAIL,
      subject: "Pesan Anda telah diterima — NestiaDev",
      html: confirmationHtml,
    }),
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.warn(`[EmailService] Visitor confirmation failed (${res.status}):`, errBody);
  }
}