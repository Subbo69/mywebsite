import React, { useEffect, useRef, useState } from 'react';

const randomColors = (count: number) => {
  return new Array(count)
    .fill(0)
    .map(() => "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
};

interface TubesBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  enableClickInteraction?: boolean;
}

export function TubesBackground({
  children,
  className = "",
  enableClickInteraction = true
}: TubesBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tubesRef = useRef<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!canvasRef.current) return;

      const CDN = 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js';

      try {
        // Fetch the script text, wrap in blob URL so Vite doesn't intercept
        const res = await fetch(CDN);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const code = await res.text();

        const blob = new Blob([code], { type: 'application/javascript' });
        const blobUrl = URL.createObjectURL(blob);

        // @ts-ignore — tell Vite to ignore this dynamic import
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

      } catch (err) {
        console.error("TubesBackground: failed to initialize:", err);
        if (mounted) setError(true);
      }
    };

    init();
    return () => { mounted = false; };
  }, []);

  const handleClick = () => {
    if (!enableClickInteraction || !tubesRef.current) return;
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
