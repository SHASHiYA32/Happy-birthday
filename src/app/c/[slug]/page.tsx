import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OtpGate from "@/components/OtpGate";
import CardExperience from "@/components/CardExperience";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasViewerAccess } from "@/lib/security/viewer-session";
import { SLUG_RE } from "@/lib/security/validation";
import { isUnlocked } from "@/lib/security/unlock";

export const metadata: Metadata = {
  title: "A birthday card for you",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default async function CardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!SLUG_RE.test(slug)) notFound();

  const admin = createAdminClient();
  const { data: card } = await admin
    .from("cards")
    .select("id, recipient_name, sender_name, birthday_date, otp_salt")
    .eq("slug", slug)
    .maybeSingle();
  if (!card) notFound();

  if (!isUnlocked(card.birthday_date)) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-6">
        <div className="max-w-md border-2 border-ink bg-[#fbf4e4] p-8 text-center shadow-[8px_8px_0_var(--ink)]">
          <p className="hand text-3xl text-tomato">Not yet…</p>
          <h1 className="display mt-1 text-4xl font-semibold">This card is still sealed.</h1>
          <p className="mt-3 text-ink-soft">
            It opens on{" "}
            <strong className="text-ink">
              {new Date(`${card.birthday_date}T12:00:00Z`).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
                timeZone: "UTC",
              })}
            </strong>
            . Come back then with your code.
          </p>
        </div>
      </main>
    );
  }

  if (!(await hasViewerAccess(slug, card.otp_salt))) return <OtpGate slug={slug} />;

  const { data: rows } = await admin
    .from("card_slides")
    .select("position, wish_text, image_path")
    .eq("card_id", card.id)
    .order("position", { ascending: true });

  const slides = (rows ?? []).map((r) => ({
    text: r.wish_text,
    // Only an app-internal route that re-checks the session; never a storage URL.
    image: r.image_path ? `/api/card/${slug}/image/${r.position}` : null,
  }));
  if (slides.length === 0) notFound();

  return <CardExperience recipient={card.recipient_name} sender={card.sender_name} slides={slides} />;
}
