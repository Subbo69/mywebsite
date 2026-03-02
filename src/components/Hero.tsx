import { ArrowRight, Send, Play, X } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useEffect, useRef, useState } from 'react';

interface HeroProps {
  onBookingClick: () => void;
  onAskAIClick: (initialMessage?: string) => void;
  language: Language;
}

// ─── Device Tier Detection ────────────────────────────────────────────────────
function getDeviceTier(): 'low' | 'medium' | 'high' {
  const cores   = navigator.hardwareConcurrency ?? 2;
  const width   = window.innerWidth;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouch || cores <= 2 || width < 768)  return 'low';
  if (cores <= 4 || width < 1280)            return 'medium';
  return 'high';
}

const TIER_CONFIG = {
  low:    { pills: 220, dots: 60,  fps: 30 },
  medium: { pills: 320, dots: 100, fps: 45 },
  high:   { pills: 420, dots: 180, fps: 60 },
};

export default function Hero({ onBookingClick, onAskAIClick, language }: HeroProps) {
  const t = translations[language];
  const canvasRef         = useRef<HTMLCanvasElement>(null);
  const heroInputRef      = useRef<HTMLInputElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const [query,         setQuery]         = useState("");
  const [isSent,        setIsSent]        = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(0);
  const [scrollScale,   setScrollScale]   = useState(0.85);
  const [displayText,   setDisplayText]   = useState("");
  const [isTyping,      setIsTyping]      = useState(false);
  const [isModalOpen,   setIsModalOpen]   = useState(false);

  const [showSubtitle,  setShowSubtitle]  = useState(false);
  const [showCTA,       setShowCTA]       = useState(false);
  const [showInput,     setShowInput]     = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const [placeholder, setPlaceholder] = useState("");
  const placeholderPhrases = [
    t.howCanWeHelp,
    t.heroPlaceholder1,
    t.heroPlaceholder2,
    t.heroPlaceholder3
  ];
  const [phraseIdx, setPhraseIdx] = useState(0);

  const [targetPos,       setTargetPos]       = useState({ x: 0, y: 0 });
  const [currentPos,      setCurrentPos]      = useState({ x: 0, y: 0 });
  const [isHoveringVideo, setIsHoveringVideo] = useState(false);

  const fullText = t.heroTitle;
  const VIDEO_ID = "Py1ClI35v_k";

  const isTouch = typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // ─── Mouse tracking for magnetic cursor ──────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoContainerRef.current) return;
    const rect = videoContainerRef.current.getBoundingClientRect();
    setTargetPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  // ─── Spring physics (video cursor pill) ──────────────────────────────────
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

  // ─── Choreography sync ───────────────────────────────────────────────────
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
            }, 600);
            return () => clearTimeout(t4);
          }, 500);
          return () => clearTimeout(t3);
        }, 500);
        return () => clearTimeout(t2);
      }, 300);
      return () => clearTimeout(t1);
    }
  }, [isTyping, displayText, fullText]);

  // ─── Placeholder typewriter ───────────────────────────────────────────────
  useEffect(() => {
    let cur = ""; let del = false; let timer: NodeJS.Timeout;
    const type = () => {
      const phrase = placeholderPhrases[phraseIdx];
      let speed = 80;
      if (!del) {
        cur = phrase.slice(0, cur.length + 1);
        if (cur === phrase) { speed = 3500; del = true; }
      } else {
        cur = phrase.slice(0, cur.length - 1); speed = 40;
        if (cur === "") { del = false; setPhraseIdx(p => (p + 1) % placeholderPhrases.length); speed = 1000; }
      }
      setPlaceholder(cur); timer = setTimeout(type, speed);
    };
    timer = setTimeout(type, 500);
    return () => clearTimeout(timer);
  }, [phraseIdx, language]);

  // ─── Title typewriter ─────────────────────────────────────────────────────
  useEffect(() => {
    let i = 0; let mounted = true;
    setDisplayText(""); setIsTyping(true);
    setShowSubtitle(false); setShowCTA(false);
    setShowInput(false); setShowParticles(false);
    const type = () => {
      if (!mounted) return;
      if (i <= fullText.length) { setDisplayText(fullText.slice(0, i++)); setTimeout(type, Math.random() * 25 + 45); }
      else setIsTyping(false);
    };
    const t0 = setTimeout(type, 280);
    return () => { mounted = false; clearTimeout(t0); };
  }, [fullText]);

  // ─── Scroll reveal ────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const p = Math.min(Math.max((window.scrollY - 50) / 300, 0), 1);
      setScrollOpacity(p); setScrollScale(0.85 + p * 0.15);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ─── PARTICLE ENGINE — loose-follow / wave-drag system ───────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tier = getDeviceTier();
    const cfg  = TIER_CONFIG[tier];
    const FRAME_INTERVAL = 1000 / cfg.fps;

    // Google brand color bands — blue inner/top → warm outer/bottom
    const COLOR_BANDS = [
      { r: 138, g: 143, b: 234 }, // soft indigo
      { r: 100, g: 120, b: 220 }, // blue
      { r: 66,  g: 133, b: 244 }, // Google Blue
      { r: 120, g: 80,  b: 200 }, // purple
      { r: 180, g: 60,  b: 160 }, // magenta-purple
      { r: 210, g: 50,  b: 80  }, // red
      { r: 234, g: 67,  b: 53  }, // Google Red
      { r: 240, g: 120, b: 30  }, // orange
      { r: 251, g: 188, b: 5   }, // Google Yellow
    ];

    // ── Physics constants ────────────────────────────────────────────────────
    //
    // ATTRACTION: how strongly each particle is pulled *toward* the cursor
    // position every frame. Intentionally weak — particles drift toward the
    // mouse but will never fully reach it before friction bleeds off the
    // velocity. Think of it like dragging through thick water.
    const ATTRACTION        = 0.007;
    // Particles within this radius feel the positional attraction.
    const ATTRACTION_RADIUS = 700;
    // Inside this radius the attraction flips to a soft push so particles
    // don't cluster right under the cursor.
    const REPULSION_RADIUS  = 55;
    // Velocity wind: fast mouse sweeps add momentum in the sweep direction,
    // creating a "wave" effect. Scaled by this factor before being added to
    // particle velocity.
    const WIND_SCALE        = 0.20;
    // Distance beyond which wind has zero effect.
    const WIND_RADIUS       = 500;
    // Very weak spring back toward spawn position. Prevents particles from
    // drifting off-screen permanently when the cursor is gone for a while.
    // Low enough that you can push them far from home before they slowly
    // wander back.
    const HOME_SPRING       = 0.003;
    // Velocity damping. Higher = particles stop faster and feel "heavier".
    // Lower = floatier, waves travel further.
    const FRICTION          = 0.91;
    // Maximum speed cap to prevent any single frame from launching a particle
    // across the screen.
    const MAX_SPEED         = 18;

    type Particle = {
      x: number; y: number;
      originX: number; originY: number;
      vx: number; vy: number;
      angle: number;
      width: number; height: number;
      r: number; g: number; b: number;
      opacity: number;
    };

    let particles: Particle[] = [];

    // Shared mouse state — velocity tracked here (not in React state, for perf)
    const mouseState = {
      x: -9999, y: -9999,
      vx: 0, vy: 0,       // smoothed velocity
      prevX: -9999, prevY: -9999,
    };

    let last   = 0;
    let rafId: number;
    let rzTimer: ReturnType<typeof setTimeout>;
    let paused = false;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const getColor = (ox: number, oy: number, dist: number, maxDist: number) => {
      const distFraction = dist / (maxDist * 0.85);
      const yFraction    = oy / canvas.height;
      const colorScore   = Math.min(distFraction * 0.5 + yFraction * 0.5, 0.999);
      return COLOR_BANDS[Math.floor(colorScore * COLOR_BANDS.length)];
    };

    const init = () => {
      particles = [];
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const maxDist = Math.sqrt(cx * cx + cy * cy);

      // Main pill particles — radially distributed, biased toward center
      for (let i = 0; i < cfg.pills; i++) {
        const t_val   = Math.pow(Math.random(), 0.55);
        const dist    = t_val * maxDist * 0.85;
        const angle   = Math.random() * Math.PI * 2;
        const ox      = cx + Math.cos(angle) * dist;
        const oy      = cy + Math.sin(angle) * dist;
        const col     = getColor(ox, oy, dist, maxDist);
        const distFraction = dist / (maxDist * 0.85);
        const size    = 1.5 + (1 - distFraction) * 3.5;
        const pillAngle = angle + Math.PI / 2 + (Math.random() - 0.5) * 0.6;

        particles.push({
          x: ox, y: oy, originX: ox, originY: oy,
          vx: 0, vy: 0,
          angle: pillAngle,
          width: size * (2.5 + Math.random() * 2),
          height: size * 0.6,
          r: col.r, g: col.g, b: col.b,
          opacity: 0.55 + Math.random() * 0.35,
        });
      }

      // Fine scatter dots
      for (let i = 0; i < cfg.dots; i++) {
        const ox   = Math.random() * canvas.width;
        const oy   = Math.random() * canvas.height;
        const dist = Math.sqrt((ox - cx) ** 2 + (oy - cy) ** 2);
        const col  = getColor(ox, oy, dist, maxDist);

        particles.push({
          x: ox, y: oy, originX: ox, originY: oy,
          vx: 0, vy: 0,
          angle: Math.random() * Math.PI,
          width: 1.5 + Math.random() * 2, height: 0.8,
          r: col.r, g: col.g, b: col.b,
          opacity: 0.2 + Math.random() * 0.25,
        });
      }
    };

    const animate = (ts: number) => {
      rafId = requestAnimationFrame(animate);
      if (paused || ts - last < FRAME_INTERVAL) return;
      last = ts;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Decay mouse velocity smoothly each frame so sweeps fade out naturally
      mouseState.vx *= 0.82;
      mouseState.vy *= 0.82;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (mouseState.x !== -9999) {
          const dx = mouseState.x - p.x;
          const dy = mouseState.y - p.y;
          const distToCursor = Math.sqrt(dx * dx + dy * dy) || 0.001;

          // ── 1. Velocity wind (sweep creates waves) ──────────────────────
          // Fast mouse movement injects momentum into nearby particles in the
          // direction of travel. Particles far away get barely any push;
          // close ones get the full effect. This is what lets you create
          // rightward "waves" by sweeping the cursor quickly.
          if (distToCursor < WIND_RADIUS) {
            const windFalloff = 1 - distToCursor / WIND_RADIUS;
            p.vx += mouseState.vx * WIND_SCALE * windFalloff;
            p.vy += mouseState.vy * WIND_SCALE * windFalloff;
          }

          // ── 2. Positional attraction toward cursor ──────────────────────
          // Each frame, particles within ATTRACTION_RADIUS get a tiny nudge
          // toward the cursor. Because ATTRACTION is small and FRICTION is
          // high, they never fully reach it — they drift closer but always
          // lag behind. Moving the cursor creates an ever-changing "target"
          // so the gap between cursor and particle constantly shifts.
          if (distToCursor < ATTRACTION_RADIUS && distToCursor > REPULSION_RADIUS) {
            const attrFalloff = 1 - distToCursor / ATTRACTION_RADIUS;
            const normX = dx / distToCursor;
            const normY = dy / distToCursor;
            p.vx += normX * ATTRACTION * attrFalloff;
            p.vy += normY * ATTRACTION * attrFalloff;
          }

          // ── 3. Soft repulsion — cursor's immediate vicinity ─────────────
          // Prevents all particles from piling up exactly on the cursor.
          // Instead they orbit loosely around it at ~REPULSION_RADIUS px.
          if (distToCursor <= REPULSION_RADIUS) {
            const pushStrength = (1 - distToCursor / REPULSION_RADIUS) * 0.06;
            p.vx -= (dx / distToCursor) * pushStrength;
            p.vy -= (dy / distToCursor) * pushStrength;
          }
        }

        // ── 4. Very weak home spring ──────────────────────────────────────
        // Gently nudges each particle back toward its spawn point so they
        // don't drift off-screen permanently. Weak enough that aggressive
        // sweeping can carry them far away for several seconds first.
        p.vx += (p.originX - p.x) * HOME_SPRING;
        p.vy += (p.originY - p.y) * HOME_SPRING;

        // ── 5. Friction ───────────────────────────────────────────────────
        p.vx *= FRICTION;
        p.vy *= FRICTION;

        // ── 6. Speed cap ──────────────────────────────────────────────────
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > MAX_SPEED) {
          p.vx = (p.vx / speed) * MAX_SPEED;
          p.vy = (p.vy / speed) * MAX_SPEED;
        }

        p.x += p.vx;
        p.y += p.vy;

        // Slight rotation proportional to speed for organic feel
        p.angle += speed * 0.012;

        // ── Draw pill ─────────────────────────────────────────────────────
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
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
        ctx.closePath();
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.opacity})`;
        ctx.fill();
        ctx.restore();
      }
    };

    // Track raw mouse position and compute smoothed velocity
    const onMouseMove = (e: MouseEvent) => {
      const rawVx = e.clientX - mouseState.prevX;
      const rawVy = e.clientY - mouseState.prevY;
      // Exponential moving average keeps velocity smooth, not jittery
      mouseState.vx = mouseState.vx * 0.55 + rawVx * 0.45;
      mouseState.vy = mouseState.vy * 0.55 + rawVy * 0.45;
      mouseState.prevX = mouseState.x;
      mouseState.prevY = mouseState.y;
      mouseState.x = e.clientX;
      mouseState.y = e.clientY;
    };

    const onMouseLeave = () => {
      mouseState.x = -9999; mouseState.y = -9999;
      mouseState.vx = 0;    mouseState.vy = 0;
    };

    // Touch: compute velocity from touch movement too
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const tx = e.touches[0].clientX;
      const ty = e.touches[0].clientY;
      const rawVx = tx - (mouseState.prevX === -9999 ? tx : mouseState.prevX);
      const rawVy = ty - (mouseState.prevY === -9999 ? ty : mouseState.prevY);
      mouseState.vx = mouseState.vx * 0.55 + rawVx * 0.45;
      mouseState.vy = mouseState.vy * 0.55 + rawVy * 0.45;
      mouseState.prevX = mouseState.x;
      mouseState.prevY = mouseState.y;
      mouseState.x = tx;
      mouseState.y = ty;
    };

    const onTouchEnd = () => {
      mouseState.vx = 0; mouseState.vy = 0;
    };

    const onVisibility = () => { paused = document.hidden; };
    const onResize = () => { clearTimeout(rzTimer); rzTimer = setTimeout(() => { resize(); init(); }, 200); };

    window.addEventListener('mousemove',          onMouseMove,  { passive: true });
    window.addEventListener('touchmove',          onTouchMove,  { passive: true });
    window.addEventListener('touchstart',         onTouchMove,  { passive: true });
    window.addEventListener('touchend',           onTouchEnd,   { passive: true });
    window.addEventListener('resize',             onResize,     { passive: true });
    document.addEventListener('mouseleave',       onMouseLeave);
    document.addEventListener('visibilitychange', onVisibility);

    resize(); init();
    rafId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(rzTimer);
      window.removeEventListener('mousemove',          onMouseMove);
      window.removeEventListener('touchmove',          onTouchMove);
      window.removeEventListener('touchstart',         onTouchMove);
      window.removeEventListener('touchend',           onTouchEnd);
      window.removeEventListener('resize',             onResize);
      document.removeEventListener('mouseleave',       onMouseLeave);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // ─── ESC closes modal ─────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsModalOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onAskAIClick(query);
    setIsSent(true); setQuery("");
    setTimeout(() => setIsSent(false), 3000);
  };

  return (
    <section
      className="relative min-h-screen md:min-h-[170vh] flex flex-col items-center bg-white text-black overflow-x-hidden pt-36 pb-24"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .typewriter-cursor {
          display: inline-block;
          width: 4px;
          height: 0.9em;
          margin-left: 4px;
          vertical-align: middle;
          background: linear-gradient(to bottom, #a855f7, #3b82f6);
          animation: blink 1s step-end infinite;
        }
        .typewriter-cursor.is-typing {
          animation: none;
          opacity: 1;
        }
      `}</style>

      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-[2000ms] ${showParticles ? 'opacity-100' : 'opacity-0'}`}
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-7xl">

        {/* ── Title ── */}
        <div className="min-h-[160px] md:min-h-[220px] flex items-center justify-center w-full mb-12">
          <h1
            className="text-4xl md:text-8xl font-bold tracking-[-0.02em] relative inline-block"
            style={{ fontFamily: '"Montserrat", sans-serif' }}
          >
            <span>{displayText}</span>
            {displayText.length < fullText.length && (
              <span className={`typewriter-cursor ${isTyping ? 'is-typing' : ''}`} />
            )}
            <span className="opacity-0 select-none" aria-hidden="true">
              {fullText.slice(displayText.length)}
            </span>
          </h1>
        </div>

        <p className={`text-base md:text-2xl text-zinc-500 mb-16 max-w-2xl font-light italic transition-all duration-1000 ${showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {t.heroSubtitle}
        </p>

        {/* ── CTA + Input ── */}
        <div className="flex flex-col items-center gap-16 mb-40 w-full max-w-md">
          <button
            onClick={onBookingClick}
            className={`group bg-black text-white px-10 py-4 rounded-full text-base font-medium flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-700 shadow-xl ${
              showCTA ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90 pointer-events-none'
            }`}
          >
            <span className="whitespace-nowrap">{t.startJourney}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </button>

          <div className={`w-full space-y-6 transition-all duration-1000 delay-300 ${showInput ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}`}>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-black text-center">
              {isSent ? t.openingChat : t.askAiAgent}
            </h3>
            <form
              onSubmit={handleAISubmit}
              className={`relative flex items-center bg-white border-2 border-black rounded-2xl p-1.5 transition-all duration-300 shadow-lg focus-within:shadow-xl ${
                isSent ? 'border-green-600 bg-green-50' : ''
              }`}
            >
              <input
                ref={heroInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isSent ? "" : placeholder}
                disabled={isSent}
                className="w-full bg-transparent px-5 py-3 text-base outline-none text-black font-medium placeholder:text-zinc-400"
                style={{ fontFamily: 'Georgia, serif' }}
              />
              <button
                type="submit"
                disabled={!query.trim() || isSent}
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                  query.trim() && !isSent ? 'bg-black text-white' : 'opacity-0'
                }`}
              >
                <span className="sr-only">Send</span>
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* ── Video ── */}
        <div
          className="w-full max-w-[90rem] sticky top-32 transition-all duration-700"
          style={{ opacity: scrollOpacity, transform: `scale(${scrollScale})` }}
        >
          <div
            ref={videoContainerRef}
            onClick={() => setIsModalOpen(true)}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHoveringVideo(true)}
            onMouseLeave={() => setIsHoveringVideo(false)}
            onTouchEnd={(e) => { e.preventDefault(); setIsModalOpen(true); }}
            className={`group relative aspect-video w-full rounded-3xl overflow-hidden shadow-2xl bg-black border border-zinc-100 ${isTouch ? 'cursor-pointer' : 'cursor-none'}`}
          >
            {/* Desktop: magnetic floating pill */}
            {!isTouch && (
              <div
                className={`pointer-events-none absolute z-50 flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full font-bold shadow-2xl transition-opacity duration-300 ${isHoveringVideo ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  left: `${currentPos.x}px`,
                  top:  `${currentPos.y}px`,
                  transform: 'translate(-50%, -50%)',
                  fontFamily: '"Montserrat", sans-serif',
                }}
              >
                <Play className="w-4 h-4 fill-black" />
                <span className="text-xs uppercase tracking-widest whitespace-nowrap">{t.playIntro}</span>
              </div>
            )}

            {/* Touch: static centred play pill */}
            {isTouch && (
              <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div
                  className="flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full font-bold shadow-2xl"
                  style={{ fontFamily: '"Montserrat", sans-serif' }}
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span className="text-xs uppercase tracking-widest whitespace-nowrap">{t.playIntro}</span>
                </div>
              </div>
            )}

            <div className="absolute inset-0 z-20 bg-black/10 transition-colors group-hover:bg-black/20" />

            {!isModalOpen && (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&iv_load_policy=3&rel=0`}
                className="absolute inset-[-2%] w-[104%] h-[104%] opacity-60 grayscale pointer-events-none object-cover scale-110"
                style={{ border: 'none' }}
              />
            )}
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-7xl aspect-video z-[110] rounded-3xl overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.3)] border border-zinc-200 bg-black">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-3 z-[130] group bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-md transition-all"
              aria-label="Close video"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&modestbranding=1&rel=0&showinfo=0`}
              className="w-[102%] h-[102%] ml-[-1%] mt-[-1%] scale-105"
              allow="autoplay; encrypted-media; fullscreen"
              title="Intro Video"
              style={{ border: 'none' }}
            />
          </div>
        </div>
      )}
    </section>
  );
}