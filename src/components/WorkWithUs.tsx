import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useEffect, useRef, useState } from 'react';

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

  const planSteps = [
    t.planStep1,
    t.planStep2,
    t.planStep3,
    t.planStep4
  ];

  useEffect(() => {
    if (isVisible && activeStep < planSteps.length) {
      const currentFullText = planSteps[activeStep];
      const currentTyped = typedText[activeStep];

      if (currentTyped.length < currentFullText.length) {
        const timeout = setTimeout(() => {
          const newTyped = [...typedText];
          newTyped[activeStep] = currentFullText.slice(0, currentTyped.length + 1);
          setTypedText(newTyped);
        }, 15); // Etwas schneller, da mehr Zeilen
        return () => clearTimeout(timeout);
      } else {
        const nextStepTimeout = setTimeout(() => {
          setActiveStep(prev => prev + 1);
        }, 300);
        return () => clearTimeout(nextStepTimeout);
      }
    } else if (activeStep === planSteps.length) {
      const btnTimeout = setTimeout(() => setShowButton(true), 400);
      return () => clearTimeout(btnTimeout);
    }
  }, [isVisible, activeStep, typedText, planSteps]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 bg-black text-white overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
          {t.workWithUs}
        </h2>

        <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
          {t.workWithUsDesc}
        </p>

        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 md:p-12 mb-12 max-w-xl mx-auto text-left backdrop-blur-sm shadow-2xl">
          <div className="grid grid-cols-1 gap-8">
            {planSteps.map((_, index) => (
              <div 
                key={index} 
                className={`flex items-start gap-4 transition-all duration-700 ${
                  activeStep >= index ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
                }`}
              >
                <div className="mt-1">
                  <CheckCircle2 className={`w-5 h-5 transition-colors duration-500 ${
                    typedText[index].length === planSteps[index].length 
                      ? 'text-green-400' 
                      : 'text-white/5'
                  }`} />
                </div>
                {/* whitespace-pre-line ist hier der entscheidende Teil für das "Enter" */}
                <p className="font-mono text-sm md:text-base leading-relaxed text-gray-300 whitespace-pre-line">
                  {typedText[index]}
                  {activeStep === index && typedText[index].length < planSteps[index].length && (
                    <span className="inline-block w-2 h-4 ml-1 bg-white animate-pulse" />
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div 
          className={`transition-all duration-1000 transform ${
            showButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
          }`}
        >
          <button
            onClick={onBookingClick}
            className="group relative inline-flex items-center gap-3 rounded-full bg-white px-10 py-4 text-lg font-bold text-black hover:bg-gray-100 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            <span>{t.bookCall}</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
