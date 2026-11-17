"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { sileo } from "sileo";
import Confetti from "./ConfettiLazy";
import OccasionArt from "./OccasionArt";
import { OCCASION_LIST } from "@/lib/occasions";
import { LATEST_UPDATE, UPDATE_STORAGE_KEY } from "@/lib/updates";

gsap.registerPlugin(useGSAP);

const N = OCCASION_LIST.length;
const ROTATE_MS = 3200;
const PICK_PAUSE_MS = 9000;

const STEPS = [
  ["01", "Write", "Add up to eight heartfelt wishes, each with its own photo if you like."],
  ["02", "Seal", "Veloura creates a hidden link and a one-time 6-digit code. Send them in separate messages."],
  ["03", "They open it", "On the day they enter the code, the card swings open, music plays and every wish and photo drifts past."],
];

const PROOF = ["Private link + 6-digit code", "Photos protected from saving", "Free to start"];

/** False on the server and during hydration, true afterwards. */
function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function Check({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0" aria-hidden>
      <circle cx="10" cy="10" r="9" fill={color} stroke="#221b17" strokeWidth="1.6" />
      <path d="M5.8 10.4l2.8 2.8 5.6-6" fill="none" stroke="#fff8ec" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);
  const wordBox = useRef<HTMLSpanElement>(null);
  const lastWidth = useRef<number | null>(null);
  const pausedUntil = useRef(0);
  const router = useRouter();
  const hydrated = useHydrated();
  const [active, setActive] = useState(0);
  const occ = OCCASION_LIST[active];

  // Entrance animation.
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from("[data-reveal]", { yPercent: 40, opacity: 0, duration: 1, stagger: 0.12 })
        .from("[data-fade]", { opacity: 0, y: 18, duration: 0.8, stagger: 0.09 }, "-=0.6")
        .from("[data-card]", { y: 60, rotate: -6, opacity: 0, duration: 1.1 }, "-=1")
        .from("[data-stamp]", { scale: 0, rotate: -40, duration: 0.7, ease: "back.out(2.2)" }, "-=0.5");
      gsap.to("[data-card]", { y: -10, duration: 2.6, yoyo: true, repeat: -1, ease: "sine.inOut", delay: 1.4 });
    },
    { scope: root },
  );

  // The word carousel advances itself, and waits a while after someone picks one.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      if (Date.now() < pausedUntil.current) return;
      setActive((a) => (a + 1) % N);
    }, ROTATE_MS);
    return () => clearInterval(id);
  }, []);

  // The line is as wide as the current word, so "Send a Vesak card" never has a gap.
  // When the word changes, glide from the old width to the new one.
  useLayoutEffect(() => {
    const el = wordBox.current;
    if (!el) return;
    const from = gsap.isTweening(el) ? el.getBoundingClientRect().width : lastWidth.current;
    gsap.killTweensOf(el);
    el.style.width = "";
    const to = el.getBoundingClientRect().width;
    lastWidth.current = to;
    if (from !== null && Math.abs(from - to) > 1) {
      gsap.fromTo(el, { width: from }, { width: to, duration: 0.7, ease: "power3.inOut", clearProps: "width" });
    }
  }, [active]);

  // "What's new" notice, once per update per browser.
  useEffect(() => {
    let seen: string | null = null;
    try {
      seen = localStorage.getItem(UPDATE_STORAGE_KEY);
    } catch {}
    if (seen === LATEST_UPDATE.id) return;
    const t = setTimeout(() => {
      sileo.info({
        title: LATEST_UPDATE.title,
        description: LATEST_UPDATE.description,
        position: "top-center",
        duration: 10000,
        fill: "#fbf4e4",
        button: { title: LATEST_UPDATE.cta, onClick: () => router.push(LATEST_UPDATE.href) },
      });
      try {
        localStorage.setItem(UPDATE_STORAGE_KEY, LATEST_UPDATE.id);
      } catch {}
    }, 1600);
    return () => clearTimeout(t);
  }, [router]);

  function pick(i: number) {
    pausedUntil.current = Date.now() + PICK_PAUSE_MS;
    setActive(i);
  }

  return (
    <div ref={root} className="relative isolate overflow-hidden">
      <Confetti variant={occ.confetti} count={70} className="absolute inset-0 -z-10 opacity-80" />

      <section
        aria-labelledby="hero-title"
        className="mx-auto grid max-w-6xl items-center gap-14 px-6 pb-20 pt-4 lg:min-h-[calc(100dvh-7rem)] lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:pb-24"
      >
        {/* ---------- copy ---------- */}
        <div>
          <p
            data-fade
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border-2 border-ink bg-[#fbf4e4] px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.18em] shadow-[3px_3px_0_var(--ink)]"
          >
            <span
              aria-hidden
              className="h-2 w-2 rounded-full transition-colors duration-700"
              style={{ background: occ.accent }}
            />
            Sealed digital keepsakes
          </p>

          <h1
            id="hero-title"
            className="display text-[clamp(2.35rem,9.4vw,4.1rem)] font-semibold leading-[1.04] tracking-tight"
          >
            <span data-reveal className="block">Send a</span>
            <span data-reveal className="block whitespace-nowrap">
              <span
                ref={wordBox}
                className="relative -mb-[0.14em] inline-block overflow-hidden pb-[0.14em] pr-[0.1em] align-bottom italic"
                style={{ color: occ.accent, transition: "color 0.7s ease" }}
              >
                {OCCASION_LIST.map((o, i) => {
                  // Server HTML (and search engines) only get the first word; the rest join after hydration.
                  if (!hydrated && i !== 0) return null;
                  const rel = (i - active + N) % N;
                  const isActive = rel === 0;
                  const isPrev = rel === N - 1;
                  return (
                    <span
                      key={o.id}
                      aria-hidden={!isActive}
                      className={`block whitespace-nowrap ${isActive ? "relative" : "absolute left-0 top-0"}`}
                      style={{
                        transform: isActive ? "translateY(0)" : isPrev ? "translateY(-110%)" : "translateY(110%)",
                        opacity: isActive ? 1 : 0,
                        transition: "transform 0.7s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease",
                      }}
                    >
                      {o.label}
                    </span>
                  );
                })}
              </span>{" "}
              card
            </span>
            <span data-reveal className="mt-3 block text-[0.46em] font-normal italic leading-snug text-ink-soft">
              that opens like a real one.
            </span>
          </h1>

          <p data-fade className="mt-8 max-w-xl text-lg leading-relaxed text-ink-soft">
            Write your wishes, add your photos and send a <strong className="text-ink">private digital card</strong> for
            birthdays, Vesak, Valentine&apos;s Day and Christmas. It stays sealed until the day, then opens with a
            six-digit code, music and your words, one at a time.
          </p>

          <div data-fade className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link href={`/create?occasion=${occ.id}`} className="btn text-lg">
              Make a card
            </Link>
            <Link href="/login" className="font-bold underline decoration-2 underline-offset-4">
              I already have an account
            </Link>
          </div>

          <ul data-fade className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t-2 border-ink/15 pt-6 text-sm font-bold">
            {PROOF.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <Check color={occ.accent} />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* ---------- card preview ---------- */}
        <div className="relative mx-auto w-full max-w-md">
          <div data-card className="relative mx-auto aspect-[3/4] w-[min(68vw,290px)] sm:w-[320px]">
            <div className="absolute inset-0 -rotate-[7deg] border-2 border-ink bg-[#fbf4e4] shadow-[6px_6px_0_var(--ink)]" />
            <div
              className="absolute inset-0 rotate-[3deg] overflow-hidden border-2 border-ink shadow-[8px_8px_0_var(--ink)]"
              style={{ background: occ.cover, transition: "background 0.7s ease" }}
            >
              {OCCASION_LIST.map((o, i) => (
                <div
                  key={o.id}
                  aria-hidden={i !== active}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-5 text-center"
                  style={{
                    color: o.coverInk,
                    opacity: i === active ? 1 : 0,
                    transform: i === active ? "scale(1)" : "scale(0.92)",
                    transition: "opacity 0.6s ease, transform 0.7s cubic-bezier(0.22,1,0.36,1)",
                  }}
                >
                  <p className="hand text-3xl leading-none">For you</p>
                  <OccasionArt occasion={o.id} className="w-[64%]" />
                  <p className="display text-2xl font-semibold italic">{o.coverGreeting}</p>
                </div>
              ))}
            </div>
            <div
              data-stamp
              aria-hidden
              className="absolute -right-4 -top-5 z-10 grid h-[92px] w-[92px] rotate-12 place-items-center rounded-full border-2 border-dashed border-ink bg-marigold text-center text-[11px] font-extrabold uppercase leading-tight tracking-wider"
            >
              <span>
                Private
                <br />
                link +<br />
                code
              </span>
            </div>
          </div>

          <div data-fade role="group" aria-label="Preview an occasion" className="mt-12 flex flex-wrap justify-center gap-2">
            {OCCASION_LIST.map((o, i) => {
              const on = i === active;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => pick(i)}
                  aria-pressed={on}
                  className="rounded-full border-2 border-ink px-4 py-1.5 text-sm font-bold transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: on ? o.accent : "transparent",
                    color: on ? "#fff8ec" : "#221b17",
                    boxShadow: on ? "3px 3px 0 #221b17" : "none",
                  }}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- occasions ---------- */}
      <section aria-labelledby="occasions-title" className="mx-auto max-w-6xl px-6 pb-24">
        <h2 id="occasions-title" className="display text-3xl font-semibold md:text-4xl">
          A card for every celebration
        </h2>
        <p className="mt-2 max-w-xl text-ink-soft">Each one has its own look, its own music and its own falling confetti.</p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {OCCASION_LIST.map((o) => (
            <li key={o.id}>
              <Link
                href={`/create?occasion=${o.id}`}
                className="group flex h-full flex-col border-2 border-ink bg-[#fbf4e4] shadow-[5px_5px_0_var(--ink)] transition-transform duration-300 hover:-translate-x-0.5 hover:-translate-y-1"
              >
                <span className="grid place-items-center border-b-2 border-ink py-6" style={{ background: o.cover }}>
                  <OccasionArt occasion={o.id} className="h-28 w-28 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3" />
                </span>
                <span className="flex flex-1 flex-col p-5">
                  <span className="display text-2xl font-semibold">{o.label} card</span>
                  <span className="mt-1 flex-1 text-sm text-ink-soft">{o.blurb}</span>
                  <span className="mt-4 text-sm font-bold" style={{ color: o.accent }}>
                    Make one →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- how it works ---------- */}
      <section aria-labelledby="how-title" className="mx-auto max-w-6xl px-6 pb-28">
        <h2 id="how-title" className="display mb-10 text-3xl font-semibold md:text-4xl">
          How to send a card with Veloura
        </h2>
        <ol className="grid gap-10 md:grid-cols-3">
          {STEPS.map(([n, title, body]) => (
            <li key={n} className="border-t-2 border-ink pt-5">
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
