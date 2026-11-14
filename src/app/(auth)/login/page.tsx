import SiteNav from "@/components/SiteNav";
import AuthForm from "@/components/AuthForm";
import { safeNext } from "@/lib/security/validation";

export const metadata = { title: "Log in · Many Happy Returns" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <>
      <SiteNav />
      <main className="px-6 py-10">
        <AuthForm mode="login" next={safeNext(next)} />
      </main>
    </>
  );
}
