"use client";
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useEffect, useRef, useState, useMemo, ReactNode } from 'react';
import { motion } from 'framer-motion';

// ─── Shared CSS ───────────────────────────────────────────────────────────────
const sharedCSS = `
  @property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }

  /* Idle: slow counter-clockwise conic sweep with randomly varying speed */
  @keyframes idleSpin { to { --angle: -360deg; } }

  .gc2-wrap {
    isolation: isolate;
    --lx: -9999px;
    --ly: -9999px;
    --inside: 0;
    position: relative;
  }

  /* ── Static base border ── */
  .gc2-base-border {
    position: absolute; inset: 0;
    border-radius: inherit;
    pointer-events: none; z-index: 1;
    border: 1.5px solid rgba(255,255,255,0.12);
  }

  /* ── Idle conic sweep (counter-clockwise, slow) ── */
  .gc2-idle {
    position: absolute; inset: -1.5px;
    border-radius: inherit;
    padding: 1.5px;
    --angle: 0deg;
    background: conic-gradient(
      from var(--angle),
      transparent 0%,
      rgba(255,255,255,0.04) 8%,
      rgba(255,255,255,0.50) 14%,
      rgba(255,255,255,0.85) 17%,
      rgba(255,255,255,0.50) 20%,
      rgba(255,255,255,0.04) 27%,
      transparent 38%
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none; z-index: 2;
    /* Base slow rotation — JS overrides animation-duration per card for variety */
    animation: idleSpin var(--idle-dur, 14s) linear infinite;
    /* Fade out when cursor is inside */
    opacity: calc(1 - var(--inside));
    transition: opacity 0.6s ease;
  }

  /* ── Cursor-following bright arc on border ── */
  .gc2-cursor-border {
    position: absolute; inset: -1.5px;
    border-radius: inherit;
    padding: 1.5px;
    background: radial-gradient(
      500px 500px at var(--lx) var(--ly),
      rgba(255,255,255,0.95) 0%,
      rgba(200,220,255,0.5) 20%,
      transparent 55%
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none; z-index: 3;
    opacity: var(--inside);
    transition: opacity 0.4s ease;
  }

  /* ── Cursor inner fill ── */
  .gc2-fill {
    position: absolute; inset: 0;
    border-radius: inherit;
    pointer-events: none; z-index: 0;
    background: radial-gradient(
      380px 380px at var(--lx) var(--ly),
      rgba(255,255,255,0.055) 0%,
      transparent 70%
    );
    opacity: var(--inside);
    transition: opacity 0.4s ease;
  }

  .gc2-content { position: relative; z-index: 4; height: 100%; }

  @keyframes subtleBounce {
    0%, 100% { transform: translateX(0); }
    50%       { transform: translateX(4px); }
  }
  .animate-arrow-bounce { animation: subtleBounce 1.5s ease-in-out infinite; }
`;

// ─── GlowCard2 ────────────────────────────────────────────────────────────────
// Cursor-following bright arc + slow counter-clockwise idle sweep
function GlowCard2({
  children,
  className = '',
  cardIndex = 0,
}: {
  children: ReactNode;
  className?: string;
  cardIndex?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Each card gets a slightly different idle speed (12–22s) for organic feel
    const baseDur = 14 + (cardIndex % 5) * 2.2;
    el.style.setProperty('--idle-dur', `${baseDur}s`);

    // JS-driven random acceleration: periodically tweak animation-duration
    // on the idle element to simulate non-uniform speed without a complex keyframe
    const idleEl = el.querySelector('.gc2-idle') as HTMLElement | null;
    if (idleEl) {
      let rafId = 0;
      let nextTick = 0;

      const jitter = () => {
        const now = performance.now();
        if (now >= nextTick) {
          // randomise duration between 80 % and 130 % of base
          const factor = 0.8 + Math.random() * 0.5;
          idleEl.style.animationDuration = `${(baseDur * factor).toFixed(2)}s`;
          // change every 1.8 – 4.5 s
          nextTick = now + 1800 + Math.random() * 2700;
        }
        rafId = requestAnimationFrame(jitter);
      };
      rafId = requestAnimationFrame(jitter);
      return () => cancelAnimationFrame(rafId);
    }
  }, [cardIndex]);

  // Pointer handlers
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
    <div
      ref={ref}
      className={`gc2-wrap ${className}`}
      style={{ background: '#000' }}
    >
      <div className="gc2-fill" />
      <div className="gc2-base-border" />
      <div className="gc2-idle" />
      <div className="gc2-cursor-border" />
      <div className="gc2-content">{children}</div>
    </div>
  );
}

// ─── WaveText ─────────────────────────────────────────────────────────────────
function WaveText({ text, className = '' }: { text: string; className?: string }) {
  return (
    <motion.span
      className={`inline-block cursor-default ${className}`}
      whileHover="hover"
      initial="initial"
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ whiteSpace: char === ' ' ? 'pre' : undefined }}
          variants={{
            initial: { y: 0, scale: 1 },
            hover: {
              y: -3,
              scale: 1.15,
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

  const planSteps = useMemo(
    () => [t.planStep1, t.planStep2, t.planStep3, t.planStep4],
    [t],
  );

  useEffect(() => {
    if (!isVisible) return;
    if (activeStep >= planSteps.length) { setShowButton(true); return; }

    const full = planSteps[activeStep];
    const current = typedText[activeStep];

    if (current.length < full.length) {
      const timeout = setTimeout(() => {
        setTypedText(prev => {
          const next = [...prev];
          next[activeStep] = full.slice(0, current.length + 1);
          return next;
        });
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

      {/* ── Vertical fade: 85% black at top → 100% black at bottom ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,1) 100%)',
        }}
      />

      <div className="relative max-w-2xl md:max-w-3xl mx-auto px-6 z-10">

        {/* Header */}
        <div className="mb-6 md:mb-10">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-1 md:mb-3">
            <WaveText text={t.workWithUs} />
          </h2>
          <p className="text-xs md:text-sm text-gray-500">
            <WaveText text={t.workWithUsDesc} />
          </p>
        </div>

        {/* Console Box */}
        <GlowCard2 className="mb-8 md:mb-12 rounded-lg" cardIndex={0}>
          <div className="p-5 md:p-8">
            <div className="space-y-2.5 md:space-y-4">
              {planSteps.map((step, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 md:gap-5 transition-opacity duration-300 ${
                    activeStep >= index ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <CheckCircle2
                    className={`w-3.5 h-3.5 md:w-5 md:h-5 shrink-0 transition-colors duration-300 ${
                      typedText[index].length === step.length
                        ? 'text-green-500'
                        : 'text-white/10'
                    }`}
                  />
                  <p className="font-mono text-[13px] md:text-[17px] text-gray-300 leading-none">
                    {typedText[index].length === step.length ? (
                      <WaveText text={typedText[index]} />
                    ) : (
                      <>
                        {typedText[index]}
                        {activeStep === index && (
                          <span className="inline-block w-1.5 h-3 md:w-2 md:h-4 ml-1 bg-white animate-pulse" />
                        )}
                      </>
                    )}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </GlowCard2>

        {/* CTA Button */}
        <div
          className={`flex justify-center transition-all duration-1000 transform ${
            showButton
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <GlowCard2 className="rounded-full" cardIndex={1}>
            <button
              onClick={onBookingClick}
              className="group relative flex items-center gap-3 rounded-full bg-white px-8 py-3 md:px-10 md:py-4 text-sm md:text-base font-black text-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <WaveText text={t.bookCall} className="uppercase tracking-wider text-black" />
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 animate-arrow-bounce shrink-0" />
            </button>
          </GlowCard2>
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
