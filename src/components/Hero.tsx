import { ArrowRight, Send, Play, X } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';

interface HeroProps {
  onBookingClick: () => void;
  onAskAIClick: (initialMessage?: string) => void;
  language: Language;
}

// --- NEW 3D PARTICLE ENGINE (REPLACES YOUR OLD CANVAS LOGIC) ---
function FluidParticles({ count = 8278 }) {
  const mesh = useRef<THREE.Points>(null);
  const { mouse, viewport } = useThree();

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    const angleStep = Math.PI * (3 - Math.sqrt(5));
    
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep;
      const radius = Math.sqrt(i) * 0.5; // Scaled for 3D space
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 5;
      randoms[i] = Math.random();
    }
    return { positions, randoms };
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.getElapsedTime();
    const pos = mesh.current.geometry.attributes.position.array as Float32Array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Drift
      pos[i3] += Math.sin(time * 0.2 + particles.randoms[i] * 10) * 0.003;
      pos[i3 + 1] += Math.cos(time * 0.2 + particles.randoms[i] * 10) * 0.003;

      // Mouse interaction
      const mx = (mouse.x * viewport.width) / 2;
      const my = (mouse.y * viewport.height) / 2;
      const dx = mx - pos[i3];
      const dy = my - pos[i3 + 1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 4) {
        pos[i3] += dx * 0.02;
        pos[i3 + 1] += dy * 0.02;
      }
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particles.positions.length / 3}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#a855f7"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  );
}

export default function Hero({ onBookingClick, onAskAIClick, language }: HeroProps) {
  const t = translations[language];
  const heroInputRef = useRef<HTMLInputElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  const [query, setQuery] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(0);
  const [scrollScale, setScrollScale] = useState(0.85);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Choreography States (Restored)
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

  // --- MAGNETIC BUTTON STATES ---
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [isHoveringVideo, setIsHoveringVideo] = useState(false);

  const fullText = t.heroTitle;
  const VIDEO_ID = "Py1ClI35v_k";

  // --- MOUSE TRACKING FOR VIDEO (Restored) ---
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoContainerRef.current) return;
    const rect = videoContainerRef.current.getBoundingClientRect();
    setTargetPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // --- SPRING PHYSICS ENGINE (Restored) ---
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

  // --- CHOREOGRAPHY SYNCHRONIZATION (Restored exactly) ---
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

  // --- INFINITE TYPEWRITER (Restored) ---
  useEffect(() => {
    let currentText = "";
    let isDeleting = false;
    let timer: NodeJS.Timeout;
    const type = () => {
      const phrase = placeholderPhrases[phraseIdx];
      let speed = 80;
      if (!isDeleting) {
        currentText = phrase.slice(0, currentText.length + 1);
        if (currentText === phrase) {
          speed = 3500; 
          isDeleting = true;
        }
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

  // --- TYPEWRITER (TITLE - Restored) ---
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

  // --- VIDEO SCROLL LOGIC (Restored) ---
  useEffect(() => {
    const handleScroll = () => {
      const progress = Math.min(Math.max((window.scrollY - 50) / 300, 0), 1);
      setScrollOpacity(progress);
      setScrollScale(0.85 + (progress * 0.15));
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ESC Key to close modal
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

      {/* --- 3D PARTICLE BACKGROUND --- */}
      <div className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-[2000ms] ${showParticles ? 'opacity-100' : 'opacity-0'}`}>
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <FluidParticles count={8000} />
          <EffectComposer>
            <Bloom intensity={1.2} luminanceThreshold={0.1} radius={0.4} />
          </EffectComposer>
        </Canvas>
      </div>
      
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-7xl">
        {/* --- TITLE SECTION --- */}
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

        {/* --- BUTTON & INPUT SECTION --- */}
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

        {/* --- MAGNETIC VIDEO PLAYER SECTION --- */}
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

      {/* --- VIDEO MODAL --- */}
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