import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Database, Brain, Terminal } from 'lucide-react';
import { translations, Language } from '../utils/translations';

// --- SNAPPY TYPING ANIMATION COMPONENT WITH AUTO-SCROLL ---
function TypingMessage({ content, onComplete, scrollRef }: { 
  content: string; 
  onComplete?: () => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < content.length) {
      // 9ms is roughly 40% faster than the previous 15ms speed
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + content[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 9);

      // Keep the scroll synchronized with the growing text
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
      
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, content, onComplete, scrollRef]);

  return <span>{displayedText}</span>;
}

// --- CLEAN & MINIMALIST THINKING COMPONENT ---
function ThinkingProcess({ language }: { language: Language }) {
  const [step, setStep] = useState(0);
  
  const steps = [
    { icon: <Terminal className="w-3 h-3" />, en: "Initializing...", de: "Initialisierung...", fr: "Initialisation..." },
    { icon: <Brain className="w-3 h-3" />, en: "Analyzing intent...", de: "Absicht analysieren...", fr: "Analyse de l'intention..." },
    { icon: <Database className="w-3 h-3" />, en: "Scanning knowledge base...", de: "Datenbank scannen...", fr: "Scan de la base de connaissances..." },
    { icon: <Sparkles className="w-3 h-3" />, en: "Formulating response...", de: "Antwort formulieren...", fr: "Formulation de la réponse..." },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1200); 
    return () => clearInterval(interval);
  }, [steps.length]);

  return (
    <div className="flex flex-col gap-1 py-1 px-2 max-w-full animate-in fade-in duration-700">
      {steps.slice(0, step + 1).map((s, i) => (
        <div 
          key={i} 
          className="flex items-center gap-2.5 h-4 animate-in slide-in-from-left-2 duration-500"
        >
          <span className={i === step ? "text-black/60 scale-90" : "text-black/10"}>
            {s.icon}
          </span>
          
          <span className={`
            text-[9px] font-light uppercase tracking-[0.2em] whitespace-nowrap
            ${i === step 
              ? "text-transparent bg-clip-text bg-gradient-to-r from-black via-zinc-400 to-black bg-[length:200%_100%] animate-[textGlow_2s_linear_infinite]" 
              : "text-black/10"}
          `}>
            {language === 'de' ? s.de : language === 'fr' ? s.fr : s.en}
          </span>

          {i === step && (
            <div className="w-0.5 h-0.5 rounded-full bg-black/20 animate-pulse ml-2" />
          )}
        </div>
      ))}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes textGlow {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}} />
    </div>
  );
}

interface ChatBotProps {
  context: string;
  onContextUsed: () => void;
  language: Language;
}

