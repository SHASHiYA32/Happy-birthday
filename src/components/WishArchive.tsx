"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { OCCASIONS, type OccasionId } from "@/lib/occasions";

export type ArchiveSlide = { position: number; text: string; hasImage: boolean };
export type ArchiveCard = {
  id: string;
  recipient: string;
  occasion: OccasionId;
  date: string;
  createdAt: string;
  slides: ArchiveSlide[];
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default function WishArchive({ cards }: { cards: ArchiveCard[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (cards.length === 0) {
    return <p className="text-ink-soft">You haven&apos;t sealed any cards yet. Your wishes and photos will show up here.</p>;
  }

  return (
    <ul className="space-y-4">
      {cards.map((card) => {
        const theme = OCCASIONS[card.occasion];
        const open = openId === card.id;
        const photos = card.slides.filter((s) => s.hasImage).length;
        return (
          <li key={card.id} className="border-2 border-ink bg-paper">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : card.id)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 p-4 text-left"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 border-ink text-xs font-extrabold text-[#fff8ec]"
                  style={{ background: theme.accent }}
                  aria-hidden
                >
                  {theme.label[0]}
                </span>
                <span className="min-w-0">
                  <span className="display block truncate text-xl font-semibold">{card.recipient}</span>
                  <span className="block text-xs text-ink-soft">
                    {theme.label} · {card.slides.length} {card.slides.length === 1 ? "wish" : "wishes"}
                    {photos > 0 && ` · ${photos} ${photos === 1 ? "photo" : "photos"}`} · sealed {fmt(card.createdAt)}
                  </span>
                </span>
              </span>
              <motion.span animate={{ rotate: open ? 180 : 0 }} className="shrink-0 text-lg" aria-hidden>
                ▾
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <ol className="space-y-5 border-t-2 border-dashed border-ink/25 p-4">
                    {card.slides.map((s) => (
                      <li key={s.position} className="grid gap-4 sm:grid-cols-[140px_1fr]">
                        {s.hasImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={`/api/me/image/${card.id}/${s.position}`}
                            alt={`Photo for wish ${s.position + 1}`}
                            loading="lazy"
                            className="aspect-[4/5] w-full max-w-[160px] border-2 border-ink bg-paper-deep object-cover"
                          />
                        ) : (
                          <div className="hidden aspect-[4/5] w-full max-w-[160px] items-center justify-center border-2 border-dashed border-ink/30 text-xs text-ink-soft sm:flex">
                            No photo
                          </div>
                        )}
                        <div>
                          <span className="hand text-2xl" style={{ color: theme.accent }}>Wish {s.position + 1}</span>
                          <p className="hand mt-1 whitespace-pre-wrap break-words text-2xl leading-snug">{s.text}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
