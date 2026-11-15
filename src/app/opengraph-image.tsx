import { ImageResponse } from "next/og";

export const alt = "Veloura: private birthday cards that open like a real one";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The preview shown when the link is shared on WhatsApp, Facebook, X, LinkedIn and so on.
export default function OpengraphImage() {
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
          background: "#f3e9d6",
          color: "#221b17",
          position: "relative",
        }}
      >
        <div style={{ position: "absolute", top: 60, right: 90, width: 150, height: 150, borderRadius: 999, background: "#f3b232", border: "4px dashed #221b17", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, textAlign: "center", transform: "rotate(12deg)" }}>
          PRIVATE
        </div>
        <div style={{ display: "flex", fontSize: 40, fontWeight: 700, letterSpacing: 6, color: "#e2492f" }}>VELOURA</div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 98, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3 }}>
          A birthday card that opens like a real one.
        </div>
        <div style={{ display: "flex", marginTop: 34, fontSize: 34, color: "#66584c" }}>
          Your wishes and photos. A private link and a 6-digit code.
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 22, display: "flex" }}>
          <div style={{ flex: 1, background: "#e2492f" }} />
          <div style={{ flex: 1, background: "#f3b232" }} />
          <div style={{ flex: 1, background: "#1d5a55" }} />
          <div style={{ flex: 1, background: "#f1b9ae" }} />
        </div>
      </div>
    ),
    size,
  );
}
