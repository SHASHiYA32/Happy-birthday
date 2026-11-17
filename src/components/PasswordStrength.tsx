"use client";

import { motion } from "motion/react";

/** Strength bar and checklist shown under a "new password" field. */
export default function PasswordStrength({ password }: { password: string }) {
  const rules = [
    { label: "At least 10 characters", met: password.length >= 10 },
    { label: "One uppercase letter (A-Z)", met: /[A-Z]/.test(password) },
    { label: "One lowercase letter (a-z)", met: /[a-z]/.test(password) },
    { label: "One number (0-9)", met: /[0-9]/.test(password) },
    { label: "One special character (!@#$...)", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = rules.filter((r) => r.met).length;

  const strength =
    password.length === 0
      ? { label: "", color: "bg-transparent", text: "text-ink-soft", width: "0%" }
      : metCount <= 2
        ? { label: "Weak", color: "bg-tomato", text: "text-tomato", width: "33%" }
        : metCount <= 4
          ? { label: "Getting there", color: "bg-amber-400", text: "text-amber-700", width: "66%" }
          : { label: "Strong", color: "bg-teal", text: "text-teal", width: "100%" };

  return (
    <div className="mt-4 space-y-3">
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
            <span className={rule.met ? "line-through decoration-2 opacity-75" : ""}>{rule.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
