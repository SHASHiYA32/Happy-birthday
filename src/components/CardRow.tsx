"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteCard, regenerateOtp, type OtpState } from "@/app/actions/cards";

export default function CardRow({
  id,
  recipient,
  birthday,
  link,
}: {
  id: string;
  recipient: string;
  birthday: string;
  link: string;
}) {
  const [otpState, otpAction, otpPending] = useActionState<OtpState, FormData>(regenerateOtp, undefined);
  
  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deletePending, startDeleteTransition] = useTransition();

  return (
    <li className="flex flex-col gap-4 border-2 border-ink bg-[#fbf4e4] p-5 shadow-[5px_5px_0_var(--ink)] sm:flex-row sm:items-center sm:justify-between relative">
      <div>
        <h3 className="display text-2xl font-semibold">{recipient}</h3>
        <p className="text-sm text-ink-soft">Opens {birthday}</p>
        {otpState?.otp && (
          <p className="mt-2 text-sm">
            New code: <span className="display text-2xl font-semibold tracking-[0.2em] text-tomato">{otpState.otp}</span>{" "}
            <span className="text-ink-soft">(shown once)</span>
          </p>
        )}
        {otpState?.error && <p className="mt-2 text-sm font-bold text-tomato">{otpState.error}</p>}
        {deleteError && <p className="mt-2 text-sm font-bold text-tomato">{deleteError}</p>}
      </div>

      <div className="flex flex-wrap gap-3 items-center">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md border-2 border-ink bg-[#fbf4e4] p-6 shadow-[8px_8px_0_var(--ink)] flex flex-col gap-4">
            <h3 className="display text-2xl font-semibold">Delete Card</h3>
            <p className="text-sm text-ink-soft">
              Are you sure you want to delete <span className="font-semibold text-ink">{recipient}'s</span> card and its photos for good?
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
                  } catch (err: any) {
                    setDeleteError(err?.message || "Failed to delete card");
                  }
                });
              }}
              className="flex justify-end gap-3 mt-2"
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
              <button
                type="submit"
                className="btn !px-4 !py-2 text-sm bg-tomato text-white flex items-center gap-2"
                disabled={deletePending}
              >
                {deletePending ? (
                  <>
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Deleting...
                  </>
                ) : (
                  "Yes, delete"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </li>
  );
}