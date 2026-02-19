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

      scrollTarget.current = (scrollTop / docHeight) * 100;
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

  const zoomScale = 1 + scrollProgress * 0.002;

  return (
    <section className="relative py-12 md:py-20 text-white overflow-hidden -mb-1">

      {/* ===== Animated Top Scroll Line ===== */}
      <div className="absolute top-0 left-0 w-full overflow-hidden z-10 pointer-events-none">
        <div
          className="absolute will-change-transform"
          style={{
            height: '3px',
            width: '467px', // +70% longer
            left: `${linePosition}%`,
            transform: 'translateX(-50%)',
            background: `
              linear-gradient(
                90deg,
                rgba(255,255,255,0) 0%,
                rgba(255,255,255,0.9) 50%,
                rgba(255,255,255,0) 100%
              )
            `,
            filter: 'blur(1px)',
            boxShadow: '0 0 12px rgba(255,255,255,0.7)',
          }}
        />
      </div>

      {/* Background */}
      <div className="absolute inset-0 w-full h-full z-[-1]">
        <div
          className="services-bg absolute inset-0 w-full h-full will-change-transform"
          style={{
            backgroundImage:
              "url('https://images.hdqwalls.com/wallpapers/neon-half-circle-q7.jpg')",
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `scaleX(-1) scale(${zoomScale})`,
            transformOrigin: 'center',
          }}
        />

        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.24) 0%, rgba(0,0,0,0.32) 8%, rgba(0,0,0,0.4) 15%, rgba(0,0,0,0.5) 25%, rgba(0,0,0,0.65) 40%, rgba(0,0,0,0.8) 55%, rgba(0,0,0,0.92) 70%, rgba(0,0,0,1) 85%, rgba(0,0,0,1) 100%)',
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 drop-shadow-lg">
            {t.servicesTitle}
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-white/90 max-w-3xl mx-auto drop-shadow-sm px-4">
            {t.servicesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 items-start pb-4 md:pb-6">
          {services.map((service, index) => {
            const Icon = service.icon;
            const isExpanded = expandedCards.has(index);

            return (
              <div
                key={index}
                onClick={() => toggleCard(index)}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 md:p-6 hover:bg-white/15 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <Icon className="w-7 h-7 md:w-8 md:h-8 text-white" />
                    <h3 className="text-lg md:text-xl font-bold leading-snug">
                      {service.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1 text-xs md:text-sm text-white/70">
                    <span>{isExpanded ? 'Close' : 'Open'}</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>

                <div
                  className={`overflow-hidden transition-[max-height] duration-300 ${
                    isExpanded ? 'max-h-[600px] mt-4' : 'max-h-0'
                  }`}
                >
                  {service.description && (
                    <p className="text-white/90 mb-3 text-sm md:text-base">
                      {service.description}
                    </p>
                  )}

                  {service.examples && (
                    <ul className="text-white/90 mb-4 space-y-1.5 text-sm md:text-base">
                      {service.examples.map((example, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-white/70">•</span>
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
                    className="text-xs md:text-sm flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    Ask Our AI Agent
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
