"use client";

import dynamic from "next/dynamic";

// Three.js only loads in the browser, after the page is already readable.
const ConfettiLazy = dynamic(() => import("./Confetti"), { ssr: false });
export default ConfettiLazy;
