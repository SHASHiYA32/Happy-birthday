import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";
import { SLUG_RE } from "@/lib/security/validation";
import { OCCASIONS, isOccasion } from "@/lib/occasions";

export const alt = "A private card, waiting to be opened";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The preview WhatsApp, Facebook and others show for a card link. It only carries the occasion:
// no names, no wishes, no photos, so nothing private leaks into a chat preview.
export default async function CardOpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let occasion = OCCASIONS.birthday;
  if (SLUG_RE.test(slug)) {
    const { data } = await createAdminClient().from("cards").select("occasion").eq("slug", slug).maybeSingle();
    if (data && isOccasion(data.occasion)) occasion = OCCASIONS[data.occasion];
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 90px",
          background: occasion.cover,
          color: occasion.coverInk,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 60,
            right: 90,
            width: 150,
            height: 150,
            borderRadius: 999,
            background: "#fff8ec",
            color: "#221b17",
            border: "4px dashed #221b17",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            fontWeight: 800,
            transform: "rotate(12deg)",
          }}
        >
          SEALED
        </div>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700, letterSpacing: 6 }}>VELOURA</div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 110, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3 }}>
          {`${occasion.coverGreeting}.`}
        </div>
        <div style={{ display: "flex", marginTop: 34, fontSize: 38, opacity: 0.85 }}>
          {`Someone made you a ${occasion.noun}. Open it with your code.`}
        </div>
      </div>
    ),
    size,
  );
}
