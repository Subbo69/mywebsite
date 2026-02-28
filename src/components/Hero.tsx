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

  

  // Choreography States

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



  // --- CHOREOGRAPHY SYNCHRONIZATION ---

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



  // --- INFINITE TYPEWRITER (PLACEHOLDER) ---

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



  // --- SPRING PHYSICS ---

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



  // --- TYPEWRITER (TITLE) - 10% SCHNELLER & FIXIERTER TEXT ---

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

        // Geschwindigkeit optimiert: 10% schneller als die "elegante" Version

        setTimeout(type, Math.random() * 25 + 45);

      } else {

        setIsTyping(false); 

      }

    };

    

    const startTimeout = setTimeout(type, 50); 

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



  // --- PARTICLE ENGINE (8.278 DOTS) ---

  useEffect(() => {

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const PARTICLE_COUNT = 8278; 

    let particles: any[] = [];

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    let ticker = 0;

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

        const radius = Math.sqrt(i) * 21.12; 

        const z = 0.5 + Math.random();

        particles.push({

          x: mouse.x + (Math.cos(angle) * radius * z),

          y: mouse.y + (Math.sin(angle) * radius * z),

          offsetX: (Math.cos(angle) * radius),

          offsetY: (Math.sin(angle) * radius),

          z: z, 

          baseSize: Math.max(0.4, 1.72 * (1 - i / PARTICLE_COUNT)) * z,

          baseOpacity: Math.max(0.06, 0.35 * (1 - i / PARTICLE_COUNT)),

          randomOffset: Math.random() * 600

        });

      }

    };

    const animate = () => {

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ticker += 0.005;

      particles.forEach((p) => {

        const targetX = mouse.x + (p.offsetX * p.z) + (Math.sin(ticker + p.randomOffset) * 4);

        const targetY = mouse.y + (p.offsetY * p.z) + (Math.cos(ticker + p.randomOffset) * 4);

        p.x += (targetX - p.x) * (0.018 * p.z);

        p.y += (targetY - p.y) * (0.018 * p.z);

        const color = getParticleColor(p.x, p.y, p.baseOpacity);

        ctx.beginPath(); ctx.fillStyle = color;

        ctx.arc(p.x, p.y, p.baseSize, 0, Math.PI * 2); ctx.fill();

      });

      requestAnimationFrame(animate);

    };

    window.addEventListener('resize', () => { resize(); init(); });

    window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });

    resize(); init(); animate();

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

      <canvas 

        ref={canvasRef} 

        className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-[2000ms] ${showParticles ? 'opacity-100' : 'opacity-0'}`} 

      />

      

      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-7xl">

        <div className="min-h-[160px] md:min-h-[220px] flex items-center justify-center w-full mb-12">

          {/* DER "GHOST-TEXT" TRICK: Zentriert ohne Bewegung */}

          <h1 

            className="text-5xl md:text-8xl font-bold tracking-[-0.02em] relative inline-block"

            style={{ fontFamily: '"Montserrat", sans-serif' }}

          >

            {/* Sichtbarer Teil */}

            <span>{displayText}</span>

            {/* Zeiger (Cursor) */}

            {isTyping && <span className="animate-pulse font-light ml-1 opacity-60">|</span>}

            {/* Unsichtbarer Rest, um den Platz zu halten */}

            <span className="opacity-0 select-none" aria-hidden="true">

              {fullText.slice(displayText.length)}

            </span>

          </h1>

        </div>



        <p className={`text-xl md:text-2xl text-zinc-500 mb-16 max-w-2xl font-light italic transition-all duration-1000 ${showSubtitle ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>

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

                <Send className="w-5 h-5" />

              </button>

            </form>

          </div>

        </div>



        <div 

          className="w-full max-w-7xl sticky top-32 transition-all duration-700"

          style={{ opacity: scrollOpacity, transform: `scale(${scrollScale})` }}

        >

          <div 

            ref={videoContainerRef}

            onClick={() => setIsModalOpen(true)}

            className="group relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl bg-black cursor-pointer border border-zinc-100"

          >

            <div className="absolute inset-0 z-20 bg-black/10 transition-colors group-hover:bg-black/20" />

            <iframe

              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0`}

              className="absolute inset-0 w-full h-full opacity-60 grayscale"

            />

          </div>

        </div>

      </div>



      {isModalOpen && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-[4px]">

          <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-4">

            <X className="w-10 h-10 text-black" />

          </button>

          <div className="w-[95vw] max-w-7xl aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl">

            <iframe

              src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1`}

              className="w-full h-full"

              allow="autoplay; encrypted-media; fullscreen"

            />

          </div>

        </div>

      )}

    </section>

  );

}