export default function ChatBot({ context, onContextUsed, language }: ChatBotProps) {
  const t = translations[language];

  const [isOpen, setIsOpen] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [buttonBrightness, setButtonBrightness] = useState(0);

  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; isNew?: boolean }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [longMessagesSent, setLongMessagesSent] = useState(0);
  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  const [pendingMsg, setPendingMsg] = useState<string | null>(null);

  const chatRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ role: 'assistant', content: t.chatGreeting, isNew: false }]);
    }
  }, [language, t.chatGreeting]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setRecommendations([]);
    setLimitWarning(null);
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    if (text.length > 500) setLongMessagesSent(prev => prev + 1);
    setIsLoading(true);

    try {
      const history = [...messagesRef.current, { role: 'user', content: text }].slice(-10);
      const response = await fetch('https://n8n.halovisionai.cloud/webhook/halovisionchatbot997655', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, language }),
      });
      
      const data = await response.json();
      let assistantMessage = data?.response || data?.message || data?.output || data?.text || t.bookingError || 'No response.';
      
      const cleanMessage = assistantMessage
        .replace(/<[^>]*>/g, '')
        .replace(/\*\*/g, '')
        .replace(/#+/g, '')
        .replace(/[`>]/g, '')
        .trim();
      
      setMessages(prev => [...prev, { role: 'assistant', content: cleanMessage, isNew: true }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to service.", isNew: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const submitInput = () => {
    if (input.trim()) {
      handleSendMessage(input);
      setInput('');
    }
  };

  useEffect(() => {
    if (context) {
      openChat();
      const validCategories = ['general', 'lead-generation', 'custom-solutions', 'save-time', 'examples'];
      if (validCategories.includes(context)) {
        const recs = t.chatRecommendations?.[context as keyof typeof t.chatRecommendations] || t.chatRecommendations?.general || [];
        setRecommendations(recs);
      } else {
        setPendingMsg(context);
      }
      onContextUsed();
    }
  }, [context, onContextUsed, t.chatRecommendations]);

  useEffect(() => {
    if (pendingMsg && isOpen) {
      const timer = setTimeout(() => {
        handleSendMessage(pendingMsg);
        setPendingMsg(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pendingMsg, isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (chatRef.current && !chatRef.current.contains(e.target as Node) && !buttonRef.current?.contains(e.target as Node)) {
        closeChat();
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const runFadeAnimation = () => {
    let startTime: number | null = null;
    const duration = 2000;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const brightness = progress < 0.5 ? progress * 2 : (1 - progress) * 2;
      setButtonBrightness(brightness);
      if (progress < 1) requestAnimationFrame(animate);
      else setButtonBrightness(0);
    };
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
    if (isVisible && !isOpen) {
      const schedule = [27000, 207000, 507000];
      schedule.forEach(delay => {
        timersRef.current.push(setTimeout(() => runFadeAnimation(), delay));
      });
      const interval = setInterval(() => runFadeAnimation(), 300000);
      timersRef.current.push(interval as any);
    }
    return () => timersRef.current.forEach(timer => clearTimeout(timer));
  }, [isVisible, isOpen]);

  const openChat = () => {
    setIsOpen(true);
    setTimeout(() => setAnimateOpen(true), 10);
  };

  const closeChat = () => {
    setAnimateOpen(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  const toggleChat = () => (isOpen ? closeChat() : openChat());

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    const limit = longMessagesSent < 2 ? 2000 : 500;
    setLimitWarning(value.length > limit ? "Message too long" : null);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 80) + 'px';
    }
  };

  return (
    <>
      <link href="https://fonts.cdnfonts.com/css/anurati" rel="stylesheet" />

      {/* Toggle Button */}
      <button
        ref={buttonRef}
        onClick={toggleChat}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 rounded-full
                   px-4 py-3 border border-black transition-all hover:scale-110 font-bold text-black 
                   shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none bg-white/40 backdrop-blur-md"
        style={{ backgroundColor: `rgba(255, 255, 255, ${buttonBrightness > 0 ? 0.9 : 0.4})` }}
      >
        <MessageSquare className="w-6 h-6" />
        <span className="uppercase tracking-widest text-xs">{t.askHaloAI || 'Ask Halo AI'}</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatRef}
          className={`fixed bottom-24 left-6 z-50 w-11/12 max-w-[24rem]
          h-[500px] md:h-[600px] flex flex-col backdrop-blur-2xl bg-white/60 border-2 border-black rounded-3xl
          shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden transform transition-all duration-300 ease-out
          ${animateOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        >
          {/* Header */}
          <div className="bg-black text-white p-5 flex items-center justify-between">
            <div>
              <div className="font-bold select-none" style={{ fontFamily: 'Anurati, sans-serif', fontSize: '1rem', letterSpacing: '0.15em' }}>
                HALOVISION AI
              </div>
              <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">{t.chatSub}</div>
            </div>
            <button onClick={closeChat} className="hover:bg-white/20 p-2 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div 
            ref={scrollAreaRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide scroll-smooth"
          >
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium transition-all ${
                    message.role === 'user'
                      ? 'bg-black text-white shadow-md'
                      : 'bg-white/20 text-black border border-black shadow-sm'
                  }`}
                >
                  {message.role === 'assistant' && message.isNew ? (
                    <TypingMessage 
                      content={message.content} 
                      scrollRef={scrollAreaRef}
                      onComplete={() => {
                        const newMsgs = [...messages];
                        newMsgs[index].isNew = false;
                        setMessages(newMsgs);
                        scrollToBottom();
                      }} 
                    />
                  ) : (
                    message.content
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <ThinkingProcess language={language} />
              </div>
            )}

            {/* Recommendations Section */}
            {recommendations.length > 0 && !isLoading && (
              <div className="flex flex-col gap-2 pt-2 animate-in fade-in slide-in-from-bottom-2">
                <div className="text-[10px] font-black uppercase text-black/40 text-center">{t.suggestions}</div>
                {recommendations.slice(0, 3).map((rec, index) => (
                  <button key={index} onClick={() => handleSendMessage(rec)}
                    className="bg-white/40 text-black border border-black p-3 rounded-xl hover:bg-black hover:text-white transition-all text-left text-xs font-bold"
                  >
                    {rec}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} className="h-2" />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white/20 border-t border-black flex flex-col gap-2">
            {limitWarning && (
              <div className="text-[10px] text-red-500 font-bold uppercase animate-pulse">
                {limitWarning}
              </div>
            )}
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => { 
                  if (e.key === 'Enter' && !e.shiftKey) { 
                    e.preventDefault(); 
                    submitInput(); 
                  } 
                }}
                rows={1}
                placeholder={t.chatInputPlaceholder}
                className="flex-1 px-4 py-2 rounded-xl border border-black focus:ring-1 focus:ring-black bg-white/50 text-black placeholder:text-black/40 resize-none text-sm font-bold"
              />
              <button onClick={submitInput} disabled={isLoading || !input.trim() || !!limitWarning}
                className="bg-black text-white p-2.5 rounded-xl hover:scale-105 transition-transform disabled:opacity-30 disabled:hover:scale-100"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
