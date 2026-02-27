import { ArrowRight } from 'lucide-react';
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
  const [animationProgress, setAnimationProgress] = useState(-90);
  const [lightOpacity, setLightOpacity] = useState(0);
  const [animationCount, setAnimationCount] = useState(0);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Automatically calculates the year so you never have to edit it manually
  const currentYear = new Date().getFullYear();

  // Animation function for the "light sweep" effect on the button
  const runAnimation = () => {
    let startTime: number | null = null;
    const duration = 3294;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      if (progress < 0.05) {
        setLightOpacity(progress / 0.05);
      } else if (progress > 0.92) {
        setLightOpacity((1 - progress) / 0.08);
      } else {
        setLightOpacity(1);
      }

      setAnimationProgress(-90 + eased * 360);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setAnimationCount((prev) => prev + 1);
      }
    };

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current = [];

    if (isVisible) {
      const firstTimer = setTimeout(() => {
        runAnimation();
      }, 2300);
      timersRef.current.push(firstTimer);

      const secondTimer = setTimeout(() => {
        runAnimation();
      }, 27000);
      timersRef.current.push(secondTimer);

      const thirdTimer = setTimeout(() => {
        runAnimation();

        const recurringInterval = setInterval(() => {
          runAnimation();
        }, 70000);

        timersRef.current.push(
          recurringInterval as unknown as NodeJS.Timeout
        );
      }, 213000);

      timersRef.current.push(thirdTimer);
    }

    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
      timersRef.current = [];
    };
  }, [isVisible]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
            setAnimationCount(0);
            setLightOpacity(0);
            setAnimationProgress(-90);
          }
        });
      },
      {
        threshold: 0.3,
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    /* py-32 changed to py-16 to reduce overall section height */
    <section ref={sectionRef} className="relative py-16 bg-black text-white overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight">
          {t.workWithUs}
        </h2>

        <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
          {t.workWithUsDesc}
        </p>

        <div className="relative inline-block">
          {/* Animated Border/Glow effect */}
          <div
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              padding: '1px',
              transform: 'scale(1.06)',
            }}
          >
            <div
              className="absolute w-full h-full rounded-full"
              style={{
                background: `conic-gradient(from ${animationProgress}deg, transparent 0%, transparent 85%, rgba(255,255,255,0.2) 88%, rgba(255,255,255,0.7) 90%, #ffffff 91.5%, #ffffff 92%, rgba(255,255,255,0.7) 93%, rgba(255,255,255,0.2) 95%, transparent 97%)`,
                filter: 'blur(0.3px)',
                opacity: lightOpacity,
              }}
            />

            <div
              className="absolute w-full h-full rounded-full"
              style={{
                background: `conic-gradient(from ${animationProgress}deg, transparent 0%, transparent 89%, rgba(255,255,255,0.9) 91%, #ffffff 92%, rgba(255,255,255,0.9) 93%, transparent 95%)`,
                filter: 'blur(0px)',
                opacity: lightOpacity * 1.2,
              }}
            />
          </div>

          <button
            onClick={onBookingClick}
            className="
              relative
              rounded-full
              bg-white
              px-10
              py-4
              text-lg
              font-bold
              flex
              items-center
              gap-3
              text-black
              hover:scale-105
              active:scale-95
              transition-all
              duration-200
              shadow-[0_0_20px_rgba(255,255,255,0.3)]
            "
          >
            <span>{t.bookCall}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* mt-32 reduced to mt-16 and pt-12 to pt-8 to keep footer close */}
      <footer className="mt-16 border-t border-white/10 pt-8 text-center text-xs text-gray-500">
        <div className="max-w-4xl mx-auto px-6">
          <p>© {currentYear} Halovision AI. All rights reserved.</p>
        </div>
      </footer>
    </section>
  );
}
