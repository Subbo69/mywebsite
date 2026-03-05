import { ArrowRight, Send, Play, X, ChevronDown } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { motion, useAnimate, animate as motionAnimate } from 'framer-motion';

declare global {
  interface Window { THREE: any }
}

// ─── GlowingEffect (inlined) ──────────────────────────────────────────────────
const GlowingEffect = memo(({
  blur = 0, inactiveZone = 0.7, proximity = 0, spread = 20,
  variant = "default", glow = false, className = "",
  movementDuration = 2, borderWidth = 1, disabled = true,
}: {
  blur?: number; inactiveZone?: number; proximity?: number; spread?: number;
  variant?: "default" | "white"; glow?: boolean; className?: string;
  movementDuration?: number; borderWidth?: number; disabled?: boolean;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastPosition = useRef({ x: 0, y: 0 });
  const animationFrameRef = useRef<number>(0);

  const handleMove = useCallback((e?: MouseEvent | { x: number; y: number }) => {
    if (!containerRef.current) return;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(() => {
      const el = containerRef.current;
      if (!el) return;
      const { left, top, width, height } = el.getBoundingClientRect();
      const mouseX = e?.x ?? lastPosition.current.x;
      const mouseY = e?.y ?? lastPosition.current.y;
      if (e) lastPosition.current = { x: mouseX, y: mouseY };
      const center = [left + width * 0.5, top + height * 0.5];
      const distFromCenter = Math.hypot(mouseX - center[0], mouseY - center[1]);
      const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;
      if (distFromCenter < inactiveRadius) { el.style.setProperty("--active", "0"); return; }
      const isActive = mouseX > left - proximity && mouseX < left + width + proximity &&
        mouseY > top - proximity && mouseY < top + height + proximity;
      el.style.setProperty("--active", isActive ? "1" : "0");
      if (!isActive) return;
      const currentAngle = parseFloat(el.style.getPropertyValue("--start")) || 0;
      const targetAngle = (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) / Math.PI + 90;
      const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
      motionAnimate(currentAngle, currentAngle + angleDiff, {
        duration: movementDuration, ease: [0.16, 1, 0.3, 1],
        onUpdate: (v) => el.style.setProperty("--start", String(v)),
      });
    });
  }, [inactiveZone, proximity, movementDuration]);

  useEffect(() => {
    if (disabled) return;
    const onScroll = () => handleMove();
    const onPointer = (e: PointerEvent) => handleMove(e);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.body.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      window.removeEventListener("scroll", onScroll);
      document.body.removeEventListener("pointermove", onPointer);
    };
  }, [handleMove, disabled]);

  const gradient = variant === "white"
    ? `repeating-conic-gradient(from 236.84deg at 50% 50%, var(--black), var(--black) calc(25% / 5))`
    : `radial-gradient(circle, #dd7bbb 10%, #dd7bbb00 20%),
       radial-gradient(circle at 40% 40%, #d79f1e 5%, #d79f1e00 15%),
       radial-gradient(circle at 60% 60%, #5a922c 10%, #5a922c00 20%),
       radial-gradient(circle at 40% 60%, #4c7894 10%, #4c789400 20%),
       repeating-conic-gradient(from 236.84deg at 50% 50%, #dd7bbb 0%, #d79f1e calc(25%/5), #5a922c calc(50%/5), #4c7894 calc(75%/5), #dd7bbb calc(100%/5))`;

  if (disabled) return <div className="pointer-events-none absolute -inset-px hidden rounded-[inherit] border opacity-0 transition-opacity" />;

  return (
    <div
      ref={containerRef}
      style={{
        '--blur': `${blur}px`, '--spread': spread, '--start': '0', '--active': '0',
        '--glowingeffect-border-width': `${borderWidth}px`,
        '--repeating-conic-gradient-times': '5',
        '--gradient': gradient,
      } as React.CSSProperties}
      className={`pointer-events-none absolute inset-0 rounded-[inherit] opacity-100 transition-opacity ${blur > 0 ? 'blur-[var(--blur)]' : ''} ${className}`}
    >
      <div className={[
        "glow rounded-[inherit]",
        'after:content-[""] after:rounded-[inherit] after:absolute after:inset-[calc(-1*var(--glowingeffect-border-width))]',
        "after:[border:var(--glowingeffect-border-width)_solid_transparent]",
        "after:[background:var(--gradient)] after:[background-attachment:fixed]",
        "after:opacity-[var(--active)] after:transition-opacity after:duration-300",
        "after:[mask-clip:padding-box,border-box] after:[mask-composite:intersect]",
        "after:[mask-image:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)-var(--spread))*1deg),#00000000_0deg,#fff,#00000000_calc(var(--spread)*2deg))]",
      ].join(" ")} />
    </div>
  );
});
GlowingEffect.displayName = "GlowingEffect";

