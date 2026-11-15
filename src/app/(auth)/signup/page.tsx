import SiteNav from "@/components/SiteNav";
import AuthForm from "@/components/AuthForm";

export const metadata = { title: "Sign up · Many Happy Returns" };

export default function SignupPage() {
  return (
    <>
      <SiteNav/>
      <main className="px-6 py-10">
        <AuthForm mode="signup" />
      </main>
    </>
  );
}
