import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/karla";
import "@fontsource-variable/caveat";
import "./globals.css";

export const metadata: Metadata = {
  title: "Veloura",
  description: "Write the wishes, add the photos, send a private wish card that opens like a real one.",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f3e9d6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
