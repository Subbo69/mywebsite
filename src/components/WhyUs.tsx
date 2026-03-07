import { Users, Zap, ChevronDown } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// ─── RevealText: letters slide up on scroll + wave on hover ──────────────────
function RevealText({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className={`inline-flex flex-wrap overflow-visible ${className}`}
      aria-label={text}
      whileHover="hover"
      initial="rest"
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ willChange: 'transform' }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          transition={{ duration: 0.45, delay: i * 0.028, ease: [0.16, 1, 0.3, 1] }}
          variants={{
            rest: { y: 0 },
            hover: {
              y: -6,
              transition: { type: 'spring', stiffness: 400, damping: 18, delay: i * 0.025 },
            },
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  );
}

function WaveText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  return (
    <motion.span
      className={`inline-flex flex-wrap ${className}`}
      style={{ overflow: 'visible' }}
      whileHover="hover"
      initial="rest"
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ willChange: 'transform' }}
          variants={{
            rest: { y: 0 },
            hover: {
              y: -5,
              transition: { type: 'spring', stiffness: 400, damping: 18, delay: i * 0.025 },
            },
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

const glowHsl: Record<string, string> = {
  cyan:   '190 100% 60%',
  purple: '270 100% 65%',
  green:  '145  90% 55%',
  amber:  ' 38 100% 55%',
  white:  '  0   0% 95%',
};
type GlowColor = keyof typeof glowHsl;
const glowPalette: GlowColor[] = ['cyan', 'purple', 'green', 'amber', 'white'];

function GlowCard({
  children,
  className = '',
  glowColor = 'cyan',
  onClick,
  registerRef,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: GlowColor;
  onClick?: () => void;
  registerRef?: (el: HTMLDivElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const color = glowHsl[glowColor] ?? glowHsl.cyan;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--gc-color', color);
    registerRef?.(el);
    return () => registerRef?.(null);
  }, [color, registerRef]);

  return (
    <div
      ref={ref}
      className={`gc-wrap relative ${className}`}
      // Dark grey — no transparency, no blur
      style={{ background: '#111111' }}
      onClick={onClick}
    >
      <div className="gc-fill" />
      <div className="gc-border" />
      <div className="gc-content">{children}</div>
    </div>
  );
}

const ICONS_ROW1 = [
  'https://cdn.simpleicons.org/openai/white',
  'https://cdn-icons-png.flaticon.com/512/281/281769.png',
  'https://cdn-icons-png.flaticon.com/512/2111/2111615.png',
  'https://cdn-icons-png.flaticon.com/512/174/174857.png',
  'https://cdn-icons-png.flaticon.com/512/732/732220.png',
  'https://cdn-icons-png.flaticon.com/512/2965/2965278.png',
  'https://cdn-icons-png.flaticon.com/512/733/733547.png',
  'https://cdn-icons-png.flaticon.com/512/2111/2111370.png',
  'https://cdn-icons-png.flaticon.com/512/732/732226.png',
  'https://cdn-icons-png.flaticon.com/512/5968/5968885.png',
];
const ICONS_ROW2 = [
  'https://cdn-icons-png.flaticon.com/512/300/300221.png',
  'https://cdn-icons-png.flaticon.com/512/732/732221.png',
  'https://cdn-icons-png.flaticon.com/512/174/174855.png',
  'https://cdn-icons-png.flaticon.com/512/733/733553.png',
  'https://cdn-icons-png.flaticon.com/512/2965/2965327.png',
  'https://cdn-icons-png.flaticon.com/512/733/733585.png',
  'https://cdn-icons-png.flaticon.com/512/5968/5968755.png',
  'https://cdn-icons-png.flaticon.com/512/4401/4401470.png',
  'https://cdn-icons-png.flaticon.com/512/1384/1384060.png',
];

const repeatedIcons = (icons: string[], repeat = 6) =>
  Array.from({ length: repeat }).flatMap(() => icons);

function LogoCarousel({
  icons,
  direction = 1,
  registerRef,
}: {
  icons: string[];
  direction?: number;
  registerRef?: (el: HTMLDivElement | null) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const velRef = useRef(0);
  const scrollVelRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());

  const items = repeatedIcons(icons, 6);
  const ITEM_WIDTH = 96;
  const HALF = (items.length / 2) * ITEM_WIDTH;

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      const dt = Math.max(now - lastScrollTime.current, 1);
      const dy = window.scrollY - lastScrollY.current;
      scrollVelRef.current = (dy / dt) * 16.67 * direction * 0.9;
      lastScrollY.current = window.scrollY;
      lastScrollTime.current = now;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [direction]);

  useEffect(() => {
    const BASE_DRIFT = 0.08 * direction;
    const tick = () => {
      velRef.current += (scrollVelRef.current - velRef.current) * 0.025;
      scrollVelRef.current *= 0.94;
      posRef.current -= velRef.current + BASE_DRIFT;
      if (posRef.current <= -HALF) posRef.current += HALF;
      if (posRef.current > 0) posRef.current -= HALF;
      const skew = Math.max(-5, Math.min(5, velRef.current * 0.35));
      const scaleY = 1 - Math.min(0.04, Math.abs(velRef.current) * 0.0025);
      if (trackRef.current) {
        trackRef.current.style.transform =
          `translateX(${posRef.current.toFixed(2)}px) skewX(${skew.toFixed(2)}deg) scaleY(${scaleY.toFixed(4)})`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [direction, HALF]);

  return (
    <div className="overflow-hidden">
      <div
        ref={trackRef}
        className="flex gap-10 whitespace-nowrap"
        style={{ transformOrigin: 'center center', willChange: 'transform' }}
      >
        {items.map((src, i) => (
          <div
            key={i}
            ref={(el) => registerRef?.(el)}
            className="logo-bubble h-14 w-14 flex-shrink-0 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.08)',
              position: 'relative',
              '--lx': '-9999px',
              '--ly': '-9999px',
            } as React.CSSProperties}
          >
            <div className="logo-bubble-border" />
            <img
              src={src}
              alt="integration logo"
              className="h-8 w-8 object-contain"
              style={{ position: 'relative', zIndex: 1, filter: 'brightness(0) invert(1)', opacity: 0.85 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

interface WhyUsProps {
  language: Language;
}

export default function WhyUs({ language }: WhyUsProps) {
  const t = translations[language];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(5).fill(false));
  const [founderVisible, setFounderVisible] = useState(false);
  const [logosVisible, setLogosVisible] = useState(false);

  const sectionRef      = useRef<HTMLElement>(null);
  const topBorderRef    = useRef<HTMLDivElement>(null);
  const itemRefs        = useRef<(HTMLDivElement | null)[]>([]);
  const founderRef      = useRef<HTMLDivElement | null>(null);
  const logosRef        = useRef<HTMLDivElement | null>(null);

  const allCardEls = useRef<Set<HTMLDivElement>>(new Set());
  const registerCard = (el: HTMLDivElement | null) => {
    if (el) allCardEls.current.add(el);
  };

  // Single section-level pointermove → updates every card's --lx/--ly + top border
  useEffect(() => {
    const section = sectionRef.current;
    const border  = topBorderRef.current;
    if (!section) return;

    let targetX = 50;
    let currentX = 50;
    let velocity = 0;
    let rafId = 0;
    let active = false;

    const stiffness = 0.09;
    const damping   = 0.48;

    const tick = () => {
      const force = (targetX - currentX) * stiffness;
      velocity = (velocity + force) * damping;
      currentX += velocity;
      if (border) border.style.setProperty('--tbx', `${currentX.toFixed(3)}%`);
      if (Math.abs(currentX - targetX) > 0.004 || Math.abs(velocity) > 0.004) {
        rafId = requestAnimationFrame(tick);
      } else {
        currentX = targetX;
        velocity = 0;
        rafId = 0;
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      targetX = ((e.clientX - r.left) / r.width) * 100;

      // Update all cards
      allCardEls.current.forEach((el) => {
        if (!el.isConnected) { allCardEls.current.delete(el); return; }
        const cr = el.getBoundingClientRect();
        el.style.setProperty('--lx', `${(e.clientX - cr.left).toFixed(1)}px`);
        el.style.setProperty('--ly', `${(e.clientY - cr.top).toFixed(1)}px`);
      });

      if (!active) {
        if (border) border.style.setProperty('--tb-opacity', '1');
        active = true;
      }
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      if (border) border.style.setProperty('--tb-opacity', '0');
      active = false;
    };

    section.addEventListener('pointermove', onMove as EventListener, { passive: true });
    section.addEventListener('pointerleave', onLeave);
    return () => {
      section.removeEventListener('pointermove', onMove as EventListener);
      section.removeEventListener('pointerleave', onLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const toggleReason = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    itemRefs.current.forEach((ref, index) => {
      if (!ref) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleItems((prev) => {
                const updated = [...prev];
                updated[index] = true;
                return updated;
              });
            }, index * 120);
            observer.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(ref);
      observers.push(observer);
    });

    if (founderRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) { setFounderVisible(true); observer.disconnect(); }
        },
        { threshold: 0.15 }
      );
      observer.observe(founderRef.current);
      observers.push(observer);
    }

    if (logosRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) { setLogosVisible(true); observer.disconnect(); }
        },
        { threshold: 0.05 }
      );
      observer.observe(logosRef.current);
      observers.push(observer);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section ref={sectionRef} className="relative py-12 md:py-16 text-white overflow-hidden" style={{ background: 'transparent' }}>
      <style>{`
        .gc-wrap {
          isolation: isolate;
          --lx: -9999px;
          --ly: -9999px;
        }
        .gc-border {
          position: absolute; inset: 0;
          border-radius: inherit;
          pointer-events: none; z-index: 1;
          border: 1px solid rgba(255,255,255,0.14);
        }
        .gc-border::after {
          content: '';
          position: absolute; inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: radial-gradient(
            400px 400px at var(--lx) var(--ly),
            hsl(var(--gc-color) / 0.9),
            transparent 60%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
        .gc-fill {
          position: absolute; inset: 0;
          border-radius: inherit;
          pointer-events: none; z-index: 0;
          background: radial-gradient(
            340px 340px at var(--lx) var(--ly),
            hsl(var(--gc-color) / 0.07),
            transparent 70%
          );
        }
        .gc-content {
          position: relative; z-index: 2;
          height: 100%; display: flex; flex-direction: column;
        }

        @keyframes slideInLeft {
          0%   { opacity: 0; transform: translateX(-52px); }
          30%  { opacity: 0.6; }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          0%   { opacity: 0; transform: translateX(72px); }
          30%  { opacity: 0.6; }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .wu-animate-left  { animation: slideInLeft  0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .wu-animate-right { animation: slideInRight 1.0s  cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .wu-pre-left  { opacity: 0; transform: translateX(-52px); }
        .wu-pre-right { opacity: 0; transform: translateX(72px); }
        .logos-in  { animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .logos-out { opacity: 0; transform: translateY(20px); }

        .carousel-masked {
          -webkit-mask-image: linear-gradient(
            to right, transparent 0%, black 16%, black 84%, transparent 100%
          );
          mask-image: linear-gradient(
            to right, transparent 0%, black 16%, black 84%, transparent 100%
          );
        }

        .logo-bubble {
          --lx: -9999px;
          --ly: -9999px;
        }
        .logo-bubble-border {
          position: absolute; inset: 0;
          border-radius: 50%;
          pointer-events: none;
          border: 1px solid rgba(255,255,255,0.16);
          z-index: 1;
        }
        .logo-bubble-border::after {
          content: '';
          position: absolute; inset: -1px;
          border-radius: 50%;
          padding: 1px;
          background: radial-gradient(
            280px 280px at var(--lx) var(--ly),
            rgba(180, 180, 255, 0.9),
            transparent 55%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
      `}</style>

      {/* ── Top cursor-following border glow ── */}
      <div
        ref={topBorderRef}
        className="pointer-events-none absolute top-0 left-0 right-0 z-20"
        style={{ height: '1.2px', '--tbx': '50%', '--tb-opacity': '0' } as React.CSSProperties}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.22)' }} />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(600px 80px at var(--tbx) 0%, rgba(255,255,255,0.95) 0%, rgba(180,220,255,0.55) 30%, transparent 70%)',
            opacity: 'var(--tb-opacity)',
            transition: 'opacity 0.4s ease',
          }}
        />
        <div
          className="absolute left-0 right-0"
          style={{
            top: '0px',
            height: '48px',
            background: 'radial-gradient(600px 48px at var(--tbx) 0%, rgba(160,210,255,0.16) 0%, transparent 70%)',
            opacity: 'var(--tb-opacity)',
            transition: 'opacity 0.4s ease',
          }}
        />
      </div>

      {/* ── Vertical black fade overlay: 0% at top → 60% at bottom ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── Left: Accordion reasons ── */}
          <div className="space-y-4">
            <RevealText
              text={t.whyUsTitle}
              className="text-3xl md:text-4xl font-black mb-6 tracking-tight text-white"
            />

            <div className="space-y-3">
              {t.reasons.slice(0, 5).map((reason, index) => {
                const isExpanded = expandedIndex === index;
                const isVisible  = visibleItems[index];

                return (
                  <div
                    key={index}
                    ref={(el) => { itemRefs.current[index] = el; }}
                    className={isVisible ? 'wu-animate-left' : 'wu-pre-left'}
                  >
                    <GlowCard
                      glowColor={glowPalette[index % glowPalette.length]}
                      onClick={() => toggleReason(index)}
                      registerRef={registerCard}
                      className={`
                        rounded-xl cursor-pointer md:cursor-default
                        transition-all duration-300
                        ${isExpanded ? 'translate-y-0.5 translate-x-0.5' : ''}
                      `}
                    >
                      <div className="px-5 py-3">
                        <div className="flex items-start gap-4">
                          <div className="w-6 h-6 rounded-full bg-white/15 border border-white/30 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-base md:text-lg font-bold leading-tight text-white">
                                <WaveText text={reason} />
                              </p>
                              <ChevronDown
                                className={`w-5 h-5 text-white/50 transition-transform duration-300 md:hidden ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            </div>

                            <div className={`
                              overflow-hidden transition-all duration-300
                              ${isExpanded
                                ? 'max-h-40 opacity-100 mt-2'
                                : 'max-h-0 opacity-0 md:max-h-40 md:opacity-100 md:mt-2'}
                            `}>
                              <p className="text-white/70 text-sm leading-relaxed">
                                <WaveText text={t.reasonsDesc[index]} />
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlowCard>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: Founder block ── */}
          <div
            ref={founderRef}
            className={`lg:sticky lg:top-24 ${founderVisible ? 'wu-animate-right' : 'wu-pre-right'}`}
          >
            <GlowCard glowColor="purple" className="rounded-[2rem]" registerRef={registerCard}>
              <div className="p-6 md:p-8">

                <div className="flex items-center gap-5 mb-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/25 flex-shrink-0">
                    <img
                      src="https://i.postimg.cc/sDfZC0mH/Screenshot-20260102-094201-(1)-(1)-(1)-(1).png"
                      alt="Founder"
                      className="w-full h-full object-cover"
                      style={{ transform: 'scale(1.2)', objectPosition: 'center 41%' }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-white/55" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                        Human-Centric AI
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white leading-none">
                      <WaveText text={t.customBuilt} />
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-white/78 text-sm md:text-base leading-relaxed font-medium">
                    <WaveText text={t.customBuiltDesc} />
                  </p>

                  <div className="pt-4 border-t border-white/15 flex items-center gap-3 text-white/90 font-black uppercase tracking-wider text-xs">
                    <Zap className="w-4 h-4 fill-white/90" />
                    <WaveText text={t.rapidDeployment} />
                  </div>
                </div>

              </div>
            </GlowCard>
          </div>

        </div>

        {/* ── Integrations logo carousel ── */}
        <div
          ref={logosRef}
          className={`mt-14 ${logosVisible ? 'logos-in' : 'logos-out'}`}
        >
          <div className="flex items-center gap-3 mb-5 px-1">
            <span className="text-sm font-black tracking-[0.18em] uppercase text-white/50 whitespace-nowrap">
              <WaveText text={t.integrationsLabel} />
            </span>
            <span className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <div className="carousel-masked flex flex-col gap-3.5">
            <LogoCarousel icons={ICONS_ROW1} direction={1} registerRef={registerCard} />
            <LogoCarousel icons={ICONS_ROW2} direction={-1} registerRef={registerCard} />
          </div>
        </div>

      </div>
    </section>
  );
}
