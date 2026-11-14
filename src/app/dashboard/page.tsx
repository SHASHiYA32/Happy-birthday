import Link from "next/link";
import { headers } from "next/headers";
import SiteNav from "@/components/SiteNav";
import CardRow from "@/components/CardRow";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "My cards · Many Happy Returns" };

export default async function Dashboard() {
  const supabase = await createClient();
  const { data: cards } = await supabase
    .from("cards")
    .select("id, slug, recipient_name, birthday_date")
    .order("created_at", { ascending: false });

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");

  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-6">
        <div className="flex items-end justify-between gap-4">
          <h1 className="display text-5xl font-semibold">My cards</h1>
          <Link href="/create" className="btn !px-5 !py-2 text-sm">New card</Link>
        </div>

        {cards && cards.length > 0 ? (
          <ul className="mt-10 space-y-6">
            {cards.map((c) => (
              <CardRow
                key={c.id}
                id={c.id}
                recipient={c.recipient_name}
                birthday={c.birthday_date}
                link={`${proto}://${host}/c/${c.slug}`}
              />
            ))}
          </ul>
        ) : (
          <p className="mt-12 text-lg text-ink-soft">
            Nothing here yet. <Link href="/create" className="font-bold text-ink underline decoration-2 underline-offset-4">Make the first one.</Link>
          </p>
        )}
      </main>
    </>
  );
}
