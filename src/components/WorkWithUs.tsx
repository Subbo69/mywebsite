import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useEffect, useRef, useState, useMemo } from 'react';

interface WorkWithUsProps {
  onBookingClick: () => void;
  language: Language;
}

export default function WorkWithUs({ onBookingClick, language }: WorkWithUsProps) {
  const t = translations[language];
  const sectionRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  
  const [activeStep, setActiveStep] = useState(0);
  const [typedText, setTypedText] = useState(['', '', '', '']);
  const [showButton, setShowButton] = useState(false);

  const planSteps = useMemo(() => [
    t.planStep1, t.planStep2, t.planStep3, t.planStep4
  ], [t]);

  useEffect(() => {
    if (isVisible && activeStep < planSteps.length) {
      const currentFullText = planSteps[activeStep];
      const currentTyped = typedText[activeStep];

      if (currentTyped.length < currentFullText.length) {
        const timeout = setTimeout(() => {
          const newTyped = [...typedText];
          newTyped[activeStep] = currentFullText.slice(0, currentTyped.length + 1);
          setTypedText(newTyped);
        }, 10);
        return () => clearTimeout(timeout);
      } else {
        const nextStepTimeout = setTimeout(() => {
          setActiveStep(prev => prev + 1);
        }, 150);
        return () => clearTimeout(nextStepTimeout);
      }
    } else if (activeStep === planSteps.length) {
      setShowButton(true);
    }
  }, [isVisible, activeStep, typedText, planSteps]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.5 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-12 bg-black text-white w-full border-t border-white/5">
      {/* Add Custom Arrow Animation Style */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes subtleBounce {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        .animate-arrow-bounce {
          animation: subtleBounce 1.5s ease-in-out infinite;
        }
      `}} />

      <div className="max-w-2xl mx-auto px-6">
        
        {/* Compressed Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight mb-1">{t.workWithUs}</h2>
          <p className="text-xs text-gray-500">{t.workWithUsDesc}</p>
        </div>

        {/* Console Box (Now strictly for text) */}
        <div className="bg-[#0A0A0A] border border-white/10 rounded-lg p-5 mb-8">
          <div className="space-y-2.5">
            {planSteps.map((_, index) => (
              <div 
                key={index} 
                className={`flex items-center gap-3 transition-opacity duration-300 ${
                  activeStep >= index ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 transition-colors duration-300 ${
                  typedText[index].length === planSteps[index].length 
                    ? 'text-green-500' 
                    : 'text-white/10'
                }`} />
                
                <p className="font-mono text-[13px] text-gray-300 leading-none">
                  {typedText[index]}
                  {activeStep === index && typedText[index].length < planSteps[index].length && (
                    <span className="inline-block w-1.5 h-3 ml-1 bg-white animate-pulse" />
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Button - Outside and Animated */}
        <div className={`flex justify-center transition-all duration-1000 transform ${
          showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}>
          <button
            onClick={onBookingClick}
            className="group relative flex items-center gap-3 rounded-full bg-white px-8 py-3 text-sm font-black text-black hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            <span className="uppercase tracking-wider">{t.bookCall}</span>
            <ArrowRight className="w-4 h-4 animate-arrow-bounce" />
          </button>
        </div>

        {/* Minimal Copyright */}
        <div className="mt-12 text-center opacity-20">
          <p className="text-[9px] tracking-[0.4em] uppercase">
            © {new Date().getFullYear()} Halovision AI
          </p>
        </div>
      </div>
    </section>
  );
}
