import { useState, useEffect } from 'react';
import { X, Calendar as CalIcon, Clock, Timer, ArrowLeft, Check } from 'lucide-react';
import Calendar from './Calendar';
import BookingForm from './BookingForm';
import { translations, Language } from '../utils/translations';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

type Step = 'calendar' | 'form' | 'confirmation';

export default function BookingModal({ isOpen, onClose, language }: BookingModalProps) {
  const t = translations[language];

  const [step, setStep] = useState<Step>('calendar');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedTimezone, setSelectedTimezone] = useState<string>('UTC+1');
  const [submittedFormData, setSubmittedFormData] = useState<any>(null);

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

  const handleBack = () => {
    if (step === 'confirmation') {
      setStep('form');
    } else if (step === 'form') {
      setStep('calendar');
    }
  };

  const handleFormSubmit = (formData: any) => {
    setSubmittedFormData(formData);
    setStep('confirmation');
  };

  const handleClose = () => {
    setStep('calendar');
    setSelectedDate(null);
    setSelectedTime('');
    setSubmittedFormData(null);
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
        className={`relative w-full max-w-4xl max-h-[85vh] bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 ease-out ${
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

        <div className="flex flex-col md:flex-row h-full max-h-[85vh] overflow-hidden">

          {/* LEFT PANEL: Summary & Branding */}
          <div className="hidden md:flex w-1/3 bg-gradient-to-br from-gray-800 to-gray-900 p-6 flex flex-col overflow-hidden border-r border-white/5">

            {/* Content Section */}
            <div className="flex-shrink-0 pt-4">
              <h2 className="text-lg font-bold text-white mb-2">
                {t.growthMappingCall}
              </h2>
              <p className="text-gray-300 mb-4 text-xs leading-snug">
                {t.growthMappingDesc}
              </p>

              <div className="space-y-1.5 text-gray-300 mb-6 text-xs">
                <p className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold flex-shrink-0 pt-0.5">1.</span>
                  <span className="leading-snug">{t.analysisStep}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold flex-shrink-0 pt-0.5">2.</span>
                  <span className="leading-snug">{t.auditStep}</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="text-purple-400 font-bold flex-shrink-0 pt-0.5">3.</span>
                  <span className="leading-snug">{t.nextSteps}</span>
                </p>
              </div>
            </div>

            {/* Selection Details (Only visible in Calendar step) */}
            {step === 'calendar' && selectedDate && (
              <div className="mt-auto space-y-1.5 pt-4 border-t border-white/10 flex-shrink-0 animate-in fade-in slide-in-from-left-4 duration-500">
                <SummaryRow
                  icon={<CalIcon className="w-3 h-3 text-purple-400" />}
                  label={selectedDate.toLocaleDateString(t.locale, {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                />
                <SummaryRow
                  icon={<Clock className="w-3 h-3 text-purple-400" />}
                  label={selectedTime}
                />
                <SummaryRow
                  icon={<Timer className="w-3 h-3 text-purple-400" />}
                  label={t.duration}
                />
              </div>
            )}

            {/* Footer Note */}
            <p className="text-gray-500 text-[10px] mt-auto pt-4 flex-shrink-0 italic">
              {t.agencyNote}
            </p>
          </div>

          {/* RIGHT PANEL: Dynamic Content (Calendar/Form/Confirmation) */}
          <div className="w-full md:w-2/3 bg-gray-900/50 overflow-y-auto flex-1 custom-scrollbar">
            {step === 'calendar' ? (
              <Calendar onSelectDateTime={handleDateTimeSelect} language={language} />
            ) : step === 'form' ? (
              <BookingForm
                selectedDate={selectedDate!}
                selectedTime={selectedTime}
                selectedTimezone={selectedTimezone}
                onBack={handleBack}
                onFormSubmit={handleFormSubmit}
                language={language}
              />
            ) : (
              <ConfirmationPage
                selectedDate={selectedDate!}
                selectedTime={selectedTime}
                selectedTimezone={selectedTimezone}
                formData={submittedFormData}
                onBack={handleBack}
                onConfirm={handleClose}
                language={language}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-200">
      <div className="flex-shrink-0">{icon}</div>
      <span className="text-[10px] font-medium tracking-wide leading-tight">{label}</span>
    </div>
  );
}

interface ConfirmationPageProps {
  selectedDate: Date;
  selectedTime: string;
  selectedTimezone: string;
  formData: any;
  onBack: () => void;
  onConfirm: () => void;
  language: Language;
}

function ConfirmationPage({
  selectedDate,
  selectedTime,
  selectedTimezone,
  formData,
  onBack,
  onConfirm,
  language,
}: ConfirmationPageProps) {
  const t = translations[language];
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      const fullPhone = `${formData.countryCode}${formData.phone}`;

      const formBody = new URLSearchParams();
      formBody.append('firstName', formData.firstName);
      formBody.append('lastName', formData.lastName);
      formBody.append('email', formData.email);
      formBody.append('countryCode', formData.countryCode);
      formBody.append('phone', formData.phone);
      formBody.append('fullPhone', fullPhone);
      formBody.append('revenueRange', formData.revenueRange);
      formBody.append('website', formData.website);
      formBody.append('businessDescription', formData.businessDescription);
      formBody.append('reason', formData.reason);
      formBody.append('date', formattedDate);
      formBody.append('time', selectedTime);
      formBody.append('timezone', selectedTimezone);

      await fetch('https://n8n.halovisionai.cloud/webhook/halovisionschedule880088', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
        mode: 'no-cors',
      });

      setIsSuccess(true);
      setTimeout(() => {
        onConfirm();
      }, 2000);
    } catch (error) {
      console.error('Booking error:', error);
      alert(t.bookingError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="p-6 md:p-10 bg-black/50 rounded-xl shadow-xl max-w-3xl mx-auto min-h-[400px] flex flex-col items-center justify-center text-center">
        <div className="mb-6 animate-in zoom-in duration-500">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 md:w-10 md:h-10 text-green-400" />
          </div>
        </div>
        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Booking Confirmed!</h3>
        <p className="text-gray-400 text-sm md:text-base">Your audit has been scheduled successfully.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 bg-black/50 rounded-xl shadow-xl max-w-3xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        {t.back}
      </button>

      <div className="mb-8">
        <h3 className="text-xl md:text-2xl font-bold text-white mb-6">Review Your Booking</h3>

        <div className="space-y-4 mb-8">
          <ConfirmationRow label="Date" value={selectedDate.toLocaleDateString(t.locale, {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })} />
          <ConfirmationRow label="Time" value={selectedTime} />
          <ConfirmationRow label="Timezone" value={selectedTimezone} />

          <div className="border-t border-gray-700 pt-4 mt-4">
            <ConfirmationRow label="Name" value={`${formData.firstName} ${formData.lastName}`} />
            <ConfirmationRow label="Email" value={formData.email} />
            <ConfirmationRow label="Phone" value={`${formData.countryCode}${formData.phone}`} />
            <ConfirmationRow label="Revenue" value={formData.revenueRange} />
            <ConfirmationRow label="Website" value={formData.website} />
          </div>

          <div className="border-t border-gray-700 pt-4 mt-4">
            <p className="text-gray-400 text-sm mb-2">Workflows & Bottlenecks:</p>
            <p className="text-gray-300 text-sm bg-gray-800/50 p-3 rounded-lg">{formData.businessDescription}</p>
          </div>

          {formData.reason && (
            <div className="border-t border-gray-700 pt-4 mt-4">
              <p className="text-gray-400 text-sm mb-2">Primary Goal:</p>
              <p className="text-gray-300 text-sm bg-gray-800/50 p-3 rounded-lg">{formData.reason}</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleConfirm}
        disabled={isSubmitting}
        className="w-full flex justify-center items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
      </button>
    </div>
  );
}

function ConfirmationRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start py-2">
      <span className="text-gray-400 text-sm">{label}:</span>
      <span className="text-white text-sm font-medium text-right max-w-xs">{value}</span>
    </div>
  );
}
