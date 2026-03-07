"use client";
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useEffect, useRef, useState, useMemo, ReactNode } from 'react';
import { motion } from 'framer-motion';

// ─── CSS ──────────────────────────────────────────────────────────────────────
const sharedCSS = `
  /* ── Shared property for conic border rotation ── */
  @property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }

  /* Console box: constant-speed counter-clockwise sweep — NO JS speed changes */
  @keyframes consoleSpin { to { --angle: -360deg; } }

  /* CTA button: rainbow border that cycles background-position */
  @keyframes rainbowShift {
    0%   { background-position: 0% 50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  /* Arrow bounce */
  @keyframes subtleBounce {
    0%, 100% { transform: translateX(0); }
    50%       { transform: translateX(5px); }
  }
  .animate-arrow-bounce { animation: subtleBounce 1.4s ease-in-out infinite; }

  /* ─── Console GlowCard ─── */
  .gc-console {
    isolation: isolate;
    --lx: -9999px; --ly: -9999px;
    --inside: 0;
    position: relative;
  }
  .gc-console-base {
    position: absolute; inset: 0;
    border-radius: inherit; pointer-events: none; z-index: 1;
    border: 1.5px solid rgba(255,255,255,0.10);
  }
  /* Constant-speed blue conic sweep */
  .gc-console-idle {
    position: absolute; inset: -1.5px;
    border-radius: inherit; padding: 1.5px;
    background: conic-gradient(
      from var(--angle),
      transparent 0%,
      hsl(220 100% 65% / 0.05) 8%,
      hsl(220 100% 70% / 0.50) 14%,
      hsl(220 100% 80% / 0.88) 17%,
      hsl(220 100% 70% / 0.50) 20%,
      hsl(220 100% 65% / 0.05) 27%,
      transparent 38%
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none; z-index: 2;
    /* Pure linear — constant speed, no JS tweaks */
    animation: consoleSpin 18s linear infinite;
    opacity: calc(1 - var(--inside));
    transition: opacity 0.5s ease;
  }
  /* Cursor arc */
  .gc-console-cursor {
    position: absolute; inset: -1.5px;
    border-radius: inherit; padding: 1.5px;
    background: radial-gradient(
      480px 480px at var(--lx) var(--ly),
      hsl(220 100% 75% / 0.95) 0%,
      hsl(220 80% 70% / 0.40) 22%,
      transparent 55%
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none; z-index: 3;
    opacity: var(--inside);
    transition: opacity 0.35s ease;
  }
  .gc-console-fill {
    position: absolute; inset: 0;
    border-radius: inherit; pointer-events: none; z-index: 0;
    background: radial-gradient(
      340px 340px at var(--lx) var(--ly),
      hsl(220 100% 60% / 0.07) 0%, transparent 70%
    );
    opacity: var(--inside);
    transition: opacity 0.35s ease;
  }
  .gc-console-content { position: relative; z-index: 4; height: 100%; }

  /* ─── Rainbow CTA button ─── */
  .cta-btn-wrap {
    position: relative;
    border-radius: 9999px;
    display: inline-block;
  }

  /* Rainbow border — always animated, behind the button */
  .cta-btn-wrap::before,
  .cta-btn-wrap::after {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 9999px;
    background: linear-gradient(
      90deg,
      #ff0080, #ff8c00, #ffe100, #00ff88, #00cfff, #cc00ff, #ff0080
    );
    background-size: 300% 300%;
    animation: rainbowShift 4s linear infinite;
    z-index: 0;
  }
  /* Blurred glow layer underneath */
  .cta-btn-wrap::after {
    filter: blur(14px);
    opacity: 0.65;
  }

  /* The actual button sits above the rainbow layers */
  .cta-btn-inner {
    position: relative;
    z-index: 1;
    border-radius: 9999px;
    overflow: hidden;
  }

  /* Hover inner glow — radial follows pointer via JS --mx/--my */
  .cta-btn-inner::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: radial-gradient(
      180px 180px at var(--mx, 50%) var(--my, 50%),
      rgba(255,255,255,0.22) 0%,
      transparent 70%
    );
    opacity: var(--hover, 0);
    transition: opacity 0.3s ease;
    pointer-events: none;
  }
`;

// ─── Console GlowCard (constant speed, no drift) ──────────────────────────────
function ConsoleCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
  }, []);

  return (
    <div ref={ref} className={`gc-console ${className}`} style={{ background: 'hsl(0 0% 4%)' }}>
      <div className="gc-console-fill" />
      <div className="gc-console-base" />
      <div className="gc-console-idle" />
      <div className="gc-console-cursor" />
      <div className="gc-console-content">{children}</div>
    </div>
  );
}

