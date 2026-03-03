import { useState, useEffect, useRef } from 'react';
import { 
  Rocket, Wrench, TrendingUp, Lightbulb, 
  Clock, Zap, Shield, Cpu, 
  BarChart, Users, Link, CheckCircle, 
  X, Sparkles 
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
  context: string;
  impact?: string;
  group: 'efficiency' | 'growth' | 'tech' | 'intelligence';
}

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

const GROUP_META = {
  efficiency: { label: 'Efficiency', color: 'bg-yellow-400', textColor: 'text-yellow-900', dot: '#facc15' },
  growth:     { label: 'Growth',     color: 'bg-blue-400',   textColor: 'text-blue-900',   dot: '#60a5fa' },
  tech:       { label: 'Tech',       color: 'bg-violet-400', textColor: 'text-violet-900', dot: '#a78bfa' },
  intelligence:{ label: 'Intelligence', color: 'bg-orange-400', textColor: 'text-orange-900', dot: '#fb923c' },
};

export default function Services({ onAskAIClick, language }: ServicesProps) {
  const t = translations[language];
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(null);
  const [activeGroup, setActiveGroup] = useState<'all' | keyof typeof GROUP_META>('all');
  const [hasAnimated, setHasAnimated] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setHasAnimated(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const titleText = t.servicesTitle as string;
  const subtitleText = t.servicesSubtitle as string;
  const titleDuration = titleText.length * 22;

  const { displayed: titleDisplayed, done: titleDone } = useTypewriter(titleText, 22, 0, hasAnimated);
  const { displayed: subtitleDisplayed, done: subtitleDone } = useTypewriter(subtitleText, 14, titleDuration + 100, hasAnimated);

  const titleCursor = hasAnimated && !titleDone;
  const subtitleCursor = hasAnimated && subtitleDisplayed.length > 0 && !subtitleDone;

  const handleAskAI = (context: string) => {
    setSelectedNode(null);
    onAskAIClick(context);
  };

  const serviceNodes: ServiceNode[] = [
    { id: 1,  icon: Clock,        title: t.node1Title,  description: t.node1Desc,  category: t.catEfficiency, context: 'save-time',        impact: t.impactTime, group: 'efficiency'   },
    { id: 2,  icon: Rocket,       title: t.node2Title,  description: t.node2Desc,  category: t.catGrowth,     context: 'lead-generation',  impact: t.impactLive, group: 'growth'       },
    { id: 3,  icon: Wrench,       title: t.node3Title,  description: t.node3Desc,  category: t.catTech,       context: 'custom-solutions',               group: 'tech'         },
    { id: 4,  icon: Zap,          title: t.node4Title,  description: t.node4Desc,  category: t.catSupport,    context: 'examples',                        group: 'growth'       },
    { id: 5,  icon: Cpu,          title: t.node5Title,  description: t.node5Desc,  category: t.catInfra,      context: 'custom-solutions',               group: 'tech'         },
    { id: 6,  icon: BarChart,     title: t.node6Title,  description: t.node6Desc,  category: t.catData,       context: 'examples',                        group: 'intelligence' },
    { id: 7,  icon: Users,        title: t.node7Title,  description: t.node7Desc,  category: t.catOps,        context: 'save-time',                       group: 'efficiency'   },
    { id: 8,  icon: Shield,       title: t.node8Title,  description: t.node8Desc,  category: t.catQuality,    context: 'custom-solutions',               group: 'efficiency'   },
    { id: 9,  icon: Link,         title: t.node9Title,  description: t.node9Desc,  category: t.catTech,       context: 'custom-solutions',               group: 'tech'         },
    { id: 10, icon: TrendingUp,   title: t.node10Title, description: t.node10Desc, category: t.catGrowth,     context: 'lead-generation',                group: 'growth'       },
    { id: 11, icon: CheckCircle,  title: t.node11Title, description: t.node11Desc, category: t.catEfficiency, context: 'save-time',                       group: 'efficiency'   },
    { id: 12, icon: Lightbulb,    title: t.node12Title, description: t.node12Desc, category: t.catConsulting, context: 'examples',                        group: 'intelligence' },
  ];

  const filtered = activeGroup === 'all' ? serviceNodes : serviceNodes.filter(n => n.group === activeGroup);

  const tabs: Array<{ key: 'all' | keyof typeof GROUP_META; label: string; count: number }> = [
    { key: 'all',          label: 'All',          count: serviceNodes.length },
    { key: 'efficiency',   label: 'Efficiency',   count: serviceNodes.filter(n => n.group === 'efficiency').length },
    { key: 'growth',       label: 'Growth',       count: serviceNodes.filter(n => n.group === 'growth').length },
    { key: 'tech',         label: 'Tech',         count: serviceNodes.filter(n => n.group === 'tech').length },
    { key: 'intelligence', label: 'Intelligence', count: serviceNodes.filter(n => n.group === 'intelligence').length },
  ];

  return (
    <section ref={sectionRef} className="relative py-12 bg-transparent overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        .tw-cursor::after { content: '|'; animation: blink 0.55s step-end infinite; font-weight: 900; }
        .tw-cursor-sub::after { content: '|'; animation: blink 0.55s step-end infinite; font-weight: 700; opacity: 0.4; }
      `}} />

      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-8">
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
      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => {
            const isActive = activeGroup === tab.key;
            const meta = tab.key !== 'all' ? GROUP_META[tab.key] : null;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveGroup(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-black font-black text-xs uppercase tracking-tight
                  transition-all duration-150
                  ${isActive
                    ? `${meta ? meta.color : 'bg-black text-white'} shadow-none translate-x-[2px] translate-y-[2px]`
                    : 'bg-white hover:bg-black/5 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]'
                  }
                `}
              >
                {meta && (
                  <span className={`w-2.5 h-2.5 rounded-full border border-black ${meta.color}`} />
                )}
                {tab.label}
                <span className={`
                  px-1.5 py-0.5 rounded text-[9px] font-black border border-black
                  ${isActive ? 'bg-black/20' : 'bg-black/10'}
                `}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map(node => {
              const meta = GROUP_META[node.group];
              return (
                <motion.div
                  key={node.id}
                  layout
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.88 }}
                  transition={{ duration: 0.18 }}
                  onClick={() => setSelectedNode(node)}
                  className="bg-white border-2 border-black rounded-xl p-5 cursor-pointer group
                    shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]
                    hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                    hover:translate-x-[3px] hover:translate-y-[3px]
                    transition-all duration-150 flex flex-col"
                >
                  {/* Group badge + icon row */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`
                      px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-black
                      ${meta.color} ${meta.textColor}
                    `}>
                      {meta.label}
                    </span>
                    <div className="p-2 bg-black text-white rounded-lg flex-shrink-0">
                      <node.icon className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-black text-sm uppercase tracking-tight leading-tight mb-2">
                    {node.title}
                  </h3>

                  <p className="text-[11px] text-black/60 font-bold leading-tight line-clamp-3 mb-4 flex-1">
                    {node.description}
                  </p>

                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center text-[9px] font-black uppercase tracking-widest text-black/30 group-hover:text-black transition-colors">
                      Details <TrendingUp className="ml-1 w-2.5 h-2.5" />
                    </div>
                    {node.impact && (
                      <span className="text-[8px] font-black uppercase px-1.5 py-0.5 bg-green-400 border border-black rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                        {node.impact}
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedNode && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedNode(null)}
              className="absolute inset-0 bg-black/10 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 10, transition: { duration: 0.2 } }}
              className="relative w-full max-w-lg bg-white border-[3px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-2xl p-6 md:p-10 max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setSelectedNode(null)} className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full transition-colors z-10">
                <X className="w-6 h-6" />
              </button>

              {/* Group strip */}
              <div className={`-mx-6 md:-mx-10 -mt-6 md:-mt-10 mb-6 px-6 md:px-10 py-3 ${GROUP_META[selectedNode.group].color} border-b-2 border-black rounded-t-2xl`}>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {GROUP_META[selectedNode.group].label}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-black text-white rounded-xl flex-shrink-0">
                  <selectedNode.icon className="w-6 h-6" />
                </div>
                <div>
                  <span className="px-2 py-0.5 bg-black text-white text-[9px] font-black rounded uppercase tracking-tighter mb-1 inline-block">
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