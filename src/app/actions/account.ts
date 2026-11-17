"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/security/rate-limit";
import { passwordSchema } from "@/lib/security/validation";

export type AccountState = { error?: string; ok?: boolean } | undefined;

const BUCKET = "birthday";

export async function changePassword(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Please log in again." };

  if (!rateLimit(`pw:${user.id}`, 5, 15 * 60_000)) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const current = String(formData.get("current") ?? "");
  const next = passwordSchema.safeParse(String(formData.get("next") ?? ""));
  const confirm = String(formData.get("confirm") ?? "");

  if (!current) return { error: "Enter your current password." };
  if (!next.success) return { error: next.error.issues[0]?.message ?? "Choose a stronger password." };
  if (next.data !== confirm) return { error: "The new passwords don't match." };
  if (next.data === current) return { error: "Choose a password you haven't used before." };

  // Re-check the current password, so a stolen session alone can't change it.
  const { error: authError } = await supabase.auth.signInWithPassword({ email: user.email, password: current });
  if (authError) return { error: "Your current password is incorrect." };

  const { error } = await supabase.auth.updateUser({ password: next.data });
  if (error) return { error: "We couldn't update your password. Please try again." };

  // Anyone else logged in as this account is signed out.
  await supabase.auth.signOut({ scope: "others" });
  return { ok: true };
}

type Admin = ReturnType<typeof createAdminClient>;

async function removeInChunks(admin: Admin, paths: string[]) {
  for (let i = 0; i < paths.length; i += 100) {
    await admin.storage.from(BUCKET).remove(paths.slice(i, i + 100));
  }
}

/** Removes everything under `<folder>/`, including any file the database no longer points to. */
async function sweepFolder(admin: Admin, folder: string, depth = 0) {
  if (depth > 3) return;
  const { data } = await admin.storage.from(BUCKET).list(folder, { limit: 1000 });
  const files: string[] = [];
  for (const entry of data ?? []) {
    if (entry.id) files.push(`${folder}/${entry.name}`);
    else await sweepFolder(admin, `${folder}/${entry.name}`, depth + 1);
  }
  await removeInChunks(admin, files);
}

export async function deleteAccount(_prev: AccountState, formData: FormData): Promise<AccountState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { error: "Please log in again." };

  if (!rateLimit(`del:${user.id}`, 3, 60 * 60_000)) {
    return { error: "Too many attempts. Please try again later." };
  }

  if (String(formData.get("confirm") ?? "").trim() !== "DELETE") {
    return { error: "Type DELETE in capital letters to confirm." };
  }

  const password = String(formData.get("password") ?? "");
  if (!password) return { error: "Enter your password to confirm." };
  const { error: authError } = await supabase.auth.signInWithPassword({ email: user.email, password });
  if (authError) return { error: "That password is not correct." };

  const admin = createAdminClient();

  // 1. Photos: every file this user uploaded.
  const { data: cards } = await admin.from("cards").select("id").eq("owner_id", user.id);
  const cardIds = (cards ?? []).map((c) => c.id);
  if (cardIds.length) {
    const { data: slides } = await admin.from("card_slides").select("image_path").in("card_id", cardIds);
    const paths = (slides ?? []).map((s) => s.image_path).filter((p): p is string => !!p);
    await removeInChunks(admin, paths);
  }
  await sweepFolder(admin, user.id);

  // 2. The account itself. Profile, cards and wishes are removed with it (ON DELETE CASCADE).
  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) return { error: "We couldn't delete your account. Please try again." };

  try {
    await supabase.auth.signOut();
  } catch {
    // the account is gone; the session cookie is useless anyway
  }
  return { ok: true };
}
