import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { ArrowRight, Send, Play, X } from 'lucide-react';
import { translations, Language } from '../utils/translations';

interface HeroProps {
  onBookingClick: () => void;
  onAskAIClick: (initialMessage?: string) => void;
  language: Language;
}

// --- 3D PARTICLE ENGINE ---
function FluidParticles({ count = 3500 }) {
  const mesh = useRef<THREE.Points>(null);
  const { mouse, viewport } = useThree();

  // Initialize particles in a semi-random cloud
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const randoms = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
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
      
      // 1. Fluid Drift Logic
      const slowTime = time * 0.1;
      pos[i3] += Math.sin(slowTime + particles.randoms[i] * 10) * 0.005;
      pos[i3 + 1] += Math.cos(slowTime + particles.randoms[i] * 10) * 0.005;

      // 2. Mouse Interaction (Magnetic Pull)
      const mx = (mouse.x * viewport.width) / 2;
      const my = (mouse.y * viewport.height) / 2;
      
      const dx = mx - pos[i3];
      const dy = my - pos[i3 + 1];
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 6) {
        const force = (6 - dist) / 6;
        pos[i3] += dx * force * 0.02;
        pos[i3 + 1] += dy * force * 0.02;
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
        size={0.08}
        color="#8b5cf6"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        sizeAttenuation={true}
      />
    </points>
  );
}

// --- MAIN HERO COMPONENT ---
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
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [isHoveringVideo, setIsHoveringVideo] = useState(false);

  const fullText = t.heroTitle;
  const placeholderPhrases = [t.howCanWeHelp, t.heroPlaceholder1, t.heroPlaceholder2, t.heroPlaceholder3];
  const VIDEO_ID = "Py1ClI35v_k";

  // Magnetic Video Follower
  useEffect(() => {
    if (!isHoveringVideo || isModalOpen) return;
    let frame: number;
    const follow = () => {
      setCurrentPos(p => ({
        x: p.x + (targetPos.x - p.x) * 0.15,
        y: p.y + (targetPos.y - p.y) * 0.15
      }));
      frame = requestAnimationFrame(follow);
    };
    frame = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(frame);
  }, [targetPos, isHoveringVideo, isModalOpen]);

  // Typewriter & UI Choreography
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
        setTimeout(() => setShowSubtitle(true), 300);
        setTimeout(() => setShowCTA(true), 800);
        setTimeout(() => setShowInput(true), 1300);
        setTimeout(() => {
          setShowParticles(true);
          heroInputRef.current?.focus({ preventScroll: true });
        }, 1800);
      }
    };
    type();
  }, [fullText]);

  // Placeholder Animation
  useEffect(() => {
    let currentText = "";
    let isDeleting = false;
    const tick = () => {
      const phrase = placeholderPhrases[phraseIdx];
      if (!isDeleting) {
        currentText = phrase.slice(0, currentText.length + 1);
        if (currentText === phrase) { setTimeout(() => isDeleting = true, 2000); }
      } else {
        currentText = phrase.slice(0, currentText.length - 1);
        if (currentText === "") {
          isDeleting = false;
          setPhraseIdx((prev) => (prev + 1) % placeholderPhrases.length);
        }
      }
      setPlaceholder(currentText);
    };
    const timer = setInterval(tick, isDeleting ? 40 : 80);
    return () => clearInterval(timer);
  }, [phraseIdx, language]);

  // Scroll Handling
  useEffect(() => {
    const handleScroll = () => {
      const progress = Math.min(Math.max((window.scrollY - 50) / 400, 0), 1);
      setScrollOpacity(progress);
      setScrollScale(0.85 + (progress * 0.15));
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
    <section className="relative min-h-screen md:min-h-[170vh] flex flex-col items-center bg-white text-black overflow-x-hidden pt-36 pb-24" style={{ fontFamily: 'Georgia, serif' }}>
      
      {/* --- SEXY 3D BACKGROUND --- */}
      <div className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-[3000ms] ${showParticles ? 'opacity-100' : 'opacity-0'}`}>
        <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
          <FluidParticles count={4000} />
          <EffectComposer>
            <Bloom intensity={1.5} luminanceThreshold={0.1} luminanceSmoothing={0.9} radius={0.5} />
          </EffectComposer>
        </Canvas>
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-7xl">
        <div className="min-h-[160px] md:min-h-[220px] flex items-center justify-center w-full mb-12">
          <h1 className="text-4xl md:text-8xl font-bold tracking-tight" style={{ fontFamily: '"Montserrat", sans-serif' }}>
            {displayText}
            {isTyping && <span className="inline-block w-1 h-12 md:h-20 bg-purple-500 ml-2 animate-pulse" />}
          </h1>
        </div>

        <p className={`text-lg md:text-2xl text-zinc-500 mb-16 max-w-2xl italic transition-all duration-1000 ${showSubtitle ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
          {t.heroSubtitle}
        </p>

        <div className="flex flex-col items-center gap-12 mb-40 w-full max-w-md">
          <button onClick={onBookingClick} className={`group bg-black text-white px-10 py-4 rounded-full font-medium flex items-center gap-2 transition-all duration-700 shadow-xl hover:scale-105 ${showCTA ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
            {t.startJourney} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className={`w-full transition-all duration-1000 delay-300 ${showInput ? 'opacity-100' : 'opacity-0 translate-y-8'}`}>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black mb-4">{isSent ? t.openingChat : t.askAiAgent}</h3>
            <form onSubmit={handleAISubmit} className="relative flex items-center bg-white border-2 border-black rounded-2xl p-1.5 shadow-lg">
              <input ref={heroInputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={placeholder} className="w-full bg-transparent px-5 py-3 outline-none" />
              <button type="submit" className={`p-3 rounded-xl transition-all ${query ? 'bg-black text-white' : 'opacity-0'}`}><Send className="w-5 h-5" /></button>
            </form>
          </div>
        </div>

        {/* --- VIDEO SECTION --- */}
        <div className="w-full max-w-6xl sticky top-32 transition-all duration-700" style={{ opacity: scrollOpacity, transform: `scale(${scrollScale})` }}>
          <div 
            ref={videoContainerRef}
            onMouseMove={(e) => {
              const rect = videoContainerRef.current?.getBoundingClientRect();
              if (rect) setTargetPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            }}
            onMouseEnter={() => setIsHoveringVideo(true)}
            onMouseLeave={() => setIsHoveringVideo(false)}
            onClick={() => setIsModalOpen(true)}
            className="relative aspect-video rounded-3xl overflow-hidden bg-black cursor-none border border-zinc-200 shadow-2xl"
          >
            <div className={`absolute z-50 flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full font-bold transition-opacity ${isHoveringVideo ? 'opacity-100' : 'opacity-0'}`} style={{ left: currentPos.x, top: currentPos.y, transform: 'translate(-50%, -50%)' }}>
              <Play className="w-4 h-4 fill-black" /> <span className="text-xs uppercase tracking-widest">{t.playIntro}</span>
            </div>
            <iframe src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0`} className="absolute inset-0 w-full h-full opacity-50 grayscale scale-110 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 z-[110] p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all text-white"><X /></button>
            <iframe src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1`} className="w-full h-full" allow="autoplay; fullscreen" />
          </div>
        </div>
      )}
    </section>
  );
}