// ─── Rainbow CTA Button ───────────────────────────────────────────────────────
function RainbowButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  const innerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${((e.clientY - r.top) / r.height * 100).toFixed(1)}%`);
      el.style.setProperty('--hover', '1');
    };
    const onLeave = () => el.style.setProperty('--hover', '0');
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div className="cta-btn-wrap">
      <div className="cta-btn-inner">
        <button
          ref={innerRef}
          onClick={onClick}
          className="relative flex items-center gap-3 bg-white px-8 py-3 md:px-10 md:py-4 text-sm md:text-base font-black text-black hover:scale-[1.03] active:scale-[0.98] transition-transform rounded-full"
          style={{ '--mx': '50%', '--my': '50%', '--hover': '0' } as React.CSSProperties}
        >
          {children}
        </button>
      </div>
    </div>
  );
}

// ─── WaveText ─────────────────────────────────────────────────────────────────
function WaveText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <motion.span className={`inline-block cursor-default ${className}`} whileHover="hover" initial="initial">
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : undefined }}
          variants={{
            initial: { y: 0, scale: 1 },
            hover: { y: -3, scale: 1.15, transition: { type: 'spring', stiffness: 400, damping: 18, delay: i * 0.025 } },
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

// ─── WorkWithUs ───────────────────────────────────────────────────────────────
interface WorkWithUsProps {
  onBookingClick: () => void;
  language: Language;
}

export default function WorkWithUs({ onBookingClick, language }: WorkWithUsProps) {
  const t = translations[language];
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [typedText, setTypedText] = useState(['', '', '', '']);
  const [showButton, setShowButton] = useState(false);

  const planSteps = useMemo(() => [t.planStep1, t.planStep2, t.planStep3, t.planStep4], [t]);

  useEffect(() => {
    if (!isVisible) return;
    if (activeStep >= planSteps.length) { setShowButton(true); return; }
    const full = planSteps[activeStep];
    const current = typedText[activeStep];
    if (current.length < full.length) {
      const timeout = setTimeout(() => {
        setTypedText(prev => { const next = [...prev]; next[activeStep] = full.slice(0, current.length + 1); return next; });
      }, 25);
      return () => clearTimeout(timeout);
    } else {
      const timeout = setTimeout(() => setActiveStep(p => p + 1), 95);
      return () => clearTimeout(timeout);
    }
  }, [isVisible, activeStep, typedText, planSteps]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.4 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-12 md:py-20 text-white w-full border-t border-white/5 overflow-hidden"
      style={{ backgroundColor: '#000000', zIndex: 1, isolation: 'isolate' }}
    >
      <style dangerouslySetInnerHTML={{ __html: sharedCSS }} />

      {/* Vertical fade: 85% black → 100% black */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 0,
          pointerEvents: 'none',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,1) 100%)',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1 }} className="max-w-2xl md:max-w-3xl mx-auto px-6">

        {/* Header */}
        <div className="mb-6 md:mb-10">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-1 md:mb-3">
            <WaveText text={t.workWithUs} />
          </h2>
          <p className="text-xs md:text-sm text-gray-500">
            <WaveText text={t.workWithUsDesc} />
          </p>
        </div>

        {/* Console card — constant-speed idle sweep */}
        <ConsoleCard className="mb-8 md:mb-12 rounded-lg">
          <div className="p-5 md:p-8">
            <div className="space-y-2.5 md:space-y-4">
              {planSteps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 md:gap-5 transition-opacity duration-300 ${activeStep >= index ? 'opacity-100' : 'opacity-0'}`}
                >
                  <CheckCircle2
                    className={`w-3.5 h-3.5 md:w-5 md:h-5 shrink-0 transition-colors duration-300 ${typedText[index].length === step.length ? 'text-green-500' : 'text-white/10'}`}
                  />
                  <p className="font-mono text-[13px] md:text-[17px] text-gray-300 leading-none">
                    {typedText[index].length === step.length ? (
                      <WaveText text={typedText[index]} />
                    ) : (
                      <>
                        {typedText[index]}
                        {activeStep === index && <span className="inline-block w-1.5 h-3 md:w-2 md:h-4 ml-1 bg-white animate-pulse" />}
                      </>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </ConsoleCard>

        {/* Rainbow CTA button */}
        <div className={`flex justify-center transition-all duration-1000 transform ${showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
          <RainbowButton onClick={onBookingClick}>
            <WaveText text={t.bookCall} className="uppercase tracking-wider text-black" />
            <ArrowRight className="w-4 h-4 md:w-5 md:h-5 animate-arrow-bounce shrink-0" />
          </RainbowButton>
        </div>

        {/* Footer */}
        <div className="mt-12 md:mt-20 text-center opacity-60">
          <p className="text-[9px] md:text-[11px] tracking-[0.4em] uppercase">
            <WaveText text={`© ${new Date().getFullYear()} Halovision AI`} />
          </p>
        </div>

      </div>
    </section>
  );
}
