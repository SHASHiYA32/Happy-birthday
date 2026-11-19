import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OtpGate from "@/components/OtpGate";
import CardExperience from "@/components/CardExperience";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasViewerAccess } from "@/lib/security/viewer-session";
import { SLUG_RE } from "@/lib/security/validation";
import { isUnlocked } from "@/lib/security/unlock";
import { OCCASIONS, isOccasion } from "@/lib/occasions";

// Link previews and the browser tab follow the card's occasion. Never put names or wishes in here.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  let noun = "card";
  if (SLUG_RE.test(slug)) {
    const { data } = await createAdminClient().from("cards").select("occasion").eq("slug", slug).maybeSingle();
    if (data && isOccasion(data.occasion)) noun = OCCASIONS[data.occasion].noun;
  }
  const title = `A ${noun} for you · Veloura`;
  const description = `Someone made you a ${noun}. Open it with your six-digit code.`;
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
    robots: { index: false, follow: false, nocache: true },
    referrer: "no-referrer",
  };
}

export default async function CardPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!SLUG_RE.test(slug)) notFound();

  const admin = createAdminClient();
  const { data: card } = await admin
    .from("cards")
    .select("id, recipient_name, sender_name, birthday_date, occasion, otp_salt")
    .eq("slug", slug)
    .maybeSingle();
  if (!card) notFound();
  const occasion = isOccasion(card.occasion) ? card.occasion : "birthday";

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

  if (!(await hasViewerAccess(slug, card.otp_salt))) return <OtpGate slug={slug} occasion={occasion} />;

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

  return <CardExperience recipient={card.recipient_name} sender={card.sender_name} slides={slides} occasion={occasion} />;
}
