"use server";

import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { lockDurationMs, verifyOtp } from "@/lib/security/otp";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";
import { setViewerCookie } from "@/lib/security/viewer-session";
import { SLUG_RE, otpSchema } from "@/lib/security/validation";
import { isUnlocked } from "@/lib/security/unlock";

export type OtpGateState = { error?: string } | undefined;

export async function openCard(_prev: OtpGateState, formData: FormData): Promise<OtpGateState> {
  const slug = String(formData.get("slug") ?? "");
  const otp = otpSchema.safeParse(String(formData.get("otp") ?? "").replace(/\s/g, ""));
  if (!SLUG_RE.test(slug)) return { error: "This link doesn't look right." };
  if (!otp.success) return { error: "The code is 6 digits." };

  const ip = await clientIp();
  if (!rateLimit(`otp:${ip}`, 30, 10 * 60_000)) {
    return { error: "Too many tries from this network. Please wait a bit." };
  }

  const admin = createAdminClient();
  const { data: card } = await admin
    .from("cards")
    .select("id, otp_hash, otp_salt, failed_attempts, locked_until, birthday_date")
    .eq("slug", slug)
    .maybeSingle();

  // Same response for "no such card" and "wrong code".
  const wrong = { error: "That code isn't right." };
  if (!card) return wrong;

  // Enforced here as well as on the page: no session can exist before the birthday.
  if (!isUnlocked(card.birthday_date)) redirect(`/c/${slug}`);

  if (card.locked_until && new Date(card.locked_until).getTime() > Date.now()) {
    const mins = Math.ceil((new Date(card.locked_until).getTime() - Date.now()) / 60_000);
    return { error: `Too many wrong codes. Try again in about ${mins} minute${mins === 1 ? "" : "s"}.` };
  }

  if (!verifyOtp(otp.data, card.otp_salt, card.otp_hash)) {
    const failed = card.failed_attempts + 1;
    const lockMs = lockDurationMs(failed);
    await admin
      .from("cards")
      .update({
        failed_attempts: failed,
        locked_until: lockMs ? new Date(Date.now() + lockMs).toISOString() : card.locked_until,
      })
      .eq("id", card.id);
    return wrong;
  }

  if (card.failed_attempts > 0 || card.locked_until) {
    await admin.from("cards").update({ failed_attempts: 0, locked_until: null }).eq("id", card.id);
  }

  await setViewerCookie(slug, card.otp_salt);
  redirect(`/c/${slug}`);
}
