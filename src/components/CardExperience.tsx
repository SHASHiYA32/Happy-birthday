"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "motion/react";
import Confetti from "./ConfettiLazy";
import ProtectedImage from "./ProtectedImage";
import { createBirthdayPlayer, type BirthdayPlayer } from "@/lib/birthday-song";

gsap.registerPlugin(useGSAP);

export type ViewerSlide = { text: string; image: string | null };
type Phase = "cover" | "opening" | "show" | "end";

const PALETTE = [
  { bg: "#f3e9d6", fg: "#221b17" },
  { bg: "#e2492f", fg: "#fff8ec" },
  { bg: "#f3b232", fg: "#221b17" },
  { bg: "#1d5a55", fg: "#fff8ec" },
  { bg: "#f1b9ae", fg: "#221b17" },
];

const NARROW = "(max-width: 700px)";
const TAP_MS = 250; // a press shorter than this is a tap, longer is a hold-to-pause
const reduced = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** True on phone-sized screens; stays in sync if the phone is rotated. */
function useNarrow() {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(NARROW);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(NARROW).matches,
    () => false,
  );
}

function Cake() {
  return (
    <svg viewBox="0 0 200 200" className="w-[58%] sm:w-[62%]" aria-hidden>
      <ellipse cx="100" cy="176" rx="78" ry="9" fill="#221b17" opacity=".25" />
      <rect x="38" y="112" width="124" height="58" rx="6" fill="#fff8ec" stroke="#221b17" strokeWidth="4" />
      <path d="M38 126c12 14 22-6 34 8s22-8 34 6 22-8 34 6 14-4 22 2" fill="none" stroke="#f1b9ae" strokeWidth="9" strokeLinecap="round" />
      <rect x="58" y="76" width="84" height="40" rx="6" fill="#f3b232" stroke="#221b17" strokeWidth="4" />
      <path d="M58 90c10 12 18-5 28 6s18-8 28 4 18-6 28 2" fill="none" stroke="#fff8ec" strokeWidth="7" strokeLinecap="round" />
      {[78, 100, 122].map((x) => (
        <g key={x}>
          <rect x={x - 3} y="52" width="6" height="26" fill="#1d5a55" stroke="#221b17" strokeWidth="3" />
          <path d={`M${x} 28c9 9 8 18 0 21-8-3-9-12 0-21z`} fill="#fff8ec" stroke="#221b17" strokeWidth="3" />
        </g>
      ))}
    </svg>
  );
}

