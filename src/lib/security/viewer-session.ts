import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

const TTL_SECONDS = 60 * 60 * 2; // a viewing session lasts two hours

type Payload = { slug: string; sv: string; exp: number };

const b64 = (buf: Buffer | string) => Buffer.from(buf).toString("base64url");

function sign(data: string) {
  return createHmac("sha256", env.sessionSecret).update(data).digest();
}

export const cookieName = (slug: string) => `bc_${slug}`;

/** `salt` is the card's OTP salt: regenerating the OTP invalidates open sessions. */
export function createViewerToken(slug: string, salt: string): string {
  const payload: Payload = {
    slug,
    sv: salt.slice(0, 12),
    exp: Math.floor(Date.now() / 1000) + TTL_SECONDS,
  };
  const body = b64(JSON.stringify(payload));
  return `${body}.${b64(sign(body))}`;
}

export function validateViewerToken(token: string | undefined, slug: string, salt: string): boolean {
  if (!token) return false;
  const [body, sig] = token.split(".");
  if (!body || !sig) return false;
  const expected = sign(body);
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as Payload;
    return (
      payload.slug === slug &&
      payload.sv === salt.slice(0, 12) &&
      typeof payload.exp === "number" &&
      payload.exp > Date.now() / 1000
    );
  } catch {
    return false;
  }
}

export async function setViewerCookie(slug: string, salt: string) {
  const store = await cookies();
  store.set(cookieName(slug), createViewerToken(slug, salt), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: TTL_SECONDS,
  });
}

export async function hasViewerAccess(slug: string, salt: string): Promise<boolean> {
  const store = await cookies();
  return validateViewerToken(store.get(cookieName(slug))?.value, slug, salt);
}
