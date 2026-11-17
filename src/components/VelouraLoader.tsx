"use client";

import { AnimatePresence, motion } from "motion/react";

const LETTERS = "Veloura".split("");
const STRIPES = ["#e2492f", "#f3b232", "#1d5a55", "#f1b9ae"];

/** The Veloura loading mark: a card that keeps opening, the wordmark bouncing, a stamp-colour bar. */
export function VelouraLoader({ label = "Loading…", compact = false }: { label?: string; compact?: boolean }) {
  return (
    <div role="status" aria-live="polite" className="flex flex-col items-center gap-5">
      <span className="sr-only">{label}</span>

      <div className="relative h-[68px] w-[52px]" style={{ perspective: 500 }} aria-hidden>
        <div className="absolute inset-0 flex items-center justify-center border-2 border-ink bg-[#fbf4e4] shadow-[3px_3px_0_var(--ink)]">
          <motion.span
            className="block h-3 w-3 rotate-45 bg-marigold"
            animate={{ scale: [0.6, 1.15, 0.6], rotate: [45, 90, 45] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
        <motion.div
          className="absolute inset-0 origin-left border-2 border-ink bg-tomato"
          animate={{ rotateY: [0, -158, -158, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, times: [0, 0.4, 0.62, 1], ease: "easeInOut" }}
        />
      </div>

      <div className={`display flex font-semibold italic ${compact ? "text-3xl" : "text-5xl"}`} aria-hidden>
        {LETTERS.map((l, i) => (
          <motion.span
            key={i}
            className="inline-block"
            animate={{ y: [0, -10, 0], color: ["#221b17", "#e2492f", "#221b17"] }}
            transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.09, ease: "easeInOut" }}
          >
            {l}
          </motion.span>
        ))}
      </div>

      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-ink/10" aria-hidden>
        <motion.div
          className="flex h-full w-1/2"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {STRIPES.map((c) => (
            <span key={c} className="h-full flex-1" style={{ background: c }} />
          ))}
        </motion.div>
      </div>

      <p className="text-xs font-bold uppercase tracking-[0.22em] text-ink-soft" aria-hidden>
        {label}
      </p>
    </div>
  );
}

/** Full-screen veil that fades in after a beat, so very quick actions never flash it. */
export function LoadingOverlay({ show, label = "Just a moment…" }: { show: boolean; label?: string }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="veloura-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.15, duration: 0.25 } }}
          exit={{ opacity: 0, transition: { duration: 0.2 } }}
          className="fixed inset-0 z-[95] grid cursor-wait place-items-center bg-paper/90 backdrop-blur-[3px]"
        >
          <VelouraLoader label={label} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
