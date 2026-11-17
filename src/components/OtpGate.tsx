"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { openCard, type OtpGateState } from "@/app/actions/viewer";
import { OCCASIONS, type OccasionId } from "@/lib/occasions";
import OccasionArt from "./OccasionArt";
import { LoadingOverlay } from "./VelouraLoader";

export default function OtpGate({ slug, occasion = "birthday" }: { slug: string; occasion?: OccasionId }) {
  const theme = OCCASIONS[occasion];
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const form = useRef<HTMLFormElement>(null);
  const code = digits.join("");

  const [state, action, pending] = useActionState<OtpGateState, FormData>(async (prev, fd) => {
    const result = await openCard(prev, fd);
    if (result?.error) {
      // Wrong code: clear the boxes and put the cursor back at the start.
      setDigits(Array(6).fill(""));
      boxes.current[0]?.focus();
    }
    return result;
  }, undefined);

  useEffect(() => {
    if (code.length === 6 && !pending) form.current?.requestSubmit();
  }, [code, pending]);

  function setAt(i: number, value: string) {
    const clean = value.replace(/\D/g, "");
    if (!clean) {
      setDigits((d) => d.map((x, j) => (j === i ? "" : x)));
      return;
    }
    // Handles typing and pasting the whole code.
    setDigits((d) => {
      const next = [...d];
      clean.split("").forEach((ch, k) => {
        if (i + k < 6) next[i + k] = ch;
      });
      return next;
    });
    boxes.current[Math.min(i + clean.length, 5)]?.focus();
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-6 py-12">
      <LoadingOverlay show={pending} label="Opening your card…" />
      <motion.div
        initial={{ opacity: 0, y: 30, rotate: -2 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 130, damping: 16 }}
        className="w-full max-w-md border-2 border-ink bg-[#fbf4e4] p-8 text-center shadow-[8px_8px_0_var(--ink)]"
      >
        <div
          className="mx-auto mb-4 grid h-20 w-20 place-items-center rounded-full border-2 border-ink"
          style={{ background: theme.cover }}
        >
          <OccasionArt occasion={occasion} className="h-14 w-14" />
        </div>
        <p className="hand text-3xl" style={{ color: theme.accent }}>{theme.gateScript}</p>
        <h1 className="display mt-1 text-4xl font-semibold leading-tight">Someone made you a {theme.noun}.</h1>
        <p className="mt-3 text-ink-soft">Type the six-digit code they sent you.</p>

        <form ref={form} action={action} className="mt-8">
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="otp" value={code} />
          <motion.div
            key={state?.error ?? "ok"}
            animate={state?.error ? { x: [0, -10, 10, -6, 6, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="flex justify-center gap-2"
          >
            {digits.map((d, i) => (
              <input
                key={i}
                ref={(el) => {
                  boxes.current[i] = el;
                }}
                value={d}
                onChange={(e) => setAt(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !digits[i] && i > 0) boxes.current[i - 1]?.focus();
                }}
                inputMode="numeric"
                autoComplete={i === 0 ? "one-time-code" : "off"}
                autoFocus={i === 0}
                aria-label={`Digit ${i + 1}`}
                className="display h-14 w-11 border-2 border-ink bg-paper text-center text-3xl font-semibold outline-none focus:border-tomato focus:shadow-[0_3px_0_var(--tomato)] sm:h-16 sm:w-12"
              />
            ))}
          </motion.div>

          {state?.error && (
            <p role="alert" className="mt-5 text-sm font-bold text-tomato">
              {state.error}
            </p>
          )}

          <button className="btn mt-8 w-full" disabled={pending || code.length < 6}>
            {pending ? "Checking…" : "Open my card"}
          </button>
        </form>
      </motion.div>
    </main>
  );
}
