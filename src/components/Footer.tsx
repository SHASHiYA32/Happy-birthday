"use client";

import React, { useState, useEffect } from "react";

export default function WavyFooter() {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("https://dd-wishspark.vercel.app");

  useEffect(() => {
    setShareUrl(window.location.origin);
  }, []);

  const shareText = encodeURIComponent(
    "Create and send sealed digital birthday cards with Wish Spark!"
  );
  const encodedUrl = encodeURIComponent(shareUrl);

  const handleInstagramShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback if clipboard permission is blocked
    }
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  };

  return (
    <footer className="relative w-full mt-auto pt-20 overflow-hidden select-none text-[#1C1917]">
      {/* Organic Layered Wave Transition */}
      <div className="relative w-full h-24 sm:h-36 overflow-hidden pointer-events-none">
        {/* Back Wave: Soft Warm Marigold (Slower, deeper swell) */}
        <div className="absolute inset-0 w-[200%] h-full animate-tide-back will-change-transform opacity-95">
          <svg
            viewBox="0 0 2880 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d="M0 85 C 420 155, 660 15, 1080 85 C 1290 120, 1365 102, 1440 85 C 1860 155, 2100 15, 2520 85 C 2730 120, 2805 102, 2880 85 L 2880 180 L 0 180 Z"
              fill="#F4B942"
            />
          </svg>
        </div>

        {/* Middle Accent Wave: Warm Cream Glimpse for Depth */}
        <div className="absolute inset-0 w-[200%] h-full animate-tide-mid will-change-transform">
          <svg
            viewBox="0 0 2880 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d="M0 105 C 360 45, 720 150, 1080 105 C 1260 82, 1350 94, 1440 105 C 1800 45, 2160 150, 2520 105 C 2700 82, 2790 94, 2880 105 L 2880 180 L 0 180 Z"
              fill="#EDE3D5"
            />
          </svg>
        </div>

        {/* Front Wave: Signature Terracotta */}
        <div className="absolute inset-0 w-[200%] h-full animate-tide-front will-change-transform">
          <svg
            viewBox="0 0 2880 180"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            <path
              d="M0 112 C 380 35, 700 165, 1080 112 C 1270 85, 1355 98, 1440 112 C 1820 35, 2140 165, 2520 112 C 2710 85, 2795 98, 2880 112 L 2880 180 L 0 180 Z"
              fill="#E25236"
            />
          </svg>
        </div>
      </div>

      {/* Main Footer Body with Subtle Tactile Grain */}
      <div className="relative z-10 bg-[#E25236] px-6 sm:px-12 pb-10 pt-2 -mt-[2px]">
        {/* Subtle SVG Noise Texture for Paper/Cardstock Feel */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative max-w-6xl mx-auto">
          {/* Top Row: Brand & Social Actions */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8">
            <div>
              <span className="font-serif italic font-bold text-2xl sm:text-3xl tracking-tight text-[#1C1917] block">
                Wish Spark
              </span>
              <p className="text-xs sm:text-sm font-medium text-[#1C1917]/80 mt-1">
                Sealed digital keepsakes worth opening.
              </p>
            </div>

            {/* Tactile Share Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#1C1917]/75 mr-1">
                Share the spark
              </span>

              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${shareText}%20${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on WhatsApp"
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EDE3D5] text-[#1C1917] text-xs font-bold border-2 border-[#1C1917] shadow-[3px_3px_0px_#1C1917] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#1C1917] hover:bg-[#FAF6F0] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_#1C1917]"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824z" />
                </svg>
                <span>WhatsApp</span>
              </a>

              {/* Instagram */}
              <button
                type="button"
                onClick={handleInstagramShare}
                aria-label="Share on Instagram"
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EDE3D5] text-[#1C1917] text-xs font-bold border-2 border-[#1C1917] shadow-[3px_3px_0px_#1C1917] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#1C1917] hover:bg-[#FAF6F0] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_#1C1917] cursor-pointer"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>{copied ? "Copied!" : "Instagram"}</span>
              </button>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Facebook"
                className="group inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#EDE3D5] text-[#1C1917] text-xs font-bold border-2 border-[#1C1917] shadow-[3px_3px_0px_#1C1917] transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_#1C1917] hover:bg-[#FAF6F0] active:translate-x-0 active:translate-y-0 active:shadow-[1px_1px_0px_#1C1917]"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                </svg>
                <span>Facebook</span>
              </a>
            </div>
          </div>

          {/* Bottom Utility Bar */}
          <div className="pt-6 border-t border-[#1C1917]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-[#1C1917]/85">
            <p>© 2026 Wish Spark. All rights reserved.</p>

            <p>
              Crafted by{" "}
              <a
                href="https://dev-dynamo-official.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 font-bold text-[#1C1917] hover:text-[#EDE3D5] transition-colors duration-200"
              >
                <span className="underline decoration-[#1C1917]/50 underline-offset-4 group-hover:decoration-[#EDE3D5]">
                  DevDynamo Pvt
                </span>
                <span className="inline-block transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}