import { Users, Zap, ChevronDown } from 'lucide-react';
import { translations, Language } from '../utils/translations';
import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// ─── RevealText: letters slide up on scroll + wave on hover ──────────────────
function RevealText({ text, className = '' }: { text: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      className={`inline-flex flex-wrap overflow-visible ${className}`}
      aria-label={text}
      whileHover="hover"
      initial="rest"
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ willChange: 'transform' }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
          transition={{ duration: 0.45, delay: i * 0.028, ease: [0.16, 1, 0.3, 1] }}
          variants={{
            rest: { y: 0 },
            hover: {
              y: -6,
              transition: { type: 'spring', stiffness: 400, damping: 18, delay: i * 0.025 },
            },
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.div>
  );
}

function WaveText({
  text,
  className = '',
}: {
  text: string;
  className?: string;
}) {
  return (
    <motion.span
      className={`inline-flex flex-wrap ${className}`}
      style={{ overflow: 'visible' }}
      whileHover="hover"
      initial="rest"
    >
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          style={{ willChange: 'transform' }}
          variants={{
            rest: { y: 0 },
            hover: {
              y: -5,
              transition: { type: 'spring', stiffness: 400, damping: 18, delay: i * 0.025 },
            },
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </motion.span>
  );
}

const glowHsl: Record<string, string> = {
  cyan:   '190 100% 60%',
  purple: '270 100% 65%',
  green:  '145  90% 55%',
  amber:  ' 38 100% 55%',
  white:  '  0   0% 95%',
};
type GlowColor = keyof typeof glowHsl;
const glowPalette: GlowColor[] = ['cyan', 'purple', 'green', 'amber', 'white'];

function GlowCard({
  children,
  className = '',
  glowColor = 'cyan',
  onClick,
  registerRef,
}: {
  children: React.ReactNode;
  className?: string;
  glowColor?: GlowColor;
  onClick?: () => void;
  registerRef?: (el: HTMLDivElement | null) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const color = glowHsl[glowColor] ?? glowHsl.cyan;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--gc-color', color);
    registerRef?.(el);
    return () => registerRef?.(null);
  }, [color, registerRef]);

  return (
    <div
      ref={ref}
      className={`gc-wrap relative ${className}`}
      style={{ background: '#111111' }}
      onClick={onClick}
    >
      <div className="gc-fill" />
      <div className="gc-border" />
      <div className="gc-content">{children}</div>
    </div>
  );
}

// ─── LOGO SOURCES ─────────────────────────────────────────────────────────────
// Sentinels for inline SVGs: '__globe__', '__mail__', '__claude__', '__notion__', '__slack__'
// jsDelivr is more reliable than cdn.simpleicons.org for some icons
const CDN = (slug: string) => `https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/${slug}.svg`;

const ICONS_ROW1 = [
  { name: 'OpenAI',         url: '__openai__' },
  { name: 'Claude',         url: '__claude__' },
  { name: 'Gemini',         url: '__gemini__' },
  { name: 'Slack',          url: '__slack__' },
  { name: 'Notion',         url: '__notion__' },
  { name: 'LinkedIn',       url: '__linkedin__' },
  { name: 'n8n',            url: '__n8n__' },
  { name: 'Mail',           url: '__mail__' },
  { name: 'Google Sheets',  url: '__sheets__' },
  { name: 'Excel',          url: CDN('microsoftexcel') },
  { name: 'Your Website',   url: '__globe__' },
];
const ICONS_ROW2 = [
  { name: 'Google Drive',   url: CDN('googledrive') },
  { name: 'Outlook',        url: CDN('microsoftoutlook') },
  { name: 'Instagram',      url: CDN('instagram') },
  { name: 'Facebook',       url: CDN('facebook') },
  { name: 'Twitter/X',      url: CDN('x') },
  { name: 'WhatsApp',       url: CDN('whatsapp') },
  { name: 'HubSpot',        url: CDN('hubspot') },
  { name: 'Shopify',        url: CDN('shopify') },
  { name: 'Stripe',         url: CDN('stripe') },
];

const repeatedIcons = (icons: { name: string; url: string }[], repeat = 6) =>
  Array.from({ length: repeat }).flatMap(() => icons);

// ── All inline SVGs — verified paths, zero CDN dependency ────────────────────

const MailSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white"
    style={{ width: 26, height: 26, opacity: 0.85, position: 'relative', zIndex: 1 }}>
    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
  </svg>
);

const GlobeSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white"
    style={{ width: 26, height: 26, opacity: 0.85, position: 'relative', zIndex: 1 }}>
    <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z"/>
  </svg>
);

