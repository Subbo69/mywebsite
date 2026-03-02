import { ArrowRight, Send, Play, X } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useEffect, useRef, useState } from 'react';

interface HeroProps {
  onBookingClick: () => void;
  onAskAIClick: (initialMessage?: string) => void;
  language: Language;
}

export default function Hero({ onBookingClick, onAskAIClick, language }: HeroProps) {
  const t = translations[language];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  
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
  
  const [placeholder, setPlaceholder] = useState("");
  const placeholderPhrases = [t.howCanWeHelp, t.heroPlaceholder1, t.heroPlaceholder2, t.heroPlaceholder3];
  const [phraseIdx, setPhraseIdx] = useState(0);

  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [isHoveringVideo, setIsHoveringVideo] = useState(false);

  const fullText = t.heroTitle;
  const VIDEO_ID = "Py1ClI35v_k";

  // Magnetic Video Button Logic
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoContainerRef.current) return;
    const rect = videoContainerRef.current.getBoundingClientRect();
    setTargetPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useEffect(() => {
    if (!isHoveringVideo || isModalOpen) return;
    let frame: number;
    const follow = () => {
      setCurrentPos(prev => ({
        x: prev.x + (targetPos.x - prev.x) * 0.15,
        y: prev.y + (targetPos.y - prev.y) * 0.15
      }));
      frame = requestAnimationFrame(follow);
    };
    frame = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(frame);
  }, [targetPos, isHoveringVideo, isModalOpen]);

  // UI Choreography
  useEffect(() => {
    if (!isTyping && displayText.length === fullText.length) {
      setTimeout(() => setShowSubtitle(true), 300);
      setTimeout(() => setShowCTA(true), 800);
      setTimeout(() => {
        setShowInput(true);
        setTimeout(() => {
          setShowParticles(true);
          heroInputRef.current?.focus({ preventScroll: true });
        }, 600);
      }, 1300);
    }
  }, [isTyping, displayText, fullText]);

  // Placeholder Typewriter
  useEffect(() => {
    let currentText = "";
    let isDeleting = false;
    let timer: NodeJS.Timeout;
    const type = () => {
      const phrase = placeholderPhrases[phraseIdx];
      let speed = isDeleting ? 40 : 80;
      if (!isDeleting) {
        currentText = phrase.slice(0, currentText.length + 1);
        if (currentText === phrase) { speed = 3000; isDeleting = true; }
      } else {
        currentText = phrase.slice(0, currentText.length - 1);
        if (currentText === "") {
          isDeleting = false;
          setPhraseIdx((prev) => (prev + 1) % placeholderPhrases.length);
          speed = 500;
        }
      }
      setPlaceholder(currentText);
      timer = setTimeout(type, speed);
    };
    timer = setTimeout(type, 500);
    return () => clearTimeout(timer);
  }, [phraseIdx, language]);

  // Main Title Typewriter
  useEffect(() => {
    let i = 0;
    setDisplayText("");
    setIsTyping(true);
    const type = () => {
      if (i <= fullText.length) {
        setDisplayText(fullText.slice(0, i));
        i++;
        setTimeout(type, 50);
      } else { setIsTyping(false); }
    };
    setTimeout(type, 300);
  }, [fullText]);

  // Scroll Video Animation
  useEffect(() => {
    const handleScroll = () => {
      const progress = Math.min(Math.max((window.scrollY - 50) / 400, 0), 1);
      setScrollOpacity(progress);
      setScrollScale(0.85 + (progress * 0.15));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- IMPROVED PHYSICS ENGINE ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    const PARTICLE_COUNT = 160;

    class Particle {
      x: number; y: number; baseX: number; baseY: number;
      vx: number; vy: number;
      z: number; baseSize: number;
      color: string;

      constructor(w: number, h: number) {
        this.x = this.baseX = Math.random() * w;
        this.y = this.baseY = Math.random() * h;
        this.vx = 0; this.vy = 0;
        this.z = Math.random() * 0.6 + 0.4;
        this.baseSize = this.z * 3.5 + 1;
        this.color = this.getColor(w, h);
      }

      getColor(w: number, h: number) {
        const xP = this.x / w; const yP = this.y / h;
        const op = 0.35 * this.z;
        if (xP < 0.5 && yP < 0.5) return `rgba(66, 133, 244, ${op})`;
        if (xP >= 0.5 && yP < 0.5) return `rgba(251, 188, 5, ${op})`;
        if (xP < 0.5 && yP >= 0.5) return `rgba(52, 168, 83, ${op})`;
        return `rgba(234, 67, 53, ${op})`;
      }

      update() {
        const dx = mouseRef.current.x - this.x;
        const dy = mouseRef.current.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const radius = 300;

        // Swarm Cursor
        if (dist < radius) {
          const force = (radius - dist) / radius;
          this.vx += (dx / dist) * force * 1.2 * this.z;
          this.vy += (dy / dist) * force * 1.2 * this.z;
        }

        // Return Home
        this.vx += (this.baseX - this.x) * 0.03;
        this.vy += (this.baseY - this.y) * 0.03;

        this.vx *= 0.92; this.vy *= 0.92;
        this.x += this.vx; this.y += this.vy;
      }

      draw(c: CanvasRenderingContext2D) {
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        const angle = Math.atan2(this.vy, this.vx);
        
        // Swell logic: dots get thicker/larger only when moving fast
        const stretch = Math.min(speed * 3, 35);
        const swell = Math.min(speed * 0.7, 8);

        c.save();
        c.translate(this.x, this.y);
        c.rotate(angle);
        c.beginPath();
        c.fillStyle = this.color;
        
        const w = this.baseSize + stretch + swell;
        const h = this.baseSize + (swell * 0.5);
        
        c.roundRect(-w/2, -h/2, w, h, h/2);
        c.fill();
        c.restore();
      }
    }

    const init = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle(canvas.width, canvas.height));
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(ctx); });
      requestAnimationFrame(loop);
    };

    const handleMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('resize', init);
    window.addEventListener('mousemove', handleMove);
    init(); loop();

    return () => {
      window.removeEventListener('resize', init);
      window.removeEventListener('mousemove', handleMove);
    };
  }, []);

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onAskAIClick(query);
    setIsSent(true);
    setQuery("");
    setTimeout(() => setIsSent(false), 3000);
  };

  return (
    <section className="relative min-h-screen md:min-h-[170vh] flex flex-col items-center bg-white text-black overflow-x-hidden pt-36 pb-24" style={{ fontFamily: 'Georgia, serif' }}>
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .typewriter-cursor { display: inline-block; width: 4px; height: 0.9em; margin-left: 4px; vertical-align: middle; background: linear-gradient(to bottom, #a855f7, #3b82f6); animation: blink 1s step-end infinite; }
      `}</style>

      <canvas ref={canvasRef} className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-[2000ms] ${showParticles ? 'opacity-100' : 'opacity-0'}`} />
      
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-7xl">
        <div className="min-h-[160px] md:min-h-[220px] flex items-center justify-center w-full mb-12">
          <h1 className="text-4xl md:text-8xl font-bold tracking-[-0.02em] relative inline-block" style={{ fontFamily: '"Montserrat", sans-serif' }}>
            <span>{displayText}</span>
            {displayText.length < fullText.length && <span className="typewriter-cursor" />}
          </h1>
        </div>

        <p className={`text-base md:text-2xl text-zinc-500 mb-16 max-w-2xl font-light italic transition-all duration-1000 ${showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {t.heroSubtitle}
        </p>

        <div className="flex flex-col items-center gap-16 mb-40 w-full max-w-md">
          <button onClick={onBookingClick} className={`group bg-black text-white px-10 py-4 rounded-full text-base font-medium flex items-center gap-2 transition-all duration-700 shadow-xl ${showCTA ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
            <span>{t.startJourney}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className={`w-full space-y-6 transition-all duration-1000 ${showInput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-black">{isSent ? t.openingChat : t.askAiAgent}</h3>
            <form onSubmit={handleAISubmit} className="relative flex items-center bg-white border-2 border-black rounded-2xl p-1.5 shadow-lg">
              <input ref={heroInputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={isSent ? "" : placeholder} disabled={isSent} className="w-full bg-transparent px-5 py-3 outline-none font-medium" />
              <button type="submit" disabled={!query.trim() || isSent} className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${query.trim() && !isSent ? 'bg-black text-white' : 'opacity-0'}`}>
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        <div className="w-full max-w-[90rem] sticky top-32 transition-all duration-700" style={{ opacity: scrollOpacity, transform: `scale(${scrollScale})` }}>
          <div ref={videoContainerRef} onClick={() => setIsModalOpen(true)} onMouseMove={handleMouseMove} onMouseEnter={() => setIsHoveringVideo(true)} onMouseLeave={() => setIsHoveringVideo(false)} className="group relative aspect-video w-full rounded-3xl overflow-hidden shadow-2xl bg-black cursor-none">
            <div className={`absolute z-50 flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full font-bold shadow-2xl transition-opacity duration-300 ${isHoveringVideo ? 'opacity-100' : 'opacity-0'}`} style={{ left: `${currentPos.x}px`, top: `${currentPos.y}px`, transform: 'translate(-50%, -50%)', fontFamily: '"Montserrat", sans-serif' }}>
              <Play className="w-4 h-4 fill-black" />
              <span className="text-xs uppercase tracking-widest">{t.playIntro}</span>
            </div>
            {!isModalOpen && (
              <iframe src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0`} className="absolute inset-[-2%] w-[104%] h-[104%] opacity-60 grayscale pointer-events-none object-cover" />
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-7xl aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-3 z-[130] bg-black/20 hover:bg-black/40 rounded-full backdrop-blur-md transition-all">
              <X className="w-6 h-6 text-white" />
            </button>
            <iframe src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&modestbranding=1`} className="w-full h-full" allow="autoplay; fullscreen" />
          </div>
        </div>
      )}
    </section>
  );
}