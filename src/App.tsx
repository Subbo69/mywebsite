import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import Testimonials from './components/Testimonials';
import WhyUs from './components/WhyUs';
import WorkWithUs from './components/WorkWithUs';
import BookingModal from './components/BookingModal';
import ChatBot from './components/ChatBot';
import GlobalParticles from './components/GlobalParticles'; // Ensure this file exists!

function App() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [chatContext, setChatContext] = useState<string>('');
  const [language, setLanguage] = useState<'en' | 'de' | 'fr'>('en');

  const openChatWithContext = (context: string) => {
    setChatContext(context);
  };

  return (
    // "relative" is required here so children can use "z-index"
    <div className="relative min-h-screen bg-white">
      
      {/* 1. THE BACKGROUND LAYER (Fixed) */}
      <GlobalParticles />

      {/* 2. THE CONTENT LAYER (Sits on top of animation) */}
      <div className="relative z-10">
        <Header
          onBookingClick={() => setIsBookingOpen(true)}
          language={language}
          onLanguageChange={setLanguage}
        />
        
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

      {/* 3. MODALS & UI OVERLAYS */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        language={language}
      />
      
      <ChatBot 
        context={chatContext} 
        onContextUsed={() => setChatContext('')} 
        language={language} 
      />
    </div>
  );
}

export default App;