// Anthropic/Claude — verified Bootstrap Icons path
const ClaudeSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white"
    style={{ width: 26, height: 26, opacity: 0.85, position: 'relative', zIndex: 1 }}>
    <path fillRule="evenodd" d="M9.218 2h2.402L16 12.987h-2.402zM4.379 2h2.512l4.38 10.987H8.82l-.895-2.308h-4.58l-.896 2.307H0L4.38 2.001zm2.755 6.64L5.635 4.777 4.137 8.64z"/>
  </svg>
);

// OpenAI — verified Bootstrap Icons path
const OpenAISVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white"
    style={{ width: 26, height: 26, opacity: 0.85, position: 'relative', zIndex: 1 }}>
    <path d="M14.949 6.547a3.94 3.94 0 0 0-.348-3.273 4.11 4.11 0 0 0-4.4-1.934A4.1 4.1 0 0 0 8.423.2 4.15 4.15 0 0 0 6.305.086a4.1 4.1 0 0 0-1.891.948 4.04 4.04 0 0 0-1.158 1.753 4.1 4.1 0 0 0-1.563.679A4 4 0 0 0 .554 4.72a3.99 3.99 0 0 0 .502 4.731 3.94 3.94 0 0 0 .346 3.274 4.11 4.11 0 0 0 4.402 1.933c.382.425.852.764 1.377.995.526.231 1.095.35 1.67.346 1.78.002 3.358-1.132 3.901-2.804a4.1 4.1 0 0 0 1.563-.68 4 4 0 0 0 1.14-1.253 3.99 3.99 0 0 0-.506-4.716m-6.097 8.406a3.05 3.05 0 0 1-1.945-.694l.096-.054 3.23-1.838a.53.53 0 0 0 .265-.455v-4.49l1.366.778q.02.011.025.035v3.722c-.003 1.653-1.361 2.992-3.037 2.996m-6.53-2.75a2.95 2.95 0 0 1-.36-2.01l.095.057L5.29 12.09a.53.53 0 0 0 .527 0l3.949-2.246v1.555a.05.05 0 0 1-.022.041L6.473 13.3c-1.454.826-3.311.335-4.15-1.098m-.85-6.94A3.02 3.02 0 0 1 3.07 3.949v3.785a.51.51 0 0 0 .262.451l3.93 2.237-1.366.779a.05.05 0 0 1-.047 0L2.575 6.768a2.95 2.95 0 0 1-1.103-2.455m11.024 3.816-3.93-2.253 1.366-.779a.05.05 0 0 1 .048 0l3.328 1.887a2.96 2.96 0 0 1-.457 5.337v-3.837a.51.51 0 0 0-.355-.355m1.36-2.012-.096-.057-3.228-1.904a.53.53 0 0 0-.528 0L6.655 7.349V5.794a.05.05 0 0 1 .02-.042l3.32-1.88a3.07 3.07 0 0 1 4.555 3.183zm-8.516 2.78-1.366-.779a.05.05 0 0 1-.025-.036V5.31a3.07 3.07 0 0 1 5.028-2.37l-.096.054-3.226 1.837a.53.53 0 0 0-.266.455zm.742-1.595 1.757-1.002 1.757 1v2l-1.757 1.002-1.757-1z"/>
  </svg>
);

