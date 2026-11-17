"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { sileo } from "sileo";
import { deleteAccount, type AccountState } from "@/app/actions/account";
import { LoadingOverlay } from "./VelouraLoader";

export default function DangerZone({ cardCount }: { cardCount: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");

  const [state, action, pending] = useActionState<AccountState, FormData>(async (prev, fd) => {
    const result = await deleteAccount(prev, fd);
    if (result?.ok) {
      sileo.success({ title: "Account deleted", description: "Your cards, wishes and photos are gone." });
      router.replace("/");
      router.refresh();
    } else if (result?.error) {
      sileo.error({ title: "Couldn't delete account", description: result.error });
    }
    return result;
  }, undefined);

  return (
    <div>
      <LoadingOverlay show={pending} label="Deleting your account…" />

      <p className="text-ink-soft">
        Deleting your account permanently removes your login, {cardCount} {cardCount === 1 ? "card" : "cards"}, every
        wish and every uploaded photo. Links you already sent stop working. This cannot be undone.
      </p>
      <button type="button" onClick={() => setOpen(true)} className="btn mt-5">
        Delete my account
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="del-title"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md border-2 border-ink bg-[#fbf4e4] p-6 shadow-[8px_8px_0_var(--ink)]"
          >
            <h3 id="del-title" className="display text-2xl font-semibold">Delete your account?</h3>
            <p className="mt-2 text-sm text-ink-soft">
              Everything you made on Veloura will be erased for good. To confirm, type <strong className="text-ink">DELETE</strong> and
              enter your password.
            </p>

            <form action={action} className="mt-6 space-y-5" noValidate>
              <div>
                <label className="label" htmlFor="del-confirm">Type DELETE</label>
                <input
                  id="del-confirm"
                  name="confirm"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="off"
                  autoCapitalize="characters"
                  className="field"
                  placeholder="DELETE"
                />
              </div>
              <div>
                <label className="label" htmlFor="del-password">Password</label>
                <input id="del-password" name="password" type="password" autoComplete="current-password" maxLength={72} className="field" />
              </div>

              {state?.error && <p role="alert" className="text-sm font-bold text-tomato">{state.error}</p>}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setOpen(false)} disabled={pending} className="btn btn-quiet !px-5 !py-2 text-sm">
                  Keep my account
                </button>
                <button className="btn !px-5 !py-2 text-sm" disabled={pending || confirm !== "DELETE"}>
                  {pending ? "Deleting…" : "Delete everything"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
