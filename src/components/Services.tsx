import { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  Rocket,
  Sparkles,
  ChevronDown,
  Wrench,
  Lightbulb,
} from 'lucide-react';
import { translations, Language } from '../utils/translations';

interface ServicesProps {
  onAskAIClick: (context: string) => void;
  language: Language;
}

export default function Services({ onAskAIClick, language }: ServicesProps) {
  const t = translations[language];

  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);

  const scrollTarget = useRef(0);
  const scrollCurrent = useRef(0);
  const rafRef = useRef<number | null>(null);

  const lerp = (start: number, end: number, factor: number) =>
    start + (end - start) * factor;

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      scrollTarget.current = (scrollTop / (docHeight || 1)) * 100;
    };

    const animate = () => {
      scrollCurrent.current = lerp(
        scrollCurrent.current,
        scrollTarget.current,
        0.08
      );
      setScrollProgress(scrollCurrent.current);
      rafRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('scroll', handleScroll);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const services = [
    {
      icon: Rocket,
      title: t.saveTime,
      description: t.saveTimeDesc,
      context: 'save-time',
    },
    {
      icon: Wrench,
      title: t.customSolutions,
      description: t.customSolutionsDesc,
      context: 'custom-solutions',
    },
    {
      icon: TrendingUp,
      title: t.leadGeneration,
      description: t.leadGenerationDesc,
      context: 'lead-generation',
    },
    {
      icon: Lightbulb,
      title: t.exampleAgents,
      description: t.exampleAgentsDesc,
      examples: t.exampleAgentsList,
      context: 'examples',
    },
  ];

  const toggleCard = (index: number) => {
    const newSet = new Set(expandedCards);
    newSet.has(index) ? newSet.delete(index) : newSet.add(index);
    setExpandedCards(newSet);
  };

  const easeInOutCubic = (t: number) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const normalizedProgress = (scrollProgress % 200) / 200;
  const linePosition = -15 + easeInOutCubic(normalizedProgress) * 130;

  return (
    <section className="relative py-12 md:py-20 bg-transparent text-black overflow-hidden -mb-1">
      
      {/* ===== Animated Top Scroll Line ===== */}
      <div className="absolute top-0 left-0 w-full overflow-hidden z-10 pointer-events-none">
        <div
          className="absolute will-change-transform"
          style={{
            height: '1px',
            width: '400px',
            left: `${linePosition}%`,
            transform: 'translateX(-50%)',
            background: `linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.2) 50%, transparent 100%)`,
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-10 md:mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-3 md:mb-4 tracking-tight">
            {t.servicesTitle}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-black/60 max-w-2xl mx-auto">
            {t.servicesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isExpanded = expandedCards.has(index);

            return (
              <div
                key={index}
                onClick={() => toggleCard(index)}
                className={`
                  group relative 
                  bg-white/40 backdrop-blur-md 
                  border-2 border-black 
                  rounded-2xl p-6 
                  transition-all duration-300 cursor-pointer
                  shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
                  hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]
                  hover:translate-x-[-2px] hover:translate-y-[-2px]
                `}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-black stroke-[2.5px]" />
                    <h3 className="text-lg md:text-xl font-black leading-tight">
                      {service.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 text-black/40 group-hover:text-black transition-colors">
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-500 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>

                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    isExpanded ? 'max-h-[600px] opacity-100 mt-5' : 'max-h-0 opacity-0'
                  }`}
                >
                  {service.description && (
                    <p className="text-black/80 mb-4 text-sm md:text-base leading-relaxed font-medium">
                      {service.description}
                    </p>
                  )}

                  {service.examples && (
                    <ul className="text-black/70 mb-6 space-y-2 text-sm md:text-base">
                      {service.examples.map((example, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-black/40 mt-1 font-bold">•</span>
                          <span>{example}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAskAIClick(service.context);
                    }}
                    className="
                      flex items-center gap-2 
                      text-xs font-black uppercase tracking-widest 
                      text-black bg-white border border-black 
                      px-3 py-2 rounded-lg
                      hover:bg-black hover:text-white 
                      transition-all duration-200
                    "
                  >
                    <Sparkles className="w-4 h-4" />
                    {t.askAiAgentButton}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