// LinkedIn — verified Bootstrap Icons path
const LinkedInSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white"
    style={{ width: 26, height: 26, opacity: 0.85, position: 'relative', zIndex: 1 }}>
    <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/>
  </svg>
);

// Google Sheets — spreadsheet grid (Bootstrap Icons)
const SheetsSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="white"
    style={{ width: 26, height: 26, opacity: 0.85, position: 'relative', zIndex: 1 }}>
    <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v4h10V2a1 1 0 0 0-1-1zm9 6h-3v2h3zm0 3h-3v2h3zm0 3h-3v2h2a1 1 0 0 0 1-1zm-4 2v-2H6v2zm-4 0v-2H3v1a1 1 0 0 0 1 1zm-2-3h2v-2H3zm0-3h2V7H3zm3-2v2h3V7zm3 3H6v2h3z"/>
  </svg>
);

// n8n — the official double-slash wordmark
const N8nSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"
    style={{ width: 26, height: 26, opacity: 0.85, position: 'relative', zIndex: 1 }}>
    <path d="M8.5 3 3 21h3.5l5.5-18zm7 0-5.5 18H13.5l5.5-18z"/>
  </svg>
);

// Notion — verified simple-icons path
const NotionSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"
    style={{ width: 26, height: 26, opacity: 0.85, position: 'relative', zIndex: 1 }}>
    <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.887l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
  </svg>
);

// Slack — verified simple-icons path
const SlackSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"
    style={{ width: 26, height: 26, opacity: 0.85, position: 'relative', zIndex: 1 }}>
    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zm1.271 0a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zm0 1.271a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zm10.122 2.521a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zm-1.268 0a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zm-2.523 10.122a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zm0-1.268a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z"/>
  </svg>
);

// Gemini — four-point sparkle star
const GeminiSVG = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"
    style={{ width: 26, height: 26, opacity: 0.85, position: 'relative', zIndex: 1 }}>
    <path d="M12 2c0 0 1.5 6.5 5 10c-3.5 3.5-5 10-5 10s-1.5-6.5-5-10c3.5-3.5 5-10 5-10z"/>
    <path d="M2 12c0 0 6.5-1.5 10-5c3.5 3.5 10 5 10 5s-6.5 1.5-10 5c-3.5-3.5-10-5-10-5z"/>
  </svg>
);

function LogoBubble({ src, name, registerRef }: { src: string; name: string; registerRef?: (el: HTMLDivElement | null) => void }) {
  const [errored, setErrored] = useState(false);
  const isGlobe    = src === '__globe__';
  const isMail     = src === '__mail__';
  const isClaude   = src === '__claude__';
  const isOpenAI   = src === '__openai__';
  const isNotion   = src === '__notion__';
  const isSlack    = src === '__slack__';
  const isGemini   = src === '__gemini__';
  const isLinkedIn = src === '__linkedin__';
  const isSheets   = src === '__sheets__';
  const isN8n      = src === '__n8n__';
  const isInline   = isGlobe || isMail || isClaude || isOpenAI || isNotion || isSlack || isGemini || isLinkedIn || isSheets || isN8n;

  return (
    <div
      ref={(el) => registerRef?.(el)}
      className="logo-bubble h-14 w-14 flex-shrink-0 rounded-full flex items-center justify-center"
      style={{ background: '#000000', position: 'relative', '--lx': '-9999px', '--ly': '-9999px' } as React.CSSProperties}
      title={name}
    >
      <div className="logo-bubble-border" />
      {isInline ? (
        <>
          {isGlobe    && <GlobeSVG />}
          {isMail     && <MailSVG />}
          {isClaude   && <ClaudeSVG />}
          {isOpenAI   && <OpenAISVG />}
          {isNotion   && <NotionSVG />}
          {isSlack    && <SlackSVG />}
          {isGemini   && <GeminiSVG />}
          {isLinkedIn && <LinkedInSVG />}
          {isSheets   && <SheetsSVG />}
          {isN8n      && <N8nSVG />}
        </>
      ) : !errored ? (
        <img
          src={src}
          alt={name}
          className="h-7 w-7 object-contain"
          style={{ position: 'relative', zIndex: 1, opacity: 0.85, filter: 'brightness(0) invert(1)' }}
          onError={() => setErrored(true)}
        />
      ) : (
        <span style={{ position: 'relative', zIndex: 1, fontSize: 9, color: 'rgba(255,255,255,0.6)', textAlign: 'center', lineHeight: 1.1, padding: '0 4px' }}>
          {name}
        </span>
      )}
    </div>
  );
}

