"use client";
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useEffect, useRef, useState, useMemo, ReactNode } from 'react';
import { motion } from 'framer-motion';

// ─── GlowCard (Spotlight border effect) ──────────────────────────────────────
interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'blue' | 'purple' | 'green' | 'red' | 'orange' | 'white';
}

const glowColorMap = {
  blue:   { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green:  { base: 120, spread: 200 },
  red:    { base: 0,   spread: 200 },
  orange: { base: 30,  spread: 200 },
  white:  { base: 0,   spread: 0   },
};

const glowCardCSS = `
  [data-glow]::before,
  [data-glow]::after {
    pointer-events: none;
    content: "";
    position: absolute;
    inset: calc(var(--border-size) * -1);
    border: var(--border-size) solid transparent;
    border-radius: calc(var(--radius) * 1px);
    background-attachment: fixed;
    background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    background-repeat: no-repeat;
    background-position: 50% 50%;
    mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    mask-clip: padding-box, border-box;
    mask-composite: intersect;
  }
  [data-glow]::before {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
      calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
      hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 50) * 1%) / var(--border-spot-opacity, 1)),
      transparent 100%
    );
    filter: brightness(2);
  }
  [data-glow]::after {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
      calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
      hsl(0 100% 100% / var(--border-light-opacity, 1)),
      transparent 100%
    );
  }
  [data-glow] [data-glow] {
    position: absolute;
    inset: 0;
    will-change: filter;
    opacity: var(--outer, 1);
    border-radius: calc(var(--radius) * 1px);
    border-width: calc(var(--border-size) * 20);
    filter: blur(calc(var(--border-size) * 10));
    background: none;
    pointer-events: none;
    border: none;
  }
  [data-glow] > [data-glow]::before {
    inset: -10px;
    border-width: 10px;
  }
  @keyframes subtleBounce {
    0%, 100% { transform: translateX(0); }
    50%       { transform: translateX(4px); }
  }
  .animate-arrow-bounce { animation: subtleBounce 1.5s ease-in-out infinite; }
`;

function GlowCard({ children, className = '', glowColor = 'blue' }: GlowCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const { base, spread } = glowColorMap[glowColor];

  useEffect(() => {
    const sync = (e: PointerEvent) => {
      if (!cardRef.current) return;
      cardRef.current.style.setProperty('--x', e.clientX.toFixed(2));
      cardRef.current.style.setProperty('--xp', (e.clientX / window.innerWidth).toFixed(2));
      cardRef.current.style.setProperty('--y', e.clientY.toFixed(2));
      cardRef.current.style.setProperty('--yp', (e.clientY / window.innerHeight).toFixed(2));
    };
    document.addEventListener('pointermove', sync);
    return () => document.removeEventListener('pointermove', sync);
  }, []);

  return (
    <div
      ref={cardRef}
      data-glow
      className={`relative rounded-lg ${className}`}
      style={{
        '--base': base,
        '--spread': spread,
        '--radius': '8',
        '--border': '1.5',
        '--backdrop': 'hsl(0 0% 4% / 1)',
        '--backup-border': 'hsl(0 0% 100% / 0.08)',
        '--size': '280',
        '--outer': '1',
        '--border-size': 'calc(var(--border, 2) * 1px)',
        '--spotlight-size': 'calc(var(--size, 150) * 1px)',
        '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
        backgroundImage: `radial-gradient(
          var(--spotlight-size) var(--spotlight-size) at
          calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
          hsl(var(--hue, 210) 100% 70% / 0.06),
          transparent
        )`,
        backgroundColor: 'var(--backdrop, transparent)',
        backgroundAttachment: 'fixed',
        border: 'var(--border-size) solid var(--backup-border)',
      } as React.CSSProperties}
    >
      <div data-glow />
      {children}
    </div>
  );
}

// ─── WaveText (letter-level hover, no layout shift) ───────────────────────────
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
              transition: {
                type: 'spring',
                stiffness: 400,
                damping: 18,
                delay: i * 0.025,
              },
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
      className="relative py-12 md:py-20 text-white w-full border-t border-white/5"
      style={{ backgroundColor: '#000000', zIndex: 1, isolation: 'isolate' }}
    >
      <style dangerouslySetInnerHTML={{ __html: glowCardCSS }} />
      <div className="absolute inset-0" style={{ backgroundColor: '#000000', zIndex: -1 }} />

      <div className="max-w-2xl md:max-w-3xl mx-auto px-6">

        {/* Header */}
        <div className="mb-6 md:mb-10">
          <h2 className="text-2xl md:text-4xl font-bold tracking-tight mb-1 md:mb-3">
            <WaveText text={t.workWithUs} />
          </h2>
          <p className="text-xs md:text-sm text-gray-500">
            <WaveText text={t.workWithUsDesc} />
          </p>
        </div>

        {/* Console Box with GlowCard border */}
        <GlowCard className="mb-8 md:mb-12" glowColor="blue">
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
                    {/* WaveText activates only once typing is done */}
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
        </GlowCard>

        {/* CTA Button with GlowCard border */}
        <div
          className={`flex justify-center transition-all duration-1000 transform ${
            showButton
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          <GlowCard glowColor="white" className="rounded-full">
            <button
              onClick={onBookingClick}
              className="group relative flex items-center gap-3 rounded-full bg-white px-8 py-3 md:px-10 md:py-4 text-sm md:text-base font-black text-black hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              <WaveText text={t.bookCall} className="uppercase tracking-wider text-black" />
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5 animate-arrow-bounce shrink-0" />
            </button>
          </GlowCard>
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
