import { useState, useEffect } from 'react';
import { X, Calendar as CalIcon, Clock, Timer, ArrowLeft, Check, Globe, ShieldCheck, Mail } from 'lucide-react';
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
  const [selectedTimezone, setSelectedTimezone] = useState<string>(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [submittedFormData, setSubmittedFormData] = useState<any>(null);

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
    } else {
      const timeout = setTimeout(() => setVisible(false), 500);
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
    if (step === 'confirmation') setStep('form');
    else if (step === 'form') setStep('calendar');
  };

  const handleFormSubmit = (formData: any) => {
    setSubmittedFormData({ ...formData });
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
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/90 backdrop-blur-2xl transition-all duration-500 ease-in-out ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div
        className={`relative w-full max-w-[1200px] h-full md:h-[85vh] bg-[#0a0a0c] rounded-[32px] shadow-[0_0_100px_rgba(168,85,247,0.15)] overflow-hidden transform transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) border border-white/10 flex flex-col md:flex-row ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-8'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 md:top-8 md:right-8 z-50 text-white/30 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all duration-300 active:scale-90"
        >
          <X className="w-6 h-6" />
        </button>

        {/* LEFT SIDEBAR - PREMIUM DARK LOOK */}
        <div className="hidden lg:flex w-[380px] bg-[#0d0d0f] p-12 flex-col border-r border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
          
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6 leading-tight tracking-tight">
              {t.growthMappingCall}
            </h2>
            <div className="w-16 h-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mb-8 shadow-[0_0_15px_rgba(168,85,247,0.5)]" />
            <p className="text-gray-400 text-base leading-relaxed font-medium">
              {t.growthMappingDesc}
            </p>
          </div>

          <div className="space-y-10 mb-10">
            <StepIndicator step={1} text={t.analysisStep} active={step === 'calendar'} completed={step !== 'calendar'} />
            <StepIndicator step={2} text={t.auditStep} active={step === 'form'} completed={step === 'confirmation'} />
            <StepIndicator step={3} text={t.nextSteps} active={step === 'confirmation'} />
          </div>

          <div className="mt-auto bg-gradient-to-br from-white/[0.03] to-transparent border border-white/10 rounded-3xl p-8 space-y-5 backdrop-blur-md shadow-2xl">
            <SummaryItem icon={<CalIcon className="w-5 h-5" />} label={selectedDate ? selectedDate.toLocaleDateString(t.locale, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pick a Date'} />
            <SummaryItem icon={<Clock className="w-5 h-5" />} label={selectedTime || 'Pick a Time'} />
            <SummaryItem icon={<Globe className="w-5 h-5" />} label={selectedTimezone} />
            <SummaryItem icon={<Timer className="w-5 h-5" />} label={t.duration} />
          </div>
        </div>

        {/* RIGHT PANEL - CONTENT AREA */}
        <div className="flex-1 overflow-y-auto bg-[#0a0a0c] relative custom-scrollbar">
          <div className="max-w-3xl mx-auto px-8 py-14 md:px-16 md:py-20">
            {step === 'calendar' ? (
              <div className="animate-in fade-in slide-in-from-right-12 duration-700 cubic-bezier(0.16, 1, 0.3, 1)">
                <h3 className="text-4xl font-bold text-white mb-10 tracking-tighter">Select Time</h3>
                <Calendar onSelectDateTime={handleDateTimeSelect} language={language} />
              </div>
            ) : step === 'form' ? (
              <div className="animate-in fade-in slide-in-from-right-12 duration-700 cubic-bezier(0.16, 1, 0.3, 1)">
                 <h3 className="text-4xl font-bold text-white mb-10 tracking-tighter">Your Details</h3>
                <BookingForm
                  selectedDate={selectedDate!}
                  selectedTime={selectedTime}
                  selectedTimezone={selectedTimezone}
                  onBack={handleBack}
                  onFormSubmit={handleFormSubmit}
                  language={language}
                />
              </div>
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

function StepIndicator({ step, text, active, completed }: { step: number; text: string; active?: boolean; completed?: boolean }) {
  return (
    <div className={`flex items-center gap-6 transition-all duration-500 ${active ? 'opacity-100 translate-x-2' : 'opacity-30 translate-x-0'}`}>
      <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-bold transition-all duration-700 ${
        completed ? 'bg-purple-600 border-purple-600 text-white' : 
        active ? 'border-purple-500 text-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.4)]' : 'border-white/20 text-white/20'
      }`}>
        {completed ? <Check className="w-5 h-5 animate-in zoom-in" /> : step}
      </div>
      <span className={`text-base font-bold tracking-tight transition-colors duration-500 ${active ? 'text-white' : 'text-white/20'}`}>{text}</span>
    </div>
  );
}

function SummaryItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-5 text-gray-400 group cursor-default">
      <div className="text-purple-500 transition-colors duration-300 group-hover:text-purple-400">{icon}</div>
      <span className="text-[11px] font-black tracking-[0.15em] uppercase opacity-70 group-hover:opacity-100 transition-opacity">{label}</span>
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
  const [confirmEmail, setConfirmEmail] = useState(formData?.email || '');

  const handleConfirm = async () => {
    if (!confirmEmail) {
      alert("Please provide an email address.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formBody = new URLSearchParams();
      // Append original form data
      Object.keys(formData).forEach(key => formBody.append(key, formData[key]));
      
      // Override with verified email and add appointment details
      formBody.set('email', confirmEmail); 
      formBody.append('fullPhone', `${formData.countryCode}${formData.phone}`);
      formBody.append('date', selectedDate.toISOString().split('T')[0]);
      formBody.append('time', selectedTime);
      formBody.append('timezone', selectedTimezone);

      await fetch('https://n8n.halovisionai.cloud/webhook/halovisionschedule880088', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
        mode: 'no-cors',
      });

      setIsSuccess(true);
      setTimeout(() => onConfirm(), 3500);
    } catch (error) {
      alert(t.bookingError);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-10 animate-in fade-in zoom-in-95 duration-1000">
        <div className="relative mb-12">
          <div className="absolute inset-0 bg-purple-600/30 blur-[40px] rounded-full animate-pulse" />
          <div className="relative w-32 h-32 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/30">
            <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center animate-bounce shadow-[0_0_35px_rgba(168,85,247,0.7)]">
              <Check className="w-10 h-10 text-white" />
            </div>
          </div>
        </div>
        <h3 className="text-5xl font-bold text-white mb-6 tracking-tighter">Confirmed!</h3>
        <p className="text-gray-400 text-xl font-medium mb-8 text-center">Your strategy session is officially locked in.</p>
        
        <div className="bg-[#0f172a]/40 border border-purple-500/30 p-6 rounded-2xl flex items-center gap-5 animate-in slide-in-from-bottom-4 delay-500 duration-700 fill-mode-both">
           <div className="w-12 h-12 bg-purple-600/20 rounded-xl flex items-center justify-center text-purple-400 shadow-inner">
              <Mail className="w-6 h-6" />
           </div>
           <div>
              <p className="text-white font-bold text-sm">Check your inbox</p>
              <p className="text-gray-400 text-xs">A calendar invitation has been sent to {confirmEmail}.</p>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-12 duration-700 ease-out">
      <button onClick={onBack} className="flex items-center gap-3 text-gray-500 hover:text-white mb-10 transition-all duration-300 text-sm font-bold uppercase tracking-widest group">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> {t.back}
      </button>

      <h3 className="text-4xl md:text-5xl font-bold text-white mb-12 tracking-tighter">Review Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-[#0f172a]/40 border border-gray-800 p-8 rounded-2xl space-y-6 hover:border-purple-500/50 transition-all duration-500 group shadow-lg">
          <h4 className="text-xs font-black text-purple-500 uppercase tracking-[0.25em]">Appointment</h4>
          <DetailRow label="Date" value={selectedDate.toLocaleDateString(t.locale, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })} />
          <DetailRow label="Time" value={`${selectedTime} (${selectedTimezone})`} />
        </div>
        <div className="bg-[#0f172a]/40 border border-gray-800 p-8 rounded-2xl space-y-6 hover:border-purple-500/50 transition-all duration-500 group shadow-lg">
          <h4 className="text-xs font-black text-purple-500 uppercase tracking-[0.25em]">Representative</h4>
          <DetailRow label="Name" value={`${formData?.firstName} ${formData?.lastName}`} />
          <div className="mt-4">
            <p className="text-[10px] text-gray-500 font-bold mb-2 uppercase tracking-[0.15em]">Confirm Email Address</p>
            <input 
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              className="w-full bg-[#0a0a0c] border border-gray-800 text-white p-3 rounded-xl focus:border-purple-500 outline-none transition-all text-sm font-medium"
              placeholder="Enter your email"
            />
          </div>
        </div>
      </div>

      <div className="space-y-6 mb-12">
        <div className="bg-[#0f172a]/40 border border-gray-800 p-8 rounded-2xl hover:border-purple-500/50 transition-all duration-500">
          <p className="text-xs uppercase font-black text-gray-500 mb-4 tracking-[0.2em]">Business Context</p>
          <p className="text-gray-300 text-lg leading-relaxed font-medium">{formData?.businessDescription}</p>
        </div>
      </div>

      <div className="flex items-center gap-5 mb-10 text-gray-400 bg-[#0f172a]/20 p-6 rounded-2xl border border-gray-800/50 backdrop-blur-sm">
        <div className="p-3 bg-purple-500/10 rounded-xl">
          <ShieldCheck className="w-6 h-6 text-purple-400" />
        </div>
        <p className="text-sm font-semibold italic opacity-80 leading-snug">
          Secure booking. You will receive a confirmation email immediately after booking.
        </p>
      </div>

      <button
        onClick={handleConfirm}
        disabled={isSubmitting}
        className="group relative w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-6 rounded-2xl font-black text-xl shadow-[0_20px_50px_rgba(168,85,247,0.3)] transition-all duration-500 active:scale-[0.98] disabled:opacity-50 overflow-hidden"
      >
        <div className="relative z-10 flex items-center justify-center gap-3">
          {isSubmitting ? (
            <>
              <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Securing your slot...</span>
            </>
          ) : (
            'Finalize Booking'
          )}
        </div>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </button>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="group/row">
      <p className="text-[10px] text-gray-500 font-bold mb-1 uppercase tracking-[0.15em] group-hover/row:text-purple-400/60 transition-colors">{label}</p>
      <p className="text-white text-xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