// ── Subtitle: RandomLetterSwapForward ─────────────────────────────────────────
function SubtitleSwap({ text }: { text: string }) {
  const [scope, animate] = useAnimate();
  const [blocked, setBlocked] = useState(false);
  const shuffled = useRef(
    Array.from({ length: text.length }, (_, i) => i).sort(() => Math.random() - 0.5)
  );
  const handleHover = useCallback(() => {
    if (blocked) return;
    setBlocked(true);
    for (let i = 0; i < text.length; i++) {
      const idx = shuffled.current[i];
      const delay = i * 0.018;
      animate(`.sub-letter-${idx}`, { y: '-100%' }, { type: 'spring', duration: 0.5, delay })
        .then(() => animate(`.sub-letter-${idx}`, { y: 0 }, { duration: 0 }));
      animate(`.sub-letter2-${idx}`, { top: '0%' }, { type: 'spring', duration: 0.5, delay })
        .then(() => animate(`.sub-letter2-${idx}`, { top: '100%' }, { duration: 0 }))
        .then(() => { if (i === text.length - 1) setBlocked(false); });
    }
  }, [animate, blocked, text.length]);

  return (
    <motion.span ref={scope} className="flex flex-wrap justify-center cursor-default" onHoverStart={handleHover}>
      <span className="sr-only">{text}</span>
      {text.split('').map((char, i) => (
        <span key={i} className="whitespace-pre relative flex overflow-hidden">
          <motion.span className={`relative sub-letter-${i}`} style={{ top: 0 }}>
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
          <motion.span className={`absolute sub-letter2-${i}`} aria-hidden style={{ top: '100%' }}>
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

  const sceneRef = useRef<{
    camera: any; scene: any; renderer: any; uniforms: any; animationId: number | null;
  }>({ camera: null, scene: null, renderer: null, uniforms: null, animationId: null });

  const reactiveRef = useRef({
    speedTarget: 1.0, speedCurrent: 1.0,
    brightnessTarget: 1.0, brightnessCurrent: 1.0,
    mouseX: 0.5, mouseY: 0.5, mouseXTarget: 0.5, mouseYTarget: 0.5,
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

  // ─── Shader ───────────────────────────────────────────────────────────────
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
    const camera = new THREE.Camera(); camera.position.z = 1;
    const scene = new THREE.Scene();
    const uniforms = {
      time:       { type: "f",  value: 1.0 },
      resolution: { type: "v2", value: new THREE.Vector2() },
      speed:      { type: "f",  value: 1.0 },
      brightness: { type: "f",  value: 1.0 },
      mousePos:   { type: "v2", value: new THREE.Vector2(0.5, 0.5) },
    };
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: `void main() { gl_Position = vec4(position, 1.0); }`,
      fragmentShader: `
        precision highp float;
        uniform vec2 resolution; uniform float time; uniform float speed;
        uniform float brightness; uniform vec2 mousePos;
        float random(in float x) { return fract(sin(x)*1e4); }
        float random(vec2 st) { return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123); }
        void main(void) {
          vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
          uv += (mousePos - 0.5) * 2.0 * 0.08;
          vec2 fMosaicScal = vec2(4.0, 2.0); vec2 vScreenSize = vec2(256.0, 256.0);
          uv.x = floor(uv.x * vScreenSize.x / fMosaicScal.x) / (vScreenSize.x / fMosaicScal.x);
          uv.y = floor(uv.y * vScreenSize.y / fMosaicScal.y) / (vScreenSize.y / fMosaicScal.y);
          float t = time + random(uv.x) * 0.4;
          vec3 color = vec3(0.0);
          for(int j = 0; j < 3; j++)
            for(int i = 0; i < 5; i++)
              color[j] += 0.0006 * float(i*i) / abs(fract(t - 0.01*float(j) + float(i)*0.01) - length(uv));
          gl_FragColor = vec4(color[2], color[1], color[0] * brightness, 1.0);
        }
      `,
    });
    scene.add(new THREE.Mesh(new THREE.PlaneBufferGeometry(2, 2), material));
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
    const animateShader = () => {
      sceneRef.current.animationId = requestAnimationFrame(animateShader);
      const r = reactiveRef.current;
      r.speedCurrent      += (r.speedTarget - r.speedCurrent) * 0.025;
      r.brightnessCurrent += (r.brightnessTarget - r.brightnessCurrent) * 0.04;
      r.mouseX            += (r.mouseXTarget - r.mouseX) * 0.06;
      r.mouseY            += (r.mouseYTarget - r.mouseY) * 0.06;
      const baseInc = 0.0009, maxInc = 0.0022;
      uniforms.time.value      += Math.max(baseInc, Math.min(baseInc + (r.speedCurrent - 1.0) * (maxInc - baseInc), maxInc));
      uniforms.speed.value      = r.speedCurrent;
      uniforms.brightness.value = r.brightnessCurrent;
      uniforms.mousePos.value.x = r.mouseX;
      uniforms.mousePos.value.y = r.mouseY;
      renderer.render(scene, camera);
    };
    animateShader();
    setShaderReady(true);
  };

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const r = reactiveRef.current;
      r.mouseXTarget = e.clientX / window.innerWidth;
      r.mouseYTarget = 1.0 - e.clientY / window.innerHeight;
      r.speedTarget = 1.4; r.brightnessTarget = 1.15;
      clearTimeout((onMove as any)._t);
      (onMove as any)._t = setTimeout(() => { r.speedTarget = 1.0; r.brightnessTarget = 1.0; }, 600);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useEffect(() => {
    let t: any;
    const onScroll = () => {
      const r = reactiveRef.current;
      const p = Math.min(Math.max((window.scrollY - 50) / 300, 0), 1);
      setScrollOpacity(p); setScrollScale(0.85 + p * 0.15);
      r.speedTarget = 1.0 + p * 1.2; r.brightnessTarget = 1.0 + p * 0.25;
      clearTimeout(t); t = setTimeout(() => { r.speedTarget = 1.0; r.brightnessTarget = 1.0; }, 800);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoContainerRef.current) return;
    const rect = videoContainerRef.current.getBoundingClientRect();
    setTargetPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useEffect(() => {
    if (!isHoveringVideo || isModalOpen) return;
    let af: number;
    const follow = () => {
      setCurrentPos(prev => ({ x: prev.x + (targetPos.x - prev.x) * 0.12, y: prev.y + (targetPos.y - prev.y) * 0.12 }));
      af = requestAnimationFrame(follow);
    };
    af = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(af);
  }, [targetPos, isHoveringVideo, isModalOpen]);

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

  useEffect(() => {
    let cur = ""; let del = false; let timer: NodeJS.Timeout;
    const type = () => {
      const phrase = placeholderPhrases[phraseIdx]; let speed = 80;
      if (!del) { cur = phrase.slice(0, cur.length + 1); if (cur === phrase) { speed = 3500; del = true; } }
      else { cur = phrase.slice(0, cur.length - 1); speed = 40; if (cur === "") { del = false; setPhraseIdx(p => (p + 1) % placeholderPhrases.length); speed = 1000; } }
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

      {/* Shader BG */}
      <div ref={shaderContainerRef} className={`fixed inset-0 z-0 pointer-events-none transition-opacity duration-[2000ms] ${shaderReady ? 'opacity-100' : 'opacity-0'}`} style={{ width: '100vw', height: '100vh' }} />
      <div className="fixed inset-0 z-[1] pointer-events-none bg-black/30" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-7xl h-full">

        {/* ── Titles ── */}
        <div className="relative mb-8 w-full mx-auto flex flex-col items-center gap-2">
          {[titleLine1, titleLine2].map((line, lineIdx) => {
            const hovered = lineIdx === 0 ? hoveredTitle1 : hoveredTitle2;
            const setHovered = lineIdx === 0 ? setHoveredTitle1 : setHoveredTitle2;
            const baseDelay = lineIdx === 0 ? 0 : titleLine1.length * 0.038;
            return (
              <h1
                key={lineIdx}
                className="flex whitespace-nowrap justify-center font-black text-white drop-shadow-2xl w-full"
                style={{ fontFamily: '"Montserrat", sans-serif', letterSpacing: '0.03em', fontSize: 'clamp(1.6rem, 6vw, 5.5rem)' }}
                onMouseLeave={() => setHovered(null)}
              >
                {line.split("").map((char, i) => {
                  const dist = hovered !== null ? Math.abs(hovered - i) : null;
                  const isHovering = hovered !== null;
                  let cls = "transition-all duration-300 ease-in-out cursor-default";
                  if (!isHovering)      cls += " font-black text-white";
                  else if (dist === 0)  cls += " font-thin text-white/40 scale-90";
                  else if (dist === 1)  cls += " font-light text-white/60";
                  else if (dist === 2)  cls += " font-normal text-white/75";
                  else                  cls += " font-semibold text-white/90";
                  return (
                    <motion.span
                      key={`l${lineIdx}-${i}`}
                      initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ duration: 0.6, delay: 0.2 + baseDelay + i * 0.038, ease: [0.22, 1, 0.36, 1] }}
                      onAnimationComplete={() => { if (lineIdx === 1 && i === line.length - 1) setTitleDone(true); }}
                      onMouseEnter={() => setHovered(i)}
                      className={cls}
                    >
                      {char === " " ? "\u00A0" : char}
                    </motion.span>
                  );
                })}
              </h1>
            );
          })}
        </div>

        {/* ── Subtitle ── */}
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

        {/* ── CTA + Input ── */}
        <div className="flex flex-col items-center gap-12 w-full max-w-md mt-4">

          {/* CTA Button */}
          <div className={`relative rounded-full transition-all duration-1000 ${showCTA ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90 pointer-events-none'}`}>
            <GlowingEffect spread={40} glow={true} disabled={false} proximity={60} inactiveZone={0.01} borderWidth={2} />
            <button
              onClick={onBookingClick}
              className="group relative bg-white text-black px-10 py-4 rounded-full text-base font-medium flex items-center gap-2 hover:scale-105 hover:bg-white/90 transition-all duration-300 shadow-2xl"
            >
              <span className="whitespace-nowrap">{t.startJourney}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* AI Input */}
          <div className={`w-full space-y-3 transition-all duration-1000 ${showInput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'}`}>
            <div className="flex flex-col items-center gap-1">
              <h3 className="text-[13px] md:text-[15px] uppercase tracking-[0.5em] font-black text-white/90">{isSent ? t.openingChat : t.askAiAgent}</h3>
              {!isSent && <ChevronDown className="w-7 h-7 text-white/80 stroke-[3] animate-bounce-down" />}
            </div>
            <div className="relative rounded-2xl">
              <GlowingEffect spread={50} glow={false} disabled={false} proximity={80} inactiveZone={0.01} borderWidth={2} />
              <form
                onSubmit={handleAISubmit}
                className={`relative flex items-center bg-white/10 border-2 backdrop-blur-sm rounded-2xl p-1.5 transition-all duration-300 shadow-2xl focus-within:bg-white/15 ${isSent ? 'border-green-400 bg-green-900/20' : 'border-white/30 focus-within:border-white/60'}`}
              >
                <input
                  ref={heroInputRef} type="text" value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isSent ? "" : placeholder} disabled={isSent}
                  className="w-full bg-transparent px-5 py-4 text-base outline-none text-white font-medium placeholder-white/50"
                  style={{ fontFamily: 'Georgia, serif' }}
                />
                <button type="submit" disabled={!query.trim() || isSent}
                  className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all ${query.trim() && !isSent ? 'bg-white text-black' : 'opacity-0'}`}>
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* ── Video ── */}
        <div className="w-full max-w-6xl mt-48 mb-24 transition-all duration-700" style={{ opacity: scrollOpacity, transform: `scale(${scrollScale})` }}>
          <div className="relative rounded-[2.5rem]">
            <GlowingEffect spread={60} glow={false} disabled={false} proximity={120} inactiveZone={0.01} borderWidth={2} />
            <div
              ref={videoContainerRef}
              onClick={() => setIsModalOpen(true)}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHoveringVideo(true)}
              onMouseLeave={() => setIsHoveringVideo(false)}
              className={`group relative aspect-video w-full rounded-[2.5rem] overflow-hidden shadow-2xl bg-black border border-white/10 ${isTouch ? 'cursor-pointer' : 'cursor-none'}`}
            >
              {!isTouch && (
                <div
                  className={`pointer-events-none absolute z-50 flex items-center gap-3 px-6 py-3 bg-white text-black rounded-full font-bold shadow-2xl transition-opacity duration-300 ${isHoveringVideo ? 'opacity-100' : 'opacity-0'}`}
                  style={{ left: `${currentPos.x}px`, top: `${currentPos.y}px`, transform: 'translate(-50%, -50%)', fontFamily: '"Montserrat", sans-serif' }}
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span className="text-xs uppercase tracking-widest whitespace-nowrap">{t.playIntro}</span>
                </div>
              )}
              {!isModalOpen && (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0`}
                  className="absolute inset-[-2%] w-[104%] h-[104%] opacity-60 grayscale pointer-events-none object-cover scale-110"
                  style={{ border: 'none' }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="absolute top-8 right-8 z-[130] rounded-full">
            <GlowingEffect spread={30} glow={false} disabled={false} proximity={50} inactiveZone={0.01} borderWidth={2} />
            <button onClick={() => setIsModalOpen(false)} className="relative p-4 bg-white border-2 border-black rounded-full hover:scale-110 transition-all shadow-xl">
              <X className="w-8 h-8 text-black" />
            </button>
          </div>
          <div className="relative w-full max-w-6xl aspect-video z-[110] rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.3)] bg-black">
            <iframe src={`https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1`} className="w-full h-full" allow="autoplay; encrypted-media; fullscreen" style={{ border: 'none' }} />
          </div>
        </div>
      )}
    </section>
  );
}
