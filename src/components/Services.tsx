import { useState } from 'react';
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
}

export default function Services({ onAskAIClick, language }: ServicesProps) {
  const t = translations[language];
  const [selectedNode, setSelectedNode] = useState<ServiceNode | null>(null);

  const handleAskAI = (context: string) => {
    setSelectedNode(null);
    onAskAIClick(context);
  };

  const serviceNodes: ServiceNode[] = [
    { id: 1, icon: Clock, title: t.node1Title, description: t.node1Desc, category: t.catEfficiency, context: 'save-time', impact: t.impactTime },
    { id: 2, icon: Rocket, title: t.node2Title, description: t.node2Desc, category: t.catGrowth, context: 'lead-generation', impact: t.impactLive },
    { id: 3, icon: Wrench, title: t.node3Title, description: t.node3Desc, category: t.catTech, context: 'custom-solutions' },
    { id: 4, icon: Zap, title: t.node4Title, description: t.node4Desc, category: t.catSupport, context: 'examples' },
    { id: 5, icon: Cpu, title: t.node5Title, description: t.node5Desc, category: t.catInfra, context: 'custom-solutions' },
    { id: 6, icon: BarChart, title: t.node6Title, description: t.node6Desc, category: t.catData, context: 'examples' },
    { id: 7, icon: Users, title: t.node7Title, description: t.node7Desc, category: t.catOps, context: 'save-time' },
    { id: 8, icon: Shield, title: t.node8Title, description: t.node8Desc, category: t.catQuality, context: 'custom-solutions' },
    { id: 9, icon: Link, title: t.node9Title, description: t.node9Desc, category: t.catTech, context: 'custom-solutions' },
    { id: 10, icon: TrendingUp, title: t.node10Title, description: t.node10Desc, category: t.catGrowth, context: 'lead-generation' },
    { id: 11, icon: CheckCircle, title: t.node11Title, description: t.node11Desc, category: t.catEfficiency, context: 'save-time' },
    { id: 12, icon: Lightbulb, title: t.node12Title, description: t.node12Desc, category: t.catConsulting, context: 'examples' },
  ];

  const infiniteNodes = [...serviceNodes, ...serviceNodes];

  return (
    <section className="relative py-12 bg-transparent overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marqueeReverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-reverse {
          animation: marqueeReverse 35s linear infinite;
        }
        .pause-marquee:hover .animate-marquee-reverse {
          animation-play-state: paused;
        }
        /* This creates the "Fade into nothing" effect on the edges */
        .mask-fade {
          mask-image: linear-gradient(
            to right,
            transparent,
            black 15%,
            black 85%,
            transparent
          );
          -webkit-mask-image: linear-gradient(
            to right,
            transparent,
            black 15%,
            black 85%,
            transparent
          );
        }
      `}} />

      <div className="max-w-7xl mx-auto px-6 mb-8">
        <div className="inline-block mb-2">
          <h2 className="text-3xl md:text-5xl font-black text-black tracking-tighter uppercase">
            {t.servicesTitle}
          </h2>
          <div className="mt-1 h-1 w-16 bg-black rounded-full" />
        </div>
        <p className="text-sm md:text-base text-black/60 font-bold max-w-2xl">
          {t.servicesSubtitle}
        </p>
      </div>

      {/* Added mask-fade here */}
      <div className="relative pause-marquee mask-fade">
        <div className="flex overflow-hidden py-4">
          <div className="flex gap-4 animate-marquee-reverse whitespace-nowrap">
            {infiniteNodes.map((node, index) => (
              <div
                key={index}
                onClick={() => setSelectedNode(node)}
                className="flex-shrink-0 w-[260px] md:w-[280px] bg-white border border-black rounded-lg p-4 cursor-pointer transition-all duration-200 group shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px]"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-black text-sm uppercase tracking-tight whitespace-normal leading-none pr-2">
                    {node.title}
                  </h3>
                  <div className="p-1.5 bg-black text-white rounded flex-shrink-0">
                    <node.icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                
                <p className="text-[11px] text-black/60 font-bold leading-tight whitespace-normal line-clamp-2 mb-3">
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
            ))}
          </div>
        </div>
      </div>

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
