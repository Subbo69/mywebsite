import { ArrowRight, Send, Play, X, ChevronDown } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useEffect, useRef, useState } from 'react';

interface HeroProps {
  onBookingClick: () => void;
  onAskAIClick: (initialMessage?: string) => void;
  language: Language;
}

function getDeviceTier(): 'low' | 'medium' | 'high' {
  if (typeof window === 'undefined') return 'medium';
  const cores = navigator.hardwareConcurrency ?? 2;
  const width = window.innerWidth;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouch || cores <= 2 || width < 768) return 'low';
  if (cores <= 4 || width < 1280) return 'medium';
  return 'high';
}

const TIER_CONFIG = {
  low:    { count: 420,  fps: 30 },
  medium: { count: 700,  fps: 45 },
  high:   { count: 1100, fps: 60 },
};

// Google brand palette — soft, slightly desaturated so dust feels ambient
const DUST_COLORS = [
  { r: 100, g: 149, b: 237 }, // cornflower blue
  { r: 66,  g: 133, b: 244 }, // Google blue
  { r: 30,  g: 100, b: 200 }, // deep blue
  { r: 234, g: 67,  b: 53  }, // Google red
  { r: 200, g: 50,  b: 45  }, // deep red
  { r: 251, g: 188, b: 5   }, // Google yellow
  { r: 255, g: 214, b: 80  }, // light gold
  { r: 52,  g: 168, b: 83  }, // Google green
  { r: 35,  g: 140, b: 65  }, // deep green
];

