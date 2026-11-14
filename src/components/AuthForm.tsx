"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { login, signup, type AuthState } from "@/app/actions/auth";

export default function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? login : signup, undefined);
  const [show, setShow] = useState(false);
  const isLogin = mode === "login";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: -1 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: "spring", stiffness: 140, damping: 18 }}
      className="mx-auto w-full max-w-md rounded-sm border-2 border-ink bg-[#fbf4e4] p-8 shadow-[8px_8px_0_var(--ink)]"
    >
      <h1 className="display text-4xl font-semibold">{isLogin ? "Welcome back." : "Let's get you in."}</h1>
      <p className="mt-2 text-ink-soft">
        {isLogin ? "Log in to make or manage your cards." : "One account to make as many cards as you like."}
      </p>

      <form action={action} className="mt-8 space-y-6" noValidate>
        {next && <input type="hidden" name="next" value={next} />}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" autoComplete="email" required className="field" placeholder="you@example.com" />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={show ? "text" : "password"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
              minLength={isLogin ? undefined : 10}
              maxLength={72}
              className="field pr-16"
              placeholder={isLogin ? "Your password" : "10+ characters, mixed case + a number"}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wider text-ink-soft"
              aria-pressed={show}
            >
              {show ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        {state?.error && (
          <motion.p initial={{ x: -6 }} animate={{ x: [0, -6, 6, -3, 0] }} role="alert" className="text-sm font-bold text-tomato">
            {state.error}
          </motion.p>
        )}
        {state?.notice && <p role="status" className="text-sm font-bold text-teal">{state.notice}</p>}

        <button className="btn w-full" disabled={pending}>
          {pending ? "One moment…" : isLogin ? "Log in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-sm text-ink-soft">
        {isLogin ? "New here? " : "Already have an account? "}
        <Link href={isLogin ? "/signup" : "/login"} className="font-bold text-ink underline decoration-2 underline-offset-4">
          {isLogin ? "Create an account" : "Log in"}
        </Link>
      </p>
    </motion.div>
  );
}
