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
import { AnimatePresence, motion } from 'framer-motion';

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
  filterGroup: 'all' | 'agents' | 'faq' | 'roi';
  context: string;
  impact?: string;
}

type FilterKey = 'all' | 'agents' | 'faq' | 'roi';

// ─── Typewriter hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 28, startDelay = 0, enabled = false) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!enabled) return;
    setDisplayed(''); setDone(false);
    let i = 0;
    const outer = setTimeout(() => {
      const iv = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(iv); setDone(true); }
      }, speed);
      return () => clearInterval(iv);
    }, startDelay);
    return () => clearTimeout(outer);
  }, [enabled, text, speed, startDelay]);
  return { displayed, done };
}

const filterIcons: Record<FilterKey, any> = {
  all: LayoutGrid, agents: Bot, faq: HelpCircle, roi: LineChart,
};

// ─── GlowCard — local-coordinate spotlight border ────────────────────────────
const glowHsl: Record<string, string> = {
  cyan:   '190 100% 60%',
  purple: '270 100% 65%',
  green:  '145  90% 55%',
  amber:  ' 38 100% 55%',
  white:  '  0   0% 88%',
};

type GlowColor = keyof typeof glowHsl;

const GLOW_CSS = `
  .gc-wrap {
    isolation: isolate;
    --lx: -9999px; --ly: -9999px; --inside: 0;
  }
  .gc-border {
    position: absolute; inset: 0;
    border-radius: inherit;
    pointer-events: none; z-index: 1;
    border: 1px solid rgba(255,255,255,0.09);
  }
  .gc-border::after {
    content: '';
    position: absolute; inset: -1px;
    border-radius: inherit;
    padding: 1px;
    background: radial-gradient(
      200px 200px at var(--lx) var(--ly),
      hsl(var(--gc-color) / calc(var(--inside) * 1)),
      transparent 65%
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
  .gc-fill {
    position: absolute; inset: 0;
    border-radius: inherit;
    pointer-events: none; z-index: 0;
    background: radial-gradient(
      160px 160px at var(--lx) var(--ly),
      hsl(var(--gc-color) / calc(var(--inside) * 0.08)),
      transparent 70%
    );
  }
  .gc-content {
    position: relative; z-index: 2;
    height: 100%; display: flex; flex-direction: column;
  }
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

function GlowCard({
  children,
  className = '',
  glowColor = 'cyan',
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: GlowColor;
  onClick?: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const color = glowHsl[glowColor] ?? glowHsl.cyan;

  useEffect(() => {
    injectGlowStyle();
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--gc-color', color);

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--lx', `${(e.clientX - r.left).toFixed(1)}px`);
      el.style.setProperty('--ly', `${(e.clientY - r.top).toFixed(1)}px`);
      el.style.setProperty('--inside', '1');
    };
    const onLeave = () => el.style.setProperty('--inside', '0');

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [color]);

  return (
    <div
      ref={ref}
      className={`gc-wrap rounded-2xl relative cursor-pointer ${className}`}
      style={{ background: 'transparent' }}
      onClick={onClick}
    >
      <div className="gc-fill" />
      <div className="gc-border" />
      <div className="gc-content">{children}</div>
    </div>
  );
}

const glowPalette: GlowColor[] = ['cyan', 'purple', 'green', 'amber', 'white'];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Services({ onAskAIClick, language }: ServicesProps) {
  const t = translations[language];
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHasAnimated(true); observer.disconnect(); } },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const titleText    = t.servicesTitle as string;
  const subtitleText = t.servicesSubtitle as string;
  const titleDuration    = titleText.length * 22;
  const subtitleDuration = subtitleText.length * 14;
  const marqueeDelay     = titleDuration + subtitleDuration + 300;

  const { displayed: titleDisplayed,    done: titleDone    } = useTypewriter(titleText,    22, 0,                   hasAnimated);
  const { displayed: subtitleDisplayed, done: subtitleDone } = useTypewriter(subtitleText, 14, titleDuration + 100, hasAnimated);

  const [marqueeVisible, setMarqueeVisible] = useState(false);
  useEffect(() => {
    if (!hasAnimated) return;
    const t2 = setTimeout(() => setMarqueeVisible(true), marqueeDelay);
    return () => clearTimeout(t2);
  }, [hasAnimated, marqueeDelay]);

  const handleAskAI = (context: string) => {
    setSelectedNode(null);
    onAskAIClick?.(context);
  };

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
    { key: 'all',    label: t.filterAll    },
    { key: 'agents', label: t.filterAgents },
    { key: 'faq',    label: t.filterFaq    },
    { key: 'roi',    label: t.filterRoi    },
  ];

  const filtered = activeFilter === 'all'
    ? serviceNodes
    : serviceNodes.filter(n => n.filterGroup === activeFilter);

  const showMarquee  = activeFilter === 'all' || filtered.length >= 7;
  const infiniteNodes = [...filtered, ...filtered];

  const titleCursor    = hasAnimated && !titleDone;
  const subtitleCursor = hasAnimated && subtitleDisplayed.length > 0 && !subtitleDone;

  const Card = ({ node, fullWidth = false, index = 0 }: { node: ServiceNode; fullWidth?: boolean; index?: number }) => (
    <GlowCard
      glowColor={glowPalette[index % glowPalette.length]}
      onClick={() => setSelectedNode(node)}
      className={`
        group
        ${fullWidth ? 'h-full' : 'flex-shrink-0 w-[310px] md:w-[330px] whitespace-normal'}
      `}
    >
      <div className="flex flex-col h-full px-4 pt-4 pb-3">
        <h3 className="font-black text-[15px] uppercase tracking-tight leading-tight mb-2 text-white/90">
          {node.title}
        </h3>
        <div className="mb-5 flex-1">
          <p className="text-[13px] text-white/75 font-medium leading-relaxed">
            {node.description}
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 mt-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-none">
            {node.category}
          </p>
          <div className="flex items-center gap-2 flex-shrink-0">
            {node.impact && (
              <span className="text-[8px] font-black uppercase px-2 py-1 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-md leading-none">
                {node.impact}
              </span>
            )}
            <div className="flex items-center gap-1 text-[11px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/85 transition-colors leading-none">
              Details <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </GlowCard>
  );

  return (
    <section ref={sectionRef} className="relative py-12 bg-black overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marqueeReverse {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0);    }
        }
        .animate-marquee-reverse { animation: marqueeReverse 60s linear infinite; }
        .pause-marquee:hover .animate-marquee-reverse { animation-play-state: paused; }
        .mask-fade {
          mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 10%, black 90%, transparent);
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .tw-cursor::after      { content: '|'; animation: blink 0.55s step-end infinite; font-weight: 900; }
        .tw-cursor-sub::after  { content: '|'; animation: blink 0.55s step-end infinite; font-weight: 700; opacity: 0.3; }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .marquee-reveal { opacity: 0; }
        .marquee-reveal.visible { animation: fadeInUp 1.4s ease-out forwards; }
      `}} />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-7">
        <div className="inline-block mb-2">
          <h2 className={`text-[33px] md:text-[55px] font-black text-white tracking-tighter uppercase min-h-[1.2em] ${titleCursor ? 'tw-cursor' : ''}`}>
            {hasAnimated ? titleDisplayed : <span className="invisible">{titleText}</span>}
          </h2>
          <div className="mt-1 h-1 w-16 bg-white/30 rounded-full" />
        </div>
        <div className="relative text-[15px] md:text-[18px] font-bold max-w-2xl">
          <p className="invisible" aria-hidden="true">{subtitleText}</p>
          <p className={`absolute inset-0 text-white/40 ${subtitleCursor ? 'tw-cursor-sub' : ''}`}>
            {hasAnimated ? subtitleDisplayed : ''}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={`max-w-7xl mx-auto px-6 mb-6 marquee-reveal ${marqueeVisible ? 'visible' : ''}`}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
          {filters.map(f => {
            const IconComp = filterIcons[f.key];
            const count = f.key === 'all'
              ? serviceNodes.length
              : serviceNodes.filter(n => n.filterGroup === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border transition-all duration-150
                  ${activeFilter === f.key
                    ? 'bg-white text-black border-white/80'
                    : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10 hover:text-white/80 hover:border-white/20'
                  }`}
              >
                <IconComp className="w-3 h-3" />
                {f.label}
                <span className="opacity-35">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Marquee */}
      {showMarquee && (
        <div className={`relative pause-marquee mask-fade marquee-reveal ${marqueeVisible ? 'visible' : ''}`}>
          <div className="flex overflow-hidden py-4">
            <div className="flex gap-4 animate-marquee-reverse whitespace-nowrap">
              {infiniteNodes.map((node, index) => (
                <Card key={`${node.id}-${index}`} node={node} index={index} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Static Grid */}
      {!showMarquee && (
        <div className={`max-w-7xl mx-auto px-6 marquee-reveal ${marqueeVisible ? 'visible' : ''}`}>
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((node, i) => (
                <motion.div
                  key={node.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card node={node} fullWidth index={i} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedNode(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 10, transition: { duration: 0.2 } }}
              className="relative w-full max-w-lg bg-[#0e0e0e] border border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.8)] rounded-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full transition-colors z-10"
              >
                <X className="w-5 h-5 text-white/50" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-white/10 text-white rounded-xl flex-shrink-0 border border-white/10">
                  <selectedNode.icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2 py-0.5 border border-white/20 text-white/40 text-[9px] font-black rounded uppercase tracking-tighter mb-1 inline-block">
                    {selectedNode.category}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-tight text-white">
                    {selectedNode.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm md:text-base text-white/50 font-medium leading-relaxed mb-8">
                {selectedNode.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleAskAI(selectedNode.context)}
                  className="flex items-center justify-center gap-2 bg-white text-black px-5 py-3 rounded-xl font-black uppercase text-xs hover:bg-white/90 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  {t.exploreAI}
                </button>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="px-5 py-3 border border-white/15 rounded-xl font-black uppercase text-xs hover:bg-white/5 transition-all text-center text-white/60"
                >
                  {t.close}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
