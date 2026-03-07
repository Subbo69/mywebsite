import { Users, Zap, ChevronDown } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useState, useEffect, useRef } from 'react';

// ─── GlowCard — local-coordinate spotlight border ────────────────────────────
const glowHsl: Record<string, string> = {
  cyan:   '190 100% 60%',
  purple: '270 100% 65%',
  green:  '145  90% 55%',
  amber:  ' 38 100% 55%',
  white:  '  0   0% 88%',
};

type GlowColor = keyof typeof glowHsl;

const GLOW_CSS = `
  .gc-wrap {
    isolation: isolate;
    --lx: -9999px; --ly: -9999px; --inside: 0;
    backdrop-filter: blur(60px) saturate(200%);
    -webkit-backdrop-filter: blur(60px) saturate(200%);
  }
  .gc-border {
    position: absolute; inset: 0;
    border-radius: inherit;
    pointer-events: none; z-index: 1;
    border: 1px solid rgba(255,255,255,0.09);
  }
  .gc-border::after {
    content: '';
    position: absolute; inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: radial-gradient(
      200px 200px at var(--lx) var(--ly),
      hsl(var(--gc-color) / calc(var(--inside) * 1)),
      transparent 65%
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
      160px 160px at var(--lx) var(--ly),
      hsl(var(--gc-color) / calc(var(--inside) * 0.07)),
      transparent 70%
    );
  }
  .gc-content {
    position: relative; z-index: 2;
    height: 100%; display: flex; flex-direction: column;
  }
`;

const GLOW_STYLE_ID = 'gc-shared-styles';
function injectGlowStyle() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(GLOW_STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = GLOW_STYLE_ID;
  el.textContent = GLOW_CSS;
  document.head.appendChild(el);
}

function GlowCard({
  children,
  className = '',
  glowColor = 'cyan',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: GlowColor;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const color = glowHsl[glowColor] ?? glowHsl.cyan;

  useEffect(() => {
    injectGlowStyle();
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--gc-color', color);

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--lx', `${(e.clientX - r.left).toFixed(1)}px`);
      el.style.setProperty('--ly', `${(e.clientY - r.top).toFixed(1)}px`);
      el.style.setProperty('--inside', '1');
    };
    const onLeave = () => el.style.setProperty('--inside', '0');

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [color]);

  return (
    <div
      ref={ref}
      className={`gc-wrap relative ${className}`}
      style={{ background: 'rgba(15, 15, 25, 0.35)' }}
      onClick={onClick}
    >
      <div className="gc-fill" />
      <div className="gc-border" />
      <div className="gc-content">{children}</div>
    </div>
  );
}

const glowPalette: GlowColor[] = ['cyan', 'purple', 'green', 'amber', 'white'];

// ─── WhyUs ────────────────────────────────────────────────────────────────────
interface WhyUsProps {
  language: Language;
}

export default function WhyUs({ language }: WhyUsProps) {
  const t = translations[language];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(5).fill(false));
  const [founderVisible, setFounderVisible] = useState(false);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const founderRef = useRef<HTMLDivElement | null>(null);

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
          if (entry.isIntersecting) {
            setFounderVisible(true);
            observer.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(founderRef.current);
      observers.push(observer);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section className="relative py-12 md:py-16 bg-transparent text-white overflow-hidden">
      <style>{`
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
        .wu-animate-left  { animation: slideInLeft  0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .wu-animate-right { animation: slideInRight 1.0s  cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .wu-pre-left  { opacity: 0; transform: translateX(-52px); }
        .wu-pre-right { opacity: 0; transform: translateX(72px); }
      `}</style>

      <div className="relative max-w-7xl mx-auto px-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── Left: Accordion reasons ───────────────────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight text-white">
              {t.whyUsTitle}
            </h2>

            <div className="space-y-3">
              {t.reasons.slice(0, 5).map((reason, index) => {
                const isExpanded = expandedIndex === index;
                const isVisible  = visibleItems[index];

                return (
                  <div
                    key={index}
                    ref={(el) => { itemRefs.current[index] = el; }}
                    className={`${isVisible ? 'wu-animate-left' : 'wu-pre-left'}`}
                  >
                    <GlowCard
                      glowColor={glowPalette[index % glowPalette.length]}
                      onClick={() => toggleReason(index)}
                      className={`
                        rounded-xl cursor-pointer md:cursor-default
                        transition-all duration-300
                        ${isExpanded ? 'translate-y-0.5 translate-x-0.5' : ''}
                      `}
                    >
                      <div className="px-5 py-3">
                        <div className="flex items-start gap-4">
                          {/* Number badge */}
                          <div className="w-6 h-6 rounded-full bg-white/10 border border-white/20 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-base md:text-lg font-bold leading-tight text-white/90">
                                {reason}
                              </p>
                              <ChevronDown
                                className={`w-5 h-5 text-white/40 transition-transform duration-300 md:hidden ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            </div>

                            <div className={`
                              overflow-hidden transition-all duration-300
                              ${isExpanded
                                ? 'max-h-40 opacity-100 mt-2'
                                : 'max-h-0 opacity-0 md:max-h-40 md:opacity-100 md:mt-2'}
                            `}>
                              <p className="text-white/55 text-sm leading-relaxed">
                                {t.reasonsDesc[index]}
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

          {/* ── Right: Founder block ──────────────────────────────────────── */}
          <div
            ref={founderRef}
            className={`lg:sticky lg:top-24 ${founderVisible ? 'wu-animate-right' : 'wu-pre-right'}`}
          >
            <GlowCard glowColor="purple" className="rounded-[2rem]">
              <div className="p-6 md:p-8">

                <div className="flex items-center gap-5 mb-6">
                  {/* Founder photo */}
                  <div className="w-20 h-20 rounded-full overflow-hidden border border-white/20 flex-shrink-0">
                    <img
                      src="https://i.postimg.cc/sDfZC0mH/Screenshot-20260102-094201-(1)-(1)-(1)-(1).png"
                      alt="Founder"
                      className="w-full h-full object-cover"
                      style={{ transform: 'scale(1.2)', objectPosition: 'center 41%' }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-5 h-5 text-white/50" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        Human-Centric AI
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white leading-none">
                      {t.customBuilt}
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-white/65 text-sm md:text-base leading-relaxed font-medium">
                    {t.customBuiltDesc}
                  </p>

                  <div className="pt-4 border-t border-white/10 flex items-center gap-3 text-white/80 font-black uppercase tracking-wider text-xs">
                    <Zap className="w-5 h-5 fill-white/80" />
                    <span>{t.rapidDeployment}</span>
                  </div>
                </div>

              </div>
            </GlowCard>
          </div>

        </div>
      </div>
    </section>
  );
}
