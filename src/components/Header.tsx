'use client'

import React, { useState, useCallback, useEffect, useRef, memo, CSSProperties, ReactNode } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { animate as motionAnimate, DynamicAnimationOptions, motion, useAnimate } from 'framer-motion';

// ─── Inline debounce (no lodash) ──────────────────────────────
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

// ─── GlowingEffect ───────────────────────────────────────────
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
      } as CSSProperties}
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

// ─── RandomLetterSwapForward ────────────────────────────────
interface TextProps {
  label: string;
  reverse?: boolean;
  transition?: DynamicAnimationOptions;
  staggerDuration?: number;
  className?: string;
  style?: CSSProperties;
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

  const shuffledIndices = Array.from({ length: label.length }, (_, i) => i).sort(() => Math.random() - 0.5);

  const hoverStart = debounce(() => {
    if (blocked) return;
    setBlocked(true);

    for (let i = 0; i < label.length; i++) {
      const randomIndex = shuffledIndices[i];
      animate(".letter-" + randomIndex, { y: reverse ? "100%" : "-100%" }, mergeTransition(transition, i))
        .then(() => animate(".letter-" + randomIndex, { y: 0 }, { duration: 0 }));

      animate(".letter-secondary-" + randomIndex, { top: "0%" }, mergeTransition(transition, i))
        .then(() => animate(".letter-secondary-" + randomIndex, { top: reverse ? "-100%" : "100%" }, { duration: 0 }))
        .then(() => { if (i === label.length - 1) setBlocked(false); });
    }
  }, 100, { leading: true, trailing: true });

  return (
    <motion.span
      className={`flex justify-center items-center relative overflow-hidden ${className ?? ''}`}
      style={style}
      onHoverStart={hoverStart}
      onClick={onClick}
      ref={scope}
    >
      <span className="sr-only">{label}</span>
      {label.split("").map((letter, i) => (
        <span className="whitespace-pre relative flex" key={i}>
          <motion.span className={`relative pb-2 letter-${i}`} style={{ top: 0 }}>{letter}</motion.span>
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

// ─── StarBackground ───────────────────────────────────────
function StarBackground({ color }: { color?: string }) {
  return (
    <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clipPath="url(#clip0)">
        <path d="M32.34 26.68C32.34 26.3152 32.0445 26.02 31.68 26.02C31.3155 26.02 31.02 26.3152 31.02 26.68C31.02 27.0448 31.3155 27.34 31.68 27.34C32.0445 27.34 32.34 27.0448 32.34 26.68Z" fill={color || "currentColor"} />
      </g>
      <defs><clipPath id="clip0"><rect width="100" height="40" fill="white"/></clipPath></defs>
    </svg>
  );
}

// ─── StarButton ─────────────────────────────────────────────
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
      <div className="absolute aspect-square inset-0 animate-star-btn bg-[radial-gradient(ellipse_at_center,var(--light-color),transparent,transparent)]"
        style={{ offsetPath: "var(--path)", offsetDistance: "0%", width: "var(--light-width)" } as CSSProperties}
      />
      <div className="absolute inset-0 z-[4] overflow-hidden rounded-[inherit]"
        style={{ borderWidth: "var(--border-width)", borderColor: "rgba(255,255,255,0.15)", borderStyle: "solid" }}
        aria-hidden="true"
      >
        <StarBackground color={backgroundColor} />
      </div>
      <span className="z-10 relative flex items-center gap-2 text-white">{children}</span>
    </button>
  );
}

// ─── Header ────────────────────────────────────────────────
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

          {/* Logo */}
          <div className="cursor-pointer pointer-events-auto" onClick={onBookingClick}>
            <RandomLetterSwapForward
              label="HALOVISION AI"
              reverse={true}
              staggerDuration={0.015}
              className="text-white select-none text-[9px] sm:text-[10px] md:text-[13px] tracking-[0.25em] font-bold"
              style={{ fontFamily: 'Anurati, sans-serif' }}
            />
          </div>

          {/* Right side */}
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

            {/* CTA Button */}
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
