"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteCard, regenerateOtp, type OtpState } from "@/app/actions/cards";
import { OCCASIONS, type OccasionId } from "@/lib/occasions";
import { LoadingOverlay } from "./VelouraLoader";

export default function CardRow({
  id,
  recipient,
  birthday,
  link,
  occasion = "birthday",
}: {
  id: string;
  recipient: string;
  birthday: string;
  link: string;
  occasion?: OccasionId;
}) {
  const theme = OCCASIONS[occasion];
  const [otpState, otpAction, otpPending] = useActionState<OtpState, FormData>(regenerateOtp, undefined);

  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, startDeleteTransition] = useTransition();

  return (
    <li className="relative flex flex-col gap-4 border-2 border-ink bg-[#fbf4e4] p-5 shadow-[5px_5px_0_var(--ink)] sm:flex-row sm:items-center sm:justify-between">
      <LoadingOverlay
        show={otpPending || deletePending}
        label={deletePending ? "Deleting your card…" : "Making a new code…"}
      />
      <div>
        <h3 className="display text-2xl font-semibold">{recipient}</h3>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-ink-soft">
          <span
            className="rounded-full border-2 border-ink px-2 py-px text-[10px] font-extrabold uppercase tracking-wider text-[#fff8ec]"
            style={{ background: theme.accent }}
          >
            {theme.label}
          </span>
          <span>Opens {birthday}</span>
        </p>
        {otpState?.otp && (
          <p className="mt-2 text-sm">
            New code: <span className="display text-2xl font-semibold tracking-[0.2em] text-tomato">{otpState.otp}</span>{" "}
            <span className="text-ink-soft">(shown once)</span>
          </p>
        )}
        {otpState?.error && <p className="mt-2 text-sm font-bold text-tomato">{otpState.error}</p>}
        {deleteError && <p className="mt-2 text-sm font-bold text-tomato">{deleteError}</p>}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="btn btn-quiet !px-4 !py-2 text-sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(link);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            } catch {}
          }}
        >
          {copied ? "Copied" : "Copy link"}
        </button>

        <form action={otpAction}>
          <input type="hidden" name="id" value={id} />
          <button className="btn btn-quiet !px-4 !py-2 text-sm" disabled={otpPending || deletePending}>
            {otpPending ? "…" : "New code"}
          </button>
        </form>

        {/* Trigger Custom Confirmation Dialog */}
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="btn !px-4 !py-2 text-sm"
          disabled={deletePending}
        >
          {deletePending ? "Deleting…" : "Delete"}
        </button>
      </div>

      {/* Custom Retro Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="flex w-full max-w-md flex-col gap-4 border-2 border-ink bg-[#fbf4e4] p-6 shadow-[8px_8px_0_var(--ink)]">
            <h3 className="display text-2xl font-semibold">Delete Card</h3>
            <p className="text-sm text-ink-soft">
              Are you sure you want to delete <span className="font-semibold text-ink">{recipient}&apos;s</span> card and its photos for good?
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                setDeleteError(null);
                startDeleteTransition(async () => {
                  try {
                    await deleteCard(formData);
                    setShowConfirm(false);
                  } catch (err) {
                    setDeleteError(err instanceof Error && err.message ? err.message : "Failed to delete card");
                  }
                });
              }}
              className="mt-2 flex justify-end gap-3"
            >
              <input type="hidden" name="id" value={id} />
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="btn btn-quiet !px-4 !py-2 text-sm"
                disabled={deletePending}
              >
                Cancel
              </button>
              <button type="submit" className="btn flex items-center gap-2 !px-4 !py-2 text-sm" disabled={deletePending}>
                {deletePending ? "Deleting..." : "Yes, delete"}
              </button>
            </form>
          </div>
        </div>
      )}
    </li>
  );
}
