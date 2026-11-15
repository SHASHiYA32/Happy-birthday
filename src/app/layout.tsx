import type { Metadata, Viewport } from "next";
import "@fontsource-variable/fraunces/full.css";
import "@fontsource-variable/karla";
import "@fontsource-variable/caveat";
import "./globals.css";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: SITE.title,
  description: SITE.description,
  applicationName: SITE.name,
  keywords: SITE.keywords,
  authors: [{ name: SITE.creator, url: SITE.creatorUrl }],
  creator: SITE.creator,
  publisher: SITE.creator,
  category: "technology",
  alternates: { canonical: "/" },
  formatDetection: { email: false, address: false, telephone: false },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#f3e9d6",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: SITE.name,
      description: SITE.description,
      inLanguage: "en",
      publisher: { "@id": `${SITE.url}/#org` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#org`,
      name: SITE.creator,
      url: SITE.creatorUrl,
    },
    {
      "@type": "WebApplication",
      "@id": `${SITE.url}/#app`,
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Any",
      browserRequirements: "Requires a modern web browser with JavaScript",
      creator: { "@id": `${SITE.url}/#org` },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script
          type="application/ld+json"
          // "<" is escaped so the JSON can never close the script tag early.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
        {children}
      </body>
    </html>
  );
}
