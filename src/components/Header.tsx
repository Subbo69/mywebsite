'use client'

import { useState, useCallback, useEffect, useRef, memo } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { animate as motionAnimate, DynamicAnimationOptions, motion, useAnimate } from 'framer-motion';
import React, { CSSProperties, ReactNode } from 'react';

// ─── Inline debounce (no lodash needed) ──────────────────────────────────────
function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  wait: number,
  opts?: { leading?: boolean; trailing?: boolean }
) {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let leadingCalled = false;
  return function (...args: Parameters<T>) {
    if (opts?.leading && !leadingCalled) { fn(...args); leadingCalled = true; }
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      if (opts?.trailing !== false) fn(...args);
      leadingCalled = false;
      timer = null;
    }, wait);
  };
}

// ─── GlowingEffect (inlined) ──────────────────────────────────────────────────
const GlowingEffect = memo(({
  blur = 0, inactiveZone = 0.7, proximity = 0, spread = 20,
  variant = "default", glow = false, className = "",
  movementDuration = 2, borderWidth = 1, disabled = true,
}: {
  blur?: number; inactiveZone?: number; proximity?: number; spread?: number;
  variant?: "default" | "white"; glow?: boolean; className?: string;
  movementDuration?: number; borderWidth?: number; disabled?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);

  const handleMove = useCallback((e?: MouseEvent | { x: number; y: number }) => {
    if (!containerRef.current) return;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      const mouseX = e?.x ?? lastPosition.current.x;
      const mouseY = e?.y ?? lastPosition.current.y;
      if (e) lastPosition.current = { x: mouseX, y: mouseY };
      const center = [left + width * 0.5, top + height * 0.5];
      const distFromCenter = Math.hypot(mouseX - center[0], mouseY - center[1]);
      const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;
      if (distFromCenter < inactiveRadius) { el.style.setProperty("--active", "0"); return; }
      const isActive = mouseX > left - proximity && mouseX < left + width + proximity &&
        mouseY > top - proximity && mouseY < top + height + proximity;
      el.style.setProperty("--active", isActive ? "1" : "0");
      if (!isActive) return;
      const currentAngle = parseFloat(el.style.getPropertyValue("--start")) || 0;
      const targetAngle = (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) / Math.PI + 90;
      const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
      motionAnimate(currentAngle, currentAngle + angleDiff, {
        duration: movementDuration, ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => el.style.setProperty("--start", String(v)),
      });
    });
  }, [inactiveZone, proximity, movementDuration]);

  useEffect(() => {
    if (disabled) return;
    const onScroll = () => handleMove();
    const onPointer = (e: PointerEvent) => handleMove(e);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.body.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("scroll", onScroll);
      document.body.removeEventListener("pointermove", onPointer);
    };
  }, [handleMove, disabled]);

  const gradient = `radial-gradient(circle, #dd7bbb 10%, #dd7bbb00 20%),
     radial-gradient(circle at 40% 40%, #d79f1e 5%, #d79f1e00 15%),
     radial-gradient(circle at 60% 60%, #5a922c 10%, #5a922c00 20%),
     radial-gradient(circle at 40% 60%, #4c7894 10%, #4c789400 20%),
     repeating-conic-gradient(from 236.84deg at 50% 50%, #dd7bbb 0%, #d79f1e calc(25%/5), #5a922c calc(50%/5), #4c7894 calc(75%/5), #dd7bbb calc(100%/5))`;

  if (disabled) return null;

  return (
    <div
      ref={containerRef}
      style={{
        '--blur': `${blur}px`, '--spread': spread, '--start': '0', '--active': '0',
        '--glowingeffect-border-width': `${borderWidth}px`,
        '--repeating-conic-gradient-times': '5',
        '--gradient': gradient,
      } as React.CSSProperties}
      className={`pointer-events-none absolute inset-0 rounded-[inherit] ${className}`}
    >
      <div className={[
        "glow rounded-[inherit]",
        'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
        "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
        "after:[background:var(--gradient)] after:[background-attachment:fixed]",
        "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
        "after:[mask-clip:padding-box,border-box] after:[mask-composite:intersect]",
        "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]",
      ].join(" ")} />
    </div>
  );
});
GlowingEffect.displayName = "GlowingEffect";

