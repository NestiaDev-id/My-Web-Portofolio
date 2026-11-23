import { env } from "../config/env.js";

export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!env.TURNSTILE_SECRET_KEY) {
    if (env.NODE_ENV === "production") {
      console.error("[Turnstile] TURNSTILE_SECRET_KEY is not configured in production.");
      return {
        ok: false,
        error: "Verifikasi keamanan server belum dikonfigurasi.",
      };
    }
    return { ok: true };
  }

  if (!token || token.trim().length === 0) {
    return { ok: false, error: "Verifikasi keamanan (Turnstile) diperlukan." };
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          secret: env.TURNSTILE_SECRET_KEY,
          response: token,
          remoteip: remoteIp,
        }),
      },
    );

    const data = (await response.json()) as {
      success: boolean;
      "error-codes"?: string[];
    };

    if (!data.success) {
      const codes = data["error-codes"]?.join(", ") ?? "unknown";
      console.warn(`[Turnstile] Verification failed: ${codes} (IP: ${remoteIp})`);
      return {
        ok: false,
        error: "Verifikasi keamanan gagal. Silakan muat ulang halaman dan coba lagi.",
      };
    }

    return { ok: true };
  } catch (err) {
    console.error("[Turnstile] Network error calling siteverify:", err);
    if (env.NODE_ENV === "production") {
      return {
        ok: false,
        error: "Layanan verifikasi keamanan sementara tidak tersedia.",
      };
    }
    return { ok: true };
  }
}
