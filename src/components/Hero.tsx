import { ArrowRight, Send, Play } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useEffect, useRef, useState, useCallback, memo } from 'react';
import { motion, animate as motionAnimate } from 'framer-motion';

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
    : `radial-gradient(circle, #07bccc 10%, #07bccc00 20%),
       radial-gradient(circle at 40% 40%, #e601c0 5%, #e601c000 15%),
       radial-gradient(circle at 60% 60%, #e9019a 10%, #e9019a00 20%),
       radial-gradient(circle at 40% 60%, #f40468 10%, #f4046800 20%),
       repeating-conic-gradient(from 236.84deg at 50% 50%, #07bccc 0%, #e601c0 calc(25%/5), #e9019a calc(50%/5), #f40468 calc(75%/5), #07bccc calc(100%/5))`;

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

// ── Subtitle: TextScramble entry + weight-on-hover ────────────────────────────
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

function SubtitleScramble({ text }: { text: string }) {
  const [displayChars, setDisplayChars] = useState<string[]>(() => text.split('').map(() =>
    SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)]
  ));

  useEffect(() => {
    const chars = text.split('');
    const total = chars.length;
    const duration = 0.84;
    const speed = 0.038;
    const steps = Math.ceil(duration / speed);
    let step = 0;
    const interval = setInterval(() => {
      const progress = step / steps;
      setDisplayChars(chars.map((c, i) => {
        if (c === ' ') return ' ';
        if (progress * total > i) return c;
        return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
      }));
      step++;
      if (step > steps) { clearInterval(interval); setDisplayChars(chars); }
    }, speed * 1000);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="flex flex-wrap justify-center cursor-default">
      {displayChars.map((char, i) => (
        <motion.span
          key={i}
          style={{ display: 'inline-block', fontWeight: 300 }}
          whileHover={{ fontWeight: 700, transition: { duration: 0.18, ease: [0.22, 1, 0.36, 1] } }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
}

// ── BubbleText: per-character wave/glow reaction on hover ─────────────────────
function BubbleText({ text, className = "" }: { text: string; className?: string }) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <span
      className={`inline-flex flex-wrap justify-center cursor-default ${className}`}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      {text.split("").map((char, idx) => {
        const distance = hoveredIndex !== null ? Math.abs(hoveredIndex - idx) : null;

        let style: React.CSSProperties = {
          display: "inline-block",
          transition: "all 0.25s ease",
          fontWeight: 900,
          color: "rgba(255,255,255,0.9)",
          letterSpacing: "0.5em",
        };

        if (distance === 0) {
          style = {
            ...style,
            color: "#ffffff",
            transform: "translateY(-3px) scale(1.15)",
            textShadow: "0 0 12px #e601c0, 0 0 24px #07bccc, 0 0 4px #fff",
          };
        } else if (distance === 1) {
          style = {
            ...style,
            color: "rgba(255,255,255,0.95)",
            transform: "translateY(-1.5px) scale(1.07)",
            textShadow: "0 0 8px #cf30aa88",
          };
        } else if (distance === 2) {
          style = {
            ...style,
            color: "rgba(255,255,255,0.85)",
            transform: "translateY(-0.5px) scale(1.02)",
          };
        }

        return (
          <span key={idx} style={style} onMouseEnter={() => setHoveredIndex(idx)}>
            {char === " " ? "\u00A0" : char}
          </span>
        );
      })}
    </span>
  );
}

// ── ReactiveBounceArrow: arrow that tilts toward mouse proximity ──────────────
function ReactiveBounceArrow() {
  const arrowRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [proximity, setProximity] = useState(0); // 0 = far, 1 = close

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = arrowRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    const maxDist = 120;
    if (dist < maxDist) {
      const factor = (1 - dist / maxDist) * 14;
      setTilt({ x: (dy / dist) * factor, y: -(dx / dist) * factor });
      setProximity(1 - dist / maxDist);
    } else {
      setTilt({ x: 0, y: 0 });
      setProximity(0);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  const strokeOpacity = 0.8 + proximity * 0.2;

  return (
    <div ref={arrowRef} style={{ display: "inline-block" }}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-bounce-down"
        style={{
          stroke: `rgba(255,255,255,${strokeOpacity})`,
          transform: `rotate3d(1, 0, 0, ${tilt.x}deg) rotate3d(0, 1, 0, ${tilt.y}deg)`,
          transition: "stroke 0.15s ease, transform 0.12s ease",
          display: "block",
        }}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

// ── Title glow constants ──────────────────────────────────────────────────────
const GLOW_SHADOW = `4px 4px 0px #07bccc, 8px 8px 0px #e601c0, 12px 12px 0px #e9019a, 15px 15px 0px #f40468, 20px 20px 6px #f40468`;
const NO_SHADOW   = `0px 0px 0px transparent, 0px 0px 0px transparent, 0px 0px 0px transparent, 0px 0px 0px transparent, 0px 0px 0px transparent`;

function GlowChar({ char, motionProps, autoGlow }: { char: string; motionProps: any; autoGlow: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const showGlow = isHovered || autoGlow;
  return (
    <motion.span {...motionProps} style={{ ...motionProps.style, display: 'inline-block' }} className="cursor-default">
      <span
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'inline-block',
          textShadow: showGlow ? GLOW_SHADOW : NO_SHADOW,
          fontWeight: isHovered ? 900 : 800,
          transform: isHovered ? 'scale(1.04)' : 'scale(1)',
          transition: showGlow
            ? 'text-shadow 0.12s ease-out 0s, transform 0.15s ease, font-weight 0.15s ease'
            : 'text-shadow 2s ease-out 1.2s, transform 0.25s ease, font-weight 0.25s ease',
        }}
      >
        {char === " " ? "\u00A0" : char}
      </span>
    </motion.span>
  );
}

interface HeroProps {
  onBookingClick: () => void;
  onAskAIClick: (initialMessage?: string) => void;
  language: Language;
  isChatOpen?: boolean;
}

export default function Hero({ onBookingClick, onAskAIClick, language, isChatOpen = false }: HeroProps) {
  const t = translations[language];
  const heroInputRef = useRef<HTMLInputElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const scrollVideoRootRef = useRef<HTMLDivElement>(null);
  const scrollVideoContainerRef = useRef<HTMLDivElement>(null);
  const playBtnRef = useRef<HTMLButtonElement>(null);
  const playBtnWrapRef = useRef<HTMLDivElement>(null);
  const btnTargetOffset = useRef({ x: 0, y: 0 });
  const btnCurrentOffset = useRef({ x: 0, y: 0 });
  const btnRafRef = useRef<number>(0);
  const isOverVideo = useRef(false);
  const lcCanvasRef = useRef<HTMLCanvasElement>(null);
  const lcRafRef = useRef<number>(0);
  const lcGlRef = useRef<WebGL2RenderingContext | null>(null);
  const lcProgRef = useRef<WebGLProgram | null>(null);
  const lcUniformsRef = useRef<Record<string, WebGLUniformLocation | null>>({});

  const [query, setQuery] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [scrollOpacity, setScrollOpacity] = useState(0);
  const [scrollScale, setScrollScale] = useState(0.85);
  const [isPlayingIntro, setIsPlayingIntro] = useState(false);
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
  const [charGlowProgress, setCharGlowProgress] = useState<number>(-1);

  const titleLine1 = t.heroTitle1;
  const titleLine2 = t.heroTitle2;
  const VIDEO_ID = "Py1ClI35v_k";
  const totalChars = titleLine1.length + titleLine2.length;

  const iframeSrc = isPlayingIntro
    ? `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=0&controls=1&playsinline=1&rel=0`
    : `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&mute=1&loop=1&playlist=${VIDEO_ID}&controls=0&playsinline=1&rel=0`;

  // ─── Magnetic button RAF loop ─────────────────────────────────────────────
  useEffect(() => {
    const LERP = 0.07;
    const tick = () => {
      btnRafRef.current = requestAnimationFrame(tick);
      const cur = btnCurrentOffset.current;
      const tgt = btnTargetOffset.current;
      const nx = cur.x + (tgt.x - cur.x) * LERP;
      const ny = cur.y + (tgt.y - cur.y) * LERP;
      btnCurrentOffset.current = { x: nx, y: ny };
      if (playBtnWrapRef.current) {
        playBtnWrapRef.current.style.transform = `translate(${nx}px, ${ny}px)`;
      }
    };
    btnRafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(btnRafRef.current);
  }, []);

  const handleVideoMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = scrollVideoContainerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const MAX_OFFSET = 28;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const nx = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, (dx / (rect.width  * 0.5)) * MAX_OFFSET));
    const ny = Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, (dy / (rect.height * 0.5)) * MAX_OFFSET));
    btnTargetOffset.current = { x: nx, y: ny };
  }, []);

  const handleVideoMouseLeave = useCallback(() => {
    btnTargetOffset.current = { x: 0, y: 0 };
  }, []);

  // ─── Liquid Crystal WebGL2 Shader ────────────────────────────────────────
  useEffect(() => {
    const canvas = lcCanvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl2');
    if (!gl) return;
    lcGlRef.current = gl;

    const vsSrc = `#version 300 es
      in vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }`;

    const fsSrc = `#version 300 es
      precision highp float;
      uniform float u_time;
      uniform vec2  u_resolution;
      uniform float u_speed;
      out vec4 fragColor;

      float sdCircle(vec2 p, float r) { return length(p) - r; }

      float opSmoothUnion(float d1, float d2, float k) {
        float h = clamp(0.5 + 0.5*(d2-d1)/k, 0.0, 1.0);
        return mix(d2, d1, h) - k*h*(1.0-h);
      }

      float mapScene(vec2 uv, float t) {
        vec2 p1 = vec2(cos(t*0.50),       sin(t*0.50))       * 0.30;
        vec2 p2 = vec2(cos(t*0.70 + 2.1), sin(t*0.60 + 2.1)) * 0.42;
        vec2 p3 = vec2(cos(t*0.40 + 4.2), sin(t*0.80 + 4.2)) * 0.36;
        float b1 = sdCircle(uv - p1, 0.22);
        float b2 = sdCircle(uv - p2, 0.17);
        float b3 = sdCircle(uv - p3, 0.25);
        float u12 = opSmoothUnion(b1, b2, 0.22);
        return opSmoothUnion(u12, b3, 0.28);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
        float t  = u_time * u_speed;
        float d  = mapScene(uv, t);
        vec3 base = vec3(0.008 / max(abs(d), 0.001));
        vec3 palette = 0.5 + 0.5 * cos(u_time * 0.3 + uv.xyx * 1.5 + vec3(0.0, 1.0, 2.0));
        vec3 col = clamp(base * palette, 0.0, 1.0);
        col *= 0.7;
        fragColor = vec4(col, 1.0);
      }`;

    const compile = (type: GLenum, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error('LC shader error:', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, vsSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fsSrc);
    if (!vs || !fs) return;

    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs); gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('LC link error:', gl.getProgramInfoLog(prog));
      return;
    }
    lcProgRef.current = prog;

    const quad = new Float32Array([-1,1, -1,-1, 1,1, 1,-1]);
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    lcUniformsRef.current = {
      time:  gl.getUniformLocation(prog, 'u_time'),
      res:   gl.getUniformLocation(prog, 'u_resolution'),
      speed: gl.getUniformLocation(prog, 'u_speed'),
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width  = canvas.clientWidth  * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const u = lcUniformsRef.current;
    const animate = (ms: number) => {
      lcRafRef.current = requestAnimationFrame(animate);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(prog);
      gl.uniform1f(u.time!,   ms * 0.001);
      gl.uniform2f(u.res!,    canvas.width, canvas.height);
      gl.uniform1f(u.speed!,  0.5);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    lcRafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(lcRafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  useEffect(() => {
    let t: any;
    const onScroll = () => {
      const p = Math.min(Math.max((window.scrollY - 50) / 300, 0), 1);
      setScrollOpacity(p); setScrollScale(0.85 + p * 0.15);
      clearTimeout(t);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ─── Scroll-Expanding Video ─────────────────────────────────────────────────
  useEffect(() => {
    const root = scrollVideoRootRef.current;
    const container = scrollVideoContainerRef.current;
    if (!root || !container) return;

    const isMobile = () => window.innerWidth < 768;

    const setup = () => {
      const mobile = isMobile();
      root.style.height = mobile ? '130vh' : '224vh';
    };

    const onScroll = () => {
      const mobile = isMobile();
      const rect = root.getBoundingClientRect();
      const rootH = root.offsetHeight;
      const scrolled = -rect.top;
      const total = rootH - window.innerHeight;
      const p = Math.max(0, Math.min(1, scrolled / total));
      const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      const startW = mobile ? 260 : 380;
      const startH = mobile ? 200 : 380;
      const endW = window.innerWidth * (mobile ? 0.94 : 0.92);
      const endH = mobile
        ? Math.min(window.innerWidth * 0.94 * 0.6, window.innerHeight * 0.55)
        : window.innerHeight * 0.88;
      const w = startW + (endW - startW) * e;
      const h = startH + (endH - startH) * e;
      container.style.width  = `${w}px`;
      container.style.height = `${h}px`;
      container.style.borderRadius = `24px`;
    };

    setup();
    window.addEventListener('resize', setup, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('resize', setup);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoContainerRef.current) return;
    const rect = videoContainerRef.current.getBoundingClientRect();
    setTargetPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  useEffect(() => {
    if (!isHoveringVideo || isPlayingIntro) return;
    let af: number;
    const follow = () => {
      setCurrentPos(prev => ({ x: prev.x + (targetPos.x - prev.x) * 0.12, y: prev.y + (targetPos.y - prev.y) * 0.12 }));
      af = requestAnimationFrame(follow);
    };
    af = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(af);
  }, [targetPos, isHoveringVideo, isPlayingIntro]);

  // ─── TIMING: Subtitle waits for glow sweep to finish ─────────────────────
  useEffect(() => {
    if (!titleDone) return;
    const sweepDelay = 200;
    const charIntervalMs = 30;
    const holdMs = 800;
    const totalSweepTime = sweepDelay + totalChars * charIntervalMs + holdMs;

    const tSubtitle = setTimeout(() => {
      setShowSubtitle(true);
      const t2 = setTimeout(() => {
        setShowCTA(true);
        const t3 = setTimeout(() => {
          setShowInput(true);
          // Only auto-focus if the AI chat is NOT already open
          const t4 = setTimeout(() => {
            if (!isChatOpen) {
              heroInputRef.current?.focus({ preventScroll: true });
            }
          }, 960);
          return () => clearTimeout(t4);
        }, 900);
        return () => clearTimeout(t3);
      }, 1200);
      return () => clearTimeout(t2);
    }, totalSweepTime);

    return () => clearTimeout(tSubtitle);
  }, [titleDone, totalChars, isChatOpen]);

  // ─── Glow sweep ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!titleDone) return;
    const sweepDelay = 200;
    const charIntervalMs = 30;
    const holdMs = 800;

    const startTimer = setTimeout(() => {
      let idx = 0;
      const interval = setInterval(() => {
        setCharGlowProgress(idx);
        idx++;
        if (idx >= totalChars) {
          clearInterval(interval);
          setTimeout(() => setCharGlowProgress(-1), holdMs);
        }
      }, charIntervalMs);
      return () => clearInterval(interval);
    }, sweepDelay);

    return () => clearTimeout(startTimer);
  }, [titleDone, totalChars]);

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
    <>
      <section
        className="relative min-h-screen flex flex-col items-center bg-black text-white pt-28 pb-12"
        style={{ fontFamily: 'Georgia, serif', overflowX: 'clip' }}
      >
        <style>{`
          @keyframes bounce-down { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(8px); } }
          @keyframes spin { from { transform: translate(-50%,-50%) rotate(90deg); } to { transform: translate(-50%,-50%) rotate(450deg); } }
          .before\\:animate-spin::before { animation: spin 3s linear infinite; }
          .animate-bounce-down { animation: bounce-down 1.2s ease-in-out infinite; }

          @keyframes play-btn-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.25); }
            50% { box-shadow: 0 0 0 12px rgba(255,255,255,0); }
          }
          .play-btn-pulse { animation: play-btn-pulse 2.4s ease-in-out infinite; }

          .video-glow-wrap {
            position: absolute; inset: 0; border-radius: inherit;
            pointer-events: none; z-index: 4; overflow: hidden;
          }
          .video-glow-l1 { position: absolute; inset: 0; border-radius: inherit; overflow: hidden; }
          .video-glow-l1::before {
            content: ""; position: absolute; z-index: -2; width: 999px; height: 999px;
            background: conic-gradient(#000, #402fb5 5%, #000 38%, #000 50%, #cf30aa 60%, #000 87%);
            top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(0deg);
            animation: video-glow-spin1 4s linear infinite; background-repeat: no-repeat;
          }
          .video-glow-l1::after {
            content: ""; position: absolute; inset: 3px;
            border-radius: inherit; background: transparent; z-index: -1;
          }
          .video-glow-l2 { position: absolute; inset: 0; border-radius: inherit; overflow: hidden; }
          .video-glow-l3 {
            position: absolute; inset: 0; border-radius: inherit; overflow: hidden; filter: blur(1px);
          }
          .video-glow-l3::before {
            content: ""; position: absolute; z-index: -2; width: 600px; height: 600px;
            background: conic-gradient(rgba(0,0,0,0) 0%, #a099d8, rgba(0,0,0,0) 8%, rgba(0,0,0,0) 50%, #dfa2da, rgba(0,0,0,0) 58%);
            filter: brightness(1.4); top: 50%; left: 50%;
            transform: translate(-50%, -50%) rotate(83deg);
            animation: video-glow-spin3 4s linear infinite; background-repeat: no-repeat;
          }
          .video-glow-l1, .video-glow-l2, .video-glow-l3 {
            mask-image: linear-gradient(#fff, #fff), linear-gradient(#fff, #fff);
            -webkit-mask-image: linear-gradient(#fff, #fff), linear-gradient(#fff, #fff);
            mask-clip: border-box, content-box; -webkit-mask-clip: border-box, content-box;
            mask-composite: exclude; -webkit-mask-composite: destination-out;
            border: 3px solid transparent;
          }
          @keyframes video-glow-spin1 {
            from { transform: translate(-50%, -50%) rotate(90deg); }
            to   { transform: translate(-50%, -50%) rotate(450deg); }
          }
          @keyframes video-glow-spin3 {
            from { transform: translate(-50%, -50%) rotate(83deg); }
            to   { transform: translate(-50%, -50%) rotate(443deg); }
          }
          .video-glow-bloom {
            position: absolute; inset: 0; border-radius: inherit;
            pointer-events: none; z-index: 3; border: 0px solid transparent;
            box-shadow: 0 0 10px 2px rgba(64,47,181,0.6), 0 0 20px 3px rgba(207,48,170,0.4), 0 0 4px 1px rgba(160,153,216,0.7);
            animation: video-bloom-pulse 4s linear infinite;
          }
          @keyframes video-bloom-pulse { 0%,100% { opacity: 0.85; } 50% { opacity: 1; } }
        `}</style>

        {/* Liquid Crystal BG */}
        <canvas ref={lcCanvasRef} className="fixed inset-0 z-0 pointer-events-none w-screen h-screen opacity-90" style={{ width: '100vw', height: '100vh' }} />
        <div className="fixed inset-0 z-[1] pointer-events-none bg-black/40" />

        <div className="relative z-10 flex flex-col items-center text-center px-6 w-full max-w-7xl h-full">

          {/* ── Titles ── */}
          <div className="relative mb-8 w-full mx-auto flex flex-col items-center gap-2">
            {[titleLine1, titleLine2].map((line, lineIdx) => {
              const baseDelay = lineIdx === 0 ? 0 : titleLine1.length * 0.046;
              return (
                <h1
                  key={lineIdx}
                  className="flex whitespace-nowrap justify-center font-black text-white drop-shadow-2xl w-full"
                  style={{
                    fontFamily: '"Montserrat", sans-serif',
                    letterSpacing: '0.03em',
                    fontSize: 'clamp(2rem, 8.5vw, 5.5rem)',
                  }}
                >
                  {line.split("").map((char, i) => {
                    const globalIdx = lineIdx === 0 ? i : titleLine1.length + i;
                    const autoGlow = charGlowProgress >= globalIdx && charGlowProgress >= 0;
                    return (
                      <GlowChar
                        key={`l${lineIdx}-${i}`}
                        char={char}
                        autoGlow={autoGlow}
                        motionProps={{
                          initial: { opacity: 0, y: 24, filter: 'blur(8px)' },
                          animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
                          transition: {
                            duration: 0.576,
                            delay: 0.24 + baseDelay + i * 0.035,
                            ease: [0.22, 1, 0.36, 1],
                          },
                          onAnimationComplete: lineIdx === 1 && i === line.length - 1
                            ? () => setTitleDone(true)
                            : undefined,
                        }}
                      />
                    );
                  })}
                </h1>
              );
            })}
          </div>

          {/* ── Subtitle ── */}
          <div className="relative inline-block mb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={showSubtitle ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.30 }}
              className="text-base md:text-2xl text-white/80 font-light italic drop-shadow-lg"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {showSubtitle && <SubtitleScramble text={t.heroSubtitle} />}
            </motion.div>
          </div>

          {/* ── CTA + Input ── */}
          <div className="flex flex-col items-center gap-12 w-full max-w-md mt-4">

            {/* CTA Button */}
            <div className={`transition-all duration-[840ms] ${showCTA ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-90 pointer-events-none'}`}>
              <button
                onClick={onBookingClick}
                className="group relative border border-white/20 bg-white/5 hover:bg-white/0 text-white mx-auto text-center rounded-full px-10 py-4 text-base font-medium flex items-center gap-2 hover:scale-105 transition-all duration-300"
              >
                <span className="absolute h-px opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out inset-x-0 top-0 bg-gradient-to-r w-3/4 mx-auto from-transparent via-[#e601c0] to-transparent" />
                <span className="whitespace-nowrap">{t.startJourney}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                <span className="absolute group-hover:opacity-60 opacity-20 transition-all duration-500 ease-in-out inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent via-[#07bccc] to-transparent" />
              </button>
            </div>

            {/* AI Input */}
            <div className={`w-full space-y-3 transition-all duration-[1200ms] ${showInput ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12 pointer-events-none'}`}>
              <div className="flex flex-col items-center gap-1">
                {/* BubbleText: reactive per-character hover on "ASK OUR AI AGENT" */}
                <h3 className="text-[13px] md:text-[15px] uppercase font-black text-white/90">
                  {isSent ? (
                    <span style={{ letterSpacing: "0.5em" }}>{t.openingChat}</span>
                  ) : (
                    <BubbleText text={t.askAiAgent} />
                  )}
                </h3>
                {/* Reactive arrow: tilts toward cursor, glows magenta/cyan on proximity */}
                {!isSent && <ReactiveBounceArrow />}
              </div>

              {/* Glowing border form */}
              <form onSubmit={handleAISubmit} className="relative flex items-center justify-center group w-full">
                {/* Glow layer 1 */}
                <div className={`absolute z-[-1] overflow-hidden rounded-xl blur-[3px] pointer-events-none
                                transition-all duration-[2000ms]
                                before:absolute before:content-[''] before:z-[-2] before:w-[999px] before:h-[999px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-60
                                before:bg-[conic-gradient(#000,#402fb5_5%,#000_38%,#000_50%,#cf30aa_60%,#000_87%)] before:transition-all before:duration-[2000ms]
                                group-hover:before:rotate-[-120deg] group-focus-within:before:rotate-[420deg] group-focus-within:before:duration-[4000ms]
                                ${isSent ? 'before:bg-[conic-gradient(#000,#00c853_5%,#000_38%,#000_50%,#00e676_60%,#000_87%)]' : ''}`}
                     style={{ height: 'calc(100% + 4px)', width: 'calc(100% + 4px)', top: '-2px', left: '-2px' }} />

                {/* Glow layer 2 */}
                <div className="absolute z-[-1] overflow-hidden rounded-xl blur-[3px] pointer-events-none
                                before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[82deg]
                                before:bg-[conic-gradient(rgba(0,0,0,0),#18116a,rgba(0,0,0,0)_10%,rgba(0,0,0,0)_50%,#6e1b60,rgba(0,0,0,0)_60%)] before:transition-all before:duration-[2000ms]
                                group-hover:before:rotate-[-98deg] group-focus-within:before:rotate-[442deg] group-focus-within:before:duration-[4000ms]"
                     style={{ height: 'calc(100% + 2px)', width: 'calc(100% + 2px)', top: '-1px', left: '-1px' }} />

                {/* Glow layer 3 */}
                <div className="absolute z-[-1] overflow-hidden rounded-xl blur-[2px] pointer-events-none
                                before:absolute before:content-[''] before:z-[-2] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-[83deg]
                                before:bg-[conic-gradient(rgba(0,0,0,0)_0%,#a099d8,rgba(0,0,0,0)_8%,rgba(0,0,0,0)_50%,#dfa2da,rgba(0,0,0,0)_58%)] before:brightness-[1.4]
                                before:transition-all before:duration-[2000ms] group-hover:before:rotate-[-97deg] group-focus-within:before:rotate-[443deg] group-focus-within:before:duration-[4000ms]"
                     style={{ height: 'calc(100% - 1px)', width: 'calc(100% - 2px)', top: '0px', left: '1px' }} />

                {/* Inner dark fill */}
                <div className="relative w-full flex items-center">
                  <div className="pointer-events-none absolute w-[30px] h-[20px] bg-[#cf30aa] top-[10px] left-[5px] blur-2xl opacity-80 transition-all duration-[2000ms] group-hover:opacity-0 z-10" />

                  {/* Search icon */}
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" viewBox="0 0 24 24" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" height="22" fill="none">
                      <circle stroke="url(#hsearch)" r="8" cy="11" cx="11" />
                      <line stroke="url(#hsearchl)" y2="16.65" y1="22" x2="16.65" x1="22" />
                      <defs>
                        <linearGradient gradientTransform="rotate(50)" id="hsearch">
                          <stop stopColor="#f8e7f8" offset="0%" /><stop stopColor="#b6a9b7" offset="50%" />
                        </linearGradient>
                        <linearGradient id="hsearchl">
                          <stop stopColor="#b6a9b7" offset="0%" /><stop stopColor="#837484" offset="50%" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Input */}
                  <input
                    ref={heroInputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={isSent ? "" : placeholder}
                    disabled={isSent}
                    className="w-full bg-[#010201] h-[56px] rounded-xl text-white pl-[52px] pr-[60px] text-base focus:outline-none placeholder-gray-400 transition-colors duration-300"
                    style={{ fontFamily: 'Georgia, serif' }}
                  />

                  {/* Send button */}
                  <div className="absolute right-[7px] top-1/2 -translate-y-1/2 flex items-center justify-center z-20">
                    {query.trim() && !isSent && (
                      <div className="absolute h-[42px] w-[42px] overflow-hidden rounded-lg pointer-events-none
                                      before:absolute before:content-[''] before:w-[600px] before:h-[600px] before:bg-no-repeat before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:rotate-90
                                      before:bg-[conic-gradient(rgba(0,0,0,0),#3d3a4f,rgba(0,0,0,0)_50%,rgba(0,0,0,0)_50%,#3d3a4f,rgba(0,0,0,0)_100%)]
                                      before:brightness-[1.35] before:animate-spin" />
                    )}
                    <button
                      type="submit"
                      disabled={!query.trim() || isSent}
                      className={`relative flex items-center justify-center h-[42px] w-[42px] rounded-lg
                                  bg-gradient-to-b from-[#161329] via-black to-[#1d1b4b] border border-white/10
                                  transition-all duration-300 z-10
                                  ${query.trim() && !isSent ? 'opacity-100 hover:brightness-125' : 'opacity-30 cursor-default'}`}
                    >
                      <Send className={`w-4 h-4 text-white/50 transition-all duration-300 ${query.trim() && !isSent ? 'text-white/90 translate-x-[1px]' : ''}`} />
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* ── Scroll-Expanding Video ── */}
          <div ref={scrollVideoRootRef} className="w-full mt-32" style={{ position: 'relative' }}>
            <div style={{ position: 'sticky', top: 0, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                ref={scrollVideoContainerRef}
                onClick={() => setIsPlayingIntro(p => !p)}
                onMouseMove={handleVideoMouseMove}
                onMouseLeave={handleVideoMouseLeave}
                style={{
                  position: 'relative',
                  width: 260,
                  height: 200,
                  borderRadius: 24,
                  overflow: 'visible',
                  background: 'transparent',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
              >
                <div className="video-glow-bloom" style={{ borderRadius: 'inherit' }} />
                <div className="video-glow-wrap" style={{ borderRadius: 'inherit' }}>
                  <div className="video-glow-l1" style={{ borderRadius: 'inherit' }} />
                  <div className="video-glow-l2" style={{ borderRadius: 'inherit' }} />
                  <div className="video-glow-l3" style={{ borderRadius: 'inherit' }} />
                </div>

                <div style={{
                  position: 'absolute', inset: 0, borderRadius: 'inherit',
                  overflow: 'hidden', background: '#000',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 1,
                }}>
                  <iframe
                    key={iframeSrc}
                    src={iframeSrc}
                    style={{ position: 'absolute', inset: '-5%', width: '110%', height: '110%', border: 'none', pointerEvents: 'none' }}
                    allow="autoplay; encrypted-media"
                  />

                  {!isPlayingIntro && (
                    <div style={{
                      position: 'absolute', inset: 0, zIndex: 3,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      pointerEvents: 'none',
                    }}>
                      <div ref={playBtnWrapRef} style={{ pointerEvents: 'auto', willChange: 'transform' }}>
                        <button
                          ref={playBtnRef}
                          onClick={(e) => { e.stopPropagation(); setIsPlayingIntro(true); }}
                          className="play-btn-pulse"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.55rem',
                            padding: '0.8rem 1.8rem', borderRadius: 999,
                            background: 'rgba(255,255,255,0.92)', color: '#000',
                            fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.07em',
                            textTransform: 'uppercase', cursor: 'pointer', border: 'none',
                            fontFamily: '"Montserrat", sans-serif', backdropFilter: 'blur(8px)',
                            transition: 'background 0.2s ease, transform 0.2s ease',
                            userSelect: 'none',
                          }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,1)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.92)')}
                        >
                          <Play style={{ width: 13, height: 13, fill: '#000' }} />
                          {t.playIntro}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}