// ─── RandomLetterSwapForward (inlined) ────────────────────────────────────────
interface TextProps {
  label: string;
  reverse?: boolean;
  transition?: DynamicAnimationOptions;
  staggerDuration?: number;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
}

function RandomLetterSwapForward({
  label,
  reverse = true,
  transition = { type: "spring", duration: 0.8 },
  staggerDuration = 0.02,
  className,
  style,
  onClick,
}: TextProps) {
  const [scope, animate] = useAnimate();
  const [blocked, setBlocked] = useState(false);

  const mergeTransition = (t: DynamicAnimationOptions, i: number) => ({
    ...t,
    delay: i * staggerDuration,
  });

  const shuffledIndices = Array.from(
    { length: label.length },
    (_, i) => i
  ).sort(() => Math.random() - 0.5);

  const hoverStart = debounce(
    () => {
      if (blocked) return;
      setBlocked(true);

      for (let i = 0; i < label.length; i++) {
        const randomIndex = shuffledIndices[i];
        animate(
          ".letter-" + randomIndex,
          { y: reverse ? "100%" : "-100%" },
          mergeTransition(transition, i)
        ).then(() => {
          animate(".letter-" + randomIndex, { y: 0 }, { duration: 0 });
        });

        animate(
          ".letter-secondary-" + randomIndex,
          { top: "0%" },
          mergeTransition(transition, i)
        )
          .then(() => {
            animate(
              ".letter-secondary-" + randomIndex,
              { top: reverse ? "-100%" : "100%" },
              { duration: 0 }
            );
          })
          .then(() => {
            if (i === label.length - 1) setBlocked(false);
          });
      }
    },
    100,
    { leading: true, trailing: true }
  );

  return (
    <motion.span
      className={`flex justify-center items-center relative overflow-hidden ${className ?? ''}`}
      style={style}
      onHoverStart={hoverStart}
      onClick={onClick}
      ref={scope}
    >
      <span className="sr-only">{label}</span>
      {label.split("").map((letter: string, i: number) => (
        <span className="whitespace-pre relative flex" key={i}>
          <motion.span className={`relative pb-2 letter-${i}`} style={{ top: 0 }}>
            {letter}
          </motion.span>
          <motion.span
            className={`absolute letter-secondary-${i}`}
            aria-hidden={true}
            style={{ top: reverse ? "-100%" : "100%" }}
          >
            {letter}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

// ─── StarBackground (inlined) ─────────────────────────────────────────────────
function StarBackground({ color }: { color?: string }) {
  return (
    <svg
      width="100%" height="100%" preserveAspectRatio="none"
      viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg"
    >
      <g clipPath="url(#clip0_408_119)">
        <path
          d="M32.34 26.68C32.34 26.3152 32.0445 26.02 31.68 26.02C31.3155 26.02 31.02 26.3152 31.02 26.68C31.02 27.0448 31.3155 27.34 31.68 27.34C32.0445 27.34 32.34 27.0448 32.34 26.68Z"
          fill="black"
        />
        <path
          fillRule="evenodd" clipRule="evenodd"
          d="M56.1 3.96C56.4645 3.96 56.76 4.25519 56.76 4.62C56.76 4.98481 56.4645 5.28 56.1 5.28C55.9131 5.28 55.7443 5.20201 55.624 5.07762C55.5632 5.01446 55.5147 4.93904 55.4829 4.8559C55.4552 4.78243 55.44 4.70315 55.44 4.62C55.44 4.5549 55.4494 4.49174 55.4668 4.43244C55.4906 4.35188 55.5292 4.27775 55.5795 4.21329C55.7004 4.05926 55.8885 3.96 56.1 3.96ZM40.26 17.16C40.6245 17.16 40.92 17.4552 40.92 17.82C40.92 18.1848 40.6245 18.48 40.26 18.48C39.8955 18.48 39.6 18.1848 39.6 17.82C39.6 17.4552 39.8955 17.16 40.26 17.16ZM74.58 5.28C74.7701 5.28 74.9413 5.36057 75.0618 5.48882C75.073 5.50043 75.0837 5.51268 75.094 5.52557C75.1088 5.54426 75.1231 5.56359 75.1359 5.58357L75.1479 5.60291L75.1595 5.62353C75.1711 5.64481 75.1814 5.66672 75.1906 5.68928C75.2226 5.76662 75.24 5.85106 75.24 5.94C75.24 6.1585 75.1336 6.3525 74.9699 6.47238C74.9158 6.51234 74.8555 6.54393 74.7908 6.56584C74.7247 6.58775 74.6538 6.6 74.58 6.6C74.2156 6.6 73.92 6.30481 73.92 5.94C73.92 5.87684 73.929 5.8156 73.9455 5.7576C73.9596 5.70862 73.979 5.66221 74.0032 5.61903C74.0657 5.50688 74.1595 5.41471 74.2728 5.35541C74.3647 5.30707 74.4691 5.28 74.58 5.28ZM21.66 33.52C22.0245 33.52 22.32 33.8152 22.32 34.18C22.32 34.5448 22.0245 34.84 21.66 34.84C21.2955 34.84 21 34.5448 21 34.18C21 33.8152 21.2955 33.52 21.66 33.52ZM8.16 32.86C8.16 32.4952 7.8645 32.2 7.5 32.2C7.1355 32.2 6.84 32.4952 6.84 32.86C6.84 33.2248 7.1355 33.52 7.5 33.52C7.8645 33.52 8.16 33.2248 8.16 32.86ZM7.5 23.68C7.8645 23.68 8.16 23.9752 8.16 24.34C8.16 24.7048 7.8645 25 7.5 25C7.1355 25 6.84 24.7048 6.84 24.34C6.84 23.9752 7.1355 23.68 7.5 23.68ZM19.32 18.48C19.32 18.1152 19.0245 17.82 18.66 17.82C18.2955 17.82 18 18.1152 18 18.48C18 18.8448 18.2955 19.14 18.66 19.14C19.0245 19.14 19.32 18.8448 19.32 18.48ZM5.66 11.84C6.0245 11.84 6.32001 12.1352 6.32001 12.5C6.32001 12.8648 6.0245 13.16 5.66 13.16C5.2955 13.16 5 12.8648 5 12.5C5 12.1352 5.2955 11.84 5.66 11.84ZM35.16 35.5C35.16 35.1352 34.8645 34.84 34.5 34.84C34.1355 34.84 33.84 35.1352 33.84 35.5C33.84 35.8648 34.1355 36.16 34.5 36.16C34.8645 36.16 35.16 35.8648 35.16 35.5ZM53.5 36.18C53.8645 36.18 54.16 36.4752 54.16 36.84C54.16 37.2048 53.8645 37.5 53.5 37.5C53.1355 37.5 52.84 37.2048 52.84 36.84C52.84 36.4752 53.1355 36.18 53.5 36.18ZM48.5 28.66C48.5 28.2952 48.2045 28 47.84 28C47.4755 28 47.18 28.2952 47.18 28.66C47.18 29.0248 47.4755 29.32 47.84 29.32C48.2045 29.32 48.5 29.0248 48.5 28.66ZM60.34 27.34C60.7045 27.34 61 27.6352 61 28C61 28.3648 60.7045 28.66 60.34 28.66C59.9755 28.66 59.68 28.3648 59.68 28C59.68 27.6352 59.9755 27.34 60.34 27.34ZM56.284 16.5C56.284 16.1352 55.9885 15.84 55.624 15.84C55.2595 15.84 54.964 16.1352 54.964 16.5C54.964 16.8648 55.2595 17.16 55.624 17.16C55.9885 17.16 56.284 16.8648 56.284 16.5ZM46.2 7.26C46.2 6.89519 45.9045 6.6 45.54 6.6C45.5174 6.6 45.4953 6.60129 45.4733 6.60387L45.453 6.60579L45.4124 6.61225L45.3857 6.61804L45.3845 6.61836C45.3675 6.62277 45.3504 6.62721 45.3341 6.63287C45.2522 6.65929 45.1774 6.70184 45.1134 6.75597C45.0627 6.79916 45.0186 6.84943 44.9828 6.90551C44.9178 7.00799 44.88 7.12981 44.88 7.26C44.88 7.62481 45.1755 7.92 45.54 7.92C45.7372 7.92 45.9141 7.83363 46.0353 7.69635C46.0808 7.64478 46.1182 7.58613 46.1459 7.52232C46.1807 7.4424 46.2 7.35346 46.2 7.26ZM33 9.34C33 8.9752 32.7045 8.68 32.34 8.68C31.9755 8.68 31.68 8.9752 31.68 9.34C31.68 9.7048 31.9755 10 32.34 10C32.7045 10 33 9.7048 33 9.34ZM16 4.8559C16.3645 4.8559 16.66 5.1511 16.66 5.5159C16.66 5.8807 16.3645 6.1759 16 6.1759C15.6355 6.1759 15.34 5.8807 15.34 5.5159C15.34 5.1511 15.6355 4.8559 16 4.8559ZM69.66 21.16C69.66 20.7952 69.3645 20.5 69 20.5C68.6355 20.5 68.34 20.7952 68.34 21.16C68.34 21.5248 68.6355 21.82 69 21.82C69.3645 21.82 69.66 21.5248 69.66 21.16ZM80.52 15.18C80.52 14.8152 80.2245 14.52 79.86 14.52C79.4956 14.52 79.2 14.8152 79.2 15.18C79.2 15.5448 79.4956 15.84 79.86 15.84C80.2245 15.84 80.52 15.5448 80.52 15.18ZM78.16 34.84C78.16 34.4752 77.5 34.18 77.5 34.18C77.5 34.18 76.84 34.4752 76.84 34.84C76.84 35.2048 77.1355 35.5 77.5 35.5C77.8645 35.5 78.16 35.2048 78.16 34.84ZM85.66 24.34C86.0245 24.34 86.32 24.6352 86.32 25C86.32 25.3648 86.0245 25.66 85.66 25.66C85.2955 25.66 85 25.3648 85 25C85 24.6352 85.2955 24.34 85.66 24.34ZM91.32 10C91.32 9.6352 91.0245 9.34 90.66 9.34C90.2955 9.34 90 9.6352 90 10C90 10.3648 90.2955 10.66 90.66 10.66C91.0245 10.66 91.32 10.3648 91.32 10ZM138.6 0H0V46.2H138.6V0ZM92.64 34.84C92.64 34.4752 91.98 34.18 91.98 34.18C91.98 34.18 91.32 34.4752 91.32 34.84C91.32 35.2048 91.6155 35.5 91.98 35.5C92.3445 35.5 92.64 35.2048 92.64 34.84Z"
          fill={color || "currentColor"}
        />
      </g>
      <defs>
        <clipPath id="clip0_408_119">
          <rect width="100" height="40" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

// ─── StarButton (inlined) ─────────────────────────────────────────────────────
interface StarButtonProps {
  children: ReactNode;
  lightWidth?: number;
  duration?: number;
  lightColor?: string;
  backgroundColor?: string;
  borderWidth?: number;
  className?: string;
  onClick?: () => void;
}

function StarButton({
  children,
  lightWidth = 110,
  duration = 3,
  lightColor = "#FAFAFA",
  backgroundColor = "currentColor",
  borderWidth = 2,
  className,
  onClick,
}: StarButtonProps) {
  const pathRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (pathRef.current) {
      const div = pathRef.current;
      div.style.setProperty(
        "--path",
        `path('M 0 0 H ${div.offsetWidth} V ${div.offsetHeight} H 0 V 0')`
      );
    }
  }, []);

  return (
    <button
      style={{
        "--duration": duration,
        "--light-width": `${lightWidth}px`,
        "--light-color": lightColor,
        "--border-width": `${borderWidth}px`,
        isolation: "isolate",
      } as CSSProperties}
      ref={pathRef}
      onClick={onClick}
      className={`relative z-[3] overflow-hidden inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all hover:scale-[1.03] active:scale-[0.97] shadow-lg ${className ?? ''}`}
    >
      {/* traveling light */}
      <div
        className="absolute aspect-square inset-0 animate-star-btn bg-[radial-gradient(ellipse_at_center,var(--light-color),transparent,transparent)]"
        style={{
          offsetPath: "var(--path)",
          offsetDistance: "0%",
          width: "var(--light-width)",
        } as CSSProperties}
      />
      {/* star pattern border overlay */}
      <div
        className="absolute inset-0 z-[4] overflow-hidden rounded-[inherit]"
        style={{ borderWidth: "var(--border-width)", borderColor: "rgba(255,255,255,0.15)", borderStyle: "solid" }}
        aria-hidden="true"
      >
        <StarBackground color={backgroundColor} />
      </div>
      {/* text */}
      <span className="z-10 relative flex items-center gap-2 text-white">
        {children}
      </span>
    </button>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
interface HeaderProps {
  onBookingClick: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function Header({ onBookingClick, language, onLanguageChange }: HeaderProps) {
  const t = translations[language];
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  return (
    <>
      <link href="https://fonts.cdnfonts.com/css/anurati" rel="stylesheet" />

      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent pointer-events-none">
        <div className="w-full flex items-center justify-between px-4 md:px-16 py-4 md:py-5">

          {/* ── Logo — RandomLetterSwap animation ── */}
          <div className="cursor-pointer pointer-events-auto" onClick={onBookingClick}>
            <RandomLetterSwapForward
              label="HALOVISION AI"
              reverse={true}
              staggerDuration={0.015}
              className="text-white select-none text-[9px] sm:text-[10px] md:text-[13px] tracking-[0.25em] font-bold"
              style={{ fontFamily: 'Anurati, sans-serif' }}
            />
          </div>

          {/* ── Right side ── */}
          <div className="flex items-center gap-4 md:gap-7 pointer-events-auto">

            {/* Language switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-1 text-[10px] md:text-xs font-bold text-white/70 hover:text-white transition-colors duration-200 tracking-[0.2em] uppercase"
              >
                <span>{language.toUpperCase()}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showLanguageMenu ? 'rotate-180' : ''}`} />
              </button>

              {showLanguageMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLanguageMenu(false)} />
                  <div className="absolute top-full right-0 mt-3 z-50 rounded-xl overflow-hidden border border-white/10 bg-black/85 backdrop-blur-xl shadow-2xl py-1 min-w-[68px]">
                    {(['en', 'de', 'fr'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => { onLanguageChange(lang); setShowLanguageMenu(false); }}
                        className={`block w-full px-4 py-2.5 text-left text-[10px] md:text-[11px] font-bold tracking-[0.18em] uppercase transition-colors duration-150
                          ${lang === language
                            ? 'text-white bg-white/10'
                            : 'text-white/50 hover:text-white hover:bg-white/5'}`}
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* ── CTA — StarButton with rainbow GlowingEffect ── */}
            <div className="relative rounded-full">
              <GlowingEffect
                spread={35}
                glow={false}
                disabled={false}
                proximity={55}
                inactiveZone={0.01}
                borderWidth={2}
              />
              <StarButton
                onClick={onBookingClick}
                lightColor="rgba(255,255,255,0.6)"
                backgroundColor="rgba(255,255,255,0.08)"
                lightWidth={90}
                duration={2.5}
                borderWidth={1}
                className="bg-white/10 backdrop-blur-sm px-4 md:px-6 py-1.5 md:py-2.5 text-[10px] md:text-sm"
              >
                <span style={{ fontFamily: '"Montserrat", sans-serif' }}>{t.letsTalk}</span>
                <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
              </StarButton>
            </div>

          </div>
        </div>
      </header>
    </>
  );
}