function SlideView({ slide, index, bitmap, fg }: { slide: ViewerSlide; index: number; bitmap?: ImageBitmap; fg: string }) {
  const root = useRef<HTMLDivElement>(null);
  const lines = slide.text.split("\n");
  const wordCount = slide.text.split(/\s+/).filter(Boolean).length;
  const long = slide.text.length > 220;
  const flip = index % 2 === 1;
  const tilt = ((index * 37) % 7) - 3; // deterministic -3..3deg

  // Sizes step down on small screens so a 500-character wish still fits.
  const size = slide.image
    ? long
      ? "text-xl sm:text-2xl md:text-4xl"
      : "text-3xl sm:text-4xl md:text-6xl"
    : long
      ? "text-2xl sm:text-3xl md:text-4xl"
      : "text-4xl sm:text-5xl md:text-7xl";

  useGSAP(
    () => {
      if (reduced()) return;
      const stagger = Math.min(0.07, 2.2 / Math.max(wordCount, 1));
      gsap.from("[data-w]", { opacity: 0, y: 26, rotate: 2, duration: 0.7, stagger, delay: 0.45, ease: "power3.out" });
      gsap.from("[data-photo]", { y: 90, rotate: tilt * 3, opacity: 0, duration: 1.1, ease: "power3.out" });
      gsap.fromTo("[data-kb]", { scale: 1 }, { scale: 1.09, duration: 16, ease: "none" });
    },
    { scope: root, dependencies: [bitmap ? 1 : 0] },
  );

  return (
    // Outer box scrolls if a very long wish still overflows; inner box centres short ones.
    <div ref={root} className="h-full touch-pan-y overflow-y-auto overscroll-contain">
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col items-center justify-center gap-5 px-5 pb-24 pt-16 md:grid md:grid-cols-2 md:gap-14 md:px-8 md:py-24">
        {slide.image && (
          <div data-photo className={`mx-auto ${flip ? "md:order-2" : ""}`} style={{ rotate: `${tilt}deg` }}>
            <div className="relative max-w-[calc(100vw-2.5rem)] bg-[#fffaf0] p-2 pb-9 shadow-[4px_6px_0_rgba(34,27,23,.35)] md:p-3 md:pb-12 md:shadow-[6px_8px_0_rgba(34,27,23,.35)]">
              <span className="absolute -top-2.5 left-1/2 h-5 w-20 -translate-x-1/2 rotate-[-3deg] bg-marigold/80 md:-top-3 md:h-6 md:w-24" />
              <div className="overflow-hidden [&_canvas]:max-h-[36dvh] md:[&_canvas]:max-h-[50dvh]">
                <div data-kb className="origin-center">
                  <ProtectedImage bitmap={bitmap} />
                </div>
              </div>
            </div>
          </div>
        )}

        <p
          className={`hand break-words leading-[1.15] ${size} ${slide.image ? "text-center md:text-left" : "mx-auto max-w-3xl text-center md:col-span-2"
            }`}
          style={{ color: fg }}
        >
          {lines.map((line, li) => (
            <span key={li}>
              {li > 0 && <br />}
              {line.split(/\s+/).filter(Boolean).map((w, wi) => (
                <span key={wi} data-w className="mr-[0.25em] inline-block">
                  {w}
                </span>
              ))}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}

export default function CardExperience({
  recipient,
  sender,
  slides,
}: {
  recipient: string;
  sender: string;
  slides: ViewerSlide[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const cover = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const tween = useRef<gsap.core.Tween | null>(null);
  const player = useRef<BirthdayPlayer | null>(null);
  const pausedRef = useRef(false);
  const press = useRef<{ t: number; x: number; y: number } | null>(null);

  const narrow = useNarrow();
  const [phase, setPhase] = useState<Phase>("cover");
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [burst, setBurst] = useState(0);
  const [bitmaps, setBitmaps] = useState<Record<number, ImageBitmap>>({});

  // Photos start loading while the closed card is on screen.
  useEffect(() => {
    let cancelled = false;
    const made: ImageBitmap[] = [];
    slides.forEach(async (s, idx) => {
      if (!s.image) return;
      try {
        const res = await fetch(s.image, { credentials: "same-origin", cache: "no-store" });
        if (!res.ok) return;
        const bmp = await createImageBitmap(await res.blob());
        if (cancelled) return bmp.close();
        made.push(bmp);
        setBitmaps((b) => ({ ...b, [idx]: bmp }));
      } catch {
        /* a missing photo just leaves the placeholder */
      }
    });
    return () => {
      cancelled = true;
      made.forEach((b) => b.close());
    };
  }, [slides]);

  useEffect(() => () => player.current?.stop(), []);

  // Closed card: gentle float.
  useGSAP(
    () => {
      if (phase !== "cover" || reduced()) return;
      gsap.to(card.current, { y: -12, rotate: 1.2, duration: 2.2, yoyo: true, repeat: -1, ease: "sine.inOut" });
      gsap.from("[data-cover-in]", { opacity: 0, y: 30, duration: 0.9, stagger: 0.12, ease: "power3.out" });
    },
    { scope: root, dependencies: [phase] },
  );

  // Opening sequence. On a wide screen the cover swings open and the two-page spread is centred.
  // A phone is too narrow for a spread, so the card stays put, the cover swings away and fades.
  useGSAP(
    () => {
      if (phase !== "opening") return;
      const done = () => {
        setPhase("show");
        setBurst((b) => b + 1);
      };
      if (reduced()) return void done();

      const onPhone = window.matchMedia(NARROW).matches;
      const tl = gsap.timeline({ onComplete: done });
      tl.to(card.current, { scale: 1.05, duration: 0.5, ease: "power2.out" })
        .to(cover.current, { rotateY: -172, duration: 1.8, ease: "power3.inOut" }, "<+0.1");
      if (onPhone) {
        tl.to(cover.current, { opacity: 0, duration: 0.5, ease: "power1.in" }, "-=0.6");
      } else {
        tl.to(card.current, { xPercent: 50, duration: 1.8, ease: "power3.inOut" }, "<");
      }
      tl.from("[data-inside]", { opacity: 0, y: 18, duration: 0.7, stagger: 0.18, ease: "power2.out" }, "-=0.9")
        .to({}, { duration: 1.2 })
        .to(stage.current, { scale: 1.7, opacity: 0, duration: 0.9, ease: "power2.in" });
    },
    { scope: root, dependencies: [phase] },
  );

  const slide = slides[i];
  const words = slide.text.split(/\s+/).filter(Boolean).length;
  const duration = Math.max(6, Math.min(16, 2.5 + words * 0.38 + (slide.image ? 1.5 : 0)));

  const finish = useCallback(() => {
    setPhase("end");
    setBurst((b) => b + 1);
  }, []);

  // Auto-advance: the active progress segment fills, then moves on.
  useEffect(() => {
    if (phase !== "show" || !progress.current) return;
    const t = gsap.fromTo(
      progress.current,
      { scaleX: 0 },
      {
        scaleX: 1,
        duration,
        ease: "none",
        onComplete: () => {
          if (i + 1 >= slides.length) finish();
          else setI(i + 1);
        },
      },
    );
    t.paused(pausedRef.current);
    tween.current = t;
    return () => {
      t.kill();
    };
  }, [phase, i, duration, slides.length, finish]);

  const setPause = useCallback((p: boolean) => {
    pausedRef.current = p;
    setPaused(p);
    tween.current?.paused(p);
  }, []);

  const go = useCallback(
    (delta: number) => {
      setI((n) => Math.min(slides.length - 1, Math.max(0, n + delta)));
    },
    [slides.length],
  );

  /** Next wish, or the ending after the last one. */
  const advance = useCallback(() => {
    if (i + 1 >= slides.length) finish();
    else setI(i + 1);
  }, [i, slides.length, finish]);

  useEffect(() => {
    if (phase !== "show") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") advance();
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === " ") {
        e.preventDefault();
        setPause(!pausedRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, advance, go, setPause]);

  // Touch behaviour, story-style: hold anywhere to pause, quick tap on the left edge goes back,
  // quick tap anywhere else goes forward. Buttons and scrolling are left alone.
  const onPressStart = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-controls]")) return;
    press.current = { t: Date.now(), x: e.clientX, y: e.clientY };
    setPause(true);
  };
  const onPressEnd = (e: React.PointerEvent) => {
    const p = press.current;
    if (!p) return;
    press.current = null;
    setPause(false);
    const quick = Date.now() - p.t < TAP_MS && Math.hypot(e.clientX - p.x, e.clientY - p.y) < 12;
    if (!quick) return;
    if (e.clientX < window.innerWidth * 0.3) go(-1);
    else advance();
  };
  const onPressCancel = () => {
    if (!press.current) return;
    press.current = null;
    setPause(false);
  };

  function begin() {
    if (phase !== "cover") return;
    try {
      player.current = createBirthdayPlayer();
      player.current.start();
    } catch {
      /* no audio support: the card still plays */
    }
    setPhase("opening");
  }

  function toggleMute() {
    const next = !muted;
    setMuted(next);
    player.current?.setMuted(next);
  }

  const colors = PALETTE[i % PALETTE.length];
  const showing = phase === "show" || phase === "end";
  const ctl =
    "grid h-11 min-w-11 place-items-center rounded-full border-2 px-3 text-base leading-none transition-transform active:scale-95 disabled:opacity-30";

  return (
    <div
      ref={root}
      className="no-save fixed inset-x-0 top-0 h-dvh select-none overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      <motion.div
        className="absolute inset-0"
        animate={{ backgroundColor: phase === "end" ? "#e2492f" : showing ? colors.bg : "#f3e9d6" }}
        transition={{ duration: 0.8 }}
      />
      <Confetti
        className="pointer-events-none absolute inset-0"
        count={showing ? (narrow ? 70 : 130) : narrow ? 30 : 45}
        burstKey={burst}
      />

      {/* ---------- cover + opening ---------- */}
      {!showing && (
        <div ref={stage} className="absolute inset-0 flex flex-col items-center justify-center px-6" style={{ perspective: 1800 }}>
          <div
            ref={card}
            className="relative aspect-[3/4] w-[min(78vw,360px,46dvh)]"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* inside, right page */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 border-2 border-ink bg-[#fbf4e4] p-4 text-center shadow-[6px_6px_0_var(--ink)] sm:gap-3 sm:p-6 sm:shadow-[8px_8px_0_var(--ink)]">
              <p data-inside className="display text-xl italic sm:text-2xl">Happy birthday,</p>
              <p data-inside className="hand max-w-full break-words text-[clamp(2.5rem,13vw,3.75rem)] leading-none text-tomato">
                {recipient}
              </p>
              <p data-inside className="text-xs font-bold uppercase tracking-[0.16em] text-ink-soft sm:text-sm sm:tracking-[0.18em]">
                with love, {sender}
              </p>
            </div>

            {/* cover, hinged on the left */}
            <div
              ref={cover}
              className="absolute inset-0 origin-left"
              style={{ transformStyle: "preserve-3d", transform: "translateZ(1px)" }}
            >
              <button
                onClick={begin}
                disabled={phase !== "cover"}
                aria-label="Open your birthday card"
                className="absolute inset-0 flex flex-col items-center justify-center gap-3 border-2 border-ink bg-tomato p-4 shadow-[6px_6px_0_var(--ink)] sm:gap-4 sm:p-6 sm:shadow-[8px_8px_0_var(--ink)]"
                style={{ backfaceVisibility: "hidden", touchAction: "manipulation" }}
              >
                <p data-cover-in className="hand max-w-full break-words text-[clamp(1.75rem,8vw,2.25rem)] leading-none text-[#fff8ec]">
                  For {recipient}
                </p>
                <div data-cover-in className="flex w-full justify-center"><Cake /></div>
                <p data-cover-in className="display text-2xl font-semibold italic text-[#fff8ec] sm:text-3xl">Happy Birthday</p>
              </button>
              {/* inside of the cover (left page) */}
              <div
                className="absolute inset-0 flex items-center justify-center border-2 border-ink bg-[#f3e2bd] p-6"
                style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              >
                <p className="hand text-4xl text-ink-soft sm:text-5xl">make a wish</p>
              </div>
            </div>
          </div>

          {phase === "cover" && (
            <motion.p
              data-cover-in
              animate={{ opacity: [0.45, 1, 0.45] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="mt-8 text-center text-xs font-bold uppercase tracking-[0.2em] sm:mt-12 sm:text-sm sm:tracking-[0.24em]"
            >
              Tap the card to open
              <br className="sm:hidden" />
              <span className="sm:before:content-['_·_']">sound on</span>
            </motion.p>
          )}
        </div>
      )}

      {/* ---------- slideshow ---------- */}
      {phase === "show" && (
        <div
          className="absolute inset-0"
          style={{ color: colors.fg }}
          onPointerDown={onPressStart}
          onPointerUp={onPressEnd}
          onPointerCancel={onPressCancel}
          onPointerLeave={onPressCancel}
        >
          <div className="absolute inset-x-0 top-0 z-10 flex gap-1 px-4 pt-[max(1rem,env(safe-area-inset-top))] sm:gap-1.5 sm:px-5 sm:pt-5">
            {slides.map((_, j) => (
              <div key={j} className="h-1 flex-1 overflow-hidden rounded-full" style={{ background: `${colors.fg}33` }}>
                <div
                  ref={j === i ? progress : undefined}
                  className="h-full origin-left rounded-full"
                  style={{ background: colors.fg, transform: j < i ? "scaleX(1)" : "scaleX(0)" }}
                />
              </div>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              className="absolute inset-0"
              initial={{ opacity: 0, y: 70 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -70 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <SlideView slide={slide} index={i} bitmap={bitmaps[i]} fg={colors.fg} />
            </motion.div>
          </AnimatePresence>

          <div
            data-controls
            className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-sm font-bold sm:px-6 sm:pb-6"
          >
            <span className="tabular-nums">{i + 1} / {slides.length}</span>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button onClick={() => go(-1)} disabled={i === 0} className={ctl} style={{ borderColor: colors.fg }} aria-label="Previous wish">‹</button>
              <button onClick={() => setPause(!paused)} className={ctl} style={{ borderColor: colors.fg }} aria-label={paused ? "Play" : "Pause"}>
                {paused ? "▶" : "❚❚"}
              </button>
              <button onClick={advance} className={ctl} style={{ borderColor: colors.fg }} aria-label={i === slides.length - 1 ? "Finish" : "Next wish"}>›</button>
              <button onClick={toggleMute} className={ctl} style={{ borderColor: colors.fg }} aria-label={muted ? "Turn sound on" : "Turn sound off"}>
                {muted ? "🔇" : "🔊"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- ending ---------- */}
      {phase === "end" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-6 text-center text-[#fff8ec] sm:gap-6 sm:px-8">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="hand text-3xl sm:text-4xl">
            with all the love,
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, scale: 0.8, rotate: -4 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 120, damping: 12, delay: 0.5 }}
            className="display max-w-full break-words text-[clamp(3rem,16vw,9rem)] font-semibold italic leading-none"
          >
            {sender}
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-4 flex w-full max-w-xs flex-col items-stretch gap-4 sm:mt-6 sm:w-auto sm:max-w-none sm:flex-row sm:justify-center"
          >
            <button
              className="btn !bg-[#fff8ec] !text-ink"
              onClick={() => {
                setI(0);
                setPhase("show");
              }}
            >
              Watch again
            </button>
            <Link href="/" className="btn btn-quiet !border-[#fff8ec] !text-[#fff8ec] !shadow-[4px_4px_0_#221b17]">
              Make one for someone
            </Link>
          </motion.div>
          <button
            onClick={toggleMute}
            aria-label={muted ? "Turn sound on" : "Turn sound off"}
            className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 grid h-11 min-w-11 place-items-center rounded-full border-2 border-[#fff8ec] px-3 text-base sm:bottom-6 sm:right-6"
          >
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
      )}
    </div>
  );
}