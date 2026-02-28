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
        <div className="w-full flex items-center justify-between px-8 md:px-16 py-4 md:py-5">

          {/* LOGO - Black text with a subtle glow for dark backgrounds */}
          <div
            className="cursor-pointer hover:opacity-70 transition-opacity"
            onClick={onBookingClick}
          >
            <span
              className="
                text-black font-bold
                select-none
                text-sm sm:text-base md:text-lg lg:text-xl
                tracking-[0.2em]
              "
              style={{
                fontFamily: 'Anurati, sans-serif',
                // This drop shadow acts as a glow only visible against dark backgrounds
                filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 2px rgba(255, 255, 255, 1))'
              }}
            >
              HALOVISION AI
            </span>
          </div>

          <div className="flex items-center gap-4 md:gap-6">
            {/* LANGUAGE SWITCHER */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-1 text-black text-sm md:text-base transition-opacity hover:opacity-70 font-medium"
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
                  <div className="absolute top-full right-0 mt-2 bg-white border border-zinc-200 rounded-lg shadow-xl py-2 min-w-[100px] z-50">
                    {(['en', 'de', 'fr'] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          onLanguageChange(lang);
                          setShowLanguageMenu(false);
                        }}
                        className="block w-full px-4 py-2 text-left text-black hover:bg-zinc-100 text-xs font-medium"
                      >
                        {lang.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* CTA BUTTON - Black background, White text */}
            <button
              onClick={onBookingClick}
              className="
                relative bg-black text-white
                px-4 md:px-6 py-2 md:py-3
                rounded-full
                flex items-center gap-2
                text-xs md:text-base
                whitespace-nowrap
                transition-all duration-300
                hover:bg-zinc-800 hover:scale-[1.02]
                active:scale-[0.98]
              "
              style={{
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                fontWeight: '500'
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
