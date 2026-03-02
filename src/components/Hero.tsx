import { ArrowRight, Send, Play, X, ChevronDown } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useEffect, useRef, useState } from 'react';

interface HeroProps {
  onBookingClick: () => void;
  onAskAIClick: (initialMessage?: string) => void;
  language: Language;
}

// ─── Device Tier Detection ────────────────────────────────────────────────────
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
  low: { pills: 220, dots: 60, fps: 30 },
  medium: { pills: 320, dots: 100, fps: 45 },
  high: { pills: 420, dots: 180, fps: 60 },
};

export default function Hero({ onBookingClick, onAskAIClick, language }: HeroProps) {
  const t = translations[language];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(0);
  const [scrollScale, setScrollScale] = useState(0.85);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  
  // Safety & Usage Limits
  const [messageCount, setMessageCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const [placeholder, setPlaceholder] = useState("");
  const placeholderPhrases = [
    t.howCanWeHelp,
    t.heroPlaceholder1,
    t.heroPlaceholder2,
    t.heroPlaceholder3
  ];
  const [phraseIdx, setPhraseIdx] = useState(0);

  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [isHoveringVideo, setIsHoveringVideo] = useState(false);

  const fullText = t.heroTitle;
  const VIDEO_ID = "Py1ClI35v_k";

  const isTouch = typeof window !== 'undefined' &&
    ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // ─── Mouse tracking ───────────────────────────────────────────────────────
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

  // ─── Choreography Sync ────────────────────────────────────────────────────
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
          }, 800); // Slightly longer delay to let the UI breathe
          return () => clearTimeout(t3);
        }, 1000); // Give user time to read the subtitle
        return () => clearTimeout(t2);
      }, 400);
      return () => clearTimeout(t1);
    }
  }, [isTyping, displayText, fullText]);

  // ─── Placeholder Typewriter ───────────────────────────────────────────────
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

  // ─── Title Typewriter ─────────────────────────────────────────────────────
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

  // ─── Scroll Reveal ────────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => {
      const p = Math.min(Math.max((window.scrollY - 50) / 300, 0), 1);
      setScrollOpacity(p); setScrollScale(0.85 + p * 0.15);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ─── Particle Engine ──────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const tier = getDeviceTier();
    const cfg = TIER_CONFIG[tier];
    const FRAME_INTERVAL = 1000 / cfg.fps;
    const COLOR_BANDS = [{ r: 138, g: 143, b: 234 }, { r: 100, g: 120, b: 220 }, { r: 66, g: 133, b: 244 }, { r: 120, g: 80, b: 200 }, { r: 180, g: 60, b: 160 }, { r: 210, g: 50, b: 80 }, { r: 234, g: 67, b: 53 }, { r: 240, g: 120, b: 30 }, { r: 251, g: 188, b: 5 }];
    const SPRING = 0.032; const FRICTION = 0.80; const WIND_SCALE = 0.18; const WIND_RADIUS = 380;
    type Particle = { x: number; y: number; originX: number; originY: number; vx: number; vy: number; angle: number; width: number; height: number; r: number; g: number; b: number; opacity: number; };
    let particles: Particle[] = [];
    const mouseState = { x: -9999, y: -9999, vx: 0, vy: 0, prevX: -9999, prevY: -9999 };
    let last = 0; let rafId: number; let rzTimer: ReturnType<typeof setTimeout>; let paused = false;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    const getColor = (ox: number, oy: number, dist: number, maxDist: number) => {
      const distFraction = dist / (maxDist * 0.85);
      const yFraction = oy / canvas.height;
      return COLOR_BANDS[Math.floor(Math.min(distFraction * 0.5 + yFraction * 0.5, 0.999) * COLOR_BANDS.length)];
    };
    const init = () => {
      particles = []; const cx = canvas.width / 2; const cy = canvas.height / 2; const maxDist = Math.sqrt(cx * cx + cy * cy);
      for (let i = 0; i < cfg.pills; i++) {
        const t_val = Math.pow(Math.random(), 0.55); const dist = t_val * maxDist * 0.85; const angle = Math.random() * Math.PI * 2;
        const ox = cx + Math.cos(angle) * dist; const oy = cy + Math.sin(angle) * dist; const col = getColor(ox, oy, dist, maxDist);
        const distFraction = dist / (maxDist * 0.85); const size = 1.5 + (1 - distFraction) * 3.5;
        particles.push({ x: ox, y: oy, originX: ox, originY: oy, vx: 0, vy: 0, angle: angle + Math.PI / 2 + (Math.random() - 0.5) * 0.6, width: size * (2.5 + Math.random() * 2), height: size * 0.6, r: col.r, g: col.g, b: col.b, opacity: 0.55 + Math.random() * 0.35 });
      }
      for (let i = 0; i < cfg.dots; i++) {
        const ox = Math.random() * canvas.width; const oy = Math.random() * canvas.height;
        const col = getColor(ox, oy, 0, maxDist);
        particles.push({ x: ox, y: oy, originX: ox, originY: oy, vx: 0, vy: 0, angle: Math.random() * Math.PI, width: 1.5 + Math.random() * 2, height: 0.8, r: col.r, g: col.g, b: col.b, opacity: 0.2 + Math.random() * 0.25 });
      }
    };
    const animate = (ts: number) => {
      rafId = requestAnimationFrame(animate); if (paused || ts - last < FRAME_INTERVAL) return; last = ts;
      ctx.clearRect(0, 0, canvas.width, canvas.height); mouseState.vx *= 0.85; mouseState.vy *= 0.85;
      for (let p of particles) {
        const dx = p.x - mouseState.x; const dy = p.y - mouseState.y; const distToCursor = Math.sqrt(dx * dx + dy * dy);
        if (distToCursor < WIND_RADIUS && mouseState.x !== -9999) { const falloff = 1 - distToCursor / WIND_RADIUS; p.vx += mouseState.vx * WIND_SCALE * falloff; p.vy += mouseState.vy * WIND_SCALE * falloff; }
        p.vx += (p.originX - p.x) * SPRING; p.vy += (p.originY - p.y) * SPRING; p.vx *= FRICTION; p.vy *= FRICTION; p.x += p.vx; p.y += p.vy; p.angle += Math.sqrt(p.vx * p.vx + p.vy * p.vy) * 0.012;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.beginPath();
        const w = p.width; const h = p.height; const rv = h / 2;
        ctx.moveTo(-w / 2 + rv, -h / 2); ctx.lineTo(w / 2 - rv, -h / 2); ctx.arcTo(w / 2, -h / 2, w / 2, h / 2, rv); ctx.lineTo(w / 2 - rv, h / 2); ctx.arcTo(w / 2, h / 2, -w / 2, h / 2, rv); ctx.lineTo(-w / 2 + rv, h / 2); ctx.arcTo(-w / 2, h / 2, -w / 2, -h / 2, rv); ctx.lineTo(-w / 2 + rv, -h / 2); ctx.arcTo(-w / 2, -h / 2, w / 2, -h / 2, rv);
        ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.opacity})`; ctx.fill(); ctx.restore();
      }
    };
    const onMouseMove = (e: MouseEvent) => {
      if (mouseState.prevX === -9999) { mouseState.x = e.clientX; mouseState.y = e.clientY; mouseState.prevX = e.clientX; mouseState.prevY = e.clientY; return; }
      const rawVx = e.clientX - mouseState.prevX; const rawVy = e.clientY - mouseState.prevY;
      mouseState.vx = mouseState.vx * 0.6 + rawVx * 0.4; mouseState.vy = mouseState.vy * 0.6 + rawVy * 0.4;
      mouseState.prevX = mouseState.x; mouseState.prevY = mouseState.y; mouseState.x = e.clientX; mouseState.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    resize(); init(); rafId = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('mousemove', onMouseMove); };
  }, []);

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!query.trim()) return;

    if (messageCount >= 25) {
      setErrorMessage("Limit reached: You can send 25 messages maximum.");
      return;
    }

    if (query.length > 2000) {
      setErrorMessage("Message too long: 2000 character limit.");
      return;
    }

    onAskAIClick(query);
    setMessageCount(prev => prev + 1);
    setIsSent(true); 
    setQuery("");
    setTimeout(() => setIsSent(false), 3000);
  };

  return (
    <section
      className="relative min-h-screen md:min-h-[140vh] flex flex-col items-center bg-white text-black overflow-x-hidden pt-24 md:pt-48 pb-24"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes bounce-subtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(6px); } }
        .typewriter-cursor {
          display: inline-block; width: 4px; height: 0.9em; margin-left: 4px;
          vertical-align: middle; background: linear-gradient(to bottom, #a855f7, #3b82f6);
          animation: blink 1s step-end infinite;
        }
        .animate-bounce-subtle { animation: bounce-subtle 2s ease-in-out infinite; }
      `}</style>

      <canvas ref={canvasRef} className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-[2000ms] ${showParticles ? 'opacity-100' : 'opacity-0'}`} />

      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-7xl">
        {/* Main Title - Increased size and spacing for PC */}
        <div className="min-h-[160px] md:min-h-[300px] flex items-center justify-center w-full mb-8 md:mb-16">
          <h1 className="text-4xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-[1.1]" style={{ fontFamily: '"Montserrat", sans-serif' }}>
            <span>{displayText}</span>
            {displayText.length < fullText.length && <span className="typewriter-cursor" />}
          </h1>
        </div>

        {/* Subtitle - More space for readability */}
        <p className={`text-base md:text-2xl text-zinc-500 mb-12 md:mb-24 max-w-3xl font-light italic transition-all duration-[1500ms] ${showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {t.heroSubtitle}
        </p>

        {/* Interaction Group - Spaced for better layout balance */}
        <div className="flex flex-col items-center gap-16 md:gap-24 w-full max-w-xl">
          <button
            onClick={onBookingClick}
            className={`group bg-black text-white px-12 py-5 rounded-full text-lg font-medium flex items-center gap-3 hover:scale-105 transition-all duration-1000 shadow-2xl ${
              showCTA ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-90 pointer-events-none'
            }`}
          >
            <span className="whitespace-nowrap">{t.startJourney}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className={`w-full space-y-4 transition-all duration-1000 delay-300 ${showInput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16 pointer-events-none'}`}>
            <div className="flex flex-col items-center gap-2">
              <h3 className="text-xs md:text-sm uppercase tracking-[0.4em] font-black text-black">
                {isSent ? t.openingChat : t.askAiAgent}
              </h3>
              {!isSent && <ChevronDown className="w-5 h-5 text-blue-500 animate-bounce-subtle" />}
            </div>

            <form onSubmit={handleAISubmit} className={`relative flex items-center bg-white border-2 border-black rounded-3xl p-2 transition-all duration-300 shadow-2xl ${isSent ? 'border-green-600 bg-green-50' : 'focus-within:border-blue-500'}`}>
              <input
                ref={heroInputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder={isSent ? "" : placeholder} disabled={isSent}
                className="w-full bg-transparent px-6 py-4 text-lg outline-none text-black font-medium"
                style={{ fontFamily: 'Georgia, serif' }}
              />
              <button type="submit" disabled={!query.trim() || isSent} className={`flex items-center justify-center w-14 h-14 rounded-2xl transition-all ${query.trim() && !isSent ? 'bg-black text-white' : 'opacity-0'}`}>
                <Send className="w-6 h-6" />
              </button>
            </form>
            {errorMessage && <p className="text-red-600 text-sm font-bold bg-red-50 py-2 px-4 rounded-lg inline-block">{errorMessage}</p>}
          </div>
        </div>

        {/* Video Preview - Sticky Scroll Effect */}
        <div className="w-full max-w-7xl mt-48 md:mt-64 transition-all duration-700" style={{ opacity: scrollOpacity, transform: `scale(${scrollScale})` }}>
          <div
            ref={videoContainerRef} onClick={() => setIsModalOpen(true)} onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHoveringVideo(true)} onMouseLeave={() => setIsHoveringVideo(false)}
            className={`group relative aspect-video w-full rounded-[3rem] overflow-hidden shadow-2xl bg-black border border-zinc-100 ${isTouch ? 'cursor-pointer' : 'cursor-none'}`}
          >
            {!isTouch && (
              <div className={`pointer-events-none absolute z-50 flex items-center gap-4 px-8 py-4 bg-white text-black rounded-full font-bold shadow-2xl transition-opacity duration-300 ${isHoveringVideo ? 'opacity-100' : 'opacity-0'}`}
                style={{ left: `${currentPos.x}px`, top: `${currentPos.y}px`, transform: 'translate(-50%, -50%)', fontFamily: '"Montserrat", sans-serif' }}>
                <Play className="w-5 h-5 fill-black" />
                <span className="text-sm uppercase tracking-widest whitespace-nowrap">{t.playIntro}</span>
              </div>
            )}
            <div className="absolute inset-0 z-20 bg-black/10 transition-colors group-hover:bg-black/20" />
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md p-6">
          <div className="relative w-full max-w-7xl aspect-video z-[110] rounded-[2rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.2)] bg-black">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 p-4 z-[130] bg-black/40 hover:bg-black/60 rounded-full transition-all text-white">
              <X className="w-8 h-8" />
            </button>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1`}
              className="w-full h-full" allow="autoplay; encrypted-media; fullscreen" style={{ border: 'none' }}
            />
          </div>
        </div>
      )}
    </section>
  );
}