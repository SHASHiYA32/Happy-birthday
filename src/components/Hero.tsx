"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Confetti from "./ConfettiLazy";

gsap.registerPlugin(useGSAP);

const LINES = [
  ["A", "birthday", "card"],
  ["that", "opens", "like", "one."],
];

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from("[data-word]", { yPercent: 115, rotate: 4, duration: 1.1, stagger: 0.07 })
        .from("[data-fade]", { opacity: 0, y: 18, duration: 0.8, stagger: 0.12 }, "-=0.6")
        .from("[data-stamp]", { scale: 0, rotate: -40, duration: 0.7, ease: "back.out(2.2)" }, "-=0.5");
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative isolate overflow-hidden">
      <Confetti count={90} className="absolute inset-0 -z-10 opacity-90" />

      <section className="mx-auto flex min-h-[78dvh] max-w-6xl flex-col justify-center px-6 pb-24">
        <h1 className="display text-[clamp(3.2rem,11vw,9.5rem)] font-semibold leading-[0.92]">
          {LINES.map((line, i) => (
            <span key={i} className="block">
              {line.map((w, j) => (
                <span key={j} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-bottom">
                  <span data-word className={`inline-block ${w === "opens" ? "italic text-tomato" : ""}`}>
                    {w}
                  </span>
                </span>
              ))}
            </span>
          ))}
        </h1>

        <p data-fade className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft">
          Write the wishes. Add the photos. Send a private link and a six-digit code. They tap the card, it
          swings open, and your words arrive one at a time, with the song playing.
        </p>

        <div data-fade className="mt-10 flex flex-wrap items-center gap-5">
          <Link href="/create" className="btn text-lg">
            Make a card
          </Link>
          <Link href="/login" className="font-bold underline decoration-2 underline-offset-4">
            I already have an account
          </Link>
        </div>

        <div
          data-stamp
          className="absolute right-6 top-6 hidden h-32 w-32 rotate-12 items-center justify-center rounded-full border-2 border-dashed border-ink bg-marigold text-center text-sm font-extrabold uppercase leading-tight tracking-wider md:flex"
        >
          Private
          <br />
          link +<br />
          code
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 pb-28 md:grid-cols-3">
        {[
          ["01", "Write", "Up to eight wishes, each with its own photo if you like."],
          ["02", "Seal", "We make a hidden link and a one-time code. Share them separately."],
          ["03", "They open it", "Cover, song, slow scroll through every wish and picture."],
        ].map(([n, title, body]) => (
          <div key={n} data-fade className="border-t-2 border-ink pt-5">
            <div className="hand text-3xl text-tomato">{n}</div>
            <h3 className="display mt-1 text-3xl font-semibold">{title}</h3>
            <p className="mt-2 text-ink-soft">{body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
