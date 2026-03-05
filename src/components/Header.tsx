import { useState, useCallback, useEffect, useRef, memo } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { animate as motionAnimate } from 'framer-motion';

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

          {/* ── Logo — bare text, no box ── */}
          <div
            className="cursor-pointer hover:opacity-60 transition-opacity duration-300 pointer-events-auto"
            onClick={onBookingClick}
          >
            <span
              className="text-white select-none text-[9px] sm:text-[10px] md:text-[13px] tracking-[0.25em] font-bold whitespace-nowrap"
              style={{ fontFamily: 'Anurati, sans-serif' }}
            >
              HALOVISION AI
            </span>
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

            {/* CTA Button — white pill with rainbow glow */}
            <div className="relative rounded-full">
              <GlowingEffect
                spread={35}
                glow={false}
                disabled={false}
                proximity={55}
                inactiveZone={0.01}
                borderWidth={2}
              />
              <button
                onClick={onBookingClick}
                className="relative flex items-center gap-2 bg-white text-black px-4 md:px-6 py-1.5 md:py-2.5 rounded-full text-[10px] md:text-sm font-semibold whitespace-nowrap hover:bg-white/90 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 shadow-lg"
                style={{ fontFamily: '"Montserrat", sans-serif' }}
              >
                <span>{t.letsTalk}</span>
                <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
