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

  // --- NATIVE ANTIGRAVITY PARTICLE ENGINE ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    const particleCount = 120; // Lower count for higher performance & cleaner look
    const mouse = { x: -1000, y: -1000 };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number; y: number; size: number; baseSize: number;
      speedX: number; speedY: number; opacity: number;

      constructor() {
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.baseSize = Math.random() * 2 + 1;
        this.size = this.baseSize;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() * -0.8) - 0.2; // Constant upward drift
        this.opacity = Math.random() * 0.5 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Reset if they float off top
        if (this.y < 0) {
          this.y = canvas!.height;
          this.x = Math.random() * canvas!.width;
        }

        // Mouse Magnetism logic
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceThreshold = 200;

        if (distance < forceThreshold) {
          const force = (forceThreshold - distance) / forceThreshold;
          this.x -= dx * force * 0.03;
          this.y -= dy * force * 0.03;
          this.size = this.baseSize + (force * 2);
        } else {
          this.size = this.baseSize;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(0, 0, 0, ${this.opacity})`; // Dark particles for white background
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    
    resize();
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // --- TYPEWRITER & CHOREOGRAPHY ---
  useEffect(() => {
    let i = 0;
    setDisplayText("");
    setIsTyping(true);
    const type = () => {
      if (i <= fullText.length) {
        setDisplayText(fullText.slice(0, i));
        i++;
        setTimeout(type, 50);
      } else {
        setIsTyping(false);
        setTimeout(() => setShowSubtitle(true), 400);
        setTimeout(() => setShowCTA(true), 800);
        setTimeout(() => { setShowInput(true); setShowParticles(true); }, 1200);
      }
    };
    type();
  }, [fullText]);

  // --- SCROLL ANIMATION ---
  useEffect(() => {
    const handleScroll = () => {
      const p = Math.min(Math.max((window.scrollY - 50) / 400, 0), 1);
      setScrollOpacity(p);
      setScrollScale(0.85 + (p * 0.15));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    <section className="relative min-h-screen md:min-h-[180vh] flex flex-col items-center bg-[#fafafa] text-black pt-36 pb-24 overflow-x-hidden" style={{ fontFamily: 'Georgia, serif' }}>
      
      {/* NATIVE CANVAS LAYER */}
      <canvas 
        ref={canvasRef} 
        className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${showParticles ? 'opacity-100' : 'opacity-0'}`} 
      />

      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-7xl">
        <div className="min-h-[140px] md:min-h-[200px] flex items-center justify-center mb-10">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {displayText}
            {isTyping && <span className="inline-block w-1 h-[0.8em] bg-black ml-2 animate-pulse" />}
          </h1>
        </div>

        <p className={`text-lg md:text-2xl text-zinc-500 mb-16 max-w-2xl italic transition-all duration-1000 ${showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {t.heroSubtitle}
        </p>

        <div className="flex flex-col items-center gap-12 mb-32 w-full max-w-md">
          <button onClick={onBookingClick} className={`group bg-black text-white px-10 py-4 rounded-full font-medium flex items-center gap-3 hover:scale-105 transition-all duration-700 shadow-xl ${showCTA ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
            {t.startJourney}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className={`w-full transition-all duration-1000 delay-300 ${showInput ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-[10px] uppercase tracking-[0.4em] font-black mb-4">{isSent ? 'Message Sent' : t.askAiAgent}</h3>
            <form onSubmit={handleAISubmit} className="relative flex items-center bg-white border-2 border-black rounded-2xl p-1.5 shadow-lg focus-within:ring-2 ring-black/5">
              <input 
                ref={heroInputRef}
                type="text" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder={placeholder}
                className="w-full px-5 py-3 outline-none text-black bg-transparent"
              />
              <button type="submit" className={`p-3 rounded-xl bg-black text-white transition-opacity ${query ? 'opacity-100' : 'opacity-0'}`}>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Video Player Section */}
        <div className="w-full max-w-6xl sticky top-32 transition-all duration-700" style={{ opacity: scrollOpacity, transform: `scale(${scrollScale})` }}>
          <div 
            ref={videoContainerRef}
            onClick={() => setIsModalOpen(true)}
            className="group relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-zinc-200 cursor-pointer"
          >
            <div className="absolute inset-0 flex items-center justify-center z-20 group-hover:scale-110 transition-transform">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
                    <Play className="w-8 h-8 fill-black" />
                </div>
            </div>

            {!isModalOpen && (
              <iframe 
                src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0`} 
                className="absolute inset-0 w-full h-full opacity-40 grayscale pointer-events-none"
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md p-6">
          <div className="relative w-full max-w-6xl aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 z-[110] p-2 bg-white/10 hover:bg-white/20 rounded-full">
              <X className="w-6 h-6 text-white" />
            </button>
            <iframe 
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1`} 
              className="w-full h-full" 
              allow="autoplay; fullscreen"
            />
          </div>
        </div>
      )}
    </section>
  );
}