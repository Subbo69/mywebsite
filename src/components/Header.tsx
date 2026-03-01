import { useState } from 'react';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { translations, Language } from '../utils/translations';

interface HeaderProps {
  onBookingClick: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export default function Header({ onBookingClick, language, onLanguageChange }: HeaderProps) {
  const t = translations[language];
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  // Hard Shadow Style for text (Language Switcher)
  const hardShadowText = {
    color: 'black',
    textShadow: '2px 2px 0px #fff', // Hard white "shadow" for legibility
    fontWeight: '700'
  };

  return (
    <>
      <link href="https://fonts.cdnfonts.com/css/anurati" rel="stylesheet" />

      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent pointer-events-none">
        <div className="w-full flex items-center justify-between px-4 md:px-16 py-4 md:py-5">

          {/* LOGO - Neo-Brutalist Box Style - ONLY Black Shadow */}
          <div
            className="cursor-pointer hover:translate-y-[-2px] transition-transform pointer-events-auto"
            onClick={onBookingClick}
          >
            <div 
              className="bg-white border-[1.5px] border-black px-3 py-1.5 md:px-4 md:py-2 rounded-[12px] md:rounded-[14px]"
              style={{
                /* Single Hard Black Shadow as per updated request */
                boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
              }}
            >
              <span
                className="
                  text-black font-bold select-none 
                  text-[10px] sm:text-xs md:text-lg 
                  tracking-[0.15em] md:tracking-[0.2em]
                  whitespace-nowrap
                "
                style={{ fontFamily: 'Anurati, sans-serif' }}
              >
                HALOVISION AI
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-6 pointer-events-auto">
            
            {/* LANGUAGE SWITCHER - Normal Font */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-1 text-xs md:text-base transition-opacity hover:opacity-70 font-bold font-sans"
                style={hardShadowText}
              >
                <span>{language.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
              </button>

              {showLanguageMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowLanguageMenu(false)} />
                  <div className="absolute top-full right-0 mt-2 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] py-2 min-w-[80px] md:min-w-[100px] z-50 rounded-xl">
                    {(['en', 'de', 'fr'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          onLanguageChange(lang);
                          setShowLanguageMenu(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-black hover:bg-zinc-100 text-[10px] md:text-xs font-bold"
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* CTA BUTTON - Classic Style with Glow */}
            <button
              onClick={onBookingClick}
              className="
                relative bg-black text-white
                px-3 md:px-7 py-2 md:py-3
                rounded-full
                flex items-center gap-2
                text-[10px] md:text-base
                whitespace-nowrap
                transition-all duration-300
                hover:bg-zinc-800 hover:scale-[1.02]
                active:scale-[0.98]
              "
              style={{
                /* Subtle glow and soft shadow for classic look */
                boxShadow: '0 0 15px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3)',
                fontWeight: '600'
              }}
            >
              <span>
                {t.letsTalk}
              </span>
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
