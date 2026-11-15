import { ImageResponse } from "next/og";
import { createAdminClient } from "@/lib/supabase/admin";
import { SLUG_RE } from "@/lib/security/validation";

export const alt = "Sealed Birthday Card Envelope";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: Props) {
  const { slug } = await params;
  
  let recipient = "You";
  let sender = "Someone special";

  if (SLUG_RE.test(slug)) {
    const admin = createAdminClient();
    const { data: card } = await admin
      .from("cards")
      .select("recipient_name, sender_name")
      .eq("slug", slug)
      .maybeSingle();

    if (card) {
      recipient = card.recipient_name;
      sender = card.sender_name;
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f3ead8",
          padding: "48px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            backgroundColor: "#fbf4e4",
            border: "5px solid #1e1b18",
            boxShadow: "14px 14px 0px #1e1b18",
            padding: "48px 64px",
            overflow: "hidden",
          }}
        >
          <svg
            width="1104"
            height="260"
            viewBox="0 0 1104 260"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            <path
              d="M 0 0 L 552 215 L 1104 0"
              fill="none"
              stroke="#1e1b18"
              strokeWidth="4"
            />
          </svg>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              width: "100%",
              zIndex: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "24px",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#d94e34",
              }}
            >
              Sealed Birthday Delivery
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                width: "110px",
                height: "130px",
                border: "3px dashed #1e1b18",
                backgroundColor: "#f3ead8",
                padding: "8px",
              }}
            >
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "#1e1b18",
                }}
              >
                Private
              </span>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "9999px",
                  backgroundColor: "#d94e34",
                  border: "3px solid #1e1b18",
                  marginTop: "10px",
                }}
              />
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              top: "172px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "84px",
              height: "84px",
              borderRadius: "9999px",
              backgroundColor: "#d94e34",
              border: "4px solid #1e1b18",
              boxShadow: "4px 4px 0px #1e1b18",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fbf4e4",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              zIndex: 20,
            }}
          >
            SEAL
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "80px",
              textAlign: "center",
              zIndex: 10,
            }}
          >
            <span
              style={{
                fontSize: "22px",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#6b6359",
                marginBottom: "12px",
              }}
            >
              Prepared especially for
            </span>

            <div
              style={{
                fontSize: recipient.length > 18 ? "56px" : "74px",
                fontWeight: 700,
                color: "#1e1b18",
                borderBottom: "4px solid #1e1b18",
                paddingBottom: "8px",
                paddingLeft: "36px",
                paddingRight: "36px",
                maxWidth: "920px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {recipient}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              borderTop: "2px solid rgba(30, 27, 24, 0.2)",
              paddingTop: "20px",
              zIndex: 10,
            }}
          >
            <span
              style={{
                fontSize: "24px",
                color: "#1e1b18",
              }}
            >
              From: <strong>{sender}</strong>
            </span>

            <span
              style={{
                fontSize: "20px",
                fontWeight: 700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#d94e34",
              }}
            >
              Tap link to open
            </span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}