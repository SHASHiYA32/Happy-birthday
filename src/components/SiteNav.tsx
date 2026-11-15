import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";
import MobileMenu from "./MobileMenu";

export default async function SiteNav() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <Link href="/" className="display text-2xl font-semibold italic tracking-tight">
        Veloura <span className="text-sm text-tomato">by DevDynamo</span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-5 text-sm font-bold">
        {user ? (
          <>
            <Link href="/dashboard" className="hover:underline decoration-2 underline-offset-4">
              My cards
            </Link>
            <LogoutButton />
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

      {/* Mobile Navigation Toggle & Menu */}
      <MobileMenu user={user} />
    </header>
  );
}