function LogoCarousel({
  icons,
  direction = 1,
  registerRef,
}: {
  icons: { name: string; url: string }[];
  direction?: number;
  registerRef?: (el: HTMLDivElement | null) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0);
  const velRef = useRef(0);
  const scrollVelRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const lastScrollY = useRef(0);
  const lastScrollTime = useRef(Date.now());

  const items = repeatedIcons(icons, 6);
  const ITEM_WIDTH = 96;
  const HALF = (items.length / 2) * ITEM_WIDTH;

  useEffect(() => {
    const handleScroll = () => {
      const now = Date.now();
      const dt = Math.max(now - lastScrollTime.current, 1);
      const dy = window.scrollY - lastScrollY.current;
      scrollVelRef.current = (dy / dt) * 16.67 * direction * 0.9;
      lastScrollY.current = window.scrollY;
      lastScrollTime.current = now;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [direction]);

  useEffect(() => {
    const BASE_DRIFT = 0.08 * direction;
    const tick = () => {
      velRef.current += (scrollVelRef.current - velRef.current) * 0.025;
      scrollVelRef.current *= 0.94;
      posRef.current -= velRef.current + BASE_DRIFT;
      if (posRef.current <= -HALF) posRef.current += HALF;
      if (posRef.current > 0) posRef.current -= HALF;
      const skew = Math.max(-5, Math.min(5, velRef.current * 0.35));
      const scaleY = 1 - Math.min(0.04, Math.abs(velRef.current) * 0.0025);
      if (trackRef.current) {
        trackRef.current.style.transform =
          `translateX(${posRef.current.toFixed(2)}px) skewX(${skew.toFixed(2)}deg) scaleY(${scaleY.toFixed(4)})`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [direction, HALF]);

  return (
    <div className="overflow-hidden">
      <div
        ref={trackRef}
        className="flex gap-10 whitespace-nowrap"
        style={{ transformOrigin: 'center center', willChange: 'transform' }}
      >
        {items.map((icon, i) => (
          <LogoBubble key={i} src={icon.url} name={icon.name} registerRef={registerRef} />
        ))}
      </div>
    </div>
  );
}

interface WhyUsProps {
  language: Language;
}

export default function WhyUs({ language }: WhyUsProps) {
  const t = translations[language];
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [visibleItems, setVisibleItems] = useState<boolean[]>(new Array(5).fill(false));
  const [founderVisible, setFounderVisible] = useState(false);
  const [logosVisible, setLogosVisible] = useState(false);

  const sectionRef      = useRef<HTMLElement>(null);
  const itemRefs        = useRef<(HTMLDivElement | null)[]>([]);
  const founderRef      = useRef<HTMLDivElement | null>(null);
  const logosRef        = useRef<HTMLDivElement | null>(null);

  const allCardEls = useRef<Set<HTMLDivElement>>(new Set());
  const registerCard = (el: HTMLDivElement | null) => {
    if (el) allCardEls.current.add(el);
  };

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const onMove = (e: PointerEvent) => {
      allCardEls.current.forEach((el) => {
        if (!el.isConnected) { allCardEls.current.delete(el); return; }
        const cr = el.getBoundingClientRect();
        el.style.setProperty('--lx', `${(e.clientX - cr.left).toFixed(1)}px`);
        el.style.setProperty('--ly', `${(e.clientY - cr.top).toFixed(1)}px`);
      });
    };

    section.addEventListener('pointermove', onMove as EventListener, { passive: true });
    return () => {
      section.removeEventListener('pointermove', onMove as EventListener);
    };
  }, []);

  const toggleReason = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    itemRefs.current.forEach((ref, index) => {
      if (!ref) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisibleItems((prev) => {
                const updated = [...prev];
                updated[index] = true;
                return updated;
              });
            }, index * 120);
            observer.disconnect();
          }
        },
        { threshold: 0.15 }
      );
      observer.observe(ref);
      observers.push(observer);
    });

    if (founderRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) { setFounderVisible(true); observer.disconnect(); }
        },
        { threshold: 0.15 }
      );
      observer.observe(founderRef.current);
      observers.push(observer);
    }

    if (logosRef.current) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) { setLogosVisible(true); observer.disconnect(); }
        },
        { threshold: 0.05 }
      );
      observer.observe(logosRef.current);
      observers.push(observer);
    }

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return (
    <section ref={sectionRef} className="relative py-12 md:py-16 text-white overflow-hidden" style={{ background: 'transparent' }}>
      <style>{`
        .gc-wrap {
          isolation: isolate;
          --lx: -9999px;
          --ly: -9999px;
        }
        .gc-border {
          position: absolute; inset: 0;
          border-radius: inherit;
          pointer-events: none; z-index: 1;
          border: 1px solid rgba(255,255,255,0.14);
        }
        .gc-border::after {
          content: '';
          position: absolute; inset: -1px;
          border-radius: inherit;
          padding: 1px;
          background: radial-gradient(
            400px 400px at var(--lx) var(--ly),
            hsl(var(--gc-color) / 0.9),
            transparent 60%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
        .gc-fill {
          position: absolute; inset: 0;
          border-radius: inherit;
          pointer-events: none; z-index: 0;
          background: radial-gradient(
            340px 340px at var(--lx) var(--ly),
            hsl(var(--gc-color) / 0.07),
            transparent 70%
          );
        }
        .gc-content {
          position: relative; z-index: 2;
          height: 100%; display: flex; flex-direction: column;
        }

        @keyframes slideInLeft {
          0%   { opacity: 0; transform: translateX(-52px); }
          30%  { opacity: 0.6; }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          0%   { opacity: 0; transform: translateX(72px); }
          30%  { opacity: 0.6; }
          100% { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .wu-animate-left  { animation: slideInLeft  0.85s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .wu-animate-right { animation: slideInRight 1.0s  cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .wu-pre-left  { opacity: 0; transform: translateX(-52px); }
        .wu-pre-right { opacity: 0; transform: translateX(72px); }
        .logos-in  { animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .logos-out { opacity: 0; transform: translateY(20px); }

        .carousel-masked {
          -webkit-mask-image: linear-gradient(
            to right, transparent 0%, black 16%, black 84%, transparent 100%
          );
          mask-image: linear-gradient(
            to right, transparent 0%, black 16%, black 84%, transparent 100%
          );
        }

        .logo-bubble {
          --lx: -9999px;
          --ly: -9999px;
        }
        .logo-bubble-border {
          position: absolute; inset: 0;
          border-radius: 50%;
          pointer-events: none;
          border: 1px solid rgba(255,255,255,0.16);
          z-index: 1;
        }
        .logo-bubble-border::after {
          content: '';
          position: absolute; inset: -1px;
          border-radius: 50%;
          padding: 1px;
          background: radial-gradient(
            280px 280px at var(--lx) var(--ly),
            rgba(180, 180, 255, 0.9),
            transparent 55%
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
        }
      `}</style>

      {/* ── Vertical black fade overlay ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* ── Left: Accordion reasons ── */}
          <div className="space-y-4">
            <RevealText
              text={t.whyUsTitle}
              className="text-3xl md:text-4xl font-black mb-6 tracking-tight text-white"
            />

            <div className="space-y-3">
              {t.reasons.slice(0, 5).map((reason, index) => {
                const isExpanded = expandedIndex === index;
                const isVisible  = visibleItems[index];

                return (
                  <div
                    key={index}
                    ref={(el) => { itemRefs.current[index] = el; }}
                    className={isVisible ? 'wu-animate-left' : 'wu-pre-left'}
                  >
                    <GlowCard
                      glowColor={glowPalette[index % glowPalette.length]}
                      onClick={() => toggleReason(index)}
                      registerRef={registerCard}
                      className={`
                        rounded-xl cursor-pointer md:cursor-default
                        transition-all duration-300
                        ${isExpanded ? 'translate-y-0.5 translate-x-0.5' : ''}
                      `}
                    >
                      <div className="px-5 py-3">
                        <div className="flex items-start gap-4">
                          <div className="w-6 h-6 rounded-full bg-white/15 border border-white/30 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-base md:text-lg font-bold leading-tight text-white">
                                <WaveText text={reason} />
                              </p>
                              <ChevronDown
                                className={`w-5 h-5 text-white/50 transition-transform duration-300 md:hidden ${isExpanded ? 'rotate-180' : ''}`}
                              />
                            </div>

                            <div className={`
                              overflow-hidden transition-all duration-300
                              ${isExpanded
                                ? 'max-h-40 opacity-100 mt-2'
                                : 'max-h-0 opacity-0 md:max-h-40 md:opacity-100 md:mt-2'}
                            `}>
                              <p className="text-white/70 text-sm leading-relaxed">
                                <WaveText text={t.reasonsDesc[index]} />
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </GlowCard>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Right: Founder block ── */}
          <div
            ref={founderRef}
            className={`lg:sticky lg:top-24 ${founderVisible ? 'wu-animate-right' : 'wu-pre-right'}`}
          >
            <GlowCard glowColor="purple" className="rounded-[2rem]" registerRef={registerCard}>
              <div className="p-6 md:p-8">

                <div className="flex items-center gap-5 mb-6">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/25 flex-shrink-0">
                    <img
                      src="https://i.postimg.cc/sDfZC0mH/Screenshot-20260102-094201-(1)-(1)-(1)-(1).png"
                      alt="Founder"
                      className="w-full h-full object-cover"
                      style={{ transform: 'scale(1.2)', objectPosition: 'center 41%' }}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-4 h-4 text-white/55" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                        Human-Centric AI
                      </span>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black text-white leading-none">
                      <WaveText text={t.customBuilt} />
                    </h3>
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-white/78 text-sm md:text-base leading-relaxed font-medium">
                    <WaveText text={t.customBuiltDesc} />
                  </p>

                  <div className="pt-4 border-t border-white/15 flex items-center gap-3 text-white/90 font-black uppercase tracking-wider text-xs">
                    <Zap className="w-4 h-4 fill-white/90" />
                    <WaveText text={t.rapidDeployment} />
                  </div>
                </div>

              </div>
            </GlowCard>
          </div>

        </div>

        {/* ── Integrations logo carousel ── */}
        <div
          ref={logosRef}
          className={`mt-14 ${logosVisible ? 'logos-in' : 'logos-out'}`}
        >
          <div className="flex items-center gap-3 mb-5 px-1">
            <span className="text-sm font-black tracking-[0.18em] uppercase text-white/50 whitespace-nowrap">
              <WaveText text={t.integrationsLabel} />
            </span>
            <span className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          <div className="carousel-masked flex flex-col gap-3.5">
            <LogoCarousel icons={ICONS_ROW1} direction={1} registerRef={registerCard} />
            <LogoCarousel icons={ICONS_ROW2} direction={-1} registerRef={registerCard} />
          </div>
        </div>

      </div>
    </section>
  );
}
