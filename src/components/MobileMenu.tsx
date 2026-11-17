"use client";

import { useState } from "react";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

interface MobileMenuProps {
    user: any;
}

export default function MobileMenu({ user }: MobileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);

    const closeMenu = () => setIsOpen(false);

    return (
        <div className="md:hidden">
            {/* Neo-brutalist Pill Hamburger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle Menu"
                aria-expanded={isOpen}
                className="relative z-50 flex flex-col justify-center items-center w-10 h-10 rounded-lg focus:outline-none"
            >
                <span
                    className={`block w-5 h-0.5 bg-[#1C1917] transition-transform duration-300 ease-in-out ${isOpen ? "rotate-45 translate-y-1.5" : "-translate-y-1"
                        }`}
                />
                <span
                    className={`block w-5 h-0.5 bg-[#1C1917] transition-opacity duration-300 ease-in-out my-1 ${isOpen ? "opacity-0" : "opacity-100"
                        }`}
                />
                <span
                    className={`block w-5 h-0.5 bg-[#1C1917] transition-transform duration-300 ease-in-out ${isOpen ? "-rotate-45 -translate-y-1.5" : "translate-y-1"
                        }`}
                />
            </button>

            {/* Backdrop & Tactile Dropdown Card */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-[#1C1917]/30 backdrop-blur-[2px]"
                    onClick={closeMenu}
                >
                    <div
                        className="absolute top-24 right-6 left-6 border-2 border-[#1C1917] bg-[#FAF6EF] p-6 shadow-[6px_6px_0px_#1C1917] flex flex-col gap-4 text-base font-bold text-[#1C1917]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    onClick={closeMenu}
                                    className="w-full text-center py-2.5 px-5 rounded-full border-2 border-[#1C1917] bg-[#FAF6EF] shadow-[3px_3px_0px_#1C1917] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                                >
                                    My cards
                                </Link>
                                <Link
                                    href="/dashboard/settings"
                                    onClick={closeMenu}
                                    className="w-full text-center py-2.5 px-5 rounded-full border-2 border-[#1C1917] bg-[#FAF6EF] shadow-[3px_3px_0px_#1C1917] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                                >
                                    Settings
                                </Link>
                                <div className="flex justify-center pt-1">
                                    <LogoutButton />
                                </div>
                            </>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    onClick={closeMenu}
                                    className="w-full text-center py-2.5 px-5 rounded-full border-2 border-[#1C1917] bg-[#FAF6EF] shadow-[3px_3px_0px_#1C1917] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                                >
                                    Log in
                                </Link>
                                <Link
                                    href="/signup"
                                    onClick={closeMenu}
                                    className="btn w-full text-center py-3 rounded-full border-2 border-[#1C1917] bg-[#DF4A30] text-white shadow-[3px_3px_0px_#1C1917] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                                >
                                    Start
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}