import SiteNav from "@/components/SiteNav";
import CreateForm from "@/components/CreateForm";

export const metadata = { title: "Make a card · Many Happy Returns" };

export default function CreatePage() {
  return (
    <>
      <SiteNav />
      <main className="px-6 pb-24 pt-6">
        <div className="mx-auto mb-10 max-w-3xl">
          <h1 className="display text-5xl font-semibold sm:text-6xl">
            Write it <span className="italic text-tomato">properly.</span>
          </h1>
          <p className="mt-3 text-ink-soft">Wishes with photos. They&apos;ll be read in this order.</p>
        </div>
        <CreateForm defaultSender="" />
      </main>
    </>
  );
}
