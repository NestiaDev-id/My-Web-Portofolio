import { Hono } from "hono";
import { z } from "zod";
import { sendContactEmail } from "../services/email.service.js";
import { saveContactToMongo } from "../services/mongo.service.js";
import { verifyTurnstileToken } from "../services/turnstile.service.js";
import { isDisposableEmail } from "../services/disposable-email.service.js";

const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama tidak boleh kosong.")
    .max(100, "Nama terlalu panjang (maksimal 100 karakter)."),
  email: z
    .string()
    .trim()
    .email("Format email tidak valid.")
    .max(255, "Email terlalu panjang."),
  message: z
    .string()
    .trim()
    .min(3, "Pesan minimal 3 karakter.")
    .max(3000, "Pesan maksimal 3000 karakter."),
  _hp_website: z.string().optional(), // Honeypot field for bot trap
  turnstileToken: z.string().optional(),
});

export const contactRoutes = new Hono();

contactRoutes.post("/", async (c) => {
  const ip =
    c.req.header("cf-connecting-ip") ??
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    "127.0.0.1";

  let body: unknown;
  try {
    body = await c.req.json();
  } catch {
    return c.json(
      { success: false, error: "Payload request harus berupa format JSON yang valid." },
      400,
    );
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? "Input tidak valid.";
    return c.json({ success: false, error: firstError }, 400);
  }

  const data = parsed.data;

  // Layer 1: Honeypot Protection — If bot fills hidden field, silent discard
  if (data._hp_website && data._hp_website.trim().length > 0) {
    console.warn(`[AntiSpam] Honeypot triggered by IP ${ip}. Discarding silently.`);
    return c.json({
      success: true,
      message: "Pesan berhasil dikirim.",
    });
  }

  // Layer 2: Cloudflare Turnstile Verification
  const turnstileResult = await verifyTurnstileToken(data.turnstileToken, ip);
  if (!turnstileResult.ok) {
    return c.json(
      {
        success: false,
        error: turnstileResult.error ?? "Verifikasi keamanan (Turnstile) gagal.",
      },
      403,
    );
  }

  // Layer 3: Disposable Email Filter
  if (isDisposableEmail(data.email)) {
    return c.json(
      {
        success: false,
        error: "Alamat email sementara (disposable/throwaway email) tidak diizinkan. Silakan gunakan email aktif Anda.",
      },
      400,
    );
  }

  // Send email via Resend
  const emailResult = await sendContactEmail({
    name: data.name,
    email: data.email,
    message: data.message,
    ip,
  });

  // Save audit log to MongoDB asynchronously
  saveContactToMongo({
    name: data.name,
    email: data.email,
    message: data.message,
    ip,
    resend_id: emailResult.messageId,
    status: emailResult.success ? "sent" : "failed",
  }).catch((err) => {
    console.warn("[ContactRoutes] Error saving contact record:", err);
  });

  if (!emailResult.success) {
    return c.json(
      {
        success: false,
        error: emailResult.error ?? "Gagal mengirim pesan melalui Resend API.",
      },
      502,
    );
  }

  return c.json({
    success: true,
    message: "Pesan berhasil dikirim ke support@nestia.my.id via Resend API.",
    id: emailResult.messageId,
  });
});
