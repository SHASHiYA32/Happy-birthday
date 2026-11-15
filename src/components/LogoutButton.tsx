"use client";

import { useState, useTransition } from "react";
import { logout } from "@/app/actions/auth";

export default function LogoutButton() {
    const [showConfirm, setShowConfirm] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleLogout = () => {
        startTransition(async () => {
            await logout();
        });
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                disabled={isPending}
                className="text-[#1c1917] hover:underline decoration-2 underline-offset-4 disabled:opacity-50"
            >
                {isPending ? "Logging out..." : "Log out"}
            </button>

            {/* Confirmation Dialog matching Wish Spark theme */}
            {showConfirm && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-[#1c1917]/40 backdrop-blur-[2px] p-4"
                    onClick={() => !isPending && setShowConfirm(false)}
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-sm bg-[#ebe3d7] p-6 border-2 border-[#1c1917] shadow-[4px_4px_0px_#1c1917] text-[#1c1917]"
                    >
                        <h3 className="font-serif text-2xl font-bold tracking-tight">
                            Log out confirmation
                        </h3>
                        <p className="mt-2 text-sm text-[#57534e]">
                            Are you sure you want to log out of your account?
                        </p>

                        {/* Responsive button container: stacks vertically on mobile, row on desktop */}
                        <div className="mt-6 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                disabled={isPending}
                                className="rounded-full border-2 border-[#1c1917] bg-transparent px-5 py-2.5 sm:py-2 text-sm font-semibold text-[#1c1917] hover:bg-[#1c1917]/5 transition-colors disabled:opacity-50 text-center"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleLogout}
                                disabled={isPending}
                                className="inline-flex items-center justify-center rounded-full border-2 border-[#1c1917] bg-[#d63e22] px-5 py-2.5 sm:py-2 text-sm font-semibold text-white shadow-[2px_2px_0px_#1c1917] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_#1c1917] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 text-center"
                            >
                                {isPending ? (
                                    <>
                                        <svg
                                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            ></path>
                                        </svg>
                                        Logging out...
                                    </>
                                ) : (
                                    "Log out"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}