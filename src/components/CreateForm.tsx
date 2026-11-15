"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { createCard, type CreateState } from "@/app/actions/cards";
import { compressImage } from "@/lib/compress-image";

type Slide = { id: number; text: string; file: File | null; preview: string | null };

const MAX = 8;
let nextId = 1;
const blank = (): Slide => ({ id: nextId++, text: "", file: null, preview: null });

function CopyButton({ value, label }: { value: string; label: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="btn btn-quiet !px-4 !py-2 text-sm"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 1600);
        } catch { }
      }}
    >
      {done ? "Copied" : label}
    </button>
  );
}

function ShareButtons({
  recipient,
  link,
  coverFile,
}: {
  recipient: string;
  link: string;
  coverFile: File | null;
}) {
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    setCanNativeShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  const beautifulMessage = [
    `Hi ${recipient},`,
    ``,
    `I put together a special birthday card just for you, filled with memories and wishes waiting to be opened.`,
    ``,
    `Open your card here:`,
    `${link}`,
  ].join("\n");

  const shortTeaser = `Hi ${recipient}, I put together a special birthday card just for you, filled with memories and wishes waiting to be opened.`;

  const encodedFullText = encodeURIComponent(beautifulMessage);
  const encodedTeaser = encodeURIComponent(shortTeaser);
  const encodedUrl = encodeURIComponent(link);

  async function handleNativeShare() {
    if (!navigator.share) return;
    try {
      const shareData: ShareData = {
        title: `A birthday card for ${recipient}`,
        text: beautifulMessage,
        url: link,
      };
      if (coverFile && navigator.canShare?.({ files: [coverFile] })) {
        shareData.files = [coverFile];
      }
      await navigator.share(shareData);
    } catch {
      // User dismissed share sheet
    }
  }

  return (
    <div className="space-y-3">
      <span className="label">Send the invitation</span>
      <div className="flex flex-wrap gap-2.5">
        <a
          href={`https://wa.me/?text=${encodedFullText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full border-2 border-ink bg-[#25D366] px-4 py-2 text-sm font-bold text-ink shadow-[3px_3px_0_var(--ink)] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          WhatsApp
        </a>

        <a
          href={`https://t.me/share/url?url=${encodedUrl}&text=${encodedTeaser}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full border-2 border-ink bg-[#26A5E4] px-4 py-2 text-sm font-bold text-white shadow-[3px_3px_0_var(--ink)] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          Telegram
        </a>

        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}"e=${encodedTeaser}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full border-2 border-ink bg-[#1877F2] px-4 py-2 text-sm font-bold text-white shadow-[3px_3px_0_var(--ink)] transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
        >
          Facebook
        </a>

        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="btn btn-quiet !px-4 !py-2 text-sm"
          >
            More apps
          </button>
        )}
      </div>
    </div>
  );
}

