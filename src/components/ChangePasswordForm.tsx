"use client";

import { useActionState, useRef, useState } from "react";
import { sileo } from "sileo";
import { changePassword, type AccountState } from "@/app/actions/account";
import PasswordStrength from "./PasswordStrength";
import { LoadingOverlay } from "./VelouraLoader";

export default function ChangePasswordForm() {
  const form = useRef<HTMLFormElement>(null);
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);

  const [state, action, pending] = useActionState<AccountState, FormData>(async (prev, fd) => {
    const result = await changePassword(prev, fd);
    if (result?.ok) {
      sileo.success({ title: "Password updated", description: "Other devices have been signed out." });
      setNext("");
      setConfirm("");
      form.current?.reset();
    } else if (result?.error) {
      sileo.error({ title: "Couldn't change password", description: result.error });
    }
    return result;
  }, undefined);

  const mismatch = confirm.length > 0 && confirm !== next;
  const type = show ? "text" : "password";

  return (
    <form ref={form} action={action} className="space-y-6" noValidate>
      <LoadingOverlay show={pending} label="Updating your password…" />

      <div>
        <label className="label" htmlFor="current">Current password</label>
        <input id="current" name="current" type={type} autoComplete="current-password" required maxLength={72} className="field" />
      </div>

      <div>
        <label className="label" htmlFor="next">New password</label>
        <input
          id="next"
          name="next"
          type={type}
          autoComplete="new-password"
          required
          minLength={10}
          maxLength={72}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          className="field"
        />
        <PasswordStrength password={next} />
      </div>

      <div>
        <label className="label" htmlFor="confirm">Repeat new password</label>
        <input
          id="confirm"
          name="confirm"
          type={type}
          autoComplete="new-password"
          required
          maxLength={72}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="field"
        />
        {mismatch && <p className="mt-2 text-xs font-bold text-tomato">The passwords don&apos;t match yet.</p>}
      </div>

      {state?.error && <p role="alert" className="text-sm font-bold text-tomato">{state.error}</p>}

      <div className="flex flex-wrap items-center gap-4">
        <button className="btn" disabled={pending || !next || mismatch}>
          {pending ? "Updating…" : "Update password"}
        </button>
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-pressed={show}
          className="text-xs font-bold uppercase tracking-wider text-ink-soft underline decoration-2 underline-offset-4"
        >
          {show ? "Hide passwords" : "Show passwords"}
        </button>
      </div>
    </form>
  );
}
