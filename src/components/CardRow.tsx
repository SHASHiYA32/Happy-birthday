"use client";

import { useActionState, useState } from "react";
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
  const [state, action, pending] = useActionState<OtpState, FormData>(regenerateOtp, undefined);
  const [copied, setCopied] = useState(false);

  return (
    <li className="flex flex-col gap-4 border-2 border-ink bg-[#fbf4e4] p-5 shadow-[5px_5px_0_var(--ink)] sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h3 className="display text-2xl font-semibold">{recipient}</h3>
        <p className="text-sm text-ink-soft">Opens {birthday}</p>
        {state?.otp && (
          <p className="mt-2 text-sm">
            New code: <span className="display text-2xl font-semibold tracking-[0.2em] text-tomato">{state.otp}</span>{" "}
            <span className="text-ink-soft">(shown once)</span>
          </p>
        )}
        {state?.error && <p className="mt-2 text-sm font-bold text-tomato">{state.error}</p>}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
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
        <form action={action}>
          <input type="hidden" name="id" value={id} />
          <button className="btn btn-quiet !px-4 !py-2 text-sm" disabled={pending}>
            {pending ? "…" : "New code"}
          </button>
        </form>
        <form
          action={deleteCard}
          onSubmit={(e) => {
            if (!confirm(`Delete ${recipient}'s card and its photos for good?`)) e.preventDefault();
          }}
        >
          <input type="hidden" name="id" value={id} />
          <button className="btn !px-4 !py-2 text-sm">Delete</button>
        </form>
      </div>
    </li>
  );
}
