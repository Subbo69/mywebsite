import { useState, useEffect, useRef } from 'react';
import { 
  Rocket, Wrench, TrendingUp, Lightbulb, 
  Clock, Zap, Shield, Cpu, 
  BarChart, Users, Link, CheckCircle, 
  X, Sparkles, Filter, Bot, GitMerge,
  MessageCircle, Database, RefreshCw, Target, DollarSign, Activity
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

function useTypewriter(text: string, speed = 28, startDelay = 0, enabled = false) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    setDisplayed('');
    setDone(false);
    let i = 0;
    const outerTimer = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(outerTimer);
  }, [enabled]);

  return { displayed, done };
}

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
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasAnimated(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const titleText     = t.servicesTitle as string;
  const subtitleText  = t.servicesSubtitle as string;
  const titleDuration = titleText.length * 22;

  const { displayed: titleDisplayed,    done: titleDone    } = useTypewriter(titleText,    22, 0,                   hasAnimated);
  const { displayed: subtitleDisplayed, done: subtitleDone } = useTypewriter(subtitleText, 14, titleDuration + 100, hasAnimated);

  const handleAskAI = (context: string) => {
    setSelectedNode(null);
    onAskAIClick(context);
  };

  // ─── 24 NODES  (6 per filter group) ──────────────────────────────────────
  const serviceNodes: ServiceNode[] = [

    // ── EXAMPLE AGENTS (6) ─────────────────────────────────────────────────
    { id: 1,  icon: Rocket,        title: t.node2Title,   description: t.node2Desc,   category: t.catGrowth,     filterGroup: 'agents', context: 'lead-generation', impact: t.impactLive },
    { id: 2,  icon: Zap,           title: t.node4Title,   description: t.node4Desc,   category: t.catSupport,    filterGroup: 'agents', context: 'examples' },
    { id: 3,  icon: Bot,           title: t.nodeA1Title,  description: t.nodeA1Desc,  category: t.catAgents,     filterGroup: 'agents', context: 'examples' },
    { id: 4,  icon: MessageCircle, title: t.nodeA2Title,  description: t.nodeA2Desc,  category: t.catAgents,     filterGroup: 'agents', context: 'examples' },
    { id: 5,  icon: Users,         title: t.nodeA3Title,  description: t.nodeA3Desc,  category: t.catOps,        filterGroup: 'agents', context: 'save-time' },
    { id: 6,  icon: RefreshCw,     title: t.nodeA5Title,  description: t.nodeA5Desc,  category: t.catOps,        filterGroup: 'agents', context: 'save-time' },

    // ── COMMON QUESTIONS (6) ───────────────────────────────────────────────
    { id: 7,  icon: Clock,         title: t.node1Title,   description: t.node1Desc,   category: t.catEfficiency, filterGroup: 'faq',    context: 'save-time',       impact: t.impactTime },
    { id: 8,  icon: Lightbulb,     title: t.node12Title,  description: t.node12Desc,  category: t.catConsulting, filterGroup: 'faq',    context: 'examples' },
    { id: 9,  icon: CheckCircle,   title: t.nodeQ1Title,  description: t.nodeQ1Desc,  category: t.catFaq,        filterGroup: 'faq',    context: 'save-time' },
    { id: 10, icon: Shield,        title: t.nodeQ2Title,  description: t.nodeQ2Desc,  category: t.catFaq,        filterGroup: 'faq',    context: 'custom-solutions' },
    { id: 11, icon: Cpu,           title: t.nodeQ3Title,  description: t.nodeQ3Desc,  category: t.catFaq,        filterGroup: 'faq',    context: 'custom-solutions' },
    { id: 12, icon: Link,          title: t.nodeQ4Title,  description: t.nodeQ4Desc,  category: t.catFaq,        filterGroup: 'faq',    context: 'custom-solutions' },

    // ── ROI & VALUE (6) ────────────────────────────────────────────────────
    { id: 13, icon: BarChart,      title: t.node6Title,   description: t.node6Desc,   category: t.catData,       filterGroup: 'roi',    context: 'examples' },
    { id: 14, icon: DollarSign,    title: t.nodeR1Title,  description: t.nodeR1Desc,  category: t.catRoi,        filterGroup: 'roi',    context: 'save-time',       impact: t.impactTime },
    { id: 15, icon: Activity,      title: t.nodeR2Title,  description: t.nodeR2Desc,  category: t.catRoi,        filterGroup: 'roi',    context: 'examples' },
    { id: 16, icon: Target,        title: t.nodeR3Title,  description: t.nodeR3Desc,  category: t.catRoi,        filterGroup: 'roi',    context: 'lead-generation', impact: t.impactLive },
    { id: 17, icon: TrendingUp,    title: t.nodeR5Title,  description: t.nodeR5Desc,  category: t.catGrowth,     filterGroup: 'roi',    context: 'lead-generation' },
    { id: 18, icon: CheckCircle,   title: t.nodeR6Title,  description: t.nodeR6Desc,  category: t.catEfficiency, filterGroup: 'roi',    context: 'save-time' },

    // ── BONUS cards visible only in "All" marquee ──────────────────────────
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
    ? serviceNodes                                               // all 24 in marquee
    : serviceNodes.filter(n => n.filterGroup === activeFilter); // 6 per group → grid

  const showMarquee = activeFilter === 'all' || filtered.length >= 7;
  const infiniteNodes = [...filtered, ...filtered];

  const titleCursor    = hasAnimated && !titleDone;
  const subtitleCursor = hasAnimated && subtitleDisplayed.length > 0 && !subtitleDone;

  const categoryColors: Record<string, string> = {
    [t.catEfficiency]: 'bg-yellow-300',
    [t.catGrowth]:     'bg-emerald-300',
    [t.catTech]:       'bg-blue-300',
    [t.catSupport]:    'bg-purple-300',
    [t.catInfra]:      'bg-cyan-300',
    [t.catData]:       'bg-orange-300',
    [t.catOps]:        'bg-pink-300',
    [t.catQuality]:    'bg-red-300',
    [t.catConsulting]: 'bg-indigo-300',
    [t.catAgents]:     'bg-violet-300',
    [t.catFaq]:        'bg-sky-300',
    [t.catRoi]:        'bg-lime-300',
  };

  const Card = ({ node, fullWidth = false }: { node: ServiceNode; fullWidth?: boolean }) => (
    <div
      onClick={() => setSelectedNode(node)}
      className={`
        bg-white border border-black rounded-lg p-4 cursor-pointer
        transition-all duration-200 group
        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
        hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
        hover:translate-x-[3px] hover:translate-y-[3px]
        ${fullWidth ? 'h-full' : 'flex-shrink-0 w-[260px] md:w-[280px] whitespace-normal'}
      `}
    >
      <div className="mb-2">
        <span className={`inline-block text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 border border-black rounded ${categoryColors[node.category] ?? 'bg-gray-200'}`}>
          {node.category}
        </span>
      </div>

      <div className="flex justify-between items-start mb-2">
        <h3 className="font-black text-sm uppercase tracking-tight leading-none pr-2">
          {node.title}
        </h3>
        <div className="p-1.5 bg-black text-white rounded flex-shrink-0">
          <node.icon className="w-3.5 h-3.5" />
        </div>
      </div>

      <p className="text-[11px] text-black/60 font-bold leading-tight line-clamp-2 mb-3">
        {node.description}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center text-[9px] font-black uppercase tracking-widest text-black/30 group-hover:text-black transition-colors">
          Details <TrendingUp className="ml-1 w-2.5 h-2.5" />
        </div>
        {node.impact && (
          <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-green-400 border border-black rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
            {node.impact}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <section ref={sectionRef} className="relative py-12 bg-transparent overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marqueeReverse {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0);    }
        }
        .animate-marquee-reverse {
          animation: marqueeReverse 45s linear infinite;
        }
        .pause-marquee:hover .animate-marquee-reverse {
          animation-play-state: paused;
        }
        .mask-fade {
          mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        .tw-cursor::after {
          content: '|';
          animation: blink 0.55s step-end infinite;
          font-weight: 900;
        }
        .tw-cursor-sub::after {
          content: '|';
          animation: blink 0.55s step-end infinite;
          font-weight: 700;
          opacity: 0.4;
        }
      `}} />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <div className="inline-block mb-2">
          <h2 className={`text-3xl md:text-5xl font-black text-black tracking-tighter uppercase min-h-[1.2em] ${titleCursor ? 'tw-cursor' : ''}`}>
            {hasAnimated ? titleDisplayed : <span className="invisible">{titleText}</span>}
          </h2>
          <div className="mt-1 h-1 w-16 bg-black rounded-full" />
        </div>
        <div className="relative text-sm md:text-base font-bold max-w-2xl">
          <p className="invisible" aria-hidden="true">{subtitleText}</p>
          <p className={`absolute inset-0 text-black/60 ${subtitleCursor ? 'tw-cursor-sub' : ''}`}>
            {hasAnimated ? subtitleDisplayed : ''}
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-black/40 flex-shrink-0" />
          {filters.map(f => {
            const count = f.key === 'all'
              ? serviceNodes.length
              : serviceNodes.filter(n => n.filterGroup === f.key).length;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded border transition-all duration-150
                  ${activeFilter === f.key
                    ? 'bg-black text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,0.25)]'
                    : 'bg-white text-black border-black hover:bg-black/5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]'
                  }`}
              >
                {f.label}
                <span className="ml-1.5 opacity-40">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Marquee — "All" view or if filtered set still large */}
      {showMarquee && (
        <div className="relative pause-marquee mask-fade">
          <div className="flex overflow-hidden py-4">
            <div className="flex gap-4 animate-marquee-reverse whitespace-nowrap">
              {infiniteNodes.map((node, index) => (
                <Card key={`${node.id}-${index}`} node={node} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Static Grid — filtered view with ≤6 cards */}
      {!showMarquee && (
        <div className="max-w-7xl mx-auto px-6">
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map(node => (
                <motion.div
                  key={node.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card node={node} fullWidth />
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
              className="absolute inset-0 bg-black/10 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 10, transition: { duration: 0.2 } }}
              className="relative w-full max-w-lg bg-white border-[3px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-black text-white rounded-xl flex-shrink-0">
                  <selectedNode.icon className="w-6 h-6" />
                </div>
                <div>
                  <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase tracking-tighter mb-1 inline-block border border-black ${categoryColors[selectedNode.category] ?? 'bg-gray-200'}`}>
                    {selectedNode.category}
                  </span>
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-tight">
                    {selectedNode.title}
                  </h3>
                </div>
              </div>

              <p className="text-sm md:text-base text-black/80 font-bold leading-relaxed mb-8">
                {selectedNode.description}
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleAskAI(selectedNode.context)}
                  className="flex items-center justify-center gap-2 bg-black text-white px-5 py-3 rounded-xl font-black uppercase text-xs hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)]"
                >
                  <Sparkles className="w-4 h-4" />
                  {t.exploreAI}
                </button>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="px-5 py-3 border-2 border-black rounded-xl font-black uppercase text-xs hover:bg-black/5 transition-all text-center"
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