"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import Confetti from "./ConfettiLazy";

gsap.registerPlugin(useGSAP);

const LINES = [
  ["Send", "a", "birthday", "card"],
  ["that", "opens", "like", "a", "real", "one."],
];

const STEPS = [
  ["01", "Write", "Add up to eight heartfelt wishes, each with its own photo if you like."],
  ["02", "Seal", "Veloura creates a hidden link and a one-time 6-digit code. Send them in separate messages."],
  ["03", "They open it", "On the birthday they enter the code, the card swings open, music plays and every wish and photo drifts past."],
];

const PROOF = ["Private link + 6-digit code", "Photos protected from saving", "Free to start"];

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduce) return;
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from("[data-word]", { yPercent: 115, rotate: 4, duration: 1.1, stagger: 0.06 })
        .from("[data-fade]", { opacity: 0, y: 18, duration: 0.8, stagger: 0.1 }, "-=0.6")
        .from("[data-stamp]", { scale: 0, rotate: -40, duration: 0.7, ease: "back.out(2.2)" }, "-=0.5");
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative isolate overflow-hidden">
      <Confetti count={90} className="absolute inset-0 -z-10 opacity-90" />

      <section aria-labelledby="hero-title" className="mx-auto flex min-h-[78dvh] max-w-6xl flex-col justify-center px-6 pb-24">
        {/* <p data-fade className="hand mb-3 text-3xl text-tomato">
          Veloura · digital birthday cards
        </p> */}

        <h1 id="hero-title" className="display text-[clamp(2.9rem,10vw,8.5rem)] font-semibold leading-[0.94]">
          {LINES.map((line, i) => (
            <span key={i} className="block">
              {line.map((w, j) => (
                <span key={j}>
                  <span className="inline-block overflow-hidden pb-[0.08em] align-bottom">
                    <span data-word className={`inline-block ${w === "opens" ? "italic text-tomato" : ""}`}>
                      {w}
                    </span>
                  </span>
                  {/* A real space, so search engines and screen readers read separate words. */}
                  {" "}
                </span>
              ))}
            </span>
          ))}
        </h1>

        <p data-fade className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-soft md:text-xl">
          Write your wishes, add your photos and send a <strong className="text-ink">private birthday card</strong>{" "}
          that is sealed until the big day. They enter a six-digit code, the card swings open, a music-box tune
          plays and your words arrive one at a time.
        </p>

        <ul data-fade className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold">
          {PROOF.map((p) => (
            <li key={p} className="flex items-center gap-2">
              <span aria-hidden className="text-tomato">✦</span>
              {p}
            </li>
          ))}
        </ul>

        <div data-fade className="mt-10 flex flex-wrap items-center gap-5">
          <Link href="/create" className="btn text-lg">
            Make a birthday card
          </Link>
          <Link href="/login" className="font-bold underline decoration-2 underline-offset-4">
            I already have an account
          </Link>
        </div>

        <div
          data-stamp
          aria-hidden
          className="absolute right-6 top-6 hidden h-32 w-32 rotate-12 items-center justify-center rounded-full border-2 border-dashed border-ink bg-marigold text-center text-sm font-extrabold uppercase leading-tight tracking-wider md:flex"
        >
          Private
          <br />
          link +<br />
          code
        </div>
      </section>

      <section aria-labelledby="how-title" className="mx-auto max-w-6xl px-6 pb-28">
        <h2 id="how-title" className="display mb-10 text-3xl font-semibold md:text-4xl">
          How to send a birthday card with Veloura
        </h2>
        <ol className="grid gap-10 md:grid-cols-3">
          {STEPS.map(([n, title, body]) => (
            <li key={n} data-fade className="border-t-2 border-ink pt-5">
              <div className="hand text-3xl text-tomato">{n}</div>
              <h3 className="display mt-1 text-3xl font-semibold">{title}</h3>
              <p className="mt-2 text-ink-soft">{body}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
