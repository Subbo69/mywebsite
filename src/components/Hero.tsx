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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoContainerRef.current) return;
    const rect = videoContainerRef.current.getBoundingClientRect();
    setTargetPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useEffect(() => {
    if (!isHoveringVideo || isModalOpen) return;
    let animationFrame: number;
    const followMouse = () => {
      setCurrentPos(prev => ({
        x: prev.x + (targetPos.x - prev.x) * 0.12,
        y: prev.y + (targetPos.y - prev.y) * 0.12
      }));
      animationFrame = requestAnimationFrame(followMouse);
    };
    animationFrame = requestAnimationFrame(followMouse);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetPos, isHoveringVideo, isModalOpen]);

  useEffect(() => {
    if (!isTyping && displayText.length === fullText.length) {
      const subTimeout = setTimeout(() => {
        setShowSubtitle(true);
        const ctaTimeout = setTimeout(() => {
          setShowCTA(true);
          const inputTimeout = setTimeout(() => {
            setShowInput(true);
            const particleTimeout = setTimeout(() => {
              setShowParticles(true);
              heroInputRef.current?.focus({ preventScroll: true });
            }, 600);
            return () => clearTimeout(particleTimeout);
          }, 500);
          return () => clearTimeout(inputTimeout);
        }, 500);
        return () => clearTimeout(ctaTimeout);
      }, 300);
      return () => clearTimeout(subTimeout);
    }
  }, [isTyping, displayText, fullText]);

  useEffect(() => {
    let currentText = "";
    let isDeleting = false;
    let timer: NodeJS.Timeout;
    const type = () => {
      const phrase = placeholderPhrases[phraseIdx];
      let speed = 80;
      if (!isDeleting) {
        currentText = phrase.slice(0, currentText.length + 1);
        if (currentText === phrase) { speed = 3500; isDeleting = true; }
      } else {
        currentText = phrase.slice(0, currentText.length - 1);
        speed = 40;
        if (currentText === "") {
          isDeleting = false;
          setPhraseIdx((prev) => (prev + 1) % placeholderPhrases.length);
          speed = 1000;
        }
      }
      setPlaceholder(currentText);
      timer = setTimeout(type, speed);
    };
    timer = setTimeout(type, 500);
    return () => clearTimeout(timer);
  }, [phraseIdx, language]);

  useEffect(() => {
    let i = 0;
    let isMounted = true;
    setDisplayText("");
    setIsTyping(true);
    setShowSubtitle(false);
    setShowCTA(false);
    setShowInput(false);
    setShowParticles(false);
    const type = () => {
      if (!isMounted) return;
      if (i <= fullText.length) {
        setDisplayText(fullText.slice(0, i));
        i++;
        setTimeout(type, Math.random() * 25 + 45);
      } else {
        setIsTyping(false);
      }
    };
    const startTimeout = setTimeout(type, 280);
    return () => { isMounted = false; clearTimeout(startTimeout); };
  }, [fullText]);

  useEffect(() => {
    const handleScroll = () => {
      const progress = Math.min(Math.max((window.scrollY - 50) / 300, 0), 1);
      setScrollOpacity(progress);
      setScrollScale(0.85 + (progress * 0.15));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- PARTICLE ENGINE (Google Antigravity Blob Style) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    // Smooth mouse position (lagged)
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let smoothMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    // Google brand colors
    const GOOGLE_COLORS = [
      { r: 66,  g: 133, b: 244 }, // Google Blue
      { r: 66,  g: 133, b: 244 },
      { r: 66,  g: 133, b: 244 },
      { r: 52,  g: 168, b: 83  }, // Google Green
      { r: 251, g: 188, b: 5   }, // Google Yellow
      { r: 234, g: 67,  b: 53  }, // Google Red
    ];

    const BLOB_RADIUS = 180;       // radius of the blob sphere
    const PARTICLE_COUNT = 600;    // particles in the blob
    const GRID_SPACING = 24;       // background grid spacing
    const SPRING = 0.055;
    const FRICTION = 0.78;

    type BlobParticle = {
      // position in 3D sphere (normalized -1 to 1)
      nx: number; ny: number; nz: number;
      // screen position
      x: number; y: number;
      vx: number; vy: number;
      r: number; g: number; b: number;
    };

    type GridParticle = {
      x: number; y: number;
      originX: number; originY: number;
      vx: number; vy: number;
      r: number; g: number; b: number;
    };

    let blobParticles: BlobParticle[] = [];
    let gridParticles: GridParticle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initBlob = () => {
      blobParticles = [];
      // Distribute points on a sphere using Fibonacci lattice
      const goldenAngle = Math.PI * (3 - Math.sqrt(5));
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const y = 1 - (i / (PARTICLE_COUNT - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = goldenAngle * i;
        const nx = Math.cos(theta) * radiusAtY;
        const nz = Math.sin(theta) * radiusAtY;
        const col = GOOGLE_COLORS[i % GOOGLE_COLORS.length];
        blobParticles.push({
          nx, ny: y, nz,
          x: smoothMouse.x + nx * BLOB_RADIUS,
          y: smoothMouse.y + y * BLOB_RADIUS,
          vx: 0, vy: 0,
          r: col.r, g: col.g, b: col.b,
        });
      }
    };

    const initGrid = () => {
      gridParticles = [];
      const cols = Math.ceil(canvas.width / GRID_SPACING) + 2;
      const rows = Math.ceil(canvas.height / GRID_SPACING) + 2;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const xFraction = col / cols;
          if (Math.random() > xFraction * 1.2) continue;
          const x = col * GRID_SPACING;
          const y = row * GRID_SPACING;
          gridParticles.push({
            x, y, originX: x, originY: y,
            vx: 0, vy: 0,
            r: 66, g: 133, b: 244, // all blue for background
          });
        }
      }
    };

    let ticker = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ticker += 0.008;

      // Smooth mouse follow (blob lags behind)
      smoothMouse.x += (mouse.x - smoothMouse.x) * 0.07;
      smoothMouse.y += (mouse.y - smoothMouse.y) * 0.07;

      // --- DRAW BACKGROUND GRID (repelled by blob) ---
      gridParticles.forEach((p) => {
        const dx = smoothMouse.x - p.x;
        const dy = smoothMouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const repelRadius = BLOB_RADIUS * 1.3;

        if (dist < repelRadius && dist > 0) {
          const force = ((repelRadius - dist) / repelRadius) * 5;
          const angle = Math.atan2(dy, dx);
          p.vx -= Math.cos(angle) * force;
          p.vy -= Math.sin(angle) * force;
        }

        p.vx += (p.originX - p.x) * SPRING;
        p.vy += (p.originY - p.y) * SPRING;
        p.vx *= FRICTION;
        p.vy *= FRICTION;
        p.x += p.vx;
        p.y += p.vy;

        const displacement = Math.sqrt((p.x - p.originX) ** 2 + (p.y - p.originY) ** 2);
        const size = 1.2 + Math.min(displacement * 0.04, 1.5);
        const opacity = 0.25 + Math.min(displacement * 0.01, 0.3);

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${opacity})`;
        ctx.fill();
      });

      // --- DRAW BLOB (3D sphere effect) ---
      // Sort by nz so "back" particles draw first
      const sorted = [...blobParticles].sort((a, b) => a.nz - b.nz);

      sorted.forEach((p) => {
        // Breathing animation
        const breathe = 1 + Math.sin(ticker * 1.2) * 0.04;
        const wobbleX = Math.sin(ticker * 0.7 + p.ny * 3) * 6;
        const wobbleY = Math.cos(ticker * 0.5 + p.nx * 3) * 6;

        // Target = smoothMouse + sphere position + wobble
        const targetX = smoothMouse.x + p.nx * BLOB_RADIUS * breathe + wobbleX;
        const targetY = smoothMouse.y + p.ny * BLOB_RADIUS * breathe + wobbleY;

        p.vx += (targetX - p.x) * 0.06;
        p.vy += (targetY - p.y) * 0.06;
        p.vx *= 0.82;
        p.vy *= 0.82;
        p.x += p.vx;
        p.y += p.vy;

        // 3D depth cues: nz ranges -1 (back) to +1 (front)
        const depth = (p.nz + 1) / 2; // 0 = back, 1 = front
        const size = 1.2 + depth * 3.5;
        const opacity = 0.15 + depth * 0.85;

        // Glow for front particles
        if (depth > 0.6) {
          const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 5);
          glow.addColorStop(0, `rgba(${p.r}, ${p.g}, ${p.b}, ${opacity * 0.35})`);
          glow.addColorStop(1, `rgba(${p.r}, ${p.g}, ${p.b}, 0)`);
          ctx.beginPath();
          ctx.arc(p.x, p.y, size * 5, 0, Math.PI * 2);
          ctx.fillStyle = glow;
          ctx.fill();
        }

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${opacity})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(animate);
    };

    const onMouseMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onResize = () => { resize(); initBlob(); initGrid(); };

    window.addEventListener('resize', onResize);
    window.addEventListener('mousemove', onMouseMove);

    resize();
    initBlob();
    initGrid();
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
            className="group relative aspect-video w-full rounded-3xl overflow-hidden shadow-2xl bg-black border border-zinc-100 cursor-none"
          >
            <div 
              className={`pointer-events-none absolute z-50 flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full font-bold shadow-2xl transition-opacity duration-300 ${isHoveringVideo ? 'opacity-100' : 'opacity-0'}`}
              style={{ 
                left: `${currentPos.x}px`, 
                top: `${currentPos.y}px`, 
                transform: 'translate(-50%, -50%)',
                fontFamily: '"Montserrat", sans-serif'
              }}
            >
              <Play className="w-4 h-4 fill-black" />
              <span className="text-xs uppercase tracking-widest whitespace-nowrap">{t.playIntro}</span>
            </div>

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