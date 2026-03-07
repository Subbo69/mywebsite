import { useState, useEffect, useRef } from 'react';
import { 
  Rocket, Wrench, TrendingUp, Lightbulb, 
  Clock, Zap, Shield, Cpu, 
  BarChart, Users, Link, CheckCircle, 
  X, Sparkles, Filter, Bot, GitMerge,
  MessageCircle, Database, RefreshCw, Target, DollarSign, Activity,
  LayoutGrid, HelpCircle, LineChart, ArrowRight
} from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { AnimatePresence, motion, Variants } from 'framer-motion';

interface ServicesProps {
  onAskAIClick: (context: string) => void;
  language: Language;
}

interface ServiceNode {
  id: number;
  icon: any;
  title: string;
  description: string;
  category: string;
  filterGroup: 'agents' | 'faq' | 'roi';
  context: string;
  impact?: string;
}

type FilterKey = 'agents' | 'faq' | 'roi';

const filterIcons: Record<FilterKey, any> = {
  agents: Bot, faq: HelpCircle, roi: LineChart,
};

const glowHsl: Record<string, string> = {
  cyan:   '190 100% 60%',
  purple: '270 100% 65%',
  green:  '145  90% 55%',
  amber:  ' 38 100% 55%',
  white:  '  0   0% 88%',
};

type GlowColor = keyof typeof glowHsl;

const GLOW_CSS = `
  @property --angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }
  @keyframes borderRotate { to { --angle: 360deg; } }
  .gc-wrap { isolation: isolate; --lx: -9999px; --ly: -9999px; --inside: 0; }
  .gc-border { position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 1; border: 1.2px solid rgba(255,255,255,0.22); }
  .gc-border::after { content: ''; position: absolute; inset: -1.2px; border-radius: inherit; padding: 1.2px; background: radial-gradient(520px 520px at var(--lx) var(--ly), hsl(var(--gc-color) / calc(var(--inside) * 1)), transparent 60%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; }
  .gc-idle-border { position: absolute; inset: -1.2px; border-radius: inherit; padding: 1.2px; --angle: 0deg; background: conic-gradient(from var(--angle), transparent 0%, hsl(var(--gc-color) / 0.06) 8%, hsl(var(--gc-color) / 0.55) 14%, hsl(var(--gc-color) / 0.9) 17%, hsl(var(--gc-color) / 0.55) 20%, hsl(var(--gc-color) / 0.06) 27%, transparent 38%); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; z-index: 2; animation: borderRotate var(--idle-duration, 6s) linear infinite var(--idle-delay, 0s); opacity: calc(1 - var(--inside)); transition: opacity 0.5s ease; }
  .gc-fill { position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 0; background: radial-gradient(420px 420px at var(--lx) var(--ly), hsl(var(--gc-color) / calc(var(--inside) * 0.13)), transparent 70%); }
  .gc-content { position: relative; z-index: 3; height: 100%; display: flex; flex-direction: column; }
`;

const GLOW_STYLE_ID = 'gc-shared-styles';
function injectGlowStyle() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(GLOW_STYLE_ID)) return;
  const el = document.createElement('style');
  el.id = GLOW_STYLE_ID;
  el.textContent = GLOW_CSS;
  document.head.appendChild(el);
}

function GlowCard({ children, className = '', glowColor = 'cyan', cardIndex = 0, onClick }: { children: React.ReactNode; className?: string; glowColor?: GlowColor; cardIndex?: number; onClick?: () => void; }) {
  const ref = useRef<HTMLDivElement>(null);
  const color = glowHsl[glowColor] ?? glowHsl.cyan;
  useEffect(() => {
    injectGlowStyle();
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--gc-color', color);
    el.style.setProperty('--idle-delay', `${-(cardIndex * 0.35) % 8}s`);
    el.style.setProperty('--idle-duration', `${5 + (cardIndex % 5) * 0.7}s`);
    const onMove = (e: PointerEvent) => { const r = el.getBoundingClientRect(); el.style.setProperty('--lx', `${(e.clientX - r.left).toFixed(1)}px`); el.style.setProperty('--ly', `${(e.clientY - r.top).toFixed(1)}px`); el.style.setProperty('--inside', '1'); };
    const onLeave = () => el.style.setProperty('--inside', '0');
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => { el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave); };
  }, [color, cardIndex]);
  return (
    <div ref={ref} className={`gc-wrap rounded-2xl relative cursor-pointer ${className}`} style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }} onClick={onClick}>
      <div className="gc-fill" /><div className="gc-border" /><div className="gc-idle-border" /><div className="gc-content">{children}</div>
    </div>
  );
}

