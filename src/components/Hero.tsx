import { ArrowRight, Send, Play, X, ChevronDown } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, useAnimate } from 'framer-motion';

declare global {
  interface Window { THREE: any }
}

// ── Subtitle: RandomLetterSwapForward ────────────────────────────────────────
function SubtitleSwap({ text }: { text: string }) {
  const [scope, animate] = useAnimate();
  const [blocked, setBlocked] = useState(false);

  // Stable shuffled order
  const shuffled = useRef(
    Array.from({ length: text.length }, (_, i) => i).sort(() => Math.random() - 0.5)
  );

  const handleHover = useCallback(() => {
    if (blocked) return;
    setBlocked(true);
    for (let i = 0; i < text.length; i++) {
      const idx = shuffled.current[i];
      const delay = i * 0.018;
      animate(`.sub-letter-${idx}`,   { y: '-100%' }, { type: 'spring', duration: 0.5, delay })
        .then(() => animate(`.sub-letter-${idx}`,   { y: 0 }, { duration: 0 }));
      animate(`.sub-letter2-${idx}`,  { top: '0%'  }, { type: 'spring', duration: 0.5, delay })
        .then(() => animate(`.sub-letter2-${idx}`,  { top: '100%' }, { duration: 0 }))
        .then(() => { if (i === text.length - 1) setBlocked(false); });
    }
  }, [animate, blocked, text.length]);

  return (
    <motion.span
      ref={scope}
      className="flex flex-wrap justify-center cursor-default"
      onHoverStart={handleHover}
    >
      <span className="sr-only">{text}</span>
      {text.split('').map((char, i) => (
        <span key={i} className="whitespace-pre relative flex overflow-hidden">
          <motion.span className={`relative sub-letter-${i}`} style={{ top: 0 }}>
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
          <motion.span
            className={`absolute sub-letter2-${i}`}
            aria-hidden
            style={{ top: '100%' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        </span>
      ))}
    </motion.span>
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
  const shaderContainerRef = useRef<HTMLDivElement>(null);

  // Shader scene refs
  const sceneRef = useRef<{
    camera: any; scene: any; renderer: any; uniforms: any; animationId: number | null;
  }>({ camera: null, scene: null, renderer: null, uniforms: null, animationId: null });

  // Reactive shader state
  const reactiveRef = useRef({
    speedTarget: 1.0,
    speedCurrent: 1.0,
    brightnessTarget: 1.0,
    brightnessCurrent: 1.0,
    mouseX: 0.5,
    mouseY: 0.5,
    mouseXTarget: 0.5,
    mouseYTarget: 0.5,
  });

  const [query, setQuery] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(0);
  const [scrollScale, setScrollScale] = useState(0.85);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shaderReady, setShaderReady] = useState(false);
  const [titleDone, setTitleDone] = useState(false);

  const [showSubtitle, setShowSubtitle] = useState(false);
  const [showCTA, setShowCTA] = useState(false);
  const [showInput, setShowInput] = useState(false);

  const [messageCount, setMessageCount] = useState(0);
  const [placeholder, setPlaceholder] = useState("");
  const placeholderPhrases = [t.howCanWeHelp, t.heroPlaceholder1, t.heroPlaceholder2, t.heroPlaceholder3];
  const [phraseIdx, setPhraseIdx] = useState(0);

  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [currentPos, setCurrentPos] = useState({ x: 0, y: 0 });
  const [isHoveringVideo, setIsHoveringVideo] = useState(false);

  const titleLine1 = t.heroTitle1;
  const titleLine2 = t.heroTitle2;
  const [hoveredTitle1, setHoveredTitle1] = useState<number | null>(null);
  const [hoveredTitle2, setHoveredTitle2] = useState<number | null>(null);
  const VIDEO_ID = "Py1ClI35v_k";
  const isTouch = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  // ─── Shader Init ────────────────────────────────────────────────────────────
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/89/three.min.js";
    script.onload = () => { if (shaderContainerRef.current && window.THREE) initShader(); };
    document.head.appendChild(script);
    return () => {
      if (sceneRef.current.animationId) cancelAnimationFrame(sceneRef.current.animationId);
      if (sceneRef.current.renderer) sceneRef.current.renderer.dispose();
      try { document.head.removeChild(script); } catch {}
    };
  }, []);

  const initShader = () => {
    if (!shaderContainerRef.current || !window.THREE) return;
    const THREE = window.THREE;
    const container = shaderContainerRef.current;
    container.innerHTML = "";

    const camera = new THREE.Camera();
    camera.position.z = 1;
    const scene = new THREE.Scene();
    const geometry = new THREE.PlaneBufferGeometry(2, 2);

    const uniforms = {
      time:       { type: "f",  value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
      speed:      { type: "f",  value: 1.0 },
      brightness: { type: "f",  value: 1.0 },
      mousePos:   { type: "v2", value: new THREE.Vector2(0.5, 0.5) },
    };

    const vertexShader = `void main() { gl_Position = vec4(position, 1.0); }`;

    const fragmentShader = `
      #define TWO_PI 6.2831853072
      #define PI 3.14159265359

      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float speed;
      uniform float brightness;
      uniform vec2 mousePos;

      float random(in float x) { return fract(sin(x)*1e4); }
      float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123); }

      void main(void) {
        vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

        // Mouse warp — subtle positional shift toward cursor
        vec2 mouse = (mousePos - 0.5) * 2.0;
        uv += mouse * 0.08;

        vec2 fMosaicScal = vec2(4.0, 2.0);
        vec2 vScreenSize = vec2(256.0, 256.0);
        uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
        uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);

        // time is already pre-scaled on CPU side — no GPU multiplication
        float t = time + random(uv.x) * 0.4;
        float lineWidth = 0.0006;

        vec3 color = vec3(0.0);
        for(int j = 0; j < 3; j++){
          for(int i = 0; i < 5; i++){
            color[j] += lineWidth * float(i*i) / abs(fract(t - 0.01*float(j) + float(i)*0.01)*1.0 - length(uv));
          }
        }

        color *= brightness;

        gl_FragColor = vec4(color[2], color[1], color[0], 1.0);
      }
    `;

    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    sceneRef.current = { camera, scene, renderer, uniforms, animationId: null };

    const onResize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
      uniforms.resolution.value.x = renderer.domElement.width;
      uniforms.resolution.value.y = renderer.domElement.height;
    };
    onResize();
    window.addEventListener("resize", onResize, false);

    const animate = () => {
      sceneRef.current.animationId = requestAnimationFrame(animate);
      const r = reactiveRef.current;

      // Smooth lerp all reactive values
      r.speedCurrent      += (r.speedTarget - r.speedCurrent) * 0.025;
      r.brightnessCurrent += (r.brightnessTarget - r.brightnessCurrent) * 0.04;
      r.mouseX            += (r.mouseXTarget - r.mouseX) * 0.06;
      r.mouseY            += (r.mouseYTarget - r.mouseY) * 0.06;

      // Increment time on CPU — base is very slow, speed nudges it slightly
      const baseInc = 0.0009;
      const maxInc  = 0.0022; // hard cap prevents any strobing
      const inc = baseInc + (r.speedCurrent - 1.0) * (maxInc - baseInc);
      uniforms.time.value += Math.max(baseInc, Math.min(inc, maxInc));
      uniforms.speed.value = r.speedCurrent;
      uniforms.brightness.value  = r.brightnessCurrent;
      uniforms.mousePos.value.x  = r.mouseX;
      uniforms.mousePos.value.y  = r.mouseY;

      renderer.render(scene, camera);
    };
    animate();
    setShaderReady(true);
  };

  // ─── Reactive Events ────────────────────────────────────────────────────────
  // Mouse move → warp + slight brightness
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const r = reactiveRef.current;
      r.mouseXTarget = e.clientX / window.innerWidth;
      r.mouseYTarget = 1.0 - e.clientY / window.innerHeight;
      r.speedTarget = 1.4;
      r.brightnessTarget = 1.15;
      // Let it ease back
      clearTimeout((onMove as any)._t);
      (onMove as any)._t = setTimeout(() => {
        r.speedTarget = 1.0;
        r.brightnessTarget = 1.0;
      }, 600);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // Scroll → speed up
  useEffect(() => {
    let scrollTimer: any;
    const onScroll = () => {
      const r = reactiveRef.current;
      const p = Math.min(Math.max((window.scrollY - 50) / 300, 0), 1);
      setScrollOpacity(p);
      setScrollScale(0.85 + p * 0.15);

      r.speedTarget = 1.0 + p * 1.2;         // max 2.2× — no strobing
      r.brightnessTarget = 1.0 + p * 0.25;
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        r.speedTarget = 1.0;
        r.brightnessTarget = 1.0;
      }, 800);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ─── Cursor follow for video ─────────────────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoContainerRef.current) return;
    const rect = videoContainerRef.current.getBoundingClientRect();
    setTargetPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useEffect(() => {
    if (!isHoveringVideo || isModalOpen) return;
    let af: number;
    const follow = () => {
      setCurrentPos(prev => ({
        x: prev.x + (targetPos.x - prev.x) * 0.12,
        y: prev.y + (targetPos.y - prev.y) * 0.12,
      }));
      af = requestAnimationFrame(follow);
    };
    af = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(af);
  }, [targetPos, isHoveringVideo, isModalOpen]);

  // ─── Animation Sequence (triggered when GradualSpacing finishes) ──────────
  useEffect(() => {
    if (!titleDone) return;
    const t1 = setTimeout(() => {
      setShowSubtitle(true);
      const t2 = setTimeout(() => {
        setShowCTA(true);
        const t3 = setTimeout(() => {
          setShowInput(true);
          const t4 = setTimeout(() => { heroInputRef.current?.focus({ preventScroll: true }); }, 800);
          return () => clearTimeout(t4);
        }, 1000);
        return () => clearTimeout(t3);
      }, 2200);
      return () => clearTimeout(t2);
    }, 400);
    return () => clearTimeout(t1);
  }, [titleDone]);

  // Placeholder typing
  useEffect(() => {
    let cur = ""; let del = false; let timer: NodeJS.Timeout;
    const type = () => {
      const phrase = placeholderPhrases[phraseIdx];
      let speed = 80;
      if (!del) {
        cur = phrase.slice(0, cur.length + 1);
        if (cur === phrase) { speed = 3500; del = true; }
      } else {
        cur = phrase.slice(0, cur.length - 1); speed = 40;
        if (cur === "") { del = false; setPhraseIdx(p => (p + 1) % placeholderPhrases.length); speed = 1000; }
      }
      setPlaceholder(cur); timer = setTimeout(type, speed);
    };
    timer = setTimeout(type, 500);
    return () => clearTimeout(timer);
  }, [phraseIdx, language]);

  const handleAISubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || messageCount >= 25) return;
    onAskAIClick(query);
    setMessageCount(prev => prev + 1);
    setIsSent(true); setQuery("");
    setTimeout(() => setIsSent(false), 3000);
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center bg-black text-white overflow-x-hidden pt-28 pb-12" style={{ fontFamily: 'Georgia, serif' }}>
      <style>{`
        @keyframes bounce-down { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
        @keyframes underline-swipe-lr {
          0% { left: 0%; width: 0%; opacity: 0; }
          40% { left: 0%; width: 70%; opacity: 1; }
          60% { left: 0%; width: 100%; opacity: 1; }
          100% { left: 100%; width: 0%; opacity: 0; }
        }
        .animate-bounce-down { animation: bounce-down 1.2s ease-in-out infinite; }
        .underline-dynamic {
          position: absolute; bottom: -6px; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent);
          animation: underline-swipe-lr 2.2s cubic-bezier(0.65, 0, 0.35, 1) 0.5s forwards;
        }
      `}</style>

      {/* ── Shader Background ── */}
      <div
        ref={shaderContainerRef}
        className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-[2000ms] ${shaderReady ? 'opacity-100' : 'opacity-0'}`}
        style={{ width: '100vw', height: '100vh' }}
      />
      {/* Overlay to darken shader slightly so text stays legible */}
      <div className="fixed inset-0 z-[1] pointer-events-none bg-black/30" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-7xl h-full">
        {/* ── Title: Inverted BubbleText — bold default, thins on hover ── */}
        <div className="relative mb-8 w-full max-w-7xl mx-auto flex flex-col items-center gap-2">
          {/* Line 1 */}
          <h1
            className="flex flex-wrap justify-center text-4xl md:text-8xl font-black text-white drop-shadow-2xl"
            style={{ fontFamily: '"Montserrat", sans-serif', letterSpacing: '0.03em' }}
            onMouseLeave={() => setHoveredTitle1(null)}
          >
            {titleLine1.split("").map((char, i) => {
              const dist = hoveredTitle1 !== null ? Math.abs(hoveredTitle1 - i) : null;
              const isHovering = hoveredTitle1 !== null;
              let cls = "transition-all duration-300 ease-in-out cursor-default";
              if (!isHovering) {
                // default: full weight, full white
                cls += " font-black text-white";
              } else if (dist === 0) {
                // directly hovered: shrinks to thin + dim
                cls += " font-thin text-white/40 scale-90";
              } else if (dist === 1) {
                cls += " font-light text-white/60";
              } else if (dist === 2) {
                cls += " font-normal text-white/75";
              } else {
                cls += " font-semibold text-white/90";
              }
              return (
                <motion.span
                  key={`l1-${i}`}
                  initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.038, ease: [0.22, 1, 0.36, 1] }}
                  onMouseEnter={() => setHoveredTitle1(i)}
                  className={cls}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              );
            })}
          </h1>
          {/* Line 2 */}
          <h1
            className="flex flex-wrap justify-center text-4xl md:text-8xl font-black text-white drop-shadow-2xl"
            style={{ fontFamily: '"Montserrat", sans-serif', letterSpacing: '0.03em' }}
            onMouseLeave={() => setHoveredTitle2(null)}
          >
            {titleLine2.split("").map((char, i) => {
              const dist = hoveredTitle2 !== null ? Math.abs(hoveredTitle2 - i) : null;
              const isHovering = hoveredTitle2 !== null;
              let cls = "transition-all duration-300 ease-in-out cursor-default";
              if (!isHovering) {
                cls += " font-black text-white";
              } else if (dist === 0) {
                cls += " font-thin text-white/40 scale-90";
              } else if (dist === 1) {
                cls += " font-light text-white/60";
              } else if (dist === 2) {
                cls += " font-normal text-white/75";
              } else {
                cls += " font-semibold text-white/90";
              }
              return (
                <motion.span
                  key={`l2-${i}`}
                  initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.6,
                    delay: 0.2 + titleLine1.length * 0.038 + i * 0.038,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onAnimationComplete={() => {
                    if (i === titleLine2.length - 1) setTitleDone(true);
                  }}
                  onMouseEnter={() => setHoveredTitle2(i)}
                  className={cls}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              );
            })}
          </h1>
        </div>

        {/* ── Subtitle: RandomLetterSwapForward ── */}
        <div className="relative inline-block mb-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={showSubtitle ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="text-base md:text-2xl text-white/80 font-light italic drop-shadow-lg"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            <SubtitleSwap text={t.heroSubtitle} />
          </motion.div>
          {showSubtitle && <div className="underline-dynamic" />}
        </div>

        {/* CTA + Input */}
        <div className="flex flex-col items-center gap-12 w-full max-w-md mt-4">
          <button onClick={onBookingClick} className={`group bg-white text-black px-10 py-4 rounded-full text-base font-medium flex items-center gap-2 hover:scale-105 hover:bg-white/90 transition-all duration-1000 shadow-2xl ${showCTA ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90 pointer-events-none'}`}>
            <span className="whitespace-nowrap">{t.startJourney}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <div className={`w-full space-y-3 transition-all duration-1000 ${showInput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'}`}>
            <div className="flex flex-col items-center gap-1">
              <h3 className="text-[13px] md:text-[15px] uppercase tracking-[0.5em] font-black text-white/90">{isSent ? t.openingChat : t.askAiAgent}</h3>
              {!isSent && <ChevronDown className="w-7 h-7 text-white/80 stroke-[3] animate-bounce-down" />}
            </div>

            <form onSubmit={handleAISubmit} className={`relative flex items-center bg-white/10 border-2 backdrop-blur-sm rounded-2xl p-1.5 transition-all duration-300 shadow-2xl focus-within:bg-white/15 ${isSent ? 'border-green-400 bg-green-900/20' : 'border-white/30 focus-within:border-white/60'}`}>
              <input ref={heroInputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={isSent ? "" : placeholder} disabled={isSent} className="w-full bg-transparent px-5 py-4 text-base outline-none text-white font-medium placeholder-white/50" style={{ fontFamily: 'Georgia, serif' }} />
              <button type="submit" disabled={!query.trim() || isSent} className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${query.trim() && !isSent ? 'bg-white text-black' : 'opacity-0'}`}><Send className="w-5 h-5" /></button>
            </form>
          </div>
        </div>

        {/* Video */}
        <div className="w-full max-w-6xl mt-48 mb-24 transition-all duration-700" style={{ opacity: scrollOpacity, transform: `scale(${scrollScale})` }}>
          <div ref={videoContainerRef} onClick={() => setIsModalOpen(true)} onMouseMove={handleMouseMove} onMouseEnter={() => setIsHoveringVideo(true)} onMouseLeave={() => setIsHoveringVideo(false)} className={`group relative aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-black border border-white/10 ${isTouch ? 'cursor-pointer' : 'cursor-none'}`}>
            {!isTouch && (
              <div className={`pointer-events-none absolute z-50 flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full font-bold shadow-2xl transition-opacity duration-300 ${isHoveringVideo ? 'opacity-100' : 'opacity-0'}`} style={{ left: `${currentPos.x}px`, top: `${currentPos.y}px`, transform: 'translate(-50%, -50%)', fontFamily: '"Montserrat", sans-serif' }}>
                <Play className="w-4 h-4 fill-black" /><span className="text-xs uppercase tracking-widest whitespace-nowrap">{t.playIntro}</span>
              </div>
            )}
            {!isModalOpen && <iframe src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0`} className="absolute inset-[-2%] w-[104%] h-[104%] opacity-60 grayscale pointer-events-none object-cover scale-110" style={{ border: 'none' }} />}
          </div>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-4 z-[130] bg-white border-2 border-black rounded-full hover:scale-110 transition-all shadow-xl"><X className="w-8 h-8 text-black" /></button>
          <div className="relative w-full max-w-6xl aspect-video z-[110] rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.3)] bg-black">
            <iframe src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1`} className="w-full h-full" allow="autoplay; encrypted-media; fullscreen" style={{ border: 'none' }} />
          </div>
        </div>
      )}
    </section>
  );
}
