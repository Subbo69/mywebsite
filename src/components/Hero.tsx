import { ArrowRight, Send, Play, X } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';

// --- 3D PARTICLE ENGINE ---
function AntigravityParticles() {
  const points = useRef<THREE.Points>(null!);
  const { mouse } = useThree();
  const count = 6000; // Slightly reduced for better performance

  const [positions, step] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const step = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 5;
      step[i] = Math.random();
    }
    return [pos, step];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const attribute = points.current.geometry.attributes.position;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Fluid float
      attribute.array[i3 + 1] += Math.sin(time + step[i]) * 0.002;
      // Mouse follow
      attribute.array[i3] += (mouse.x * 8 - attribute.array[i3]) * 0.01;
      attribute.array[i3 + 1] += (mouse.y * 5 - attribute.array[i3 + 1]) * 0.01;
    }
    attribute.needsUpdate = true;
    points.current.rotation.y = time * 0.05;
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
        color="#6366f1" // Indigo base
        transparent
        opacity={0.4}
        sizeAttenuation={true}
        blending={THREE.NormalBlending} // Changed for better visibility on white
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
        if (currentText === "") { isDeleting = false; setPhraseIdx((prev) => (prev + 1) % placeholderPhrases.length); speed = 500; }
      }
      setPlaceholder(currentText);
      timer = setTimeout(type, speed);
    };
    timer = setTimeout(type, 500);
    return () => clearTimeout(timer);
  }, [phraseIdx, language]);

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
    type();
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

  return (
    <section className="relative min-h-screen md:min-h-[170vh] flex flex-col items-center bg-white text-black overflow-x-hidden pt-36 pb-24" style={{ fontFamily: 'Georgia, serif' }}>
      <style>{`
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .typewriter-cursor { display: inline-block; width: 4px; height: 0.9em; margin-left: 4px; vertical-align: middle; background: #a855f7; animation: blink 1s step-end infinite; }
      `}</style>

      {/* --- BACKGROUND LAYER --- */}
      <div className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-1000 ${showParticles ? 'opacity-100' : 'opacity-0'}`}>
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }} dpr={[1, 2]}>
          <AntigravityParticles />
          <EffectComposer>
            <Bloom intensity={0.5} luminanceThreshold={0.9} />
          </EffectComposer>
        </Canvas>
      </div>
      
      {/* --- CONTENT LAYER --- */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-7xl">
        <div className="min-h-[160px] md:min-h-[220px] flex items-center justify-center w-full mb-12">
          <h1 className="text-4xl md:text-8xl font-bold tracking-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            <span>{displayText}</span>
            {isTyping && <span className="typewriter-cursor" />}
          </h1>
        </div>

        <p className={`text-base md:text-2xl text-zinc-500 mb-16 max-w-2xl italic transition-all duration-1000 ${showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {t.heroSubtitle}
        </p>

        <div className="flex flex-col items-center gap-16 mb-40 w-full max-w-md">
          <button onClick={onBookingClick} className={`group bg-black text-white px-10 py-4 rounded-full text-base font-medium flex items-center gap-2 transition-all duration-700 shadow-xl ${showCTA ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
            <span>{t.startJourney}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className={`w-full space-y-6 transition-all duration-1000 ${showInput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black text-black">{isSent ? t.openingChat : t.askAiAgent}</h3>
            <form onSubmit={(e) => { e.preventDefault(); onAskAIClick(query); setIsSent(true); }} className="relative flex items-center bg-white border-2 border-black rounded-2xl p-1.5 shadow-lg">
              <input ref={heroInputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} className="w-full bg-transparent px-5 py-3 outline-none text-black" />
              <button type="submit" className="bg-black text-white p-2 rounded-xl"><Send className="w-5 h-5" /></button>
            </form>
          </div>
        </div>

        {/* --- VIDEO PLAYER --- */}
        <div className="w-full max-w-[90rem] transition-all duration-700" style={{ opacity: scrollOpacity, transform: `scale(${scrollScale})` }}>
          <div ref={videoContainerRef} onClick={() => setIsModalOpen(true)} onMouseMove={handleMouseMove} onMouseEnter={() => setIsHoveringVideo(true)} onMouseLeave={() => setIsHoveringVideo(false)} className="group relative aspect-video w-full rounded-3xl overflow-hidden shadow-2xl bg-black border border-zinc-100 cursor-none">
             <div className={`pointer-events-absolute z-50 flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full font-bold shadow-2xl transition-opacity duration-300 ${isHoveringVideo ? 'opacity-100' : 'opacity-0'}`} style={{ position: 'absolute', left: `${currentPos.x}px`, top: `${currentPos.y}px`, transform: 'translate(-50%, -50%)' }}>
              <Play className="w-4 h-4 fill-black" />
              <span className="text-xs uppercase tracking-widest">{t.playIntro}</span>
            </div>
            {!isModalOpen && (
              <iframe src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0`} className="absolute inset-0 w-full h-full opacity-60 grayscale pointer-events-none object-cover" />
            )}
          </div>
        </div>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-7xl aspect-video rounded-3xl overflow-hidden bg-black">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 p-3 z-[130] bg-white/20 rounded-full"><X className="w-6 h-6 text-white" /></button>
            <iframe src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1`} className="w-full h-full" allowFullScreen />
          </div>
        </div>
      )}
    </section>
  );
}