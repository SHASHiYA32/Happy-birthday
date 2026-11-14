import "server-only";
import { randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";

const SLUG_ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"; // no look-alike characters

/** 16 chars from a 31-letter alphabet is about 79 bits: not guessable. */
export function generateSlug(length = 16): string {
  let out = "";
  for (let i = 0; i < length; i++) out += SLUG_ALPHABET[randomInt(0, SLUG_ALPHABET.length)];
  return out;
}

export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashOtp(otp: string, saltHex = randomBytes(16).toString("hex")) {
  const hash = scryptSync(otp, Buffer.from(saltHex, "hex"), 32, { N: 16384, r: 8, p: 1 });
  return { hash: hash.toString("hex"), salt: saltHex };
}

export function verifyOtp(otp: string, saltHex: string, expectedHashHex: string): boolean {
  const actual = scryptSync(otp, Buffer.from(saltHex, "hex"), 32, { N: 16384, r: 8, p: 1 });
  const expected = Buffer.from(expectedHashHex, "hex");
  return expected.length === actual.length && timingSafeEqual(actual, expected);
}

/**
 * Escalating lockout: every 5th wrong guess locks the card for 15 min, then
 * 30 min, 1 h ... capped at 24 h. Success resets the counter.
 */
export function lockDurationMs(failedAttempts: number): number {
  if (failedAttempts === 0 || failedAttempts % 5 !== 0) return 0;
  const step = failedAttempts / 5 - 1;
  return Math.min(15 * 60_000 * 2 ** step, 24 * 60 * 60_000);
}
