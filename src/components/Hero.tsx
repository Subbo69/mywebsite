import { ArrowRight, Send, Play, X } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- 3D PARTICLE COMPONENT ---
function AntigravityParticles() {
  const points = useRef<THREE.Points>(null!);
  const { mouse, viewport } = useThree();
  const count = 7000;

  // Create initial random distribution
  const [positions, distances] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const dist = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      dist[i] = Math.random();
    }
    return [pos, dist];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const attribute = points.current.geometry.attributes.position;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Floating wave motion
      attribute.array[i3 + 1] += Math.sin(time + distances[i]) * 0.003;
      
      // Mouse Interaction (Magnetic follow)
      // Converts 2D mouse coords to 3D space
      const targetX = (mouse.x * viewport.width) / 2;
      const targetY = (mouse.y * viewport.height) / 2;
      
      attribute.array[i3] += (targetX - attribute.array[i3]) * 0.015;
      attribute.array[i3 + 1] += (targetY - attribute.array[i3 + 1]) * 0.015;
    }
    attribute.needsUpdate = true;
    points.current.rotation.z = time * 0.05;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#6366f1"
        transparent
        opacity={0.6}
        sizeAttenuation={true}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}

interface HeroProps {
  onBookingClick: () => void;
  onAskAIClick: (initialMessage?: string) => void;
  language: Language;
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
  
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  
  const [placeholder, setPlaceholder] = useState("");
  const placeholderPhrases = [
    t.howCanWeHelp, t.heroPlaceholder1, t.heroPlaceholder2, t.heroPlaceholder3
  ];
  const [phraseIdx, setPhraseIdx] = useState(0);

  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [isHoveringVideo, setIsHoveringVideo] = useState(false);

  const fullText = t.heroTitle;
  const VIDEO_ID = "Py1ClI35v_k";

  // --- MOUSE TRACKING ---
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

  // --- TYPEWRITERS & CHOREOGRAPHY ---
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
        // Trigger subsequent animations
        setTimeout(() => setShowSubtitle(true), 400);
        setTimeout(() => setShowCTA(true), 900);
        setTimeout(() => {
          setShowInput(true);
          setShowParticles(true);
        }, 1400);
      }
    };
    type();
  }, [fullText]);

  useEffect(() => {
    let current = "";
    let isDeleting = false;
    let timer: any;
    const typePlaceholder = () => {
      const phrase = placeholderPhrases[phraseIdx];
      if (!isDeleting) {
        current = phrase.slice(0, current.length + 1);
        if (current === phrase) { isDeleting = true; timer = setTimeout(typePlaceholder, 2500); return; }
      } else {
        current = phrase.slice(0, current.length - 1);
        if (current === "") { 
          isDeleting = false; 
          setPhraseIdx(prev => (prev + 1) % placeholderPhrases.length);
        }
      }
      setPlaceholder(current);
      timer = setTimeout(typePlaceholder, isDeleting ? 40 : 80);
    };
    typePlaceholder();
    return () => clearTimeout(timer);
  }, [phraseIdx, language]);

  // --- SCROLL EFFECTS ---
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
    <section className="relative min-h-screen md:min-h-[180vh] flex flex-col items-center bg-white text-black pt-36 pb-24 overflow-x-hidden" style={{ fontFamily: 'Georgia, serif' }}>
      
      {/* 3D BACKGROUND LAYER */}
      <div className={`fixed inset-0 w-full h-full z-0 pointer-events-none transition-opacity duration-1000 ${showParticles ? 'opacity-100' : 'opacity-0'}`}>
        <Canvas camera={{ position: [0, 0, 7] }} dpr={[1, 2]}>
          <AntigravityParticles />
          <EffectComposer>
            <Bloom intensity={1.2} luminanceThreshold={0.2} radius={0.5} />
          </EffectComposer>
        </Canvas>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-7xl">
        {/* Title */}
        <div className="min-h-[140px] md:min-h-[200px] flex items-center justify-center mb-10">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {displayText}
            {isTyping && <span className="inline-block w-1 h-[0.8em] bg-indigo-600 ml-2 animate-pulse" />}
          </h1>
        </div>

        {/* Subtitle */}
        <p className={`text-lg md:text-2xl text-zinc-500 mb-16 max-w-2xl italic transition-all duration-1000 ${showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {t.heroSubtitle}
        </p>

        {/* Interaction Group */}
        <div className="flex flex-col items-center gap-12 mb-32 w-full max-w-md">
          <button 
            onClick={onBookingClick} 
            className={`group bg-black text-white px-10 py-4 rounded-full font-medium flex items-center gap-3 hover:scale-105 transition-all duration-700 shadow-2xl ${showCTA ? 'opacity-100' : 'opacity-0 translate-y-10'}`}
          >
            {t.startJourney}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className={`w-full transition-all duration-1000 delay-300 ${showInput ? 'opacity-100' : 'opacity-0 translate-y-10'}`}>
            <h3 className="text-[10px] uppercase tracking-[0.4em] font-black mb-4">{isSent ? 'Message Sent' : t.askAiAgent}</h3>
            <form onSubmit={handleAISubmit} className="relative flex items-center bg-white border-2 border-black rounded-2xl p-1.5 shadow-lg">
              <input 
                ref={heroInputRef}
                type="text" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder={placeholder}
                className="w-full px-5 py-3 outline-none text-black"
              />
              <button type="submit" className={`p-3 rounded-xl bg-black text-white transition-opacity ${query ? 'opacity-100' : 'opacity-0'}`}>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Video Player */}
        <div 
          className="w-full max-w-6xl sticky top-32 transition-all duration-700" 
          style={{ opacity: scrollOpacity, transform: `scale(${scrollScale})` }}
        >
          <div 
            ref={videoContainerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHoveringVideo(true)}
            onMouseLeave={() => setIsHoveringVideo(false)}
            onClick={() => setIsModalOpen(true)}
            className="group relative aspect-video rounded-3xl overflow-hidden shadow-2xl bg-black border border-zinc-200 cursor-none"
          >
            {/* Custom Cursor */}
            <div 
              className={`fixed pointer-events-none z-50 flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full font-bold transition-opacity ${isHoveringVideo ? 'opacity-100' : 'opacity-0'}`}
              style={{ left: `${currentPos.x}px`, top: `${currentPos.y}px`, transform: 'translate(-50%, -50%)' }}
            >
              <Play className="w-4 h-4 fill-black" />
              <span className="text-[10px] uppercase tracking-widest">{t.playIntro}</span>
            </div>

            {!isModalOpen && (
              <iframe 
                src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0`} 
                className="absolute inset-0 w-full h-full opacity-50 grayscale scale-110 pointer-events-none"
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