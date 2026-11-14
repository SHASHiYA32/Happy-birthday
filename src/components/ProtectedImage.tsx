"use client";

import { useEffect, useRef } from "react";

/**
 * Photos are fetched with the viewer's session cookie, decoded in memory and
 * painted on a canvas. There is no <img>, no blob: URL and no file URL, so
 * right-click "save image", drag-out and "open in new tab" have nothing to grab.
 * (A determined person can still screenshot the screen; nothing in a browser
 * can prevent that.)
 */
export default function ProtectedImage({ bitmap }: { bitmap?: ImageBitmap }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || !bitmap) return;
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0);
  }, [bitmap]);

  return (
    <div
      className="no-save relative"
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
    >
      {bitmap ? (
        <canvas ref={ref} className="block h-auto max-h-[50dvh] w-auto max-w-full" aria-hidden />
      ) : (
        <div className="aspect-[4/5] w-56 animate-pulse bg-paper-deep" />
      )}
      {/* Transparent shield: swallows long-press / context menu on touch screens. */}
      <div className="absolute inset-0" />
    </div>
  );
}
