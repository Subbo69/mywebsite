import { useRef, useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Linkedin, Mail, MessageSquare, X, ChevronLeft, ChevronRight } from 'lucide-react';

const glowHsl: Record<string, string> = {
  cyan:   '190 100% 60%',
  purple: '270 100% 65%',
  green:  '145  90% 55%',
  amber:  ' 38 100% 55%',
  white:  '  0   0% 88%',
};

type GlowColor = keyof typeof glowHsl;

const GLOW_CSS = `
  @property --angle { syntax: '<angle>'; initial-value: 0deg; inherits: false; }
  @keyframes borderRotate { to { --angle: 360deg; } }
  .gc-wrap { isolation: isolate; --lx: -9999px; --ly: -9999px; --inside: 0; }
  .gc-border { position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 1; border: 1.2px solid rgba(255,255,255,0.22); }
  .gc-border::after { content: ''; position: absolute; inset: -1.2px; border-radius: inherit; padding: 1.2px; background: radial-gradient(520px 520px at var(--lx) var(--ly), hsl(var(--gc-color) / calc(var(--inside) * 1)), transparent 60%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
  .gc-idle-border { position: absolute; inset: -1.2px; border-radius: inherit; padding: 1.2px; --angle: 0deg; background: conic-gradient(from var(--angle), transparent 0%, hsl(var(--gc-color) / 0.06) 8%, hsl(var(--gc-color) / 0.55) 14%, hsl(var(--gc-color) / 0.9) 17%, hsl(var(--gc-color) / 0.55) 20%, hsl(var(--gc-color) / 0.06) 27%, transparent 38%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; z-index: 2; animation: borderRotate var(--idle-duration, 6s) linear infinite var(--idle-delay, 0s); opacity: calc(1 - var(--inside)); transition: opacity 0.5s ease; }
  .gc-fill { position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 0; background: radial-gradient(420px 420px at var(--lx) var(--ly), hsl(var(--gc-color) / calc(var(--inside) * 0.13)), transparent 70%); }
  .gc-content { position: relative; z-index: 3; height: 100%; display: flex; flex-direction: column; }
  @keyframes t-modal-in { from { opacity: 0; transform: scale(0.94) translateY(12px); } to { opacity: 1; transform: scale(1) translateY(0); } }
  .t-modal-card { animation: t-modal-in 0.28s cubic-bezier(0.22,1,0.36,1) forwards; }
  @keyframes t-overlay-in { from { opacity: 0; } to { opacity: 1; } }
  .t-overlay { animation: t-overlay-in 0.2s ease forwards; }
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
  cardIndex = 0,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: GlowColor;
  cardIndex?: number;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const color = glowHsl[glowColor] ?? glowHsl.cyan;

  useEffect(() => {
    injectGlowStyle();
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--gc-color', color);
    el.style.setProperty('--idle-delay', `${-(cardIndex * 0.35) % 8}s`);
    el.style.setProperty('--idle-duration', `${5 + (cardIndex % 5) * 0.7}s`);
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
  }, [color, cardIndex]);

  return (
    <div
      ref={ref}
      className={`gc-wrap rounded-xl relative ${className}`}
      style={{ background: '#000000', ...style }}
    >
      <div className="gc-fill" />
      <div className="gc-border" />
      <div className="gc-idle-border" />
      <div className="gc-content">{children}</div>
    </div>
  );
}

interface Review {
  name: string;
  role: string;
  link: string;
  icon: string;
  review: string;
}

interface TranslatedReview {
  name: string;
  role: string;
  review: string;
}

// Static data that never changes (links, icons, fallback content)
const reviewsBase: Review[] = [
  { name: '@sarah_tech', role: 'CEO, TechStart', link: 'https://linkedin.com', icon: 'linkedin', review: 'HaloVision transformed our customer service with their AI agents. Response times dropped by 80% and satisfaction is at an all-time high.' },
  { name: '@mike_growth', role: 'Founder, GrowthLab', link: 'https://facebook.com', icon: 'message', review: 'The automation solutions they built for us freed up our team to focus on strategic work. ROI was evident within the first month.' },
  { name: '@emma_sales', role: 'Director, SalesForce', link: 'https://teams.microsoft.com', icon: 'message', review: "Their lead generation AI is incredible. We're now capturing and qualifying leads 24/7 without effort. Conversion is way up." },
  { name: '@david_cloud', role: 'Manager, CloudSync', link: 'https://twitter.com', icon: 'mail', review: 'Working with HaloVision was seamless. They delivered a custom solution that exceeded expectations. Highly responsive team.' },
  { name: '@lisa_ops', role: 'COO, ScaleUp', link: 'https://linkedin.com', icon: 'linkedin', review: 'The workflow automation cut our manual processing by 70%. The team was professional, fast, and incredibly responsive throughout.' },
];

const glowPalette: GlowColor[] = ['cyan', 'purple', 'green', 'amber', 'white'];

function getIconNode(icon: string) {
  if (icon === 'linkedin') return <Linkedin className="w-3 h-3" />;
  if (icon === 'mail') return <Mail className="w-3 h-3" />;
  return <MessageSquare className="w-3 h-3" />;
}

function openLink(url: string, e: React.MouseEvent) {
  e.stopPropagation();
  window.open(url, '_blank', 'noopener,noreferrer');
}

function FocusModal({
  review,
  reviewIdx,
  openLabel,
  onClose,
}: {
  review: Review & { translatedReview: string; translatedRole: string };
  reviewIdx: number;
  openLabel: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return createPortal(
    <div
      className="t-overlay fixed inset-0 z-[9999] flex items-center justify-center p-6"
      style={{
        backdropFilter: 'blur(12px) brightness(0.4)',
        WebkitBackdropFilter: 'blur(12px) brightness(0.4)',
        background: 'rgba(0,0,0,0.75)',
      }}
      onClick={onClose}
    >
      <div
        className="t-modal-card relative w-full"
        style={{ maxWidth: 400 }}
        onClick={(e) => e.stopPropagation()}
      >
        <GlowCard
          glowColor={glowPalette[reviewIdx % glowPalette.length]}
          cardIndex={reviewIdx}
          className="w-full"
        >
          <div className="p-6">
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-full transition-colors z-10"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
            <p className="text-sm font-medium italic leading-relaxed text-white/90 mb-5 pr-6">
              {'\u201C'}{review.translatedReview}{'\u201D'}
            </p>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 border border-white/25 flex-shrink-0" />
                <div>
                  <span className="font-black text-[10px] uppercase block text-white leading-none">
                    {review.name}
                  </span>
                  <span className="text-[8px] font-bold text-white/60 uppercase tracking-wider block mt-0.5">
                    {review.translatedRole}
                  </span>
                </div>
              </div>
              <button
                onClick={(e) => openLink(review.link, e)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 hover:border-white/50 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all duration-200 text-[10px] font-bold uppercase tracking-wider flex-shrink-0"
              >
                {getIconNode(review.icon)}
                <span>{openLabel}</span>
              </button>
            </div>
          </div>
        </GlowCard>
      </div>
    </div>,
    document.body
  );
}

interface TestimonialsProps {
  t?: {
    title?: string;
    open?: string;
    reviews?: TranslatedReview[];
  };
}

export default function Testimonials({ t = {} }: TestimonialsProps) {
  const label = {
    title: t.title ?? 'What People Say',
    open: t.open ?? 'Open',
  };

  // Merge translated text with static base data (links, icons)
  const reviews = reviewsBase.map((base, i) => ({
    ...base,
    translatedReview: t.reviews?.[i]?.review ?? base.review,
    translatedRole: t.reviews?.[i]?.role ?? base.role,
  }));

  const [activeIndex, setActiveIndex] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragOffsetX, setDragOffsetX] = useState(0);
  const [flyDirection, setFlyDirection] = useState<null | 'left' | 'right'>(null);
  const [hasRevealed, setHasRevealed] = useState(false);
  const [selectedReview, setSelectedReview] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const topBorderRef = useRef<HTMLDivElement>(null);
  const animatingRef = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0, rootMargin: '800px 0px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const top = topBorderRef.current;
    if (!section || !top) return;
    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      top.style.setProperty('--tbx', `${x.toFixed(2)}%`);
      top.style.setProperty('--tb-opacity', '1');
    };
    const onLeave = () => top.style.setProperty('--tb-opacity', '0');
    section.addEventListener('pointermove', onMove);
    section.addEventListener('pointerleave', onLeave);
    return () => {
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const goTo = useCallback((dir: 'left' | 'right') => {
    if (animatingRef.current) return;
    animatingRef.current = true;
    setFlyDirection(dir);
    setTimeout(() => {
      setActiveIndex((prev) =>
        dir === 'right'
          ? (prev + 1) % reviews.length
          : (prev - 1 + reviews.length) % reviews.length
      );
      setFlyDirection(null);
      setDragOffsetX(0);
      animatingRef.current = false;
    }, 320);
  }, [reviews.length]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (animatingRef.current) return;
    setDragging(true);
    setDragStartX(e.clientX);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setDragOffsetX(e.clientX - dragStartX);
  };

  const onPointerUp = useCallback((reviewIdx: number) => {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(dragOffsetX) > 80) {
      goTo(dragOffsetX < 0 ? 'right' : 'left');
    } else if (Math.abs(dragOffsetX) < 6) {
      setSelectedReview(reviewIdx);
      setDragOffsetX(0);
    } else {
      setDragOffsetX(0);
    }
  }, [dragging, dragOffsetX, goTo]);

  const stackIndices = [
    (activeIndex + 2) % reviews.length,
    (activeIndex + 1) % reviews.length,
    activeIndex,
  ];

  const flyX = flyDirection === 'left' ? -420 : flyDirection === 'right' ? 420 : dragOffsetX;
  const flyRotate = flyDirection
    ? flyDirection === 'left' ? -18 : 18
    : dragOffsetX * 0.04;

  const css = `
    @keyframes t-typing  { from { width: 0 } to { width: 100% } }
    @keyframes t-blink   { from, to { border-color: transparent } 50% { border-color: rgba(255,255,255,0.7) } }
    .t-typewriter { overflow: hidden; white-space: nowrap; border-right: 2px solid transparent; display: inline-block; width: 0; }
    .is-visible .t-typewriter { animation: t-typing 1.2s steps(20,end) 0.3s forwards, t-blink 0.75s step-end 3; animation-fill-mode: forwards; }
    .t-underline { transform: scaleX(0); transform-origin: left center; transition: transform 0.5s ease 1.6s; }
    .is-visible .t-underline { transform: scaleX(1); }
    .bottom-border-glow { --tbx: 50%; --tb-opacity: 0; }
  `;

  return (
    <section
      ref={sectionRef}
      className="relative py-10 md:py-16 overflow-hidden"
      style={{ background: 'transparent' }}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className={`relative z-10 ${hasRevealed ? 'is-visible' : ''}`}>
        <div className="max-w-7xl mx-auto px-6 mb-8 md:flex md:flex-col md:items-center">
          <div className="inline-block">
            <h3
              className="t-typewriter text-lg md:text-xl font-black text-white tracking-tight uppercase"
              style={{ filter: 'drop-shadow(0 0 10px rgba(180,220,255,0.7)) drop-shadow(0 0 24px rgba(140,200,255,0.35))' }}
            >
              {label.title}
            </h3>
            <div className="t-underline mt-1 h-[2px] w-full bg-white/40 rounded-full" />
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 px-6">
          <div className="relative" style={{ width: '100%', maxWidth: 420, height: 220 }}>
            {stackIndices.map((reviewIdx, stackPos) => {
              const isTop = stackPos === 2;
              const offset = (2 - stackPos) * 10;
              const scale = 1 - (2 - stackPos) * 0.055;
              const zIndex = stackPos + 1;
              const opacity = 1 - (2 - stackPos) * 0.18;

              const cardStyle: React.CSSProperties = isTop
                ? {
                    transform: `scale(${scale}) translateY(${offset}px) translateX(${flyX}px) rotate(${flyRotate}deg)`,
                    transition: dragging
                      ? 'none'
                      : flyDirection
                      ? 'transform 0.32s cubic-bezier(0.4,0,0.2,1), opacity 0.32s ease'
                      : 'transform 0.25s cubic-bezier(0.22,1,0.36,1)',
                    opacity: flyDirection ? 0 : 1,
                    zIndex,
                    position: 'absolute' as const,
                    inset: 0,
                    cursor: dragging ? 'grabbing' : 'grab',
                  }
                : {
                    transform: `scale(${scale}) translateY(${offset}px)`,
                    transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1)',
                    opacity,
                    zIndex,
                    position: 'absolute' as const,
                    inset: 0,
                    pointerEvents: 'none' as const,
                  };

              const r = reviews[reviewIdx];

              return (
                <div
                  key={`${reviewIdx}-${stackPos}`}
                  style={cardStyle}
                  onPointerDown={isTop ? onPointerDown : undefined}
                  onPointerMove={isTop ? onPointerMove : undefined}
                  onPointerUp={isTop ? () => onPointerUp(reviewIdx) : undefined}
                  onPointerCancel={isTop ? () => setDragging(false) : undefined}
                >
                  <GlowCard
                    glowColor={glowPalette[reviewIdx % glowPalette.length]}
                    cardIndex={reviewIdx}
                    className="w-full h-full select-none"
                  >
                    <div className="flex flex-col h-full p-5">
                      <div className="flex-1 min-h-0 relative mb-4 overflow-hidden">
                        <p className="text-white/95 leading-relaxed font-medium italic" style={{ fontSize: '15.4px' }}>
                          {'\u201C'}{r.translatedReview}{'\u201D'}
                        </p>
                        <div
                          className="absolute bottom-0 left-0 right-0 h-6 pointer-events-none"
                          style={{ background: 'linear-gradient(to bottom, transparent, #000000)' }}
                        />
                      </div>
                      <div className="flex items-center gap-3 mt-auto">
                        <div className="w-7 h-7 rounded-full bg-white/15 border border-white/25 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="text-white font-black text-[10px] block truncate uppercase leading-none">
                            {r.name}
                          </span>
                          <span className="text-white/70 text-[8px] font-bold uppercase tracking-wider leading-none mt-0.5 block">
                            {r.translatedRole}
                          </span>
                        </div>
                        <div className="text-white/30">
                          {getIconNode(r.icon)}
                        </div>
                      </div>
                    </div>
                  </GlowCard>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => goTo('left')}
              className="p-2 rounded-full border border-white/15 hover:border-white/40 bg-black/40 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex gap-1.5">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    if (animatingRef.current || i === activeIndex) return;
                    const dir = i > activeIndex ? 'right' : 'left';
                    animatingRef.current = true;
                    setFlyDirection(dir);
                    setTimeout(() => {
                      setActiveIndex(i);
                      setFlyDirection(null);
                      setDragOffsetX(0);
                      animatingRef.current = false;
                    }, 320);
                  }}
                  className="transition-all duration-300 rounded-full"
                  style={{
                    width: i === activeIndex ? 20 : 6,
                    height: 6,
                    background: i === activeIndex ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.25)',
                  }}
                />
              ))}
            </div>

            <button
              onClick={() => goTo('right')}
              className="p-2 rounded-full border border-white/15 hover:border-white/40 bg-black/40 hover:bg-white/10 text-white/60 hover:text-white transition-all duration-200"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={topBorderRef}
        className="bottom-border-glow pointer-events-none absolute top-0 left-0 right-0 z-10"
        style={{ height: '1.2px' }}
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

      {selectedReview !== null && (
        <FocusModal
          review={reviews[selectedReview]}
          reviewIdx={selectedReview}
          openLabel={label.open}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </section>
  );
}
