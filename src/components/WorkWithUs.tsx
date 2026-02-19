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

  // Animation function
  const runAnimation = () => {
    let startTime: number | null = null;
    const duration = 3294; // 170% speed (5600 / 1.7 ≈ 3294ms)

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Smoother ease in-out for better acceleration/deceleration
      const eased = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      // Opacity control: fade in at start, fade out at end (going into button)
      if (progress < 0.05) {
        // Fade in during first 5%
        setLightOpacity(progress / 0.05);
      } else if (progress > 0.92) {
        // Fade out during last 8% (smooth disappear into button)
        setLightOpacity((1 - progress) / 0.08);
      } else {
        setLightOpacity(1);
      }
      
      // Start from -90deg (top) and complete one full rotation
      setAnimationProgress(-90 + (eased * 360));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Animation complete, increment counter
        setAnimationCount(prev => prev + 1);
      }
    };

    requestAnimationFrame(animate);
  };

  // Schedule animations based on timing rules
  useEffect(() => {
    // Clear any existing timers
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];

    if (isVisible) {
      // First animation: wait 3 seconds
      const firstTimer = setTimeout(() => {
        runAnimation();
      }, 2300);
      timersRef.current.push(firstTimer);

      // Second animation: after 30 seconds (3s initial + 30s = 33s total)
      const secondTimer = setTimeout(() => {
        runAnimation();
      }, 27000);
      timersRef.current.push(secondTimer);

      // Third animation and beyond: every 3 minutes after the second one
      // (3s + 30s + 3min = 213s total for third)
      const scheduleRecurringAnimations = () => {
        const thirdTimer = setTimeout(() => {
          runAnimation();
          
          // Continue every 3 minutes
          const recurringInterval = setInterval(() => {
            runAnimation();
          }, 70000); // 3 minutes

          // Store interval ID for cleanup (cast to NodeJS.Timeout)
          timersRef.current.push(recurringInterval as unknown as NodeJS.Timeout);
        }, 213000); // 3s + 30s + 3min
        timersRef.current.push(thirdTimer);
      };

      scheduleRecurringAnimations();
    }

    return () => {
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
    };
  }, [isVisible]);

  // Intersection Observer to detect visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          } else {
            setIsVisible(false);
            // Reset animation count when leaving viewport
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
    <section ref={sectionRef} className="relative py-32 bg-black text-white">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-5xl md:text-6xl font-bold mb-6">
          {t.workWithUs}
        </h2>
        <p className="text-xl text-gray-400 mb-12">
          {t.workWithUsDesc}
        </p>

        {/* White light-string border button */}
        <div className="relative inline-block">
          {/* Shooting star effect - bright head with trailing tail */}
          <div 
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              padding: '1px',
              transform: 'scale(1.06)', // Closer to button (was 1.12)
            }}
          >
            {/* Bright head of the shooting star */}
            <div
              className="absolute w-full h-full rounded-full"
              style={{
                background: `conic-gradient(from ${animationProgress}deg, transparent 0%, transparent 85%, rgba(255,255,255,0.2) 88%, rgba(255,255,255,0.7) 90%, #ffffff 91.5%, #ffffff 92%, rgba(255,255,255,0.7) 93%, rgba(255,255,255,0.2) 95%, transparent 97%)`,
                filter: 'blur(0.3px)',
                opacity: lightOpacity,
              }}
            />
            {/* Extra glow for the bright head */}
            <div
              className="absolute w-full h-full rounded-full"
              style={{
                background: `conic-gradient(from ${animationProgress}deg, transparent 0%, transparent 89%, rgba(255,255,255,0.9) 91%, #ffffff 92%, rgba(255,255,255,0.9) 93%, transparent 95%)`,
                filter: 'blur(0px)',
                opacity: lightOpacity * 1.2,
              }}
            />
          </div>

          {/* White button */}
          <button
            onClick={onBookingClick}
            className="
              relative
              rounded-full
              bg-white
              px-8
              py-4
              text-lg
              font-semibold
              flex
              items-center
              gap-3
              text-black
              hover:scale-105
              active:scale-95
              transition-transform
              duration-200
              shadow-lg
            "
          >
            <span>{t.bookCall}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  );
}