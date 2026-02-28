import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import WhyUs from './components/WhyUs';
import WorkWithUs from './components/WorkWithUs';
import BookingModal from './components/BookingModal';
import ChatBot from './components/ChatBot';
import GlobalParticles from './components/GlobalParticles'; // Import here

function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [chatContext, setChatContext] = useState<string>('');
  const [language, setLanguage] = useState<'en' | 'de' | 'fr'>('en');

  const openChatWithContext = (context: string) => {
    setChatContext(context);
  };

  return (
    <div className="relative min-h-screen">
      {/* 1. This sits fixed in the background of the whole site */}
      <GlobalParticles />

      {/* 2. All content must be z-10 to sit on top of the canvas */}
      <div className="relative z-10">
        <Header
          onBookingClick={() => setIsBookingOpen(true)}
          language={language}
          onLanguageChange={setLanguage}
        />
        
        {/* IMPORTANT: Ensure these components do not have solid bg-white classes inside them */}
        <Hero
          onBookingClick={() => setIsBookingOpen(true)}
          onAskAIClick={() => openChatWithContext('general')}
          language={language}
        />
        <Services
          onAskAIClick={(context: string) => openChatWithContext(context)}
          language={language}
        />
        <Testimonials />
        <WhyUs language={language} />
        <WorkWithUs
          onBookingClick={() => setIsBookingOpen(true)}
          language={language}
        />
      </div>

      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        language={language}
      />
      <ChatBot context={chatContext} onContextUsed={() => setChatContext('')} language={language} />
    </div>
  );
}

export default App;
