import { ArrowRight, Send } from 'lucide-react';
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
  
  const [query, setQuery] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(0);
  const [scrollScale, setScrollScale] = useState(0.85);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const fullText = t.heroTitle;

  // --- TYPEWRITER LOGIC WITH NON-DISRUPTIVE AUTO-FOCUS ---
  useEffect(() => {
    let i = 0;
    let isMounted = true;
    setDisplayText("");
    setIsTyping(true);
    
    const type = () => {
      if (!isMounted) return;
      if (i <= fullText.length) {
        setDisplayText(fullText.slice(0, i));
        i++;
        setTimeout(type, Math.random() * 78 + 52);
      } else {
        setIsTyping(false); 
        
        // AUTO-FOCUS LOGIC
        setTimeout(() => {
          if (isMounted && heroInputRef.current) {
            heroInputRef.current.focus({
              preventScroll: true,
            });
          }
        }, 200);
      }
    };
    
    const startTimeout = setTimeout(type, 800); 
    return () => { isMounted = false; clearTimeout(startTimeout); };
  }, [fullText]);

  // --- VIDEO SCROLL LOGIC ---
  useEffect(() => {
    const handleScroll = () => {
      const progress = Math.min(Math.max((window.scrollY - 50) / 300, 0), 1);
      setScrollOpacity(progress);
      setScrollScale(0.85 + (progress * 0.15));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- PARTICLE ANIMATION ENGINE ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const PARTICLE_COUNT = 2600; 
    const HISTORY_FRAMES = 120; 

    let particles: any[] = [];
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let mouseHistory: {x: number, y: number}[] = Array(HISTORY_FRAMES).fill({ ...mouse });
    let ticker = 0;
    let waveActive = false;
    let lastWaveTime = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const getParticleColor = (x: number, y: number, opacity: number) => {
      const diagScore = (x + y) / (canvas.width + canvas.height);
      const hue = diagScore > 0.45 ? 212 : 272; 
      return `hsla(${hue}, 85%, 45%, ${opacity})`;
    };

    const init = () => {
      particles = [];
      const angleStep = Math.PI * (3 - Math.sqrt(5)); 
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = i * angleStep;
        const radius = Math.sqrt(i) * 16; 
        const z = 0.5 + Math.random();
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          offsetX: (Math.cos(angle) * radius),
          offsetY: (Math.sin(angle) * radius),
          z: z, 
          baseSize: Math.max(0.4, 1.1 * (1 - i / PARTICLE_COUNT)) * z,
          baseOpacity: Math.max(0.06, 0.35 * (1 - i / PARTICLE_COUNT)),
          randomOffset: Math.random() * 600,
          delayFrames: Math.floor((i / PARTICLE_COUNT) * 100) 
        });
      }
    };

    const handleMove = (e: MouseEvent | TouchEvent) => {
      let clientX, clientY;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX; clientY = e.touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX; clientY = (e as MouseEvent).clientY;
      }
      mouse.x = clientX; mouse.y = clientY;
    };

    const animate = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ticker += 0.005; 

      if (!waveActive && time - lastWaveTime > 6000) {
        waveActive = true;
        lastWaveTime = time;
        setTimeout(() => { waveActive = false; }, 3500);
      }

      mouseHistory.push({ ...mouse });
      if (mouseHistory.length > HISTORY_FRAMES) mouseHistory.shift();

      particles.forEach((p) => {
        const delayedMouse = mouseHistory[mouseHistory.length - 1 - p.delayFrames] || mouseHistory[0];
        const targetX = delayedMouse.x + (p.offsetX * p.z) + (Math.sin(ticker + p.randomOffset) * 4);
        const targetY = delayedMouse.y + (p.offsetY * p.z) + (Math.cos(ticker + p.randomOffset) * 4);

        p.x += (targetX - p.x) * (0.018 * p.z);
        p.y += (targetY - p.y) * (0.018 * p.z);

        let swell = 0;
        if (waveActive) {
          const dist = Math.sqrt((p.x - mouse.x)**2 + (p.y - mouse.y)**2);
          swell = Math.max(0, Math.sin((dist * 0.006) - (ticker * 2.5)) * 1.2);
        }

        const size = p.baseSize * (1 + (swell * 0.12));
        const color = getParticleColor(p.x, p.y, Math.min(0.65, p.baseOpacity + (swell * 0.1)));
        const gradRadius = size * 2.4; 
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, gradRadius);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.beginPath(); ctx.fillStyle = gradient;
        ctx.arc(p.x, p.y, gradRadius, 0, Math.PI * 2); ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: true });
    resize(); init(); requestAnimationFrame(animate);
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleMove);
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
    <section 
      className="relative min-h-screen md:min-h-[170vh] flex flex-col items-center bg-white text-black overflow-x-hidden pt-36 pb-24"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-5xl">
        
        <div className="min-h-[160px] md:min-h-[220px] flex items-center justify-center w-full mb-8">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tight font-sans">
            {displayText}
            {isTyping && <span className="animate-pulse font-light ml-1 opacity-60">|</span>}
          </h1>
        </div>

        <p className="text-xl md:text-2xl text-zinc-500 mb-12 max-w-2xl font-light italic">
          {t.heroSubtitle}
        </p>

        <div className="flex flex-col items-center gap-12 mb-32 w-full max-w-md">
          {/* IMPROVED RESPONSIVE BUTTON */}
          <button
            onClick={onBookingClick}
            className="group bg-black text-white px-8 py-4 md:px-12 md:py-5 rounded-full text-base md:text-lg font-medium flex items-center gap-2 md:gap-3 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10"
          >
            <span className="whitespace-nowrap">{t.startJourney}</span>
            <ArrowRight className="w-4 h-4 md:w-5 h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </button>

          <div className="w-full space-y-4">
            <h3 className="text-xs uppercase tracking-[0.25em] font-black text-black">
              {isSent ? t.openingChat : t.askAiAgent}
            </h3>
            
            <form 
              onSubmit={handleAISubmit}
              className={`relative flex items-center bg-white border-2 rounded-2xl p-1.5 transition-all duration-500 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus-within:translate-y-1 focus-within:translate-x-1 focus-within:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                isSent ? 'border-green-500 bg-green-50' : 'border-black'
              }`}
            >
              <input 
                ref={heroInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={isSent ? t.sendingMessage : t.howCanWeHelp}
                disabled={isSent}
                className="w-full bg-transparent px-4 py-3 text-base outline-none placeholder:text-zinc-500 text-black font-bold"
                style={{ fontFamily: 'Georgia, serif' }}
              />
              
              <button 
                type="submit"
                disabled={!query.trim() || isSent}
                className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${
                  query.trim() && !isSent
                  ? 'bg-black text-white scale-100 opacity-100 hover:scale-105 active:scale-95' 
                  : 'bg-zinc-200 text-zinc-400 scale-90 opacity-0 pointer-events-none'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        <div 
          className="w-full sticky top-32 transition-all duration-700"
          style={{ 
            opacity: scrollOpacity,
            transform: `scale(${scrollScale})`,
            filter: `blur(${(1 - scrollOpacity) * 10}px)`
          }}
        >
          <div className="relative aspect-video w-full rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-zinc-100 shadow-2xl bg-white">
            <iframe
              src="https://www.youtube-nocookie.com/embed/Py1ClI35v_k?autoplay=1&mute=1&loop=1&playlist=Py1ClI35v_k&controls=0"
              className="absolute inset-0 w-full h-full pointer-events-none grayscale-[0.2]"
              title="Preview"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
