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

    setTargetPos({

      x: e.clientX - rect.left,

      y: e.clientY - rect.top

    });

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



  // ─── LIQUID AURORA BACKGROUND ENGINE ────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let tick = 0;

    const mouse    = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const tMouse   = { x: mouse.x, y: mouse.y };
    let lastMX = mouse.x, lastMY = mouse.y, moveAccum = 0;

    const ripples: { x: number; y: number; r: number; opacity: number; speed: number }[] = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    // Six orbs — each travels a distinct Lissajous figure across the viewport
    const orbs = [
      { fx:0.00041, fy:0.00057, px:0.00, py:0.00, ax:0.38, ay:0.32, radius:560, r:139, g:92,  b:246, ps:0.0023, pa:0.08 },
      { fx:0.00053, fy:0.00038, px:2.09, py:1.22, ax:0.30, ay:0.38, radius:520, r:59,  g:130, b:246, ps:0.0031, pa:0.10 },
      { fx:0.00035, fy:0.00062, px:4.18, py:3.67, ax:0.34, ay:0.26, radius:480, r:192, g:38,  b:211, ps:0.0019, pa:0.07 },
      { fx:0.00068, fy:0.00044, px:1.05, py:5.24, ax:0.22, ay:0.34, radius:430, r:99,  g:102, b:241, ps:0.0027, pa:0.09 },
      { fx:0.00029, fy:0.00071, px:3.14, py:2.51, ax:0.40, ay:0.22, radius:390, r:14,  g:165, b:233, ps:0.0035, pa:0.11 },
      { fx:0.00058, fy:0.00033, px:5.50, py:4.71, ax:0.26, ay:0.36, radius:350, r:167, g:243, b:210, ps:0.0022, pa:0.06 },
    ];

    const getCenter = (orb: typeof orbs[0], W: number, H: number) => {
      const bx = W * 0.5 + Math.sin(tick * orb.fx + orb.px) * W * orb.ax;
      const by = H * 0.5 + Math.cos(tick * orb.fy + orb.py) * H * orb.ay;
      const dx = mouse.x - bx, dy = mouse.y - by;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const pull = Math.min(170, 15000 / (dist + 80));
      return { x: bx + (dx / dist) * pull, y: by + (dy / dist) * pull };
    };

    const animate = () => {
      tick += 1;
      const W = canvas.width, H = canvas.height;

      // Smooth mouse spring
      mouse.x += (tMouse.x - mouse.x) * 0.055;
      mouse.y += (tMouse.y - mouse.y) * 0.055;

      // Ripple spawn on fast mouse movement
      const mdx = tMouse.x - lastMX, mdy = tMouse.y - lastMY;
      moveAccum += Math.sqrt(mdx * mdx + mdy * mdy);
      lastMX = tMouse.x; lastMY = tMouse.y;
      if (moveAccum > 60) {
        moveAccum = 0;
        ripples.push({ x: mouse.x, y: mouse.y, r: 0, opacity: 0.20, speed: 2.4 + Math.random() * 1.6 });
      }

      ctx.clearRect(0, 0, W, H);

      // ── Layer 1: Glowing orbs via 'screen' blending ──
      ctx.globalCompositeOperation = 'screen';
      orbs.forEach((orb) => {
        const { x, y } = getCenter(orb, W, H);
        const r = orb.radius * (1 + Math.sin(tick * orb.ps) * orb.pa);
        const a = 0.28 + Math.sin(tick * orb.ps * 1.7) * 0.05;
        const g = ctx.createRadialGradient(x, y, 0, x, y, r);
        g.addColorStop(0.00, `rgba(${orb.r},${orb.g},${orb.b},${a.toFixed(3)})`);
        g.addColorStop(0.35, `rgba(${orb.r},${orb.g},${orb.b},${(a*0.45).toFixed(3)})`);
        g.addColorStop(0.70, `rgba(${orb.r},${orb.g},${orb.b},${(a*0.10).toFixed(3)})`);
        g.addColorStop(1.00, `rgba(${orb.r},${orb.g},${orb.b},0)`);
        ctx.beginPath();
        ctx.fillStyle = g;
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Layer 2: Ripple rings ──
      ctx.globalCompositeOperation = 'source-over';
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += rp.speed;
        rp.opacity -= 0.0038;
        if (rp.opacity <= 0) { ripples.splice(i, 1); continue; }
        const o = orbs[i % orbs.length];
        ctx.beginPath();
        ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${o.r},${o.g},${o.b},${rp.opacity.toFixed(3)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // ── Layer 3: Mesh lines between nearby orb centers ──
      const centers = orbs.map((o) => ({ ...getCenter(o, W, H), r: o.r, g: o.g, b: o.b }));
      const MAX_D = 380;
      for (let i = 0; i < centers.length; i++) {
        for (let j = i + 1; j < centers.length; j++) {
          const dx = centers[j].x - centers[i].x, dy = centers[j].y - centers[i].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < MAX_D) {
            const alpha = (1 - d / MAX_D) * 0.07;
            const lg = ctx.createLinearGradient(centers[i].x, centers[i].y, centers[j].x, centers[j].y);
            lg.addColorStop(0,   `rgba(${centers[i].r},${centers[i].g},${centers[i].b},${alpha.toFixed(3)})`);
            lg.addColorStop(0.5, `rgba(${Math.round((centers[i].r+centers[j].r)/2)},${Math.round((centers[i].g+centers[j].g)/2)},${Math.round((centers[i].b+centers[j].b)/2)},${(alpha*1.6).toFixed(3)})`);
            lg.addColorStop(1,   `rgba(${centers[j].r},${centers[j].g},${centers[j].b},${alpha.toFixed(3)})`);
            ctx.beginPath();
            ctx.moveTo(centers[i].x, centers[i].y);
            ctx.lineTo(centers[j].x, centers[j].y);
            ctx.strokeStyle = lg;
            ctx.lineWidth = (1 - d / MAX_D) * 1.2;
            ctx.stroke();
          }
        }
      }

      ctx.globalCompositeOperation = 'source-over';
      animId = requestAnimationFrame(animate);
    };

    const onMM = (e: MouseEvent) => { tMouse.x = e.clientX; tMouse.y = e.clientY; };
    window.addEventListener('mousemove', onMM);
    window.addEventListener('resize', resize);
    resize();
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMM);
      window.removeEventListener('resize', resize);
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

        className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-[2500ms] ${showParticles ? 'opacity-100' : 'opacity-0'}`} 

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