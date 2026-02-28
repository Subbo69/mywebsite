import { Users, Zap, ChevronDown } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useState } from 'react';

interface WhyUsProps {
  language: Language;
}

export default function WhyUs({ language }: WhyUsProps) {
  const t = translations[language];
  // Track expanded state for mobile
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleReason = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className="relative py-12 md:py-16 bg-gradient-to-b from-transparent to-white text-black overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left: Reasons (Accordion on mobile, static on desktop) */}
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">
              {t.whyUsTitle}
            </h2>

            <div className="space-y-3">
              {t.reasons.slice(0, 5).map((reason, index) => {
                const isExpanded = expandedIndex === index;
                
                return (
                  <div
                    key={index}
                    onClick={() => toggleReason(index)}
                    className={`
                      backdrop-blur-md
                      bg-white/20
                      border border-black
                      rounded-xl
                      px-5 py-3
                      shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                      cursor-pointer md:cursor-default
                      transition-all duration-300
                      ${isExpanded ? 'bg-white/40 translate-y-0.5 translate-x-0.5 shadow-none' : ''}
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-base md:text-lg font-bold leading-tight">
                            {reason}
                          </p>
                          {/* Chevron only visible on mobile to indicate interactivity */}
                          <ChevronDown 
                            className={`w-5 h-5 transition-transform duration-300 md:hidden ${isExpanded ? 'rotate-180' : ''}`} 
                          />
                        </div>
                        
                        {/* Expandable Description */}
                        <div className={`
                          overflow-hidden transition-all duration-300
                          ${isExpanded ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0 md:max-h-40 md:opacity-100 md:mt-2'}
                        `}>
                          <p className="text-black/70 text-sm leading-relaxed">
                            {t.reasonsDesc[index]}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Compressed Founder Block */}
          <div className="
            backdrop-blur-xl 
            bg-white/30 
            border border-black 
            rounded-[2rem] 
            p-6 md:p-8 
            shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]
            lg:sticky lg:top-24
          ">
            <div className="flex items-center gap-5 mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-black shadow-sm flex-shrink-0">
                <img
                  src="https://i.postimg.cc/sDfZC0mH/Screenshot-20260102-094201-(1)-(1)-(1)-(1).png"
                  alt="Founder"
                  className="w-full h-full object-cover"
                  style={{
                    transform: 'scale(1.2)',
                    objectPosition: 'center 41%',
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-5 h-5 text-black" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/50">Human-Centric AI</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-black leading-none">
                  {t.customBuilt}
                </h3>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-black/80 text-sm md:text-base leading-relaxed font-medium">
                {t.customBuiltDesc}
              </p>

              <div className="pt-4 border-t border-black/10 flex items-center gap-3 text-black font-black uppercase tracking-wider text-xs">
                <Zap className="w-5 h-5 fill-black" />
                <span>{t.rapidDeployment}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
