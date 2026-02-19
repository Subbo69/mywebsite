import { useState, useEffect } from 'react';
import { X, Calendar as CalIcon, Clock, Timer } from 'lucide-react';
import Calendar from './Calendar';
import BookingForm from './BookingForm';
import { translations, Language } from '../utils/translations';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

type Step = 'calendar' | 'form';

export default function BookingModal({ isOpen, onClose, language }: BookingModalProps) {
  const t = translations[language];

  const [step, setStep] = useState<Step>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedTimezone, setSelectedTimezone] = useState<string>('UTC+1');

  // Animation visibility state
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      // Wait for exit animation before unmounting
      const timeout = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!visible) return null;

  const handleDateTimeSelect = (date: Date, time: string, timezone: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setSelectedTimezone(timezone);
    setStep('form');
  };

  const handleBack = () => setStep('calendar');

  const handleClose = () => {
    setStep('calendar');
    setSelectedDate(null);
    setSelectedTime('');
    onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ease-out ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Custom Font - Anurati */}
      <link href="https://fonts.cdnfonts.com/css/anurati" rel="stylesheet" />

      <div
        className={`relative w-full max-w-6xl max-h-[90vh] bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ease-out ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-white/70 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col md:flex-row h-full max-h-[90vh] overflow-hidden">
          
          {/* LEFT PANEL: Summary & Branding */}
          <div className="w-full md:w-2/5 bg-gradient-to-br from-gray-800 to-gray-900 p-6 md:p-10 flex flex-col overflow-hidden border-r border-white/5">
            
            {/* Logo Section */}
            <div className="flex items-center gap-3 mb-6 md:mb-10 pl-2 md:pl-4 flex-shrink-0">
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] font-bold select-none text-2xl md:text-4xl"
                style={{ fontFamily: 'Anurati, sans-serif', letterSpacing: '0.06em' }}
              >
                HALOVISION AI
              </span>
            </div>

            {/* Content Section */}
            <div className="flex-shrink-0">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-5">
                {t.growthMappingCall}
              </h2>
              <p className="text-gray-300 mb-6 md:mb-8 text-sm md:text-base leading-relaxed">
                {t.growthMappingDesc}
              </p>

              <div className="space-y-3 md:space-y-4 text-gray-300 mb-8 md:mb-10 text-sm md:text-base">
                <p className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold">1.</span> {t.analysisStep}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold">2.</span> {t.auditStep}
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-purple-400 font-bold">3.</span> {t.nextSteps}
                </p>
              </div>
            </div>

            {/* Selection Details (Only visible in Form step) */}
            {step === 'form' && selectedDate && (
              <div className="mt-auto space-y-3 md:space-y-4 pt-6 md:pt-8 border-t border-white/10 flex-shrink-0 animate-in fade-in slide-in-from-left-4 duration-500">
                <SummaryRow
                  icon={<CalIcon className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />}
                  label={selectedDate.toLocaleDateString(language === 'en' ? 'en-US' : 'de-DE', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                />
                <SummaryRow 
                  icon={<Clock className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />} 
                  label={selectedTime} 
                />
                <SummaryRow 
                  icon={<Timer className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />} 
                  label="30 Min" 
                />
              </div>
            )}

            {/* Footer Note */}
            <p className="text-gray-500 text-xs md:text-sm mt-auto pt-6 hidden md:block flex-shrink-0 italic">
              {t.agencyNote}
            </p>
          </div>

          {/* RIGHT PANEL: Dynamic Content (Calendar/Form) */}
          <div className="w-full md:w-3/5 bg-gray-900/50 overflow-y-auto flex-1 custom-scrollbar">
            {step === 'calendar' ? (
              <Calendar onSelectDateTime={handleDateTimeSelect} />
            ) : (
              <BookingForm
                selectedDate={selectedDate!}
                selectedTime={selectedTime}
                selectedTimezone={selectedTimezone}
                onBack={handleBack}
                onSuccess={handleClose}
                language={language}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Reusable Row for the Left Panel Summary
 */
function SummaryRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-4 text-gray-200">
      <div className="flex-shrink-0">{icon}</div>
      <span className="text-xs md:text-sm font-medium tracking-wide">{label}</span>
    </div>
  );
}
