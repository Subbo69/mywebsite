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
  
  // NEW: State to control the visibility of the AI input area
  const [showInput, setShowInput] = useState(false);
  
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

  // --- SYNCHRONIZATION LOGIC: APPEARANCE & FOCUS ---
  useEffect(() => {
    if (!isTyping && displayText.length === fullText.length) {
      const syncTimeout = setTimeout(() => {
        setShowInput(true); // Make the window appear
        // Use a tiny nested timeout to ensure the DOM element is rendered before focusing
        setTimeout(() => {
          heroInputRef.current?.focus({ preventScroll: true });
        }, 50);
      }, 400); // The 0.4s delay you requested
      return () => clearTimeout(syncTimeout);
    }
  }, [isTyping, displayText, fullText]);

  // --- GHOST PLACEHOLDER TYPING ANIMATION ---
  useEffect(() => {
    // Only start typing if the input window is actually shown
    if (!showInput) {
      setPlaceholder("");
      return;
    }

    let currentText = "";
    let isDeleting = false;
    let speed = 100;
    let timer: NodeJS.Timeout;

    const type = () => {
      const phrase = placeholderPhrases[phraseIdx];
      
      if (!isDeleting) {
        currentText = phrase.slice(0, currentText.length + 1);
        speed = 100;
      } else {
        currentText = phrase.slice(0, currentText.length - 1);
        speed = 50;
      }

      setPlaceholder(currentText);

      if (!isDeleting && currentText === phrase) {
        setTimeout(() => (isDeleting = true), 2000);
      } else if (isDeleting && currentText === "") {
        isDeleting = false;
        setPhraseIdx((prev) => (prev + 1) % placeholderPhrases.length);
      }
    };

    timer = setInterval(type, speed);
    return () => clearInterval(timer);
  }, [phraseIdx, language, showInput]);

  // --- SPRING PHYSICS FOR FLOATING BUTTON ---
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

  // --- TYPEWRITER LOGIC (MAIN TITLE) ---
  useEffect(() => {
    let i = 0;
    let isMounted = true;
    setDisplayText("");
    setIsTyping(true);
    setShowInput(false); // Reset when language/title changes
    
    const type = () => {
      if (!isMounted) return;
      if (i <= fullText.length) {
        setDisplayText(fullText.slice(0, i));
        i++;
        setTimeout(type, Math.random() * 78 + 52);
      } else {
        setIsTyping(false); 
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

    const PARTICLE_COUNT = 5110; 
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
      const isMobile = window.innerWidth < 768;
      const sizeMultiplier = (isMobile ? 1.0 : 1.72); 

      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = i * angleStep;
        const radius = Math.sqrt(i) * 21.12; 
        const z = 0.5 + Math.random();
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          offsetX: (Math.cos(angle) * radius),
          offsetY: (Math.sin(angle) * radius),
          z: z, 
          baseSize: Math.max(0.4, sizeMultiplier * (1 - i / PARTICLE_COUNT)) * z,
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

    window.addEventListener('resize', () => { resize(); init(); });
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

  const handleVideoMouseMove = (e: React.MouseEvent) => {
    if (!videoContainerRef.current) return;
    const rect = videoContainerRef.current.getBoundingClientRect();
    setTargetPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <section 
      className="relative min-h-screen md:min-h-[170vh] flex flex-col items-center bg-white text-black overflow-x-hidden pt-36 pb-24"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
      
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-5xl">
        {/* Title */}
        <div className="min-h-[160px] md:min-h-[220px] flex items-center justify-center w-full mb-12">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tight font-sans">
            {displayText}
            {isTyping && <span className="animate-pulse font-light ml-1 opacity-60">|</span>}
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-zinc-500 mb-16 max-w-2xl font-light italic">
          {t.heroSubtitle}
        </p>

        {/* Action Container */}
        <div className="flex flex-col items-center gap-16 mb-40 w-full max-w-md">
          <button
            onClick={onBookingClick}
            className="group bg-black text-white px-10 py-4 rounded-full text-base font-medium flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl"
          >
            <span className="whitespace-nowrap">{t.startJourney}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </button>

          {/* AI INPUT AREA: Now conditional based on showInput */}
          <div className={`w-full space-y-6 transition-all duration-700 ${showInput ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
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
                  query.trim() && !isSent
                  ? 'bg-black text-white scale-100 opacity-100' 
                  : 'bg-transparent text-zinc-300 opacity-0 pointer-events-none'
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        {/* PREVIEW VIDEO */}
        <div 
          className="w-full max-w-7xl sticky top-32 transition-all duration-700"
          style={{ 
            opacity: scrollOpacity,
            transform: `scale(${scrollScale})`,
            filter: `blur(${(1 - scrollOpacity) * 10}px)`
          }}
        >
          <div 
            ref={videoContainerRef}
            onMouseMove={handleVideoMouseMove}
            onMouseEnter={() => setIsHoveringVideo(true)}
            onMouseLeave={() => setIsHoveringVideo(false)}
            onClick={() => setIsModalOpen(true)}
            className="group relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black cursor-none border border-zinc-100"
          >
            <div 
              className="pointer-events-none absolute z-30 transition-opacity duration-300"
              style={{ 
                left: currentPos.x, 
                top: currentPos.y, 
                transform: 'translate(-50%, -50%)',
                opacity: isHoveringVideo ? 1 : 0 
              }}
            >
              <div className="flex items-center gap-2.5 px-6 py-3 bg-white border border-black rounded-full shadow-xl scale-90 group-hover:scale-100 transition-transform duration-500">
                <Play className="w-4 h-4 text-black fill-black" />
                <span className="text-black text-base font-bold whitespace-nowrap" style={{ fontFamily: 'Georgia, serif' }}>
                  {t.playIntro}
                </span>
              </div>
            </div>

            <div className="absolute inset-0 z-20 bg-black/10 transition-colors group-hover:bg-black/20" />
            
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=${isModalOpen ? '0' : '1'}&mute=1&loop=0&playlist=${VIDEO_ID}&controls=0&showinfo=0&modestbranding=1`}
              className="absolute inset-0 w-full h-full opacity-60 grayscale"
              title={t.videoAmbientTitle}
            />
          </div>
        </div>
      </div>

      {/* MODAL VIDEO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-[4px] animate-in fade-in duration-300">
          <button 
            onClick={() => setIsModalOpen(false)}
            className="absolute top-8 right-8 p-4 hover:rotate-90 transition-transform z-[110]"
          >
            <X className="w-10 h-10 text-black stroke-[2px]" />
          </button>
          
          <div className="w-[95vw] max-w-7xl aspect-video rounded-3xl overflow-hidden border border-zinc-200 bg-black shadow-2xl animate-in zoom-in-95 duration-300">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=0&controls=1&loop=0&rel=0&start=0`}
              className="w-full h-full"
              title={t.videoFullTitle}
              allow="autoplay; encrypted-media; fullscreen"
            />
          </div>
        </div>
      )}
    </section>
  );
}
