import { z } from "zod";

export const SLUG_RE = /^[a-z0-9]{16,32}$/;

export const MAX_SLIDES = 8;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const cleanText = (max: number) =>
  z
    .string()
    .transform((s) => s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim())
    .pipe(z.string().min(1).max(max));

export const emailSchema = z.string().trim().toLowerCase().email().max(254);

export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters.")
  .max(72, "Use at most 72 characters.")
  .refine((p) => /[a-z]/.test(p) && /[A-Z]/.test(p) && /\d/.test(p), {
    message: "Mix upper case, lower case and a number.",
  });

export const cardMetaSchema = z.object({
  recipient: cleanText(60),
  sender: cleanText(60),
  birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const wishSchema = cleanText(500);

export const otpSchema = z.string().regex(/^\d{6}$/);

/** Only same-site relative paths, so `?next=` can't become an open redirect. */
export function safeNext(value: string | null | undefined, fallback = "/dashboard") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return fallback;
  }
  return value;
}

/** Sniff real file type from magic bytes; never trust the browser-supplied MIME. */
export function sniffImage(bytes: Uint8Array): { mime: string; ext: string } | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { mime: "image/jpeg", ext: "jpg" };
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return { mime: "image/png", ext: "png" };
  }
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}
