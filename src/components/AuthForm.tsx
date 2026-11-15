"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { login, signup, type AuthState } from "@/app/actions/auth";

export default function AuthForm({ mode, next }: { mode: "login" | "signup"; next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(mode === "login" ? login : signup, undefined);
  const [show, setShow] = useState(false);
  const [password, setPassword] = useState("");
  const isLogin = mode === "login";

  // Password validation rules (matches your minLength={10} + mixed case + number + symbol)
  const rules = [
    { label: "At least 10 characters", met: password.length >= 10 },
    { label: "One uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { label: "One number (0-9)", met: /[0-9]/.test(password) },
    { label: "One special character (!@#$...)", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = rules.filter((r) => r.met).length;

  // Determine strength bar color, width, and label
  const getStrengthMeta = () => {
    if (password.length === 0) return { label: "", color: "bg-transparent", text: "text-ink-soft", width: "0%" };
    if (metCount <= 2) return { label: "Weak", color: "bg-tomato", text: "text-tomato", width: "33%" };
    if (metCount <= 4) return { label: "Getting there", color: "bg-amber-400", text: "text-amber-700", width: "66%" };
    return { label: "Strong", color: "bg-teal", text: "text-teal", width: "100%" };
  };

  const strength = getStrengthMeta();

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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {/* Signup-only Password Strength Bar & Checklist */}
          {!isLogin && (
            <div className="mt-4 space-y-3">
              {/* Progress Bar */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                  <span className="text-ink-soft">Password Strength</span>
                  <span className={strength.text}>{strength.label}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-sm border-2 border-ink bg-[#f2e6cf]">
                  <motion.div
                    className={`h-full ${strength.color}`}
                    initial={{ width: "0%" }}
                    animate={{ width: strength.width }}
                    transition={{ type: "spring", stiffness: 260, damping: 24 }}
                  />
                </div>
              </div>

              {/* Bullet Point Checklist (Crosses out when achieved) */}
              <ul className="space-y-1.5 pt-1 text-xs">
                {rules.map((rule) => (
                  <li
                    key={rule.label}
                    className={`flex items-center gap-2 transition-colors duration-200 ${
                      rule.met ? "font-semibold text-teal" : "text-ink-soft"
                    }`}
                  >
                    <span
                      className={`inline-block h-2 w-2 rounded-full border border-ink transition-colors ${
                        rule.met ? "bg-teal" : "bg-transparent"
                      }`}
                    />
                    <span className={rule.met ? "line-through decoration-2 opacity-75" : ""}>
                      {rule.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
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