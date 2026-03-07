import React, { useEffect, useRef, useState } from 'react';

const randomColors = (count: number) => {
  return new Array(count)
    .fill(0)
    .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
};

// ── Device capability detection ───────────────────────────────────────────────
// Returns a score 0–4 based on device signals:
//   0 = very weak (old phone),  4 = high-end desktop
function getDeviceScore(): number {
  let score = 0;
  const isTouchOnly     = window.matchMedia('(hover: none)').matches;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
  const isLargeScreen   = window.innerWidth >= 1024;
  const cores           = navigator.hardwareConcurrency ?? 2;
  const memory          = (navigator as any).deviceMemory ?? 2; // GB, often undefined on iOS

  if (!isTouchOnly)     score += 1; // has real mouse/trackpad
  if (!isCoarsePointer) score += 1; // fine pointer = desktop/laptop
  if (isLargeScreen)    score += 1; // big screen
  if (cores >= 4)       score += 1; // enough CPU threads
  if (memory >= 4)      score += 1; // enough RAM (Android/Chrome only)

  return score; // 0–5
}

interface TubesBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  // Override auto-detection: true = full interactivity, false = animation-only
  enableClickInteraction?: boolean;
}

export function TubesBackground({
  children,
  className = "",
  enableClickInteraction,
}: TubesBackgroundProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const tubesRef   = useRef<any>(null);
  const [error, setError] = useState(false);

  // Determine capability level once on mount
  const [deviceScore, setDeviceScore] = useState<number | null>(null);

  useEffect(() => {
    setDeviceScore(getDeviceScore());
  }, []);

  // Resolve flags from score (or prop override)
  // score >= 3  → full interactivity (click + cursor tracking)
  // score == 2  → click only, no cursor tracking
  // score <= 1  → animation only, no interaction at all
  const isHighPerf   = enableClickInteraction !== undefined
    ? enableClickInteraction
    : (deviceScore ?? 0) >= 3;

  const allowTracking = (deviceScore ?? 0) >= 3; // cursor/touch tracking

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!canvasRef.current) return;
      const CDN = 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js';
      try {
        const res = await fetch(CDN);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const code = await res.text();
        const blob = new Blob([code], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);
        // @ts-ignore
        const mod = await import(/* @vite-ignore */ blobUrl);
        URL.revokeObjectURL(blobUrl);
        if (!mounted || !canvasRef.current) return;

        const TubesCursor = mod.default ?? mod;
        const app = TubesCursor(canvasRef.current, {
          tubes: {
            colors: ["#f967fb", "#53bc28", "#6958d5"],
            lights: {
              intensity: 200,
              colors: ["#83f36e", "#fe8a2e", "#ff008a", "#60aed5"]
            }
          }
        });
        tubesRef.current = app;

        // ── Disable mouse/touch tracking on weak devices ──────────────────
        // The tubes library attaches its own pointermove/touchmove listeners
        // that drive the cursor-reactive animation. We neutralize them by
        // stopping propagation on the canvas for those events, so the library
        // never receives the coordinates — the idle auto-animation still runs.
        if (!allowTracking && canvasRef.current) {
          const stopTracking = (e: Event) => e.stopImmediatePropagation();
          canvasRef.current.addEventListener('pointermove', stopTracking, { capture: true });
          canvasRef.current.addEventListener('touchmove',   stopTracking, { capture: true, passive: true });
          canvasRef.current.addEventListener('mousemove',   stopTracking, { capture: true });
        }

      } catch (err) {
        console.error("TubesBackground: failed to initialize:", err);
        if (mounted) setError(true);
      }
    };

    // Wait until we have the device score before initialising
    if (deviceScore !== null) init();

    return () => { mounted = false; };
  }, [deviceScore, allowTracking]);

  const handleClick = () => {
    if (!isHighPerf || !tubesRef.current) return;
    try {
      tubesRef.current.tubes.setColors(randomColors(3));
      tubesRef.current.tubes.setLightsColors(randomColors(4));
    } catch (e) {
      console.warn("TubesBackground: could not randomize colors:", e);
    }
  };

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${className}`}
      onClick={handleClick}
    >
      {/* Fallback dark gradient shown until/if tubes load */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #050008 0%, #180030 40%, #06001a 70%, #000308 100%)',
          zIndex: 0,
        }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block"
        style={{ touchAction: 'none', zIndex: 1 }}
      />
      <div className="relative z-10 w-full h-full pointer-events-none">
        {children}
      </div>
    </div>
  );
}

export default TubesBackground;
