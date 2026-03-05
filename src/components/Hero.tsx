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
  low:    { dustCount: 1800, trailMax: 60,  fps: 30 },
  medium: { dustCount: 3200, trailMax: 100, fps: 45 },
  high:   { dustCount: 5000, trailMax: 160, fps: 60 },
};

// Google brand colors for the contrail
const GOOGLE_COLORS = [
  { r: 66,  g: 133, b: 244 }, // Blue
  { r: 52,  g: 168, b: 83  }, // Green
  { r: 251, g: 188, b: 5   }, // Yellow
  { r: 234, g: 67,  b: 53  }, // Red
  { r: 25,  g: 103, b: 210 }, // Blue dark
  { r: 30,  g: 142, b: 62  }, // Green dark
  { r: 249, g: 160, b: 0   }, // Yellow dark
  { r: 197, g: 34,  b: 31  }, // Red dark
];

export default function Hero({ onBookingClick, onAskAIClick, language }: HeroProps) {
  const t = translations[language];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(0);
  const [scrollScale, setScrollScale] = useState(0.85);
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
        x: prev.x + (targetPos.x - prev.x) * 0.12,
        y: prev.y + (targetPos.y - prev.y) * 0.12,
      }));
      af = requestAnimationFrame(follow);
    };
    af = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(af);
  }, [targetPos, isHoveringVideo, isModalOpen]);

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
      } else {
        setIsTyping(false);
      }
    };
    const t0 = setTimeout(type, 2000);
    return () => { mounted = false; clearTimeout(t0); };
  }, [fullText]);

  useEffect(() => {
    const onScroll = () => {
      const p = Math.min(Math.max((window.scrollY - 50) / 300, 0), 1);
      setScrollOpacity(p); setScrollScale(0.85 + p * 0.15);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── NANO DUST PARTICLE SYSTEM ─────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tier = getDeviceTier();
    const cfg = TIER_CONFIG[tier];
    const FRAME_INTERVAL = 1000 / cfg.fps;

    // ── Dust particle type ──
    type Dust = {
      x: number; y: number;
      vx: number; vy: number;
      size: number;       // radius: 0.3–1.4px (true nano scale)
      opacity: number;
      baseOpacity: number;
      drift: number;      // individual drift speed
      driftAngle: number;
    };

    // ── Trail point type ──
    type TrailPoint = {
      x: number; y: number;
      r: number; g: number; b: number;
      life: number;        // 0–1, fades to 0
      colorIdx: number;
    };

    let dust: Dust[] = [];
    let trail: TrailPoint[] = [];
    let colorCycleIdx = 0;

    const mouse = { x: -9999, y: -9999, vx: 0, vy: 0, prevX: -9999, prevY: -9999 };
    let last = 0;
    let rafId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initDust = () => {
      dust = [];
      for (let i = 0; i < cfg.dustCount; i++) {
        const size = 0.25 + Math.random() * Math.random() * 1.1; // heavy tail toward small
        dust.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.08,
          vy: (Math.random() - 0.5) * 0.08,
          size,
          baseOpacity: 0.08 + Math.random() * 0.28,
          opacity: 0.08 + Math.random() * 0.28,
          drift: 0.0004 + Math.random() * 0.001,
          driftAngle: Math.random() * Math.PI * 2,
        });
      }
    };

    const REPEL_RADIUS = 120;
    const SUCK_RADIUS = 280;
    const TRAIL_SPAWN_DIST = 6; // px between trail spawns
    let lastTrailX = -9999, lastTrailY = -9999;

    const animate = (ts: number) => {
      rafId = requestAnimationFrame(animate);
      if (ts - last < FRAME_INTERVAL) return;
      last = ts;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ── Update + draw dust ──
      const mx = mouse.x, my = mouse.y;
      const hasMouse = mx !== -9999;

      for (const p of dust) {
        // Brownian drift
        p.driftAngle += (Math.random() - 0.5) * 0.04;
        p.vx += Math.cos(p.driftAngle) * p.drift;
        p.vy += Math.sin(p.driftAngle) * p.drift;

        if (hasMouse) {
          const dx = p.x - mx, dy = p.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < REPEL_RADIUS && dist > 0) {
            // Hard repel — dust scatters away
            const force = Math.pow(1 - dist / REPEL_RADIUS, 2) * 0.8;
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
            p.opacity = Math.min(1, p.baseOpacity + force * 2.5);
          } else if (dist < SUCK_RADIUS) {
            // Gentle suction toward orbit
            const force = (1 - dist / SUCK_RADIUS) * 0.012;
            p.vx -= (dx / dist) * force;
            p.vy -= (dy / dist) * force;
            p.opacity = p.baseOpacity + (1 - dist / SUCK_RADIUS) * 0.18;
          } else {
            p.opacity += (p.baseOpacity - p.opacity) * 0.05;
          }
        } else {
          p.opacity += (p.baseOpacity - p.opacity) * 0.05;
        }

        // Damping
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x += p.vx;
        p.y += p.vy;

        // Wrap
        if (p.x < -2) p.x = canvas.width + 2;
        if (p.x > canvas.width + 2) p.x = -2;
        if (p.y < -2) p.y = canvas.height + 2;
        if (p.y > canvas.height + 2) p.y = -2;

        // Draw as a tiny circle — pure monochrome dust
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(30,30,35,${p.opacity.toFixed(3)})`;
        ctx.fill();
      }

      // ── Spawn trail points along mouse path ──
      if (hasMouse) {
        const tdx = mx - lastTrailX, tdy = my - lastTrailY;
        const tDist = Math.sqrt(tdx * tdx + tdy * tdy);
        if (tDist > TRAIL_SPAWN_DIST || lastTrailX === -9999) {
          const col = GOOGLE_COLORS[colorCycleIdx % GOOGLE_COLORS.length];
          // Spawn a small cluster per point for a dusty look
          const clusterSize = 3 + Math.floor(Math.random() * 4);
          for (let c = 0; c < clusterSize; c++) {
            trail.push({
              x: mx + (Math.random() - 0.5) * 14,
              y: my + (Math.random() - 0.5) * 14,
              r: col.r, g: col.g, b: col.b,
              life: 0.9 + Math.random() * 0.1,
              colorIdx: colorCycleIdx,
            });
          }
          colorCycleIdx++;
          if (trail.length > cfg.trailMax * (3 + 4) * 2) {
            trail = trail.slice(-cfg.trailMax * 5);
          }
          lastTrailX = mx; lastTrailY = my;
        }
      }

      // ── Update + draw trail ──
      const FADE_SPEED = 0.022;
      trail = trail.filter(tp => tp.life > 0);
      for (const tp of trail) {
        tp.life -= FADE_SPEED;
        tp.x += (Math.random() - 0.5) * 0.3;
        tp.y += (Math.random() - 0.5) * 0.3 + 0.04; // slight gravity drift

        const a = Math.max(0, tp.life * 0.75);
        // Draw as a tiny glowing nano-dot
        const size = 0.5 + tp.life * 1.6;

        const grad = ctx.createRadialGradient(tp.x, tp.y, 0, tp.x, tp.y, size * 3);
        grad.addColorStop(0, `rgba(${tp.r},${tp.g},${tp.b},${(a * 0.9).toFixed(3)})`);
        grad.addColorStop(0.5, `rgba(${tp.r},${tp.g},${tp.b},${(a * 0.3).toFixed(3)})`);
        grad.addColorStop(1, `rgba(${tp.r},${tp.g},${tp.b},0)`);

        ctx.beginPath();
        ctx.arc(tp.x, tp.y, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (mouse.prevX === -9999) {
        mouse.x = e.clientX; mouse.y = e.clientY;
        mouse.prevX = e.clientX; mouse.prevY = e.clientY;
        return;
      }
      mouse.vx = mouse.vx * 0.6 + (e.clientX - mouse.prevX) * 0.4;
      mouse.vy = mouse.vy * 0.6 + (e.clientY - mouse.prevY) * 0.4;
      mouse.prevX = mouse.x; mouse.prevY = mouse.y;
      mouse.x = e.clientX; mouse.y = e.clientY;
    };

    const onMouseLeave = () => { mouse.x = -9999; mouse.y = -9999; lastTrailX = -9999; lastTrailY = -9999; };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', resize);

    resize();
    initDust();
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
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
      className="relative min-h-screen flex flex-col items-center bg-white text-black overflow-x-hidden pt-28 pb-12"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;700;900&display=swap');

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes bounce-down { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
        @keyframes title-fade-slide {
          0% { opacity: 0; transform: translateY(24px); filter: blur(6px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0px); }
        }
        @keyframes underline-swipe-lr {
          0%   { left: 0%; width: 0%;   opacity: 0; }
          40%  { left: 0%; width: 70%;  opacity: 1; }
          60%  { left: 0%; width: 100%; opacity: 1; }
          100% { left: 100%; width: 0%; opacity: 0; }
        }
        @keyframes shimmer-in {
          0%   { opacity: 0; transform: translateY(16px) scale(0.97); filter: blur(4px); }
          100% { opacity: 1; transform: translateY(0)    scale(1);    filter: blur(0); }
        }
        @keyframes float-glow {
          0%, 100% { box-shadow: 0 0 24px 0 rgba(66,133,244,0.12), 0 8px 40px rgba(0,0,0,0.10); }
          33%       { box-shadow: 0 0 32px 0 rgba(52,168,83,0.15),  0 8px 40px rgba(0,0,0,0.10); }
          66%       { box-shadow: 0 0 28px 0 rgba(234,67,53,0.12),  0 8px 40px rgba(0,0,0,0.10); }
        }
        @keyframes btn-pulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,0,0,0.18); }
          50%       { box-shadow: 0 0 0 8px rgba(0,0,0,0); }
        }

        .cursor-standby   { animation: blink 1s step-end infinite; }
        .typewriter-cursor {
          display: inline-block; width: 3px; height: 0.95em;
          margin-left: 3px; vertical-align: middle;
          background: linear-gradient(to bottom, #4285F4, #EA4335);
          border-radius: 2px;
        }
        .animate-bounce-down { animation: bounce-down 1.2s ease-in-out infinite; }
        .underline-dynamic {
          position: absolute; bottom: -6px; height: 2px;
          background: linear-gradient(90deg, transparent, #18181b, transparent);
          animation: underline-swipe-lr 2.2s cubic-bezier(0.65,0,0.35,1) 0.5s forwards;
        }
        .title-entrance   { animation: title-fade-slide 1.4s cubic-bezier(0.22,1,0.36,1) forwards; }
        .shimmer-entrance { animation: shimmer-in 1.0s cubic-bezier(0.22,1,0.36,1) forwards; }
        .input-glow       { animation: float-glow 4s ease-in-out infinite; }
        .btn-breathe      { animation: btn-pulse 2.4s ease-in-out infinite; }

        /* Frosted glass input */
        .glass-input {
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(16px) saturate(180%);
          -webkit-backdrop-filter: blur(16px) saturate(180%);
          border: 1.5px solid rgba(0,0,0,0.10);
          border-radius: 20px;
          transition: border-color 0.3s, box-shadow 0.3s;
        }
        .glass-input:focus-within {
          border-color: rgba(66,133,244,0.45);
          box-shadow: 0 0 0 3px rgba(66,133,244,0.08);
        }

        /* Video container hover glow */
        .video-wrap:hover { box-shadow: 0 32px 96px rgba(0,0,0,0.22), 0 0 0 1px rgba(255,255,255,0.06); }

        /* Subtle grain overlay on canvas */
        .canvas-noise::after {
          content: '';
          position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          opacity: 0.025;
          pointer-events: none;
        }
      `}</style>

      {/* ── Nano-dust canvas ── */}
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-[3000ms] canvas-noise ${showParticles ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* ── Hero content ── */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-7xl">

        {/* Title */}
        <div className="relative mb-10 w-full max-w-7xl mx-auto flex justify-center title-entrance">
          <div className="relative inline-block w-full">
            {/* Ghost for layout */}
            <h1
              className="text-4xl md:text-8xl font-black invisible select-none text-center"
              style={{ fontFamily: '"Montserrat", sans-serif', letterSpacing: '0.02em', lineHeight: 1.08 }}
            >
              {fullText}
            </h1>
            {/* Live typewriter */}
            <h1
              className="absolute top-0 left-0 w-full text-4xl md:text-8xl font-black text-center"
              style={{ fontFamily: '"Montserrat", sans-serif', letterSpacing: '0.02em', lineHeight: 1.08 }}
            >
              <span className="bg-clip-text" style={{ WebkitBackgroundClip: 'text' }}>
                {displayText}
              </span>
              <span
                className={`typewriter-cursor transition-opacity duration-1000 ${
                  displayText.length === 0 ? 'cursor-standby' : isTyping ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </h1>
          </div>
        </div>

        {/* Subtitle */}
        <div className="relative inline-block mb-12">
          <p
            className={`text-base md:text-xl text-zinc-600 max-w-xl font-light tracking-wide leading-relaxed transition-all duration-[1500ms] ${
              showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ fontFamily: 'Georgia, serif', letterSpacing: '0.01em' }}
          >
            {t.heroSubtitle}
          </p>
          {showSubtitle && <div className="underline-dynamic" />}
        </div>

        {/* CTA + Input */}
        <div className="flex flex-col items-center gap-10 w-full max-w-md">

          {/* Book button */}
          <button
            onClick={onBookingClick}
            className={`group relative overflow-hidden bg-black text-white px-10 py-4 rounded-full text-sm font-semibold flex items-center gap-2.5 transition-all duration-1000 btn-breathe ${
              showCTA
                ? 'opacity-100 translate-y-0 scale-100'
                : 'opacity-0 translate-y-8 scale-90 pointer-events-none'
            }`}
            style={{ fontFamily: '"Montserrat", sans-serif', letterSpacing: '0.08em' }}
          >
            {/* Shimmer on hover */}
            <span
              className="absolute inset-0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent)' }}
            />
            <span className="whitespace-nowrap uppercase tracking-widest">{t.startJourney}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          {/* AI input */}
          <div
            className={`w-full space-y-4 transition-all duration-1000 ${
              showInput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'
            }`}
          >
            <div className="flex flex-col items-center gap-1.5">
              <h3
                className="text-[11px] md:text-[13px] uppercase tracking-[0.55em] font-black text-zinc-400"
                style={{ fontFamily: '"Montserrat", sans-serif' }}
              >
                {isSent ? t.openingChat : t.askAiAgent}
              </h3>
              {!isSent && (
                <ChevronDown className="w-6 h-6 text-zinc-400 stroke-[2.5] animate-bounce-down" />
              )}
            </div>

            <form
              onSubmit={handleAISubmit}
              className={`relative flex items-center glass-input p-1.5 input-glow ${
                isSent ? 'border-emerald-400 bg-emerald-50/80' : ''
              }`}
            >
              <input
                ref={heroInputRef}
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={isSent ? '' : placeholder}
                disabled={isSent}
                className="w-full bg-transparent px-5 py-3.5 text-sm outline-none text-zinc-800 font-medium placeholder:text-zinc-400"
                style={{ fontFamily: 'Georgia, serif' }}
              />
              <button
                type="submit"
                disabled={!query.trim() || isSent}
                className={`flex items-center justify-center w-11 h-11 rounded-[14px] transition-all ${
                  query.trim() && !isSent ? 'bg-black text-white scale-100' : 'opacity-0 scale-75'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Video */}
        <div
          className="w-full max-w-6xl mt-48 mb-24 transition-all duration-700"
          style={{ opacity: scrollOpacity, transform: `scale(${scrollScale})` }}
        >
          <div
            ref={videoContainerRef}
            onClick={() => setIsModalOpen(true)}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHoveringVideo(true)}
            onMouseLeave={() => setIsHoveringVideo(false)}
            className={`group video-wrap relative aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-black border border-white/10 transition-all duration-500 ${
              isTouch ? 'cursor-pointer' : 'cursor-none'
            }`}
          >
            {/* Custom cursor */}
            {!isTouch && (
              <div
                className={`pointer-events-none absolute z-50 flex items-center gap-2.5 px-5 py-2.5 bg-white text-black rounded-full font-bold shadow-2xl transition-opacity duration-300 ${
                  isHoveringVideo ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  left: `${currentPos.x}px`,
                  top: `${currentPos.y}px`,
                  transform: 'translate(-50%, -50%)',
                  fontFamily: '"Montserrat", sans-serif',
                }}
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span className="text-[10px] uppercase tracking-widest whitespace-nowrap">{t.playIntro}</span>
              </div>
            )}
            {!isModalOpen && (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0`}
                className="absolute inset-[-2%] w-[104%] h-[104%] opacity-60 grayscale pointer-events-none object-cover scale-110"
                style={{ border: 'none' }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-xl p-4">
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-8 right-8 p-3 z-[130] bg-white border-2 border-black rounded-full hover:scale-110 transition-all shadow-xl"
          >
            <X className="w-7 h-7 text-black" />
          </button>
          <div className="relative w-full max-w-6xl aspect-video z-[110] rounded-3xl overflow-hidden shadow-[0_0_120px_rgba(0,0,0,0.25)] bg-black">
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