const glowPalette: GlowColor[] = ['cyan', 'purple', 'green', 'amber', 'white'];

function GlowFilterButton({ children, isActive, onClick }: { children: React.ReactNode; isActive: boolean; onClick: () => void; }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--gc-color', glowHsl.white);
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--lx', `${(e.clientX - r.left).toFixed(1)}px`);
      el.style.setProperty('--ly', `${(e.clientY - r.top).toFixed(1)}px`);
      el.style.setProperty('--inside', '1');
    };
    const onLeave = () => el.style.setProperty('--inside', '0');
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => { el.removeEventListener('pointermove', onMove); el.removeEventListener('pointerleave', onLeave); };
  }, []);
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`gc-wrap relative flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg transition-all duration-150 ${isActive ? 'bg-white text-black border-transparent' : 'bg-white/8 text-white/70 hover:text-white'}`}
      style={{ isolation: 'isolate', '--lx': '-9999px', '--ly': '-9999px', '--inside': '0' } as React.CSSProperties}
    >
      {!isActive && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-lg z-[1]" style={{ border: '1.2px solid rgba(255,255,255,0.22)' }} />
      )}
      {!isActive && (
        <span aria-hidden="true" className="pointer-events-none absolute rounded-lg z-[2]" style={{ inset: '-1.2px', padding: '1.2px', background: 'radial-gradient(260px 260px at var(--lx) var(--ly), hsl(var(--gc-color) / calc(var(--inside) * 1)), transparent 60%)', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
      )}
      {isActive && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-lg z-[1]" style={{ background: 'white' }} />
      )}
      <span className="relative z-[3] flex items-center gap-1">{children}</span>
    </button>
  );
}

function AnimatedTitle({ text, animate }: { text: string; animate: boolean }) {
  const letters = Array.from(text);
  const delay = 0.04;

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: delay, delayChildren: 0 },
    },
  };

  const child: Variants = {
    hidden: { opacity: 0, y: 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 12, stiffness: 220 },
    },
  };

  const lineVariants: Variants = {
    hidden: { width: '0%', left: '50%' },
    visible: {
      width: '100%',
      left: '0%',
      transition: { delay: letters.length * delay + 0.1, duration: 0.7, ease: 'easeOut' },
    },
  };

  return (
    <div className="relative inline-block">
      <motion.div
        style={{ display: 'flex', overflow: 'hidden', flexWrap: 'wrap' }}
        variants={container}
        initial="hidden"
        animate={animate ? 'visible' : 'hidden'}
        className="text-[33px] md:text-[55px] font-black text-white tracking-tighter uppercase"
      >
        {letters.map((letter, i) => (
          <motion.span key={i} variants={child}>
            {letter === ' ' ? '\u00A0' : letter}
          </motion.span>
        ))}
      </motion.div>

      <motion.div
        variants={lineVariants}
        initial="hidden"
        animate={animate ? 'visible' : 'hidden'}
        className="absolute h-1 rounded-full bg-white/50"
        style={{ bottom: '-6px' }}
      />
    </div>
  );
}

function AnimatedSubtitle({ text, animate }: { text: string; animate: boolean }) {
  const letters = Array.from(text);
  const delay = 0.018;

  const container: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: delay, delayChildren: 0.18 },
    },
  };

  const child: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', damping: 14, stiffness: 260 },
    },
  };

  return (
    <motion.div
      style={{ display: 'flex', flexWrap: 'wrap', overflow: 'hidden' }}
      variants={container}
      initial="hidden"
      animate={animate ? 'visible' : 'hidden'}
      className="text-[15px] md:text-[18px] font-bold text-white/65 max-w-2xl"
    >
      {letters.map((letter, i) => (
        <motion.span key={i} variants={child}>
          {letter === ' ' ? '\u00A0' : letter}
        </motion.span>
      ))}
    </motion.div>
  );
}

