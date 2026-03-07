import { useRef, useEffect, useState } from 'react';
import { Linkedin, Mail, MessageSquare, X } from 'lucide-react';

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
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: GlowColor;
  cardIndex?: number;
  onClick?: () => void;
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
      // Pure black background — no blur, no transparency
      style={{ background: '#000000' }}
      onClick={onClick}
    >
      <div className="gc-fill" />
      <div className="gc-border" />
      <div className="gc-idle-border" />
      <div className="gc-content">{children}</div>
    </div>
  );
}

const glowPalette: GlowColor[] = ['cyan', 'purple', 'green', 'amber', 'white'];

export default function Testimonials() {
  const [selectedReview, setSelectedReview] = useState<number | null>(null);
  const [hasRevealed, setHasRevealed] = useState(false);
  const sectionRef      = useRef<HTMLDivElement>(null);
  const bottomBorderRef = useRef<HTMLDivElement>(null);
  const topBorderRef    = useRef<HTMLDivElement>(null);

  // Fire very early — 800px before the section enters the viewport so cards
  // are already mid-scroll when the user first sees them.
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
    const border  = bottomBorderRef.current;
    if (!section || !border) return;
    const top = topBorderRef.current;
    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      border.style.setProperty('--tbx', `${x.toFixed(2)}%`);
      border.style.setProperty('--tb-opacity', '1');
      if (top) {
        top.style.setProperty('--tbx', `${x.toFixed(2)}%`);
        top.style.setProperty('--tb-opacity', '1');
      }
    };
    const onLeave = () => {
      border.style.setProperty('--tb-opacity', '0');
      if (top) top.style.setProperty('--tb-opacity', '0');
    };
    section.addEventListener('pointermove', onMove);
    section.addEventListener('pointerleave', onLeave);
    return () => {
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  const reviews = [
    {
      name: '@sarah_tech',
      role: 'CEO, TechStart',
      link: 'https://linkedin.com',
      icon: 'linkedin',
      review:
        'HaloVision transformed our customer service with their AI agents. Response times dropped by 80% and satisfaction is at an all-time high.',
    },
    {
      name: '@mike_growth',
      role: 'Founder, GrowthLab',
      link: 'https://facebook.com',
      icon: 'message',
      review:
        'The automation solutions they built for us freed up our team to focus on strategic work. ROI was evident within the first month.',
    },
    {
      name: '@emma_sales',
      role: 'Director, SalesForce',
      link: 'https://teams.microsoft.com',
      icon: 'message',
      review:
        "Their lead generation AI is incredible. We're now capturing and qualifying leads 24/7 without effort. Conversion is way up.",
    },
    {
      name: '@david_cloud',
      role: 'Manager, CloudSync',
      link: 'https://twitter.com',
      icon: 'mail',
      review:
        'Working with HaloVision was seamless. They delivered a custom solution that exceeded expectations. Highly responsive team.',
    },
  ];

  const infiniteReviews = [...reviews, ...reviews];

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'linkedin': return <Linkedin className="w-2.5 h-2.5" />;
      case 'mail':     return <Mail className="w-2.5 h-2.5" />;
      default:         return <MessageSquare className="w-2.5 h-2.5" />;
    }
  };

  const css = `
    /* ── Section: completely transparent background ── */
    .t-section { background: transparent; }

    /* ── Title typewriter ── */
    @keyframes t-typing  { from { width: 0 } to { width: 100% } }
    @keyframes t-blink   { from, to { border-color: transparent } 50% { border-color: rgba(255,255,255,0.7) } }

    .t-typewriter {
      overflow: hidden;
      white-space: nowrap;
      /* cursor blink border */
      border-right: 2px solid transparent;
      display: inline-block;
      width: 0;
    }
    .is-visible .t-typewriter {
      animation:
        t-typing 1.2s steps(20, end) 0.3s forwards,
        t-blink  0.75s step-end 3;
      animation-delay: 0.3s, 0.3s;
      animation-fill-mode: forwards;
    }

    /* underline beneath title slides in after typing finishes */
    .t-underline {
      transform: scaleX(0);
      transform-origin: left center;
      transition: transform 0.5s ease 1.6s;
    }
    .is-visible .t-underline { transform: scaleX(1); }

    /* ── Marquee strip ── */
    /*
      Cards start translated 100% to the right (off-screen), then slide to 0.
      The marquee animation then takes over. We use a wrapper translate so the
      infinite-scroll transform and the entry-slide don't interfere.
    */
    @keyframes t-marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }

    /* Entry slide: the whole strip slides in from the right */
    @keyframes t-slide-in {
      from { transform: translateX(110vw); }
      to   { transform: translateX(0);     }
    }

    .t-marquee-outer {
      /* hidden until hasRevealed so the 800px pre-fire doesn't show a flash */
      opacity: 0;
      transition: opacity 0.01s;
    }
    .t-marquee-outer.is-visible {
      opacity: 1;
    }

    /* Inner belt: starts off-screen, slides to rest, then marquee loops */
    .t-marquee-belt {
      display: flex;
    }

    /* Before reveal: belt sits far right — but already running so it's mid-scroll on appear */
    .t-animate-marquee {
      animation: t-marquee 18s linear infinite;
    }

    /* When not yet visible, offset the whole outer strip so cards start outside */
    .t-marquee-outer:not(.is-visible) .t-animate-marquee {
      animation: t-marquee 18s linear infinite;
      /* cards pre-position to the right; opacity 0 on parent hides them */
    }

    /* Pause on hover */
    .t-pause-marquee:hover .t-animate-marquee { animation-play-state: paused; }

    .mask-fade {
      mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
      -webkit-mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
    }

    .bottom-border-glow { --tbx: 50%; --tb-opacity: 0; }
  `;

  return (
    <section
      ref={sectionRef}
      // Fully transparent section — no background, no blur
      className="t-section relative py-8 md:py-12 overflow-hidden"
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className={`relative z-10 ${hasRevealed ? 'is-visible' : ''}`}>
        {/* Title */}
        <div className="max-w-7xl mx-auto px-6 mb-4">
          <div className="inline-block">
            <h3 className="t-typewriter text-lg md:text-xl font-black text-white tracking-tight uppercase">
              What People Say
            </h3>
          </div>
          <div className="t-underline mt-0.5 h-1 w-10 bg-white/50 rounded-full" />
        </div>

        {/* Marquee strip */}
        <div
          className={`t-marquee-outer relative t-pause-marquee mask-fade ${
            hasRevealed ? 'is-visible' : ''
          }`}
        >
          <div className="flex overflow-hidden py-4">
            <div className="t-marquee-belt t-animate-marquee whitespace-nowrap pl-6 gap-4">
              {infiniteReviews.map((review, index) => (
                <GlowCard
                  key={index}
                  glowColor={glowPalette[index % glowPalette.length]}
                  cardIndex={index}
                  onClick={() => setSelectedReview(index % reviews.length)}
                  className="flex-shrink-0 w-[245px] md:w-[300px] cursor-pointer group whitespace-normal"
                >
                  <div className="flex flex-col h-full p-4">
                    <p className="text-white/95 text-[14px] leading-[20px] mb-3 font-medium italic flex-1">
                      "{review.review}"
                    </p>
                    <div className="flex items-center gap-2 mt-auto">
                      <div className="w-5 h-5 rounded-full bg-white/15 border border-white/25 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <a
                          href={review.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:opacity-60 transition-opacity"
                        >
                          <span className="text-white font-black text-[9px] block truncate uppercase leading-none underline decoration-white/20 decoration-1 underline-offset-2">
                            {review.name}
                          </span>
                          <span className="text-white/75 text-[6.5px] font-bold uppercase tracking-wider leading-none mt-0.5 block">
                            {review.role}
                          </span>
                        </a>
                      </div>
                      <div className="text-white/50 group-hover:text-white/80 transition-colors">
                        {getIcon(review.icon)}
                      </div>
                    </div>
                  </div>
                </GlowCard>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top border glow that follows cursor */}
      <div
        ref={topBorderRef}
        className="bottom-border-glow pointer-events-none absolute top-0 left-0 right-0 z-10"
        style={{ height: '1.2px' }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.22)' }} />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(600px 80px at var(--tbx) 0%, rgba(255,255,255,0.95) 0%, rgba(180,220,255,0.55) 30%, transparent 70%)',
            opacity: 'var(--tb-opacity)',
            transition: 'opacity 0.4s ease',
          }}
        />
        <div
          className="absolute left-0 right-0"
          style={{
            top: '0px',
            height: '48px',
            background:
              'radial-gradient(600px 48px at var(--tbx) 0%, rgba(160,210,255,0.16) 0%, transparent 70%)',
            opacity: 'var(--tb-opacity)',
            transition: 'opacity 0.4s ease',
          }}
        />
      </div>

      {/* Bottom border glow that follows cursor */}
      <div
        ref={bottomBorderRef}
        className="bottom-border-glow pointer-events-none absolute bottom-0 left-0 right-0 z-10"
        style={{ height: '1.2px' }}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.22)' }} />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(600px 80px at var(--tbx) 100%, rgba(255,255,255,0.95) 0%, rgba(180,220,255,0.55) 30%, transparent 70%)',
            opacity: 'var(--tb-opacity)',
            transition: 'opacity 0.4s ease',
          }}
        />
        <div
          className="absolute left-0 right-0"
          style={{
            bottom: '0px',
            height: '48px',
            background:
              'radial-gradient(600px 48px at var(--tbx) 100%, rgba(160,210,255,0.16) 0%, transparent 70%)',
            opacity: 'var(--tb-opacity)',
            transition: 'opacity 0.4s ease',
          }}
        />
      </div>

      {/* Modal */}
      {selectedReview !== null && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedReview(null)}
        >
          <div className="relative max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <GlowCard
              glowColor={glowPalette[selectedReview % glowPalette.length]}
              cardIndex={selectedReview}
              className="w-full"
            >
              <div className="p-6">
                <button
                  onClick={() => setSelectedReview(null)}
                  className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-full transition-colors z-10"
                >
                  <X className="w-4 h-4 text-white/70" />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/25 flex-shrink-0" />
                  <div>
                    <a
                      href={reviews[selectedReview].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-70 transition-opacity"
                    >
                      <span className="font-black text-xs uppercase block text-white">
                        {reviews[selectedReview].name}
                      </span>
                      <span className="text-[9px] font-bold text-white/70 uppercase block">
                        {reviews[selectedReview].role}
                      </span>
                    </a>
                  </div>
                </div>
                <p className="text-base font-medium italic leading-snug text-white/90">
                  "{reviews[selectedReview].review}"
                </p>
              </div>
            </GlowCard>
          </div>
        </div>
      )}
    </section>
  );
}
