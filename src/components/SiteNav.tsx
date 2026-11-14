import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";

export default async function SiteNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="display text-xl font-semibold italic tracking-tight">
        Many Happy Returns
      </Link>
      <nav className="flex items-center gap-5 text-sm font-bold">
        {user ? (
          <>
            <Link href="/dashboard" className="hover:underline decoration-2 underline-offset-4">
              My cards
            </Link>
            <form action={logout}>
              <button className="hover:underline decoration-2 underline-offset-4">Log out</button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:underline decoration-2 underline-offset-4">
              Log in
            </Link>
            <Link href="/signup" className="btn !px-4 !py-2 text-sm">
              Start
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