export default function Hero({ onBookingClick, onAskAIClick, language }: HeroProps) {
  const t = translations[language];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(0);
  const [scrollScale, setScrollScale] = useState(0.88);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const [messageCount, setMessageCount] = useState(0);
  const [placeholder, setPlaceholder] = useState('');
  const placeholderPhrases = [t.howCanWeHelp, t.heroPlaceholder1, t.heroPlaceholder2, t.heroPlaceholder3];
  const [phraseIdx, setPhraseIdx] = useState(0);

  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [isHoveringVideo, setIsHoveringVideo] = useState(false);

  const fullText = t.heroTitle;
  const VIDEO_ID = 'Py1ClI35v_k';
  const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // ── Custom cursor follower for video ───────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoContainerRef.current) return;
    const rect = videoContainerRef.current.getBoundingClientRect();
    setTargetPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useEffect(() => {
    if (!isHoveringVideo || isModalOpen) return;
    let af: number;
    const follow = () => {
      setCurrentPos(prev => ({
        x: prev.x + (targetPos.x - prev.x) * 0.12,
        y: prev.y + (targetPos.y - prev.y) * 0.12,
      }));
      af = requestAnimationFrame(follow);
    };
    af = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(af);
  }, [targetPos, isHoveringVideo, isModalOpen]);

  // ── Animation Orchestration ────────────────────────────────────────
  useEffect(() => {
    if (!isTyping && displayText.length === fullText.length) {
      const t1 = setTimeout(() => {
        setShowSubtitle(true);
        const t2 = setTimeout(() => {
          setShowCTA(true);
          const t3 = setTimeout(() => {
            setShowInput(true);
            const t4 = setTimeout(() => {
              setShowParticles(true);
              heroInputRef.current?.focus({ preventScroll: true });
            }, 800);
            return () => clearTimeout(t4);
          }, 1000);
          return () => clearTimeout(t3);
        }, 2200);
        return () => clearTimeout(t2);
      }, 600);
      return () => clearTimeout(t1);
    }
  }, [isTyping, displayText, fullText]);

  // ── Placeholder typewriter ─────────────────────────────────────────
  useEffect(() => {
    let cur = ''; let del = false; let timer: NodeJS.Timeout;
    const type = () => {
      const phrase = placeholderPhrases[phraseIdx];
      let speed = 80;
      if (!del) {
        cur = phrase.slice(0, cur.length + 1);
        if (cur === phrase) { speed = 3500; del = true; }
      } else {
        cur = phrase.slice(0, cur.length - 1); speed = 40;
        if (cur === '') { del = false; setPhraseIdx(p => (p + 1) % placeholderPhrases.length); speed = 1000; }
      }
      setPlaceholder(cur); timer = setTimeout(type, speed);
    };
    timer = setTimeout(type, 500);
    return () => clearTimeout(timer);
  }, [phraseIdx, language]);

  // ── Title typewriter ───────────────────────────────────────────────
  useEffect(() => {
    let i = 0; let mounted = true;
    setDisplayText(''); setIsTyping(false);
    setShowSubtitle(false); setShowCTA(false);
    setShowInput(false); setShowParticles(false);
    const type = () => {
      if (!mounted) return;
      if (i <= fullText.length) {
        setIsTyping(true);
        setDisplayText(fullText.slice(0, i++));
        setTimeout(type, Math.random() * 25 + 45);
      } else { setIsTyping(false); }
    };
    const t0 = setTimeout(type, 2000);
    return () => { mounted = false; clearTimeout(t0); };
  }, [fullText]);

  // ── Scroll parallax ────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const p = Math.min(Math.max((window.scrollY - 50) / 300, 0), 1);
      setScrollOpacity(p); setScrollScale(0.88 + p * 0.12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Dust Particle Canvas ───────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tier = getDeviceTier();
    const cfg = TIER_CONFIG[tier];
    const FRAME_INTERVAL = 1000 / cfg.fps;

    // Each "dust mote" is a tiny soft circle that drifts and reacts to mouse wind
    type Mote = {
      x: number; y: number;
      originX: number; originY: number;
      vx: number; vy: number;
      radius: number;
      r: number; g: number; b: number;
      baseOpacity: number;
      opacity: number;
      drift: number;      // personal drift speed
      driftAngle: number; // direction of ambient drift
      driftPhase: number; // phase offset for oscillation
    };

    let motes: Mote[] = [];
    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, prevX: -9999, prevY: -9999 };
    let last = 0; let rafId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const randomColor = () => DUST_COLORS[Math.floor(Math.random() * DUST_COLORS.length)];

    const init = () => {
      motes = [];
      for (let i = 0; i < cfg.count; i++) {
        const col = randomColor();
        const radius = 0.6 + Math.random() * 2.8; // tiny motes: 0.6–3.4 px
        motes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          originX: Math.random() * canvas.width,
          originY: Math.random() * canvas.height,
          vx: 0, vy: 0,
          radius,
          r: col.r, g: col.g, b: col.b,
          baseOpacity: 0.08 + Math.random() * 0.35,
          opacity: 0,
          drift: 0.08 + Math.random() * 0.18,
          driftAngle: Math.random() * Math.PI * 2,
          driftPhase: Math.random() * Math.PI * 2,
        });
      }
    };

    let elapsed = 0;
    const animate = (ts: number) => {
      rafId = requestAnimationFrame(animate);
      if (ts - last < FRAME_INTERVAL) return;
      const dt = ts - last;
      last = ts;
      elapsed += dt * 0.001; // seconds

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Decay mouse velocity
      mouse.vx *= 0.88;
      mouse.vy *= 0.88;

      const WIND_RADIUS = 260;
      const WIND_FORCE = 0.22;
      const SPRING = 0.0018;    // very gentle spring — motes wander far
      const FRICTION = 0.97;    // high friction — silky, not bouncy

      for (const m of motes) {
        // Fade in
        m.opacity = Math.min(m.opacity + 0.004, m.baseOpacity);

        // Ambient oscillating drift
        const driftX = Math.cos(m.driftAngle + elapsed * m.drift) * m.drift * 0.4;
        const driftY = Math.sin(m.driftAngle * 0.7 + elapsed * m.drift + m.driftPhase) * m.drift * 0.3;

        // Mouse wind
        const dx = m.x - mouse.x;
        const dy = m.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < WIND_RADIUS && mouse.x !== -9999) {
          const falloff = (1 - dist / WIND_RADIUS) ** 2; // quadratic falloff — sharper centre
          m.vx += mouse.vx * WIND_FORCE * falloff;
          m.vy += mouse.vy * WIND_FORCE * falloff;
        }

        // Soft spring back towards origin (very loose)
        m.vx += (m.originX - m.x) * SPRING;
        m.vy += (m.originY - m.y) * SPRING;

        // Integrate
        m.vx = (m.vx + driftX) * FRICTION;
        m.vy = (m.vy + driftY) * FRICTION;
        m.x += m.vx;
        m.y += m.vy;

        // Draw soft glowing dot
        const grd = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.radius * 2.5);
        grd.addColorStop(0,   `rgba(${m.r},${m.g},${m.b},${m.opacity})`);
        grd.addColorStop(0.4, `rgba(${m.r},${m.g},${m.b},${m.opacity * 0.6})`);
        grd.addColorStop(1,   `rgba(${m.r},${m.g},${m.b},0)`);

        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (mouse.prevX === -9999) {
        mouse.x = e.clientX; mouse.y = e.clientY;
        mouse.prevX = e.clientX; mouse.prevY = e.clientY; return;
      }
      const rawVx = e.clientX - mouse.prevX;
      const rawVy = e.clientY - mouse.prevY;
      mouse.vx = mouse.vx * 0.55 + rawVx * 0.45;
      mouse.vy = mouse.vy * 0.55 + rawVy * 0.45;
      mouse.prevX = mouse.x; mouse.prevY = mouse.y;
      mouse.x = e.clientX; mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    resize();
    window.addEventListener('resize', resize, { passive: true });
    init();
    rafId = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || messageCount >= 25) return;
    onAskAIClick(query);
    setMessageCount(prev => prev + 1);
    setIsSent(true); setQuery('');
    setTimeout(() => setIsSent(false), 3000);
  };

  return (
    <section
      className="relative min-h-screen flex flex-col items-center bg-[#fafaf9] text-black overflow-x-hidden pt-28 pb-12"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;600;700&family=Montserrat:wght@400;600;700;900&display=swap');

        @keyframes blink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes bounce-down { 0%,100%{transform:translateY(0)}50%{transform:translateY(8px)} }
        @keyframes title-rise { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer-lr {
          0%  { left:0%;   width:0%;    opacity:0 }
          35% { left:0%;   width:60%;   opacity:1 }
          65% { left:0%;   width:100%;  opacity:1 }
          100%{ left:100%; width:0%;    opacity:0 }
        }
        @keyframes grain {
          0%,100%{transform:translate(0,0)}
          10%{transform:translate(-2%,-3%)}
          20%{transform:translate(3%,2%)}
          30%{transform:translate(-1%,4%)}
          40%{transform:translate(4%,-2%)}
          50%{transform:translate(-3%,1%)}
          60%{transform:translate(2%,3%)}
          70%{transform:translate(-4%,-1%)}
          80%{transform:translate(1%,-4%)}
          90%{transform:translate(3%,2%)}
        }
        @keyframes soft-pulse { 0%,100%{opacity:.45} 50%{opacity:.7} }

        .cursor-blink { animation: blink 1s step-end infinite; }
        .typewriter-cursor {
          display:inline-block; width:3px; height:.95em;
          margin-left:3px; vertical-align:middle;
          background: linear-gradient(to bottom, #ea4335, #4285f4);
          border-radius:2px;
        }
        .bounce-down { animation: bounce-down 1.3s ease-in-out infinite; }
        .title-rise  { animation: title-rise 1.4s cubic-bezier(.22,1,.36,1) forwards; }

        .shimmer-underline {
          position:absolute; bottom:-5px; height:1.5px;
          background:linear-gradient(90deg,transparent,#18181b 40%,#18181b 60%,transparent);
          animation: shimmer-lr 2.4s cubic-bezier(.65,0,.35,1) .4s forwards;
        }

        /* Film grain overlay */
        .grain-overlay {
          position:fixed; inset:0; pointer-events:none; z-index:1;
          opacity:.028;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size:180px;
          animation: grain 0.6s steps(1) infinite;
        }

        /* Vignette */
        .vignette {
          position:fixed; inset:0; pointer-events:none; z-index:1;
          background: radial-gradient(ellipse 90% 80% at 50% 50%, transparent 55%, rgba(0,0,0,.12) 100%);
        }

        /* Input glow */
        .ai-input:focus-within { box-shadow: 0 0 0 3px rgba(66,133,244,.18), 0 8px 32px rgba(0,0,0,.12); }
        .ai-input.sent        { box-shadow: 0 0 0 3px rgba(52,168,83,.22),  0 8px 32px rgba(0,0,0,.08); }

        /* CTA button */
        .cta-btn {
          background: #0f0f0f;
          position:relative; overflow:hidden;
        }
        .cta-btn::before {
          content:''; position:absolute; inset:0;
          background: linear-gradient(105deg,transparent 35%,rgba(255,255,255,.13) 50%,transparent 65%);
          transform:translateX(-100%); transition:transform .55s ease;
        }
        .cta-btn:hover::before { transform:translateX(100%); }

        /* Video thumbnail shimmer on hover */
        .video-wrap::after {
          content:''; position:absolute; inset:0; z-index:10;
          background:linear-gradient(135deg,rgba(255,255,255,.04) 0%,transparent 60%);
          pointer-events:none;
        }
      `}</style>

      {/* Atmospheric grain + vignette */}
      <div className="grain-overlay" />
      <div className="vignette" />

      {/* Dust canvas */}
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-[3000ms] ${showParticles ? 'opacity-100' : 'opacity-0'}`}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-7xl">

        {/* ── Title ── */}
        <div className="relative mb-6 w-full max-w-7xl mx-auto flex justify-center title-rise">
          <div className="relative inline-block w-full">
            {/* Ghost for layout */}
            <h1
              className="text-4xl md:text-[5.5rem] leading-[1.05] font-black invisible select-none text-center"
              style={{ fontFamily: '"Montserrat", sans-serif', letterSpacing: '-0.01em' }}
            >{fullText}</h1>
            {/* Real title */}
            <h1
              className="absolute top-0 left-0 w-full text-4xl md:text-[5.5rem] leading-[1.05] font-black text-center text-zinc-950"
              style={{ fontFamily: '"Montserrat", sans-serif', letterSpacing: '-0.01em' }}
            >
              <span>{displayText}</span>
              <span className={`typewriter-cursor transition-opacity duration-700 ${displayText.length === 0 ? 'cursor-blink' : isTyping ? 'opacity-100' : 'opacity-0'}`} />
            </h1>
          </div>
        </div>

        {/* ── Subtitle ── */}
        <div className="relative inline-block mb-10">
          <p
            className={`text-base md:text-xl text-zinc-500 max-w-xl font-light tracking-wide transition-all duration-[1600ms] ${showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}
            style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: 'clamp(1rem, 2vw, 1.25rem)', letterSpacing: '.03em' }}
          >
            {t.heroSubtitle}
          </p>
          {showSubtitle && <div className="shimmer-underline" />}
        </div>

        {/* ── CTA + AI input ── */}
        <div className="flex flex-col items-center gap-10 w-full max-w-lg mt-2">

          {/* Book button */}
          <button
            onClick={onBookingClick}
            className={`cta-btn group text-white px-10 py-4 rounded-full text-sm font-semibold flex items-center gap-2.5 transition-all duration-700 hover:scale-105 active:scale-95
              ${showCTA ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}`}
            style={{ fontFamily: '"Montserrat", sans-serif', letterSpacing: '.08em' }}
          >
            <span className="uppercase tracking-widest text-xs">{t.startJourney}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* AI input block */}
          <div className={`w-full space-y-3 transition-all duration-1000 ${showInput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-14 pointer-events-none'}`}>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className="text-[10px] uppercase tracking-[.55em] font-bold text-zinc-400"
                style={{ fontFamily: '"Montserrat", sans-serif' }}
              >
                {isSent ? t.openingChat : t.askAiAgent}
              </span>
              {!isSent && <ChevronDown className="w-5 h-5 text-zinc-300 stroke-[2.5] bounce-down" />}
            </div>

            <form
              onSubmit={handleAISubmit}
              className={`ai-input relative flex items-center bg-white border border-zinc-200 rounded-2xl p-1.5 transition-all duration-300 shadow-sm ${isSent ? 'sent border-green-300 bg-green-50/60' : 'hover:border-zinc-300'}`}
            >
              <input
                ref={heroInputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={isSent ? '' : placeholder}
                disabled={isSent}
                className="w-full bg-transparent px-5 py-4 text-[15px] outline-none text-zinc-900 font-medium placeholder:text-zinc-350"
                style={{ fontFamily: 'Georgia, serif' }}
              />
              <button
                type="submit"
                disabled={!query.trim() || isSent}
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${query.trim() && !isSent ? 'bg-zinc-950 text-white scale-100' : 'opacity-0 scale-90'}`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* ── Video ── */}
        <div
          className="w-full max-w-5xl mt-44 mb-20 transition-all duration-700"
          style={{ opacity: scrollOpacity, transform: `scale(${scrollScale})` }}
        >
          <div
            ref={videoContainerRef}
            onClick={() => setIsModalOpen(true)}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHoveringVideo(true)}
            onMouseLeave={() => setIsHoveringVideo(false)}
            className={`video-wrap group relative aspect-video w-full rounded-[2rem] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,.18)] bg-zinc-950 border border-white/8 ${isTouch ? 'cursor-pointer' : 'cursor-none'}`}
          >
            {/* Custom cursor */}
            {!isTouch && (
              <div
                className={`pointer-events-none absolute z-50 flex items-center gap-2.5 px-5 py-2.5 bg-white text-zinc-950 rounded-full shadow-2xl transition-opacity duration-200 ${isHoveringVideo ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  left: `${currentPos.x}px`, top: `${currentPos.y}px`,
                  transform: 'translate(-50%,-50%)',
                  fontFamily: '"Montserrat", sans-serif',
                }}
              >
                <Play className="w-3.5 h-3.5 fill-zinc-950" />
                <span className="text-[10px] uppercase tracking-[.2em] font-bold whitespace-nowrap">{t.playIntro}</span>
              </div>
            )}

            {/* Muted autoplay preview */}
            {!isModalOpen && (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0`}
                className="absolute inset-[-2%] w-[104%] h-[104%] opacity-55 grayscale pointer-events-none scale-110"
                style={{ border: 'none' }}
              />
            )}

            {/* Subtle bottom gradient */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/30 to-transparent pointer-events-none z-10" />
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-xl p-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-7 right-7 p-3.5 z-[130] bg-white border border-zinc-200 rounded-full hover:scale-110 transition-all shadow-lg"
          >
            <X className="w-6 h-6 text-zinc-900" />
          </button>
          <div className="relative w-full max-w-5xl aspect-video z-[110] rounded-3xl overflow-hidden shadow-[0_0_120px_rgba(0,0,0,.35)] bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1`}
              className="w-full h-full"
              allow="autoplay; encrypted-media; fullscreen"
              style={{ border: 'none' }}
            />
          </div>
        </div>
      )}
    </section>
  );
}