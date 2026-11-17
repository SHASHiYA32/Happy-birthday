import { VelouraLoader } from "@/components/VelouraLoader";

// Shown by Next.js while any page is loading after a click or navigation.
export default function Loading() {
  return (
    <div className="grid min-h-dvh place-items-center px-6" style={{ animation: "veloura-in .3s .15s both" }}>
      <VelouraLoader label="Loading…" />
      <style>{`@keyframes veloura-in{from{opacity:0}to{opacity:1}}`}</style>
    </div>
  );
}
