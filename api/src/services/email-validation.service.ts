import dns from "node:dns/promises";
import type { MxRecord } from "node:dns";
import { isDisposableEmail } from "./disposable-email.service.js";
import { env } from "../config/env.js";

export { isDisposableEmail };

export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Common keyboard mash sequences and dummy placeholder names.
 */
const BOGUS_LOCAL_PARTS = new Set([
  "asdf",
  "asdfg",
  "asdfgh",
  "qwerty",
  "qwert",
  "zxcv",
  "zxcvb",
  "test",
  "testing",
  "fake",
  "spam",
  "dummy",
  "none",
  "null",
  "sample",
]);

/**
 * Checks if the email pattern indicates keyboard mash, repetitive characters,
 * or throwaway placeholder addresses.
 */
export function isSuspiciousEmailPattern(email: string): ValidationResult {
  const atIndex = email.lastIndexOf("@");
  if (atIndex < 1) {
    return { valid: false, reason: "Format alamat email tidak valid." };
  }

  const localPart = email.slice(0, atIndex).toLowerCase().trim();

  // 1. Check exact bogus / placeholder names (e.g. test@..., asdf@..., fake@...)
  if (BOGUS_LOCAL_PARTS.has(localPart)) {
    return {
      valid: false,
      reason: "Alamat email terindikasi menggunakan pola placeholder atau ketikan asal.",
    };
  }

  // 2. Check 4 or more repetitive characters consecutively (e.g. aaaa@..., 1111@...)
  if (/(.)\1{3,}/.test(localPart)) {
    return {
      valid: false,
      reason: "Alamat email terindikasi mengandung karakter berulang yang tidak wajar.",
    };
  }

  // 3. Check for keyboard mash sequence patterns within localpart
  const mashPatterns = [/asdf/i, /qwerty/i, /zxcv/i, /12345/];
  for (const pattern of mashPatterns) {
    if (pattern.test(localPart) && localPart.length <= 12) {
      return {
        valid: false,
        reason: "Alamat email terindikasi pola keyboard mash atau ketikan acak.",
      };
    }
  }

  return { valid: true };
}

/**
 * Checks whether the domain of the email has active DNS MX records.
 * Prevents hard-bounces and quota waste by verifying mail server existence.
 */
export async function hasValidMxRecord(
  email: string,
  resolver: (domain: string) => Promise<MxRecord[]> = dns.resolveMx,
): Promise<ValidationResult> {
  const atIndex = email.lastIndexOf("@");
  if (atIndex < 0) {
    return { valid: false, reason: "Format email tidak valid." };
  }

  const domain = email.slice(atIndex + 1).toLowerCase().trim();

  try {
    const mxRecords = await resolver(domain);
    if (!Array.isArray(mxRecords) || mxRecords.length === 0) {
      return {
        valid: false,
        reason: `Domain email (${domain}) tidak memiliki server mail aktif (MX Record kosong).`,
      };
    }
    return { valid: true };
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    const definiteFailureCodes = new Set([
      "ENOTFOUND",
      "ENODATA",
      "NODATA",
      "NOTFOUND",
    ]);

    if (error.code && definiteFailureCodes.has(error.code)) {
      return {
        valid: false,
        reason: `Domain email (${domain}) tidak terdaftar atau tidak memiliki MX Record aktif.`,
      };
    }

    // Network / DNS resolver unreachable or timeout (fail-open with warning)
    console.warn(
      `[DNS MX] Resolver warning for ${domain} (${error.code ?? "UNKNOWN"}): skipping strict check to prevent false positive.`
    );
    return { valid: true };
  }
}
