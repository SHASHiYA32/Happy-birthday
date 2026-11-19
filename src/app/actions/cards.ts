"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateOtp, generateSlug, hashOtp } from "@/lib/security/otp";
import { rateLimit } from "@/lib/security/rate-limit";
import { isOccasion } from "@/lib/occasions";
import {
  MAX_IMAGE_BYTES,
  MAX_SLIDES,
  cardMetaSchema,
  sniffImage,
  wishSchema,
} from "@/lib/security/validation";

export type CreateState =
  | { error?: string; ok?: undefined }
  | { ok: true; link: string; otp: string; recipient: string };

async function baseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function createCard(_prev: CreateState, formData: FormData): Promise<CreateState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in again." };

  if (!rateLimit(`create:${user.id}`, 10, 60 * 60_000)) {
    return { error: "You've made a lot of cards just now. Try again in a little while." };
  }

  const meta = cardMetaSchema.safeParse({
    recipient: formData.get("recipient"),
    sender: formData.get("sender"),
    birthday: formData.get("birthday"),
  });
  if (!meta.success) return { error: "Please fill in their name, your name and the birthday." };

  // No silent default: a form that forgets to send the type must fail loudly, not quietly make a birthday card.
  const occasion = String(formData.get("occasion") ?? "");
  if (!isOccasion(occasion)) return { error: "Choose what kind of card this is." };

  const count = Number(formData.get("count"));
  if (!Number.isInteger(count) || count < 1 || count > MAX_SLIDES) {
    return { error: `A card holds between 1 and ${MAX_SLIDES} wishes.` };
  }

  const slides: { text: string; bytes?: Uint8Array; mime?: string; ext?: string }[] = [];
  for (let i = 0; i < count; i++) {
    const text = wishSchema.safeParse(formData.get(`text_${i}`));
    if (!text.success) return { error: `Wish ${i + 1} needs some words (up to 500 characters).` };

    const file = formData.get(`image_${i}`);
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_IMAGE_BYTES) return { error: `Photo ${i + 1} is too large (5 MB max).` };
      const bytes = new Uint8Array(await file.arrayBuffer());
      const type = sniffImage(bytes);
      if (!type) return { error: `Photo ${i + 1} must be a JPG, PNG or WebP image.` };
      slides.push({ text: text.data, bytes, mime: type.mime, ext: type.ext });
    } else {
      slides.push({ text: text.data });
    }
  }

  const otp = generateOtp();
  const { hash, salt } = hashOtp(otp);
  const slug = generateSlug();

  const { data: card, error: cardError } = await supabase
    .from("cards")
    .insert({
      owner_id: user.id,
      slug,
      recipient_name: meta.data.recipient,
      sender_name: meta.data.sender,
      birthday_date: meta.data.birthday,
      occasion,
      otp_hash: hash,
      otp_salt: salt,
    })
    .select("id, occasion")
    .single();
  if (cardError || !card) return { error: "Couldn't save the card. Please try again." };

  // Read-back check: the stored type must be the one chosen. If it isn't (an old database or old code),
  // undo the card instead of quietly handing out a birthday card for a Valentine's one.
  if (card.occasion !== occasion) {
    await supabase.from("cards").delete().eq("id", card.id);
    return { error: "This card's type wasn't saved correctly, so it was cancelled. Please contact support." };
  }

  const uploaded: string[] = [];
  const rows: { card_id: string; position: number; wish_text: string; image_path: string | null }[] = [];

  for (let i = 0; i < slides.length; i++) {
    const s = slides[i];
    let path: string | null = null;
    if (s.bytes && s.mime && s.ext) {
      path = `${user.id}/${card.id}/${randomUUID()}.${s.ext}`;
      const { error } = await supabase.storage
        .from("birthday")
        .upload(path, s.bytes, { contentType: s.mime, upsert: false, cacheControl: "0" });
      if (error) {
        await supabase.storage.from("birthday").remove(uploaded);
        await supabase.from("cards").delete().eq("id", card.id);
        return { error: `Photo ${i + 1} didn't upload. Please try again.` };
      }
      uploaded.push(path);
    }
    rows.push({ card_id: card.id, position: i, wish_text: s.text, image_path: path });
  }

  const { error: slidesError } = await supabase.from("card_slides").insert(rows);
  if (slidesError) {
    if (uploaded.length) await supabase.storage.from("birthday").remove(uploaded);
    await supabase.from("cards").delete().eq("id", card.id);
    return { error: "Couldn't save the wishes. Please try again." };
  }

  revalidatePath("/dashboard");
  return { ok: true, link: `${await baseUrl()}/c/${slug}`, otp, recipient: meta.data.recipient };
}

export type OtpState = { otp?: string; error?: string } | undefined;

export async function regenerateOtp(_prev: OtpState, formData: FormData): Promise<OtpState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Please log in again." };

  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return { error: "Unknown card." };

  const otp = generateOtp();
  const { hash, salt } = hashOtp(otp);
  const { data, error } = await supabase
    .from("cards")
    .update({ otp_hash: hash, otp_salt: salt, failed_attempts: 0, locked_until: null })
    .eq("id", id)
    .select("id");
  if (error || !data?.length) return { error: "Couldn't change the code." };
  return { otp };
}

export async function deleteCard(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) return;

  const { data: slides } = await supabase.from("card_slides").select("image_path").eq("card_id", id);
  const paths = (slides ?? []).map((s) => s.image_path).filter((p): p is string => !!p);
  if (paths.length) await supabase.storage.from("birthday").remove(paths);
  await supabase.from("cards").delete().eq("id", id); // slides cascade
  revalidatePath("/dashboard");
}
