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

  const handleMouseMoveVideo = (e: React.MouseEvent<HTMLDivElement>) => {
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

  // --- 3D DEPTH PARTICLE ENGINE ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const PARTICLE_COUNT = 2200; // Optimized for performance with 3D calcs
    let particles: any[] = [];
    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let lastMouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let velocity = { x: 0, y: 0 };
    let ticker = 0;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    const init = () => {
      particles = [];
      const angleStep = Math.PI * (3 - Math.sqrt(5)); 
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        const angle = i * angleStep;
        const radius = Math.sqrt(i) * 24; 
        const z = Math.random() * 0.6 + 0.4; // 0.4 (far) to 1.0 (near)
        
        particles.push({
          offsetX: Math.cos(angle) * radius,
          offsetY: Math.sin(angle) * radius,
          x: mouse.x,
          y: mouse.y,
          z: z, 
          baseSize: z * 2.5 + 0.5, // Larger base size for near particles
          randomOffset: Math.random() * 1000
        });
      }
    };
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ticker += 0.005;

      // Calculate Mouse Velocity for the "Swell" effect
      velocity.x = mouse.x - lastMouse.x;
      velocity.y = mouse.y - lastMouse.y;
      const speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
      
      particles.forEach((p) => {
        // 1:1 Movement with Z-parallax factor
        // Near particles (high Z) move slightly more than far ones
        const targetX = mouse.x + (p.offsetX * p.z) + (Math.sin(ticker + p.randomOffset) * 5);
        const targetY = mouse.y + (p.offsetY * p.z) + (Math.cos(ticker + p.randomOffset) * 5);
        
        // Smooth easing to position
        p.x += (targetX - p.x) * (0.08 * p.z);
        p.y += (targetY - p.y) * (0.08 * p.z);

        // 3D SWELL LOGIC: Increase size based on speed and depth
        const swell = (speed * 0.15) * p.z;
        const currentSize = p.baseSize + swell;
        
        // DEPTH COLOR LOGIC: Higher Z = Higher Opacity
        const diagScore = (p.x + p.y) / (canvas.width + canvas.height);
        const hue = diagScore > 0.45 ? 212 : 272; 
        const opacity = Math.min(0.6, (0.15 * p.z) + (speed * 0.005));
        
        ctx.beginPath();
        ctx.fillStyle = `hsla(${hue}, 80%, 60%, ${opacity})`;
        
        // Draw slightly elliptical if moving fast (stretch effect)
        const stretch = speed * 0.1;
        ctx.ellipse(
          p.x, p.y, 
          currentSize + stretch, 
          currentSize, 
          Math.atan2(velocity.y, velocity.x), 
          0, Math.PI * 2
        );
        ctx.fill();
      });

      lastMouse.x = mouse.x;
      lastMouse.y = mouse.y;
      requestAnimationFrame(animate);
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', () => { resize(); init(); });
    window.addEventListener('mousemove', handleMouseMove);
    resize(); init(); animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // ... (Rest of your existing logic for Typewriter, Video Scroll, and Modal remains exactly the same)
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
          return () => clearTimeout(ctaTimeout);
        }, 500);
        return () => clearTimeout(subTimeout);
      }, 300);
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
    setShowSubtitle(false); setShowCTA(false); setShowInput(false); setShowParticles(false);
    const type = () => {
      if (!isMounted) return;
      if (i <= fullText.length) {
        setDisplayText(fullText.slice(0, i));
        i++;
        setTimeout(type, Math.random() * 25 + 45);
      } else { setIsTyping(false); }
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

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onAskAIClick(query); setIsSent(true); setQuery("");
    setTimeout(() => setIsSent(false), 3000);
  };

  return (
    <section className="relative min-h-screen md:min-h-[170vh] flex flex-col items-center bg-white text-black overflow-x-hidden pt-36 pb-24" style={{ fontFamily: 'Georgia, serif' }}>
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .typewriter-cursor { display: inline-block; width: 4px; height: 0.9em; margin-left: 4px; vertical-align: middle; background: linear-gradient(to bottom, #a855f7, #3b82f6); animation: blink 1s step-end infinite; }
        .typewriter-cursor.is-typing { animation: none; opacity: 1; }
      `}</style>

      <canvas ref={canvasRef} className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-[2000ms] ${showParticles ? 'opacity-100' : 'opacity-0'}`} />
      
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-7xl">
        <div className="min-h-[160px] md:min-h-[220px] flex items-center justify-center w-full mb-12">
          <h1 className="text-4xl md:text-8xl font-bold tracking-[-0.02em] relative inline-block" style={{ fontFamily: '"Montserrat", sans-serif' }}>
            <span>{displayText}</span>
            {displayText.length < fullText.length && <span className={`typewriter-cursor ${isTyping ? 'is-typing' : ''}`} />}
            <span className="opacity-0 select-none" aria-hidden="true">{fullText.slice(displayText.length)}</span>
          </h1>
        </div>

        <p className={`text-base md:text-2xl text-zinc-500 mb-16 max-w-2xl font-light italic transition-all duration-1000 ${showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {t.heroSubtitle}
        </p>

        <div className="flex flex-col items-center gap-16 mb-40 w-full max-w-md">
          <button onClick={onBookingClick} className={`group bg-black text-white px-10 py-4 rounded-full text-base font-medium flex items-center gap-2 hover:scale-105 active:scale-95 transition-all duration-700 shadow-xl ${showCTA ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90 pointer-events-none'}`}>
            <span className="whitespace-nowrap">{t.startJourney}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
          </button>

          <div className={`w-full space-y-6 transition-all duration-1000 delay-300 ${showInput ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95 pointer-events-none'}`}>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-black text-center">{isSent ? t.openingChat : t.askAiAgent}</h3>
            <form onSubmit={handleAISubmit} className={`relative flex items-center bg-white border-2 border-black rounded-2xl p-1.5 transition-all duration-300 shadow-lg focus-within:shadow-xl ${isSent ? 'border-green-600 bg-green-50' : ''}`}>
              <input ref={heroInputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={isSent ? "" : placeholder} disabled={isSent} className="w-full bg-transparent px-5 py-3 text-base outline-none text-black font-medium placeholder:text-zinc-400" style={{ fontFamily: 'Georgia, serif' }} />
              <button type="submit" disabled={!query.trim() || isSent} className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all ${query.trim() && !isSent ? 'bg-black text-white' : 'opacity-0'}`}>
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>

        <div className="w-full max-w-[90rem] sticky top-32 transition-all duration-700" style={{ opacity: scrollOpacity, transform: `scale(${scrollScale})` }}>
          <div ref={videoContainerRef} onClick={() => setIsModalOpen(true)} onMouseMove={handleMouseMoveVideo} onMouseEnter={() => setIsHoveringVideo(true)} onMouseLeave={() => setIsHoveringVideo(false)} className="group relative aspect-video w-full rounded-3xl overflow-hidden shadow-2xl bg-black border border-zinc-100 cursor-none">
            <div className={`pointer-events-none absolute z-50 flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full font-bold shadow-2xl transition-opacity duration-300 ${isHoveringVideo ? 'opacity-100' : 'opacity-0'}`} style={{ left: `${currentPos.x}px`, top: `${currentPos.y}px`, transform: 'translate(-50%, -50%)', fontFamily: '"Montserrat", sans-serif' }}>
              <Play className="w-4 h-4 fill-black" />
              <span className="text-xs uppercase tracking-widest whitespace-nowrap">{t.playIntro}</span>
            </div>
            <div className="absolute inset-0 z-20 bg-black/10 transition-colors group-hover:bg-black/20" />
            {!isModalOpen && (
              <iframe src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&iv_load_policy=3&rel=0`} className="absolute inset-[-2%] w-[104%] h-[104%] opacity-60 grayscale pointer-events-none object-cover scale-110" style={{ border: 'none' }} />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}