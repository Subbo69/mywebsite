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
  low: { pills: 200, dots: 50, fps: 30 },
  medium: { pills: 300, dots: 80, fps: 45 },
  high: { pills: 400, dots: 150, fps: 60 },
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
  
  const [messageCount, setMessageCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const [placeholder, setPlaceholder] = useState("");
  const placeholderPhrases = [t.howCanWeHelp, t.heroPlaceholder1, t.heroPlaceholder2, t.heroPlaceholder3];
  const [phraseIdx, setPhraseIdx] = useState(0);

  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [isHoveringVideo, setIsHoveringVideo] = useState(false);

  const fullText = t.heroTitle;
  const VIDEO_ID = "Py1ClI35v_k";
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
            }, 500);
            return () => clearTimeout(t4);
          }, 500);
          return () => clearTimeout(t3);
        }, 700);
        return () => clearTimeout(t2);
      }, 300);
      return () => clearTimeout(t1);
    }
  }, [isTyping, displayText, fullText]);

  useEffect(() => {
    let cur = ""; let del = false; let timer: NodeJS.Timeout;
    const type = () => {
      const phrase = placeholderPhrases[phraseIdx];
      let speed = 80;
      if (!del) {
        cur = phrase.slice(0, cur.length + 1);
        if (cur === phrase) { speed = 3000; del = true; }
      } else {
        cur = phrase.slice(0, cur.length - 1); speed = 40;
        if (cur === "") { del = false; setPhraseIdx(p => (p + 1) % placeholderPhrases.length); speed = 1000; }
      }
      setPlaceholder(cur); timer = setTimeout(type, speed);
    };
    timer = setTimeout(type, 500);
    return () => clearTimeout(timer);
  }, [phraseIdx, language]);

  useEffect(() => {
    let i = 0; let mounted = true;
    setDisplayText(""); setIsTyping(true);
    const type = () => {
      if (!mounted) return;
      if (i <= fullText.length) { setDisplayText(fullText.slice(0, i++)); setTimeout(type, 40); }
      else setIsTyping(false);
    };
    const t0 = setTimeout(type, 280);
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const tier = getDeviceTier();
    const cfg = TIER_CONFIG[tier];
    const FRAME_INTERVAL = 1000 / cfg.fps;
    const COLOR_BANDS = [{ r: 138, g: 143, b: 234 }, { r: 66, g: 133, b: 244 }, { r: 180, g: 60, b: 160 }, { r: 234, g: 67, b: 53 }, { r: 251, g: 188, b: 5 }];
    const SPRING = 0.035; const FRICTION = 0.82;
    type Particle = { x: number; y: number; originX: number; originY: number; vx: number; vy: number; angle: number; width: number; height: number; r: number; g: number; b: number; opacity: number; };
    let particles: Particle[] = [];
    let last = 0; let rafId: number;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    const init = () => {
      particles = []; const cx = canvas.width / 2; const cy = canvas.height / 2;
      for (let i = 0; i < cfg.pills; i++) {
        const dist = Math.random() * (canvas.width * 0.45); const angle = Math.random() * Math.PI * 2;
        const ox = cx + Math.cos(angle) * dist; const oy = cy + Math.sin(angle) * dist;
        const col = COLOR_BANDS[Math.floor(Math.random() * COLOR_BANDS.length)];
        const size = 1.2 + Math.random() * 3;
        particles.push({ x: ox, y: oy, originX: ox, originY: oy, vx: 0, vy: 0, angle: Math.random() * Math.PI, width: size * 3, height: size * 0.6, r: col.r, g: col.g, b: col.b, opacity: 0.45 });
      }
    };
    const animate = (ts: number) => {
      rafId = requestAnimationFrame(animate); if (ts - last < FRAME_INTERVAL) return; last = ts;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let p of particles) {
        p.vx += (p.originX - p.x) * SPRING; p.vy += (p.originY - p.y) * SPRING; p.vx *= FRICTION; p.vy *= FRICTION; p.x += p.vx; p.y += p.vy;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.angle); ctx.fillStyle = `rgba(${p.r},${p.g},${p.b},${p.opacity})`;
        ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height); ctx.restore();
      }
    };
    window.addEventListener('resize', resize); resize(); init(); rafId = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener('resize', resize); };
  }, []);

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    if (!query.trim()) return;
    if (messageCount >= 25) { setErrorMessage("Message limit reached (25/25)."); return; }
    if (query.length > 2000) { setErrorMessage("Limit: 2000 characters per message."); return; }
    onAskAIClick(query);
    setMessageCount(prev => prev + 1);
    setIsSent(true); setQuery("");
    setTimeout(() => setIsSent(false), 3000);
  };

  return (
    <section className="relative min-h-[100vh] flex flex-col items-center bg-white text-black overflow-x-hidden pt-16 md:pt-24 pb-12" style={{ fontFamily: 'Georgia, serif' }}>
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes bounce-sm { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(5px); } }
        .typewriter-cursor { display: inline-block; width: 3px; height: 0.9em; margin-left: 4px; vertical-align: middle; background: #3b82f6; animation: blink 1s step-end infinite; }
      `}</style>

      <canvas ref={canvasRef} className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-[2000ms] ${showParticles ? 'opacity-100' : 'opacity-0'}`} />

      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-5xl">
        {/* Adjusted Title Size */}
        <div className="min-h-[140px] md:min-h-[260px] flex items-center justify-center w-full mb-4">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05]" style={{ fontFamily: '"Montserrat", sans-serif' }}>
            <span>{displayText}</span>
            {displayText.length < fullText.length && <span className="typewriter-cursor" />}
          </h1>
        </div>

        <p className={`text-base md:text-xl text-zinc-500 mb-8 md:mb-12 max-w-2xl font-light italic transition-all duration-1000 ${showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {t.heroSubtitle}
        </p>

        <div className="flex flex-col items-center gap-10 w-full max-w-lg">
          <button onClick={onBookingClick} className={`group bg-black text-white px-10 py-4 rounded-full text-base font-medium flex items-center gap-2 hover:scale-105 transition-all duration-700 shadow-xl ${showCTA ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'}`}>
            <span className="whitespace-nowrap">{t.startJourney}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className={`w-full space-y-4 transition-all duration-1000 ${showInput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}`}>
            <div className="flex flex-col items-center">
              <h3 className="text-[11px] md:text-xs uppercase tracking-[0.45em] font-black text-black">
                {isSent ? t.openingChat : t.askAiAgent}
              </h3>
              {!isSent && <ChevronDown className="w-5 h-5 text-blue-500 animate-bounce-sm" />}
            </div>

            <form onSubmit={handleAISubmit} className="relative flex items-center bg-white border-2 border-black rounded-2xl p-2 shadow-2xl focus-within:border-blue-500 transition-all">
              <input
                ref={heroInputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                placeholder={isSent ? "" : placeholder} disabled={isSent}
                className="w-full bg-transparent px-5 py-3 text-base outline-none text-black font-medium"
                style={{ fontFamily: 'Georgia, serif' }}
              />
              <button type="submit" disabled={!query.trim() || isSent} className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${query.trim() && !isSent ? 'bg-black text-white' : 'opacity-0'}`}>
                <Send className="w-5 h-5" />
              </button>
            </form>
            {errorMessage && <p className="text-red-500 text-xs font-bold bg-red-50 py-1.5 px-3 rounded-md">{errorMessage}</p>}
          </div>
        </div>

        {/* Video preview lowered slightly */}
        <div className="w-full max-w-5xl mt-32 transition-all duration-700" style={{ opacity: scrollOpacity, transform: `scale(${scrollScale})` }}>
          <div ref={videoContainerRef} onClick={() => setIsModalOpen(true)} onMouseMove={handleMouseMove} onMouseEnter={() => setIsHoveringVideo(true)} onMouseLeave={() => setIsHoveringVideo(false)} className={`group relative aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-black border border-zinc-100 ${isTouch ? 'cursor-pointer' : 'cursor-none'}`}>
            {!isTouch && (
              <div className={`pointer-events-none absolute z-50 flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full font-bold shadow-2xl transition-opacity duration-300 ${isHoveringVideo ? 'opacity-100' : 'opacity-0'}`} style={{ left: `${currentPos.x}px`, top: `${currentPos.y}px`, transform: 'translate(-50%, -50%)', fontFamily: '"Montserrat", sans-serif' }}>
                <Play className="w-4 h-4 fill-black" />
                <span className="text-xs uppercase tracking-widest whitespace-nowrap">{t.playIntro}</span>
              </div>
            )}
            <div className="absolute inset-0 z-20 bg-black/10 group-hover:bg-black/20" />
            {!isModalOpen && (
              <iframe src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0`} className="absolute inset-[-2%] w-[104%] h-[104%] opacity-60 grayscale pointer-events-none object-cover scale-110" style={{ border: 'none' }} />
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/85 backdrop-blur-md p-4">
          <div className="relative w-full max-w-6xl aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-3 z-[130] bg-black/40 rounded-full text-white"><X className="w-6 h-6" /></button>
            <iframe src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1`} className="w-full h-full" allow="autoplay; fullscreen" style={{ border: 'none' }} />
          </div>
        </div>
      )}
    </section>
  );
}