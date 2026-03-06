import { useRef, useEffect, useState } from 'react';
import { Linkedin, Mail, MessageSquare, X } from 'lucide-react';

// ─── GlowCard (same implementation as Services.tsx) ──────────────────────────
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
      className={`gc-wrap rounded-xl relative ${className}`}
      style={{ background: 'transparent' }}
      onClick={onClick}
    >
      <div className="gc-fill" />
      <div className="gc-border" />
      <div className="gc-content">{children}</div>
    </div>
  );
}

const glowPalette: GlowColor[] = ['cyan', 'purple', 'green', 'amber', 'white'];

// ─── Testimonials ─────────────────────────────────────────────────────────────
export default function Testimonials() {
  const [selectedReview, setSelectedReview] = useState<number | null>(null);
  const [hasRevealed, setHasRevealed] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const reviews = [
    {
      name: "@sarah_tech",
      role: "CEO, TechStart",
      link: "https://linkedin.com",
      icon: "linkedin",
      review: "HaloVision transformed our customer service with their AI agents. Response times dropped by 80% and satisfaction is at an all-time high.",
    },
    {
      name: "@mike_growth",
      role: "Founder, GrowthLab",
      link: "https://facebook.com",
      icon: "message",
      review: "The automation solutions they built for us freed up our team to focus on strategic work. ROI was evident within the first month.",
    },
    {
      name: "@emma_sales",
      role: "Director, SalesForce",
      link: "https://teams.microsoft.com",
      icon: "message",
      review: "Their lead generation AI is incredible. We're now capturing and qualifying leads 24/7 without effort. Conversion is way up.",
    },
    {
      name: "@david_cloud",
      role: "Manager, CloudSync",
      link: "https://twitter.com",
      icon: "mail",
      review: "Working with HaloVision was seamless. They delivered a custom solution that exceeded expectations. Highly responsive team.",
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
    .t-section-reveal {
      opacity: 0;
      transform: translateY(32px) scale(0.98);
      transition: opacity 0.9s cubic-bezier(0.22, 1, 0.36, 1), transform 0.9s cubic-bezier(0.22, 1, 0.36, 1);
    }
    .t-section-reveal.is-visible {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
    .t-title-reveal {
      opacity: 0;
      transform: translateX(-12px);
      transition: opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s;
    }
    .is-visible .t-title-reveal {
      opacity: 1;
      transform: translateX(0);
    }
    .t-marquee-reveal {
      opacity: 0;
      transition: opacity 0.8s ease 0.55s;
    }
    .is-visible .t-marquee-reveal {
      opacity: 1;
    }
    @keyframes t-typing {
      from { width: 0 }
      to   { width: 100% }
    }
    @keyframes t-blink {
      from, to { border-color: transparent }
      50%      { border-color: rgba(255,255,255,0.7) }
    }
    .t-typewriter {
      overflow: hidden;
      white-space: nowrap;
      border-right: 2px solid transparent;
      display: inline-block;
      width: 0;
    }
    .is-visible .t-typewriter {
      animation: t-typing 1.2s steps(20, end) 0.3s forwards,
                 t-blink 0.75s step-end 3;
      animation-delay: 0.3s, 0.3s;
      animation-fill-mode: forwards;
    }
    @keyframes t-marquee {
      0%   { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .t-animate-marquee {
      animation: t-marquee 18s linear infinite;
    }
    .t-pause-marquee:hover .t-animate-marquee {
      animation-play-state: paused;
    }
    .mask-fade {
      mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
      -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
    }
  `;

  return (
    <section ref={sectionRef} className="relative py-8 md:py-12 bg-black overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: css }} />

      <div className={`t-section-reveal relative z-10 ${hasRevealed ? 'is-visible' : ''}`}>

        {/* Header — padded */}
        <div className="max-w-7xl mx-auto px-6 mb-4">
          <div className="inline-block t-title-reveal">
            <h3 className="t-typewriter text-lg md:text-xl font-black text-white tracking-tight uppercase">
              What People Say
            </h3>
          </div>
          <div className="mt-0.5 h-1 w-10 bg-white/30 rounded-full" />
        </div>

        {/* Marquee — full bleed, mask-fade edges like Services */}
        <div className="relative t-pause-marquee mask-fade t-marquee-reveal">
          <div className="flex overflow-hidden py-4">
            <div className="flex gap-4 t-animate-marquee whitespace-nowrap pl-6">
              {infiniteReviews.map((review, index) => (
                <GlowCard
                  key={index}
                  glowColor={glowPalette[index % glowPalette.length]}
                  onClick={() => setSelectedReview(index % reviews.length)}
                  className="flex-shrink-0 w-[245px] md:w-[300px] cursor-pointer group whitespace-normal"
                >
                  <div className="flex flex-col h-full p-4">
                    {/* Quote */}
                    <p className="text-white/75 text-[14px] leading-[20px] mb-3 font-medium italic flex-1">
                      "{review.review}"
                    </p>

                    {/* Author row */}
                    <div className="flex items-center gap-2 mt-auto">
                      <div className="w-5 h-5 rounded-full bg-white/15 border border-white/20 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <a
                          href={review.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="hover:opacity-60 transition-opacity"
                        >
                          <span className="text-white/90 font-black text-[9px] block truncate uppercase leading-none underline decoration-white/20 decoration-1 underline-offset-2">
                            {review.name}
                          </span>
                          <span className="text-white/40 text-[6.5px] font-bold uppercase tracking-wider leading-none mt-0.5 block">
                            {review.role}
                          </span>
                        </a>
                      </div>
                      <div className="text-white/20 group-hover:text-white/60 transition-colors">
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

      {/* Modal */}
      {selectedReview !== null && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="relative max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <GlowCard
              glowColor={glowPalette[selectedReview % glowPalette.length]}
              className="w-full"
            >
              <div className="p-6">
                <button
                  onClick={() => setSelectedReview(null)}
                  className="absolute top-3 right-3 p-1.5 hover:bg-white/10 rounded-full transition-colors z-10"
                >
                  <X className="w-4 h-4 text-white/60" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex-shrink-0" />
                  <div>
                    <a
                      href={reviews[selectedReview].link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-70 transition-opacity"
                    >
                      <span className="font-black text-xs uppercase block text-white/90">
                        {reviews[selectedReview].name}
                      </span>
                      <span className="text-[9px] font-bold text-white/40 uppercase block">
                        {reviews[selectedReview].role}
                      </span>
                    </a>
                  </div>
                </div>

                <p className="text-base font-medium italic leading-snug text-white/80">
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
