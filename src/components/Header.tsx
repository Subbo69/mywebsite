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

  return (
    <>
      <link href="https://fonts.cdnfonts.com/css/anurati" rel="stylesheet" />

      <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        {/* Full-width container */}
        <div className="w-full flex items-center justify-between px-8 md:px-16 py-4 md:py-5">

          {/* LOGO */}
          <div
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={onBookingClick}
          >
            <span
              className="
                text-white font-bold
                select-none
                text-xl sm:text-2xl md:text-3xl lg:text-4xl
                tracking-[0.2em]
              "
              style={{
                fontFamily: 'Anurati, sans-serif',
                textShadow: '0 2px 12px rgba(0,0,0,0.55)',
              }}
            >
              HALOVISION AI
            </span>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-4 md:gap-6">

            {/* LANGUAGE SELECTOR */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-1 text-white text-sm md:text-base transition-opacity hover:opacity-80"
                style={{
                  textShadow: '0 1px 8px rgba(0,0,0,0.6)',
                }}
              >
                <span>{language.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showLanguageMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowLanguageMenu(false)}
                  />
                  <div className="absolute top-full right-0 mt-2 bg-black/80 backdrop-blur-md rounded-lg shadow-xl py-2 min-w-[100px] z-50">
                    {(['en', 'de', 'fr'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          onLanguageChange(lang);
                          setShowLanguageMenu(false);
                        }}
                        className="block w-full px-3 py-2 text-left text-white hover:bg-white/10 text-xs"
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* CTA BUTTON */}
            <button
              onClick={onBookingClick}
              className="
                relative text-white
                px-4 md:px-6 py-2 md:py-3
                rounded-full
                flex items-center gap-2
                text-xs md:text-base
                whitespace-nowrap
                transition-all duration-300
                hover:bg-white hover:text-black
              "
              style={{
                border: '1px solid rgba(255,255,255,0.65)',
                boxShadow:
                  '0 2px 6px rgba(0,0,0,0.35)',
              }}
            >
              <span
                style={{
                  textShadow: '0 1px 6px rgba(0,0,0,0.55)',
                }}
              >
                {t.letsTalk}
              </span>
              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 drop-shadow" />
            </button>

          </div>
        </div>
      </header>
    </>
  );
}
