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
  low:    { pills: 140, dots: 40,  fps: 30 },
  medium: { pills: 220, dots: 70,  fps: 45 },
  high:   { pills: 320, dots: 120, fps: 60 },
};

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
        x: prev.x + (targetPos.x - prev.x) * 0.10,
        y: prev.y + (targetPos.y - prev.y) * 0.10,
      }));
      af = requestAnimationFrame(follow);
    };
    af = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(af);
  }, [targetPos, isHoveringVideo, isModalOpen]);

  useEffect(() => {
    if (!isTyping && displayText.length === fullText.length && fullText.length > 0) {
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
          }, 900);
          return () => clearTimeout(t3);
        }, 2000);
        return () => clearTimeout(t2);
      }, 500);
      return () => clearTimeout(t1);
    }
  }, [isTyping, displayText, fullText]);

  useEffect(() => {
    let cur = ''; let del = false; let timer: NodeJS.Timeout;
    const type = () => {
      const phrase = placeholderPhrases[phraseIdx];
      let speed = 75;
      if (!del) {
        cur = phrase.slice(0, cur.length + 1);
        if (cur === phrase) { speed = 3200; del = true; }
      } else {
        cur = phrase.slice(0, cur.length - 1); speed = 35;
        if (cur === '') { del = false; setPhraseIdx(p => (p + 1) % placeholderPhrases.length); speed = 900; }
      }
      setPlaceholder(cur); timer = setTimeout(type, speed);
    };
    timer = setTimeout(type, 400);
    return () => clearTimeout(timer);
  }, [phraseIdx, language]);

  useEffect(() => {
    let i = 0; let mounted = true;
    setDisplayText(''); setIsTyping(false);
    setShowSubtitle(false); setShowCTA(false); setShowInput(false); setShowParticles(false);
    const type = () => {
      if (!mounted) return;
      if (i <= fullText.length) {
        setIsTyping(true);
        setDisplayText(fullText.slice(0, i++));
        setTimeout(type, Math.random() * 22 + 40);
      } else {
        setIsTyping(false);
      }
    };
    const t0 = setTimeout(type, 1800);
    return () => { mounted = false; clearTimeout(t0); };
  }, [fullText]);

  useEffect(() => {
    const onScroll = () => {
      const p = Math.min(Math.max((window.scrollY - 50) / 320, 0), 1);
      setScrollOpacity(p);
      setScrollScale(0.88 + p * 0.12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const tier = getDeviceTier();
    const cfg = TIER_CONFIG[tier];
    const FRAME_INTERVAL = 1000 / cfg.fps;

    const PALETTE = [
      { r: 212, g: 175, b: 120 },
      { r: 190, g: 155, b: 100 },
      { r: 168, g: 140, b: 108 },
      { r: 140, g: 130, b: 120 },
      { r: 180, g: 165, b: 150 },
      { r: 200, g: 185, b: 165 },
      { r: 155, g: 140, b: 130 },
      { r: 220, g: 200, b: 175 },
    ];

    const SPRING = 0.028; const FRICTION = 0.82; const WIND_SCALE = 0.14; const WIND_RADIUS = 340;

    type Particle = {
      x: number; y: number; originX: number; originY: number;
      vx: number; vy: number; angle: number;
      width: number; height: number;
      r: number; g: number; b: number; opacity: number;
    };

    let particles: Particle[] = [];
    const mouseState = { x: -9999, y: -9999, vx: 0, vy: 0, prevX: -9999, prevY: -9999 };
    let last = 0; let rafId: number;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };

    const pickColor = (i: number) => PALETTE[i % PALETTE.length];

    const init = () => {
      particles = [];
      const cx = canvas.width / 2; const cy = canvas.height / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy);
      for (let i = 0; i < cfg.pills; i++) {
        const t_val = Math.pow(Math.random(), 0.5);
        const dist = t_val * maxDist * 0.9;
        const angle = Math.random() * Math.PI * 2;
        const ox = cx + Math.cos(angle) * dist;
        const oy = cy + Math.sin(angle) * dist;
        const col = pickColor(i);
        const distFraction = dist / (maxDist * 0.9);
        const size = 1.2 + (1 - distFraction) * 2.8;
        particles.push({
          x: ox, y: oy, originX: ox, originY: oy, vx: 0, vy: 0,
          angle: angle + Math.PI / 2 + (Math.random() - 0.5) * 0.5,
          width: size * (3 + Math.random() * 2.5),
          height: size * 0.55,
          r: col.r, g: col.g, b: col.b,
          opacity: 0.18 + Math.random() * 0.22,
        });
      }
      for (let i = 0; i < cfg.dots; i++) {
        const ox = Math.random() * canvas.width;
        const oy = Math.random() * canvas.height;
        const col = pickColor(i + 3);
        particles.push({
          x: ox, y: oy, originX: ox, originY: oy, vx: 0, vy: 0,
          angle: Math.random() * Math.PI,
          width: 1 + Math.random() * 1.5, height: 0.7,
          r: col.r, g: col.g, b: col.b,
          opacity: 0.08 + Math.random() * 0.14,
        });
      }
    };

    const animate = (ts: number) => {
      rafId = requestAnimationFrame(animate);
      if (ts - last < FRAME_INTERVAL) return;
      last = ts;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      mouseState.vx *= 0.85; mouseState.vy *= 0.85;
      for (const p of particles) {
        const dx = p.x - mouseState.x; const dy = p.y - mouseState.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < WIND_RADIUS && mouseState.x !== -9999) {
          const falloff = 1 - dist / WIND_RADIUS;
          p.vx += mouseState.vx * WIND_SCALE * falloff;
          p.vy += mouseState.vy * WIND_SCALE * falloff;
        }
        p.vx += (p.originX - p.x) * SPRING;
        p.vy += (p.originY - p.y) * SPRING;
        p.vx *= FRICTION; p.vy *= FRICTION;
        p.x += p.vx; p.y += p.vy;
        p.angle += Math.sqrt(p.vx * p.vx + p.vy * p.vy) * 0.010;
        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.angle);
        ctx.beginPath();
        const w = p.width; const h = p.height; const rv = h / 2;
        ctx.moveTo(-w / 2 + rv, -h / 2);
        ctx.lineTo(w / 2 - rv, -h / 2);
        ctx.arcTo(w / 2, -h / 2, w / 2, h / 2, rv);
        ctx.lineTo(w / 2 - rv, h / 2);
        ctx.arcTo(w / 2, h / 2, -w / 2, h / 2, rv);
        ctx.lineTo(-w / 2 + rv, h / 2);
        ctx.arcTo(-w / 2, h / 2, -w / 2, -h / 2, rv);
        ctx.lineTo(-w / 2 + rv, -h / 2);
        ctx.arcTo(-w / 2, -h / 2, w / 2, -h / 2, rv);
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.opacity})`;
        ctx.fill();
        ctx.restore();
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (mouseState.prevX === -9999) {
        mouseState.x = e.clientX; mouseState.y = e.clientY;
        mouseState.prevX = e.clientX; mouseState.prevY = e.clientY; return;
      }
      const rawVx = e.clientX - mouseState.prevX;
      const rawVy = e.clientY - mouseState.prevY;
      mouseState.vx = mouseState.vx * 0.6 + rawVx * 0.4;
      mouseState.vy = mouseState.vy * 0.6 + rawVy * 0.4;
      mouseState.prevX = mouseState.x; mouseState.prevY = mouseState.y;
      mouseState.x = e.clientX; mouseState.y = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    resize(); init(); rafId = requestAnimationFrame(animate);
    window.addEventListener('resize', resize);
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
      className="relative min-h-screen flex flex-col items-center overflow-x-hidden pt-32 pb-16"
      style={{
        background: 'linear-gradient(165deg, #faf8f5 0%, #f5f0e8 40%, #ede8de 100%)',
        fontFamily: '"Cormorant Garamond", "Didot", "Bodoni MT", Georgia, serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap');

        :root {
          --gold: #B8966E;
          --gold-light: #D4AF82;
          --gold-dark: #8B6B45;
          --ink: #1a1714;
          --ink-muted: #4a4540;
          --cream: #faf8f5;
          --parchment: #ede8de;
        }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        @keyframes scaleIn {
          from { opacity: 0; transform: scaleX(0); }
          to   { opacity: 1; transform: scaleX(1); }
        }

        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(7px); }
        }

        .cursor-blink { animation: blink 1s step-end infinite; }

        .typewriter-cursor {
          display: inline-block;
          width: 2.5px;
          height: 0.85em;
          margin-left: 3px;
          vertical-align: middle;
          background: var(--gold);
          border-radius: 1px;
        }

        .hero-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-weight: 700;
          font-size: clamp(3rem, 9vw, 8.5rem);
          line-height: 1.02;
          letter-spacing: -0.015em;
          color: var(--ink);
        }

        .hero-title-ghost {
          opacity: 0;
          user-select: none;
          pointer-events: none;
        }

        .gold-rule {
          width: 60px;
          height: 1.5px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          animation: scaleIn 1.2s cubic-bezier(0.22,1,0.36,1) forwards;
        }

        .subtitle-text {
          font-family: 'Jost', sans-serif;
          font-weight: 300;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          font-size: clamp(0.65rem, 1.4vw, 0.82rem);
          color: var(--ink-muted);
        }

        .cta-btn {
          position: relative;
          overflow: hidden;
          font-family: 'Jost', sans-serif;
          font-weight: 400;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          font-size: 0.72rem;
          padding: 1rem 2.8rem;
          border: 1px solid var(--ink);
          color: var(--ink);
          background: transparent;
          border-radius: 0;
          transition: color 0.4s ease;
          cursor: pointer;
        }

        .cta-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--ink);
          transform: translateX(-100%);
          transition: transform 0.4s cubic-bezier(0.22,1,0.36,1);
          z-index: 0;
        }

        .cta-btn:hover::before { transform: translateX(0); }
        .cta-btn:hover { color: var(--cream); }
        .cta-btn span, .cta-btn svg { position: relative; z-index: 1; }

        .ai-label {
          font-family: 'Jost', sans-serif;
          font-weight: 200;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          font-size: 0.6rem;
          color: var(--gold-dark);
        }

        .ai-input-wrap {
          border: none;
          border-bottom: 1px solid rgba(26,23,20,0.25);
          border-radius: 0;
          background: transparent;
          padding: 0;
          display: flex;
          align-items: center;
          transition: border-color 0.3s ease;
        }

        .ai-input-wrap:focus-within { border-bottom-color: var(--gold); }
        .ai-input-wrap.sent { border-bottom-color: #6aaa6a; }

        .ai-input {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.05rem;
          font-style: italic;
          font-weight: 400;
          color: var(--ink);
          background: transparent;
          border: none;
          outline: none;
          width: 100%;
          padding: 0.9rem 0;
          letter-spacing: 0.01em;
        }

        .ai-input::placeholder { color: rgba(74,69,64,0.45); }

        .ai-send-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--gold);
          padding: 0.4rem;
          transition: transform 0.2s ease, color 0.2s ease;
          flex-shrink: 0;
        }

        .ai-send-btn:hover { transform: translateX(3px); color: var(--gold-dark); }
        .ai-send-btn:disabled { opacity: 0; pointer-events: none; }

        .chevron-bounce { animation: bounceDown 1.4s ease-in-out infinite; }

        .video-shell {
          border-radius: 3px;
          overflow: hidden;
          box-shadow:
            0 2px 4px rgba(26,23,20,0.04),
            0 8px 24px rgba(26,23,20,0.07),
            0 32px 64px rgba(26,23,20,0.08);
          transition: box-shadow 0.5s ease;
        }

        .video-shell:hover {
          box-shadow:
            0 2px 4px rgba(26,23,20,0.04),
            0 12px 32px rgba(26,23,20,0.10),
            0 48px 80px rgba(26,23,20,0.14);
        }

        .play-pill {
          font-family: 'Jost', sans-serif;
          font-weight: 300;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-size: 0.65rem;
          background: rgba(250,248,245,0.95);
          color: var(--ink);
          border-radius: 100px;
          padding: 0.7rem 1.5rem;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 20px rgba(26,23,20,0.18);
        }

        .decorative-line {
          position: absolute;
          width: 1px;
          background: linear-gradient(to bottom, transparent, var(--gold-light), transparent);
          opacity: 0.35;
          pointer-events: none;
        }

        .corner-mark {
          position: absolute;
          width: 20px;
          height: 20px;
          opacity: 0.4;
        }

        .modal-backdrop {
          background: rgba(250,248,245,0.88);
          backdrop-filter: blur(20px) saturate(1.2);
        }

        .modal-close {
          font-family: 'Jost', sans-serif;
          font-weight: 200;
          letter-spacing: 0.25em;
          font-size: 0.65rem;
          text-transform: uppercase;
          color: var(--ink);
          background: rgba(250,248,245,0.95);
          border: 1px solid rgba(26,23,20,0.15);
          padding: 0.6rem 1.4rem;
          border-radius: 0;
          cursor: pointer;
          transition: background 0.3s ease, color 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .modal-close:hover { background: var(--ink); color: var(--cream); }

        .noise-overlay {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-size: 180px;
        }
      `}</style>

      <div className="noise-overlay" />

      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ transition: 'opacity 2.5s ease', opacity: showParticles ? 1 : 0 }}
      />

      {/* Decorative vertical rules */}
      <div className="decorative-line" style={{ left: '7%', top: 0, height: '100%' }} />
      <div className="decorative-line" style={{ right: '7%', top: 0, height: '100%' }} />

      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-6xl">

        {/* Eyebrow rule */}
        <div className="mb-10" style={{ animation: 'fadeIn 1.2s ease 0.3s both' }}>
          <div className="flex items-center gap-5 justify-center">
            <div className="gold-rule" />
            <span className="ai-label">Est. Excellence</span>
            <div className="gold-rule" />
          </div>
        </div>

        {/* Hero title */}
        <div className="relative mb-10 w-full" style={{ animation: 'fadeIn 0.8s ease 0.6s both' }}>
          <h1 className="hero-title hero-title-ghost text-center select-none">{fullText}</h1>
          <h1 className="hero-title absolute inset-0 flex items-start justify-center text-center">
            <span>{displayText}</span>
            <span
              className={`typewriter-cursor ${displayText.length === 0 ? 'cursor-blink' : isTyping ? 'opacity-100' : 'opacity-0'}`}
              style={{ transition: 'opacity 0.8s ease' }}
            />
          </h1>
        </div>

        {/* Subtitle */}
        <div
          className="mb-14"
          style={{
            transition: 'opacity 1.4s cubic-bezier(0.22,1,0.36,1), transform 1.4s cubic-bezier(0.22,1,0.36,1)',
            opacity: showSubtitle ? 1 : 0,
            transform: showSubtitle ? 'translateY(0)' : 'translateY(20px)',
          }}
        >
          <p className="subtitle-text max-w-xl mx-auto" style={{ lineHeight: 2.2 }}>
            {t.heroSubtitle}
          </p>
        </div>

        {/* CTA */}
        <div
          className="mb-20"
          style={{
            transition: 'opacity 1.2s ease, transform 1.2s cubic-bezier(0.22,1,0.36,1)',
            opacity: showCTA ? 1 : 0,
            transform: showCTA ? 'translateY(0)' : 'translateY(24px)',
          }}
        >
          <button onClick={onBookingClick} className="cta-btn group">
            <span className="flex items-center gap-3">
              {t.startJourney}
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </div>

        {/* AI input */}
        <div
          className="w-full max-w-lg"
          style={{
            transition: 'opacity 1.2s ease, transform 1.2s cubic-bezier(0.22,1,0.36,1)',
            opacity: showInput ? 1 : 0,
            transform: showInput ? 'translateY(0)' : 'translateY(32px)',
          }}
        >
          <div className="flex flex-col items-center gap-3 mb-5">
            <span className="ai-label">{isSent ? t.openingChat : t.askAiAgent}</span>
            {!isSent && (
              <div className="chevron-bounce">
                <ChevronDown className="w-4 h-4" style={{ color: 'var(--gold)', strokeWidth: 1.5 }} />
              </div>
            )}
          </div>

          <form onSubmit={handleAISubmit} className={`ai-input-wrap ${isSent ? 'sent' : ''}`}>
            <input
              ref={heroInputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={isSent ? '' : placeholder}
              disabled={isSent}
              className="ai-input"
            />
            <button type="submit" disabled={!query.trim() || isSent} className="ai-send-btn">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Video */}
        <div
          className="w-full max-w-5xl mt-36 mb-16"
          style={{
            opacity: scrollOpacity,
            transform: `scale(${scrollScale})`,
            transition: 'transform 0.1s linear',
          }}
        >
          <div className="flex items-center gap-5 justify-center mb-8">
            <div className="gold-rule" />
            <span className="ai-label">Our Story</span>
            <div className="gold-rule" />
          </div>

          <div
            ref={videoContainerRef}
            onClick={() => setIsModalOpen(true)}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHoveringVideo(true)}
            onMouseLeave={() => setIsHoveringVideo(false)}
            className={`video-shell group relative aspect-video w-full bg-black ${isTouch ? 'cursor-pointer' : 'cursor-none'}`}
          >
            {!isTouch && (
              <div
                className="pointer-events-none absolute z-50 play-pill flex items-center gap-2.5"
                style={{
                  left: `${currentPos.x}px`,
                  top: `${currentPos.y}px`,
                  transform: 'translate(-50%, -50%)',
                  transition: 'opacity 0.25s ease',
                  opacity: isHoveringVideo ? 1 : 0,
                }}
              >
                <Play className="w-3 h-3 fill-current" />
                <span>{t.playIntro}</span>
              </div>
            )}

            {!isModalOpen && (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0`}
                className="absolute inset-[-2%] w-[104%] h-[104%] pointer-events-none object-cover"
                style={{ border: 'none', opacity: 0.55, filter: 'grayscale(60%) sepia(20%)' }}
              />
            )}

            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(26,23,20,0.3) 100%)' }}
            />

            <svg className="corner-mark" style={{ top: 14, left: 14 }} viewBox="0 0 20 20" fill="none">
              <path d="M0 20 L0 0 L20 0" stroke="#B8966E" strokeWidth="1.5" fill="none" />
            </svg>
            <svg className="corner-mark" style={{ top: 14, right: 14 }} viewBox="0 0 20 20" fill="none">
              <path d="M20 20 L20 0 L0 0" stroke="#B8966E" strokeWidth="1.5" fill="none" />
            </svg>
            <svg className="corner-mark" style={{ bottom: 14, left: 14 }} viewBox="0 0 20 20" fill="none">
              <path d="M0 0 L0 20 L20 20" stroke="#B8966E" strokeWidth="1.5" fill="none" />
            </svg>
            <svg className="corner-mark" style={{ bottom: 14, right: 14 }} viewBox="0 0 20 20" fill="none">
              <path d="M20 0 L20 20 L0 20" stroke="#B8966E" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center modal-backdrop p-6 gap-5">
          <button onClick={() => setIsModalOpen(false)} className="modal-close">
            <X className="w-3.5 h-3.5" />
            <span>Close</span>
          </button>
          <div
            className="relative w-full max-w-5xl aspect-video bg-black"
            style={{ boxShadow: '0 40px 100px rgba(26,23,20,0.3)' }}
          >
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