import Link from "next/link";
import { redirect } from "next/navigation";
import SiteNav from "@/components/SiteNav";
import ChangePasswordForm from "@/components/ChangePasswordForm";
import WishArchive, { type ArchiveCard } from "@/components/WishArchive";
import DangerZone from "@/components/DangerZone";
import { createClient } from "@/lib/supabase/server";
import { isOccasion } from "@/lib/occasions";

export const metadata = { title: "Settings · Veloura" };

const joined = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function Section({ id, title, children, danger = false }: { id: string; title: string; children: React.ReactNode; danger?: boolean }) {
  return (
    <section
      aria-labelledby={id}
      className={`border-2 p-6 shadow-[6px_6px_0_var(--ink)] sm:p-8 ${
        danger ? "border-tomato bg-[#fbeee6] shadow-[6px_6px_0_var(--tomato)]" : "border-ink bg-[#fbf4e4]"
      }`}
    >
      <h2 id={id} className={`display text-3xl font-semibold ${danger ? "text-tomato" : ""}`}>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard/settings");

  const { data: rows } = await supabase
    .from("cards")
    .select("id, recipient_name, occasion, birthday_date, created_at, card_slides(position, wish_text, image_path)")
    .order("created_at", { ascending: false });

  const cards: ArchiveCard[] = (rows ?? []).map((c) => ({
    id: c.id,
    recipient: c.recipient_name,
    occasion: isOccasion(c.occasion) ? c.occasion : "birthday",
    date: c.birthday_date,
    createdAt: c.created_at,
    slides: [...(c.card_slides ?? [])]
      .sort((a, b) => a.position - b.position)
      .map((s) => ({ position: s.position, text: s.wish_text, hasImage: !!s.image_path })),
  }));

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        {/* <Link href="/dashboard" className="text-sm font-bold underline decoration-2 underline-offset-4">
          ← My cards
        </Link> */}
        <h1 className="display mt-3 text-5xl font-semibold">Settings</h1>

        <div className="mt-10 space-y-10">
          <Section id="account" title="Account">
            <dl className="grid gap-5 sm:grid-cols-2">
              <div>
                <dt className="label">Email</dt>
                <dd className="mt-1 break-all text-lg font-bold">{user.email}</dd>
              </div>
              <div>
                <dt className="label">Member since</dt>
                <dd className="mt-1 text-lg font-bold">{joined(user.created_at)}</dd>
              </div>
            </dl>
          </Section>

          <Section id="password" title="Change password">
            <ChangePasswordForm />
          </Section>

          <Section id="wishes" title="Your wishes">
            <p className="mb-5 text-sm text-ink-soft">Every card you have sealed, with its wishes and photos. Only you can see this.</p>
            <WishArchive cards={cards} />
          </Section>

          <Section id="danger" title="Danger zone" danger>
            <DangerZone cardCount={cards.length} />
          </Section>
        </div>
      </main>
    </>
  );
}