export default function CreateForm({ defaultSender }: { defaultSender: string }) {
  const [state, action, pending] = useActionState<CreateState, FormData>(createCard, {});
  const [, startTransition] = useTransition();
  const [slides, setSlides] = useState<Slide[]>(() => [blank()]);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => () => slides.forEach((s) => s.preview && URL.revokeObjectURL(s.preview)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const update = (id: number, patch: Partial<Slide>) =>
    setSlides((all) => all.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  async function pick(id: number, file: File | undefined) {
    if (!file) return;
    setLocalError(null);
    try {
      const small = await compressImage(file);
      const old = slides.find((s) => s.id === id)?.preview;
      if (old) URL.revokeObjectURL(old);
      update(id, { file: small, preview: URL.createObjectURL(small) });
    } catch {
      setLocalError("That file couldn't be read as a photo. Try a JPG, PNG or WebP.");
    }
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setLocalError(null);
    const base = new FormData(e.currentTarget);
    const fd = new FormData();
    for (const k of ["recipient", "sender", "birthday"]) fd.set(k, String(base.get(k) ?? ""));
    fd.set("count", String(slides.length));
    slides.forEach((s, i) => {
      fd.set(`text_${i}`, s.text);
      if (s.file) fd.set(`image_${i}`, s.file);
    });
    startTransition(() => {
      action(fd);
      setBusy(false);
    });
  }

  if (state?.ok) {
    const firstUploadedPhoto = slides.find((s) => s.file !== null)?.file ?? null;
    const message = [
      `Hi ${state.recipient},`,
      ``,
      `I put together a special birthday card just for you, filled with memories and wishes waiting to be opened.`,
      ``,
      `Open your card here: ${state.link}`,
      `Use this one-time code to unlock it: ${state.otp}`,
    ].join("\n");

    const codeOnlyMessage = `Here is the one-time code to unlock your birthday card: ${state.otp}`;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.94, rotate: -1.5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 160, damping: 16 }}
        className="mx-auto max-w-xl rounded-sm border-2 border-ink bg-[#fbf4e4] p-8 shadow-[8px_8px_0_var(--ink)]"
      >
        <p className="hand text-3xl text-tomato">Sealed.</p>
        <h2 className="display mt-1 text-4xl font-semibold">{state.recipient}'s card is ready.</h2>

        <div className="mt-8 space-y-6">
          <div>
            <span className="label">Private link</span>
            <p className="mt-1 break-all font-bold">{state.link}</p>
            <div className="mt-2">
              <CopyButton value={state.link} label="Copy link" />
            </div>
          </div>

          <div className="border-y-2 border-dashed border-ink/20 py-5">
            <ShareButtons
              recipient={state.recipient}
              link={state.link}
              coverFile={firstUploadedPhoto}
            />
          </div>

          <div>
            <span className="label">One-time code</span>
            <p className="display mt-1 text-6xl font-semibold tracking-[0.2em] text-tomato">{state.otp}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <CopyButton value={state.otp} label="Copy code" />
              <a
                href={`https://wa.me/?text=${encodeURIComponent(codeOnlyMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-quiet !px-4 !py-2 text-sm"
              >
                Send code on WhatsApp
              </a>
            </div>
            <p className="mt-3 text-sm text-ink-soft">
              This is the only time the code is shown. Send it in a different message from the link. If you lose
              it, make a new one from My cards.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-4">
          <CopyButton value={message} label="Copy a message to send" />
          <Link href="/dashboard" className="btn !px-5 !py-2 text-sm">My cards</Link>
        </div>
      </motion.div>
    );
  }

  const error = localError ?? state?.error;

  return (
    <form ref={formRef} onSubmit={onSubmit} className="mx-auto max-w-3xl space-y-12">
      <section className="grid gap-8 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="recipient">Who is it for?</label>
          <input id="recipient" name="recipient" required maxLength={60} className="field" placeholder="Nimali" />
        </div>
        <div>
          <label className="label" htmlFor="sender">From</label>
          <input id="sender" name="sender" required maxLength={60} defaultValue={defaultSender} className="field" placeholder="Your name" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="birthday">Their birthday</label>
          <input id="birthday" name="birthday" type="date" required className="field max-w-xs" />
          <p className="mt-2 text-sm text-ink-soft">The card stays shut until this day, then opens with the code.</p>
        </div>
      </section>

      <section className="space-y-8">
        <h2 className="display text-3xl font-semibold">The wishes</h2>
        <AnimatePresence initial={false}>
          {slides.map((s, i) => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, y: 30, rotate: i % 2 ? 0.8 : -0.8 }}
              animate={{ opacity: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ type: "spring", stiffness: 170, damping: 20 }}
              className="grid gap-5 border-2 border-ink bg-[#fbf4e4] p-5 shadow-[5px_5px_0_var(--ink)] sm:grid-cols-[180px_1fr]"
            >
              <label className="group relative flex aspect-[4/5] cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed border-ink-soft bg-paper text-center text-sm font-bold text-ink-soft">
                {s.preview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <span className="px-3">+ Add a photo<br /><span className="font-normal">(optional)</span></span>
                )}
                <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => pick(s.id, e.target.files?.[0])} />
              </label>

              <div>
                <div className="flex items-center justify-between">
                  <span className="hand text-2xl text-tomato">Wish {i + 1}</span>
                  {slides.length > 1 && (
                    <button
                      type="button"
                      className="text-xs font-bold uppercase tracking-wider text-ink-soft hover:text-tomato"
                      onClick={() => {
                        if (s.preview) URL.revokeObjectURL(s.preview);
                        setSlides((all) => all.filter((x) => x.id !== s.id));
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <textarea
                  required
                  maxLength={500}
                  rows={5}
                  value={s.text}
                  onChange={(e) => update(s.id, { text: e.target.value })}
                  className="hand mt-2 w-full resize-none border-0 border-b-2 border-ink bg-transparent text-2xl leading-snug outline-none focus:border-tomato"
                  placeholder="Write it the way you'd say it…"
                />
                <div className="text-right text-xs text-ink-soft">{s.text.length}/500</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {slides.length < MAX && (
          <button type="button" className="btn btn-quiet" onClick={() => setSlides((a) => [...a, blank()])}>
            + Another wish ({slides.length}/{MAX})
          </button>
        )}
      </section>

      {error && <p role="alert" className="font-bold text-tomato">{error}</p>}

      <button className="btn text-lg" disabled={pending || busy}>
        {pending || busy ? "Sealing the card…" : "Seal the card"}
      </button>
    </form>
  );
}