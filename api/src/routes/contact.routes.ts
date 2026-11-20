import { Hono } from "hono";
import { z } from "zod";
import { sendContactEmail } from "../services/email.service.js";
import { saveContactToMongo } from "../services/mongo.service.js";
import { verifyTurnstileToken } from "../services/turnstile.service.js";
import {
  isDisposableEmail,
  isSuspiciousEmailPattern,
  hasValidMxRecord,
} from "../services/email-validation.service.js";
import { ipCooldownMiddleware } from "../middleware/cooldown.middleware.js";
import {
  setIpCooldown,
  checkEmailRateLimit,
} from "../services/cooldown.service.js";

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

// Layer 2: IP Cooldown Gatekeeper (Redis Hot-Cache + MongoDB)
contactRoutes.use("*", ipCooldownMiddleware);

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

  // Layer 1: Honeypot Protection — If bot fills hidden field, silent discard & cooldown escalation
  if (data._hp_website && data._hp_website.trim().length > 0) {
    console.warn(`[AntiSpam] Honeypot triggered by IP ${ip}. Activating cooldown period.`);
    setIpCooldown(ip, "HONEYPOT_TRIGGERED", 24 * 3600).catch((err) =>
      console.warn("[Cooldown] Error setting cooldown for honeypot IP:", err),
    );
    return c.json({
      success: true,
      message: "Pesan berhasil dikirim.",
    });
  }

  // Layer 3b: Target Email Cooldown Window (max 3 submissions per 45 mins)
  const emailLimit = await checkEmailRateLimit(data.email);
  if (!emailLimit.allowed) {
    return c.json(
      {
        success: false,
        error:
          "Alamat email ini baru saja digunakan untuk mengirim pesan. Mohon tunggu masa jeda sebelum mengirim pesan baru ke alamat yang sama.",
      },
      429,
    );
  }

  // Layer 4: Cloudflare Turnstile Verification
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

  // Layer 5a: Disposable Email Filter
  if (isDisposableEmail(data.email)) {
    return c.json(
      {
        success: false,
        error: "Alamat email sementara (disposable/throwaway email) tidak diizinkan. Silakan gunakan email aktif Anda.",
      },
      400,
    );
  }

  // Layer 5b: Anti-Keyboard Mash & Pattern Filter
  const patternCheck = isSuspiciousEmailPattern(data.email);
  if (!patternCheck.valid) {
    return c.json(
      {
        success: false,
        error: patternCheck.reason ?? "Format alamat email tidak wajar.",
      },
      400,
    );
  }

  // Layer 5c: DNS MX Record Verification
  const mxCheck = await hasValidMxRecord(data.email);
  if (!mxCheck.valid) {
    return c.json(
      {
        success: false,
        error: mxCheck.reason ?? "Domain email tidak memiliki server penerima aktif.",
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
