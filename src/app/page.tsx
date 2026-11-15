import SiteNav from "@/components/SiteNav";
import Hero from "@/components/Hero";
import WavyFooter from "@/components/Footer";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
      </main>
      <WavyFooter/>
    </>
  );
}