export const SECTION_BG = 'transparent';

export default function Services({ onAskAIClick, language }: ServicesProps) {
  const t = translations[language];
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('agents');
  const [marqueeVisible, setMarqueeVisible] = useState(false);
  const sectionRef     = useRef<HTMLDivElement>(null);
  const topBorderRef   = useRef<HTMLDivElement>(null);
  const bottomBorderRef = useRef<HTMLDivElement>(null); // ← NEW

  // Shared spring-smoothed cursor tracker for both borders
  useEffect(() => {
    const section = sectionRef.current;
    const topEl   = topBorderRef.current;
    const botEl   = bottomBorderRef.current;
    if (!section) return;

    let targetX = 50;
    let currentX = 50;
    let velocity = 0;
    let rafId = 0;
    let active = false;

    const stiffness = 0.09;
    const damping   = 0.48;

    const tick = () => {
      const force = (targetX - currentX) * stiffness;
      velocity = (velocity + force) * damping;
      currentX += velocity;
      const val = `${currentX.toFixed(3)}%`;
      if (topEl) topEl.style.setProperty('--tbx', val);
      if (botEl) botEl.style.setProperty('--tbx', val);
      if (Math.abs(currentX - targetX) > 0.004 || Math.abs(velocity) > 0.004) {
        rafId = requestAnimationFrame(tick);
      } else {
        currentX = targetX;
        velocity = 0;
        rafId = 0;
      }
    };

    const onMove = (e: PointerEvent) => {
      const r = section.getBoundingClientRect();
      targetX = ((e.clientX - r.left) / r.width) * 100;
      if (!active) {
        if (topEl) topEl.style.setProperty('--tb-opacity', '1');
        if (botEl) botEl.style.setProperty('--tb-opacity', '1');
        active = true;
      }
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    const onLeave = () => {
      if (topEl) topEl.style.setProperty('--tb-opacity', '0');
      if (botEl) botEl.style.setProperty('--tb-opacity', '0');
      active = false;
    };

    section.addEventListener('pointermove', onMove);
    section.addEventListener('pointerleave', onLeave);
    return () => {
      section.removeEventListener('pointermove', onMove);
      section.removeEventListener('pointerleave', onLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setHasAnimated(true);
        observer.disconnect();
      }
    }, { threshold: 0.15 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasAnimated) return;
    const t2 = setTimeout(() => setMarqueeVisible(true), 400);
    return () => clearTimeout(t2);
  }, [hasAnimated]);

  const handleAskAI = (context: string) => { setSelectedNode(null); onAskAIClick?.(context); };

  const titleText    = t.servicesTitle as string;
  const subtitleText = t.servicesSubtitle as string;

  const serviceNodes: ServiceNode[] = [
    { id: 1,  icon: Rocket,        title: t.node2Title,   description: t.node2Desc,   category: t.catGrowth,     filterGroup: 'agents', context: 'lead-generation', impact: t.impactLive },
    { id: 2,  icon: Zap,           title: t.node4Title,   description: t.node4Desc,   category: t.catSupport,    filterGroup: 'agents', context: 'examples' },
    { id: 3,  icon: Bot,           title: t.nodeA1Title,  description: t.nodeA1Desc,  category: t.catAgents,     filterGroup: 'agents', context: 'examples' },
    { id: 4,  icon: MessageCircle, title: t.nodeA2Title,  description: t.nodeA2Desc,  category: t.catAgents,     filterGroup: 'agents', context: 'examples' },
    { id: 5,  icon: Users,         title: t.nodeA3Title,  description: t.nodeA3Desc,  category: t.catOps,        filterGroup: 'agents', context: 'save-time' },
    { id: 6,  icon: RefreshCw,     title: t.nodeA5Title,  description: t.nodeA5Desc,  category: t.catOps,        filterGroup: 'agents', context: 'save-time' },
    { id: 7,  icon: Clock,         title: t.node1Title,   description: t.node1Desc,   category: t.catEfficiency, filterGroup: 'faq',    context: 'save-time',        impact: t.impactTime },
    { id: 8,  icon: Lightbulb,     title: t.node12Title,  description: t.node12Desc,  category: t.catConsulting, filterGroup: 'faq',    context: 'examples' },
    { id: 9,  icon: CheckCircle,   title: t.nodeQ1Title,  description: t.nodeQ1Desc,  category: t.catFaq,        filterGroup: 'faq',    context: 'save-time' },
    { id: 10, icon: Shield,        title: t.nodeQ2Title,  description: t.nodeQ2Desc,  category: t.catFaq,        filterGroup: 'faq',    context: 'custom-solutions' },
    { id: 11, icon: Cpu,           title: t.nodeQ3Title,  description: t.nodeQ3Desc,  category: t.catFaq,        filterGroup: 'faq',    context: 'custom-solutions' },
    { id: 12, icon: Link,          title: t.nodeQ4Title,  description: t.nodeQ4Desc,  category: t.catFaq,        filterGroup: 'faq',    context: 'custom-solutions' },
    { id: 13, icon: BarChart,      title: t.node6Title,   description: t.node6Desc,   category: t.catData,       filterGroup: 'roi',    context: 'examples' },
    { id: 14, icon: DollarSign,    title: t.nodeR1Title,  description: t.nodeR1Desc,  category: t.catRoi,        filterGroup: 'roi',    context: 'save-time',        impact: t.impactTime },
    { id: 15, icon: Activity,      title: t.nodeR2Title,  description: t.nodeR2Desc,  category: t.catRoi,        filterGroup: 'roi',    context: 'examples' },
    { id: 16, icon: Target,        title: t.nodeR3Title,  description: t.nodeR3Desc,  category: t.catRoi,        filterGroup: 'roi',    context: 'lead-generation', impact: t.impactLive },
    { id: 17, icon: TrendingUp,    title: t.nodeR5Title,  description: t.nodeR5Desc,  category: t.catGrowth,     filterGroup: 'roi',    context: 'lead-generation' },
    { id: 18, icon: CheckCircle,   title: t.nodeR6Title,  description: t.nodeR6Desc,  category: t.catEfficiency, filterGroup: 'roi',    context: 'save-time' },
    { id: 19, icon: Wrench,        title: t.node3Title,   description: t.node3Desc,   category: t.catTech,       filterGroup: 'agents', context: 'custom-solutions' },
    { id: 20, icon: GitMerge,      title: t.nodeA4Title,  description: t.nodeA4Desc,  category: t.catTech,       filterGroup: 'agents', context: 'custom-solutions' },
    { id: 21, icon: Database,      title: t.nodeA6Title,  description: t.nodeA6Desc,  category: t.catInfra,      filterGroup: 'agents', context: 'custom-solutions' },
    { id: 22, icon: TrendingUp,    title: t.nodeQ5Title,  description: t.nodeQ5Desc,  category: t.catFaq,        filterGroup: 'faq',    context: 'examples' },
    { id: 23, icon: Lightbulb,     title: t.nodeQ6Title,  description: t.nodeQ6Desc,  category: t.catFaq,        filterGroup: 'faq',    context: 'examples' },
    { id: 24, icon: BarChart,      title: t.nodeR4Title,  description: t.nodeR4Desc,  category: t.catData,       filterGroup: 'roi',    context: 'examples' },
  ];

  const filters: { key: FilterKey; label: string }[] = [
    { key: 'agents', label: t.filterAgents },
    { key: 'faq',    label: t.filterFaq    },
    { key: 'roi',    label: t.filterRoi    },
  ];

  const filtered = serviceNodes.filter(n => n.filterGroup === activeFilter);
  const showMarquee = filtered.length >= 7;
  const infiniteNodes = [...filtered, ...filtered];

  const Card = ({ node, fullWidth = false, index = 0 }: { node: ServiceNode; fullWidth?: boolean; index?: number }) => (
    <GlowCard glowColor={glowPalette[index % glowPalette.length]} cardIndex={index} onClick={() => setSelectedNode(node)} className={`group ${fullWidth ? 'h-full' : 'flex-shrink-0 w-[310px] md:w-[330px] whitespace-normal'}`}>
      <div className="flex flex-col h-full px-4 pt-3 pb-3">
        <h3 className="font-black text-[15px] uppercase tracking-tight leading-tight mb-1.5 text-white">{node.title}</h3>
        <div className="mb-4 relative" style={{ height: '4.5em' }}>
          <p className="text-[13px] text-white/85 font-medium leading-[1.5] overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{node.description}</p>
        </div>
        <div className="flex items-center justify-between gap-2 mt-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/60 leading-none">{node.category}</p>
          <div className="flex items-center gap-2 flex-shrink-0">
            {node.impact && <span className="text-[8px] font-black uppercase px-2 py-1 bg-emerald-500/25 border border-emerald-500/50 text-emerald-300 rounded-md leading-none">{node.impact}</span>}
            <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-white/55 group-hover:text-white transition-colors leading-none">Details <ArrowRight className="w-3 h-3" /></div>
          </div>
        </div>
      </div>
    </GlowCard>
  );

  // Shared border glow layer — reused for top and bottom
  const BorderGlow = ({ position, ref: bRef }: { position: 'top' | 'bottom'; ref: React.RefObject<HTMLDivElement> }) => (
    <div
      ref={bRef}
      className="pointer-events-none absolute left-0 right-0 z-10"
      style={{
        [position]: 0,
        height: '1.2px',
        '--tbx': '50%',
        '--tb-opacity': '0',
      } as React.CSSProperties}
    >
      <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.22)' }} />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(600px 80px at var(--tbx) ${position === 'top' ? '0%' : '100%'}, rgba(255,255,255,0.95) 0%, rgba(180,220,255,0.55) 30%, transparent 70%)`,
          opacity: 'var(--tb-opacity)',
          transition: 'opacity 0.4s ease',
        }}
      />
      <div
        className="absolute left-0 right-0"
        style={{
          [position]: '0px',
          height: '48px',
          background: `radial-gradient(600px 48px at var(--tbx) ${position === 'top' ? '0%' : '100%'}, rgba(160,210,255,0.16) 0%, transparent 70%)`,
          opacity: 'var(--tb-opacity)',
          transition: 'opacity 0.4s ease',
        }}
      />
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className="relative py-12 overflow-hidden"
      style={{
        background: 'rgba(10, 10, 10, 0.45)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marqueeReverse { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        .animate-marquee-reverse { animation: marqueeReverse 60s linear infinite; animation-play-state: paused; }
        .marquee-running .animate-marquee-reverse { animation-play-state: running; }
        .pause-marquee:hover .animate-marquee-reverse { animation-play-state: paused; }
        .mask-fade { mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent); }
        .marquee-reveal { opacity: 0; transform: translateX(-24px); transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.45s, transform 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.45s; }
        .marquee-reveal.visible { opacity: 1; transform: translateX(0); }
      `}} />

      {/* ── Top border glow ── */}
      <div
        ref={topBorderRef}
        className="pointer-events-none absolute top-0 left-0 right-0 z-10"
        style={{ height: '1.2px', '--tbx': '50%', '--tb-opacity': '0' } as React.CSSProperties}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.22)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(600px 80px at var(--tbx) 0%, rgba(255,255,255,0.95) 0%, rgba(180,220,255,0.55) 30%, transparent 70%)', opacity: 'var(--tb-opacity)', transition: 'opacity 0.4s ease' }} />
        <div className="absolute left-0 right-0" style={{ top: '0px', height: '48px', background: 'radial-gradient(600px 48px at var(--tbx) 0%, rgba(160,210,255,0.16) 0%, transparent 70%)', opacity: 'var(--tb-opacity)', transition: 'opacity 0.4s ease' }} />
      </div>

      {/* ── Bottom border glow ── */}
      <div
        ref={bottomBorderRef}
        className="pointer-events-none absolute bottom-0 left-0 right-0 z-10"
        style={{ height: '1.2px', '--tbx': '50%', '--tb-opacity': '0' } as React.CSSProperties}
      >
        <div className="absolute inset-0" style={{ background: 'rgba(255,255,255,0.22)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(600px 80px at var(--tbx) 100%, rgba(255,255,255,0.95) 0%, rgba(180,220,255,0.55) 30%, transparent 70%)', opacity: 'var(--tb-opacity)', transition: 'opacity 0.4s ease' }} />
        <div className="absolute left-0 right-0" style={{ bottom: '0px', height: '48px', background: 'radial-gradient(600px 48px at var(--tbx) 100%, rgba(160,210,255,0.16) 0%, transparent 70%)', opacity: 'var(--tb-opacity)', transition: 'opacity 0.4s ease' }} />
      </div>

      {/* Title & subtitle */}
      <div className="max-w-7xl mx-auto px-6 mb-7">
        <div className="inline-block mb-4 pb-2">
          <AnimatedTitle text={titleText} animate={hasAnimated} />
        </div>
        <AnimatedSubtitle text={subtitleText} animate={hasAnimated} />
      </div>

      {/* Filters */}
      <div className={`max-w-7xl mx-auto px-6 mb-6 marquee-reveal ${marqueeVisible ? 'visible' : ''}`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-white/40 flex-shrink-0" />
          {filters.map(f => {
            const IconComp = filterIcons[f.key];
            const count = serviceNodes.filter(n => n.filterGroup === f.key).length;
            return (
              <GlowFilterButton key={f.key} isActive={activeFilter === f.key} onClick={() => setActiveFilter(f.key)}>
                <IconComp className="w-3 h-3" />{f.label}<span className="opacity-50">({count})</span>
              </GlowFilterButton>
            );
          })}
        </div>
      </div>

      {showMarquee && (
        <div className={`relative pause-marquee mask-fade marquee-reveal ${marqueeVisible ? 'visible marquee-running' : ''}`}>
          <div className="flex overflow-hidden py-4">
            <div className="flex gap-4 animate-marquee-reverse whitespace-nowrap">
              {infiniteNodes.map((node, index) => <Card key={`${node.id}-${index}`} node={node} index={index} />)}
            </div>
          </div>
        </div>
      )}

      {!showMarquee && (
        <div className={`max-w-7xl mx-auto px-6 marquee-reveal ${marqueeVisible ? 'visible' : ''}`}>
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((node, i) => (
                <motion.div key={node.id} layout initial={{ opacity: 0, scale: 0.95, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.2 }}>
                  <Card node={node} fullWidth index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedNode(null)} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 10, transition: { duration: 0.2 } }}
              className="relative w-full max-w-lg border border-white/20 shadow-[0_0_80px_rgba(0,0,0,0.9)] rounded-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto"
              style={{ background: 'rgba(10,10,10,0.75)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
            >
              <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"><X className="w-5 h-5 text-white/70" /></button>
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/15 text-white rounded-xl flex-shrink-0 border border-white/20"><selectedNode.icon className="w-6 h-6" /></div>
                <div>
                  <span className="px-2 py-0.5 border border-white/30 text-white/60 text-[9px] font-black rounded uppercase tracking-tighter mb-1 inline-block">{selectedNode.category}</span>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-tight text-white">{selectedNode.title}</h3>
                </div>
              </div>
              <p className="text-sm md:text-base text-white/75 font-medium leading-relaxed mb-8">{selectedNode.description}</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => handleAskAI(selectedNode.context)} className="flex items-center justify-center gap-2 bg-white text-black px-5 py-3 rounded-xl font-black uppercase text-xs hover:bg-white/90 transition-all"><Sparkles className="w-4 h-4" />{t.exploreAI}</button>
                <button onClick={() => setSelectedNode(null)} className="px-5 py-3 border border-white/25 rounded-xl font-black uppercase text-xs hover:bg-white/8 transition-all text-center text-white/75">{t.close}</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
