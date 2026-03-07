import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Database, Brain, Terminal, Cpu, Zap, Search, Wand2 } from 'lucide-react';
import { translations, Language } from '../utils/translations';

// ─── ALL STYLES ────────────────────────────────────────────────────────────────
const allStyles = `
  /* ── Spotlight glow: data-glow system (button only) ── */
  [data-glow]::before,
  [data-glow]::after {
    pointer-events: none;
    content: "";
    position: absolute;
    inset: calc(var(--border-size) * -1);
    border: var(--border-size) solid transparent;
    border-radius: calc(var(--radius) * 1px);
    background-attachment: fixed;
    background-size: calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)));
    background-repeat: no-repeat;
    background-position: 50% 50%;
    mask: linear-gradient(transparent, transparent), linear-gradient(white, white);
    mask-clip: padding-box, border-box;
    mask-composite: intersect;
  }
  [data-glow]::before {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.75) calc(var(--spotlight-size) * 0.75) at
      calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
      hsl(var(--hue, 210) 100% 50% / 0.8), transparent 100%
    );
    filter: brightness(2);
  }
  [data-glow]::after {
    background-image: radial-gradient(
      calc(var(--spotlight-size) * 0.5) calc(var(--spotlight-size) * 0.5) at
      calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px),
      hsl(0 100% 100% / 0.4), transparent 100%
    );
  }
  [data-glow] [data-glow] {
    position: absolute;
    inset: 0;
    will-change: filter;
    opacity: var(--outer, 1);
    border-radius: calc(var(--radius) * 1px);
    filter: blur(calc(var(--border-size) * 10));
    background: none;
    pointer-events: none;
    border: none;
  }
  [data-glow] > [data-glow]::before {
    inset: -10px;
    border-width: 10px;
  }

  /* ── GlowingShadow: rotating hue border for chat window ── */
  @property --hue            { syntax: "<number>"; inherits: true; initial-value: 0; }
  @property --rotate         { syntax: "<number>"; inherits: true; initial-value: 0; }
  @property --bg-y           { syntax: "<number>"; inherits: true; initial-value: 0; }
  @property --bg-x           { syntax: "<number>"; inherits: true; initial-value: 0; }
  @property --glow-translate-y { syntax: "<number>"; inherits: true; initial-value: 0; }
  @property --glow-opacity   { syntax: "<number>"; inherits: true; initial-value: 0; }
  @property --glow-blur      { syntax: "<number>"; inherits: true; initial-value: 0; }
  @property --glow-scale     { syntax: "<number>"; inherits: true; initial-value: 2; }
  @property --glow-radius    { syntax: "<number>"; inherits: true; initial-value: 2; }

  /* Fixed outer shell — pure positioning, no visual styling */
  .chat-window-fixed {
    position: fixed;
    bottom: 6rem;
    right: 1.5rem;
    z-index: 50;
    width: 91.666667%;
    max-width: 24rem;
    height: 420px;
  }
  @media (min-width: 768px) {
    .chat-window-fixed { height: 600px; }
  }

  /* Glow container fills the fixed shell */
  .chat-glow-container {
    --hue-speed: 1;
    --animation-speed: 18s;
    --glow-scale: 1.5;
    --scale-factor: 1;
    --glow-blur: 6;
    --glow-opacity: 1;
    --glow-radius: 100;
    --glow-rotate-unit: 1deg;
    --border-width: 2px;
    --card-radius: 24px;

    width: 100%;
    height: 100%;
    position: relative;
    border-radius: var(--card-radius);
  }

  /* Rotating hue border */
  .chat-glow-container::before {
    content: "";
    display: block;
    position: absolute;
    inset: calc(var(--border-width) * -1);
    border-radius: calc(var(--card-radius) + var(--border-width));
    z-index: -1;
    background: hsl(0deg 0% 16%) radial-gradient(
      30% 30% at calc(var(--bg-x) * 1%) calc(var(--bg-y) * 1%),
      hsl(calc(var(--hue) * var(--hue-speed) * 1deg) 100% 90%) 0%,
      hsl(calc(var(--hue) * var(--hue-speed) * 1deg) 100% 80%) 20%,
      hsl(calc(var(--hue) * var(--hue-speed) * 1deg) 100% 60%) 40%,
      transparent 100%
    );
    animation: chat-hue-animation var(--animation-speed) linear infinite,
               chat-rotate-bg var(--animation-speed) cubic-bezier(0.37, 0, 0.63, 1) infinite;
    pointer-events: none;
  }

  /* Orbiting glow blob */
  .chat-glow-orb {
    display: block;
    position: absolute;
    width: 80px;
    height: 80px;
    animation: chat-rotate var(--animation-speed) cubic-bezier(0.37, 0, 0.63, 1) infinite;
    transform: rotateZ(calc(var(--rotate) * var(--glow-rotate-unit)));
    transform-origin: center;
    border-radius: calc(var(--glow-radius) * 10vw);
    top: 50%;
    left: 50%;
    margin: -40px 0 0 -40px;
    pointer-events: none;
    z-index: -1;
  }
  .chat-glow-orb::after {
    content: "";
    display: block;
    filter: blur(calc(var(--glow-blur) * 10px));
    width: 130%;
    height: 130%;
    left: -15%;
    top: -15%;
    background: hsl(calc(var(--hue) * var(--hue-speed) * 1deg) 100% 60%);
    position: relative;
    border-radius: calc(var(--glow-radius) * 10vw);
    animation: chat-hue-animation var(--animation-speed) linear infinite;
    transform: scaleY(calc(var(--glow-scale) * var(--scale-factor) / 1.1))
               scaleX(calc(var(--glow-scale) * var(--scale-factor) * 1.2))
               translateY(calc(var(--glow-translate-y) * 1%));
    opacity: var(--glow-opacity);
  }

  /* Inner content panel */
  .chat-glow-inner {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.82);
    border-radius: calc(var(--card-radius) - 1px);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  @keyframes chat-rotate-bg {
    0%   { --bg-x: 0;   --bg-y: 0;   }
    25%  { --bg-x: 100; --bg-y: 0;   }
    50%  { --bg-x: 100; --bg-y: 100; }
    75%  { --bg-x: 0;   --bg-y: 100; }
    100% { --bg-x: 0;   --bg-y: 0;   }
  }
  @keyframes chat-rotate {
    from { --rotate: -70;           --glow-translate-y: -65; }
    to   { --rotate: calc(360 - 70); --glow-translate-y: -65; }
  }
  @keyframes chat-hue-animation {
    0%   { --hue: 0;   }
    100% { --hue: 360; }
  }

  /* ── Thinking animation ── */
  @keyframes thinking-bounce {
    0%   { transform: translateY(0px); }
    30%  { transform: translateY(-2px); }
    60%  { transform: translateY(0px); }
    100% { transform: translateY(0px); }
  }

  @keyframes thinking-glow-pulse {
    0%, 100% { 
      filter: drop-shadow(0 0 3px rgba(167,139,250,0.3));
      opacity: 0.5;
    }
    50% { 
      filter: drop-shadow(0 0 7px rgba(167,139,250,0.7));
      opacity: 0.9;
    }
  }

  @keyframes shine-sweep {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  .thinking-text {
    background: linear-gradient(110deg, #383838 30%, #ccc 46%, #e8e8ff 52%, #ccc 58%, #383838 70%);
    background-size: 200% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: shine-sweep 2.8s linear infinite;
  }

  .thinking-icon-bounce {
    animation: thinking-bounce 2.6s ease-in-out 1;
  }

  .thinking-icon-glow {
    animation: thinking-glow-pulse 3s ease-in-out 1;
  }
`;

// ─── TYPING MESSAGE ────────────────────────────────────────────────────────────
function TypingMessage({ content, onComplete, scrollRef }: {
  content: string;
  onComplete?: () => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    if (currentIndex < content.length) {
      const t = setTimeout(() => {
        setDisplayedText(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 9);
      if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      return () => clearTimeout(t);
    } else if (onComplete) onComplete();
  }, [currentIndex, content, onComplete, scrollRef]);
  return <span>{displayedText}</span>;
}

// ─── THINKING LINES ────────────────────────────────────────────────────────────
const THINKING_LINES = {
  en: [
    { icon: 'Database', text: 'Raiding the vault...' },
    { icon: 'Brain', text: 'Rewiring the brain...' },
    { icon: 'Zap', text: 'Charging the answer...' },
    { icon: 'Search', text: 'Hunting for truth...' },
    { icon: 'Cpu', text: 'Burning some cycles...' },
    { icon: 'Wand2', text: 'Pulling strings...' },
    { icon: 'Terminal', text: 'Talking to the machine...' },
    { icon: 'Sparkles', text: 'Distilling genius...' },
    { icon: 'Brain', text: 'Deep in thought...' },
    { icon: 'Database', text: 'Mining the depths...' },
    { icon: 'Zap', text: 'Connecting the dots...' },
    { icon: 'Wand2', text: 'Bending reality slightly...' },
    { icon: 'Cpu', text: 'Crunching it down...' },
    { icon: 'Search', text: 'Sifting the noise...' },
    { icon: 'Terminal', text: 'Asking the void...' },
    { icon: 'Sparkles', text: 'Almost there...' },
    { icon: 'Brain', text: 'Following the thread...' },
    { icon: 'Database', text: 'Draining the reservoir...' },
    { icon: 'Zap', text: 'Sharpening the signal...' },
    { icon: 'Wand2', text: 'Weaving the response...' },
    { icon: 'Cpu', text: 'Trimming the fat...' },
    { icon: 'Search', text: 'Narrowing it down...' },
    { icon: 'Terminal', text: 'Reading between the lines...' },
    { icon: 'Sparkles', text: 'Polishing the thought...' },
    { icon: 'Brain', text: 'Turning it over...' },
    { icon: 'Database', text: 'Cross-referencing...' },
    { icon: 'Zap', text: 'Cutting through the noise...' },
    { icon: 'Wand2', text: 'Conjuring clarity...' },
    { icon: 'Cpu', text: 'Running the numbers...' },
    { icon: 'Search', text: 'Tracing the logic...' },
    { icon: 'Terminal', text: 'Processing in silence...' },
    { icon: 'Sparkles', text: 'Letting it simmer...' },
  ],
  de: [
    { icon: 'Database', text: 'Datenbank plündern...' },
    { icon: 'Brain', text: 'Gehirn überschreiben...' },
    { icon: 'Zap', text: 'Antwort aufladen...' },
    { icon: 'Search', text: 'Wahrheit aufspüren...' },
    { icon: 'Cpu', text: 'Rechenkerne glühen...' },
    { icon: 'Wand2', text: 'Fäden ziehen...' },
    { icon: 'Terminal', text: 'Maschine befragen...' },
    { icon: 'Sparkles', text: 'Wissen destillieren...' },
    { icon: 'Brain', text: 'Tief im Denken...' },
    { icon: 'Database', text: 'Tiefen durchforsten...' },
    { icon: 'Zap', text: 'Punkte verbinden...' },
    { icon: 'Wand2', text: 'Realität verbiegen...' },
    { icon: 'Cpu', text: 'Alles zerkleinern...' },
    { icon: 'Search', text: 'Rauschen filtern...' },
    { icon: 'Terminal', text: 'In Stille verarbeiten...' },
    { icon: 'Sparkles', text: 'Fast geschafft...' },
    { icon: 'Brain', text: 'Dem Faden folgen...' },
    { icon: 'Database', text: 'Speicher anzapfen...' },
    { icon: 'Zap', text: 'Signal schärfen...' },
    { icon: 'Wand2', text: 'Antwort verweben...' },
    { icon: 'Cpu', text: 'Überfluss kürzen...' },
    { icon: 'Search', text: 'Eingrenzen...' },
    { icon: 'Terminal', text: 'Zwischen den Zeilen lesen...' },
    { icon: 'Sparkles', text: 'Gedanken polieren...' },
    { icon: 'Brain', text: 'Nochmal wenden...' },
    { icon: 'Database', text: 'Querverweise prüfen...' },
    { icon: 'Zap', text: 'Lärm durchschneiden...' },
    { icon: 'Wand2', text: 'Klarheit herbeirufen...' },
    { icon: 'Cpu', text: 'Zahlen durchrechnen...' },
    { icon: 'Search', text: 'Logik nachspüren...' },
    { icon: 'Terminal', text: 'In Stille verarbeiten...' },
    { icon: 'Sparkles', text: 'Köcheln lassen...' },
  ],
  fr: [
    { icon: 'Database', text: 'Pillage en cours...' },
    { icon: 'Brain', text: 'Recâblage du cerveau...' },
    { icon: 'Zap', text: 'Charge de la réponse...' },
    { icon: 'Search', text: 'Chasse à la vérité...' },
    { icon: 'Cpu', text: 'Cycles en combustion...' },
    { icon: 'Wand2', text: 'Tirage des ficelles...' },
    { icon: 'Terminal', text: 'Dialogue avec la machine...' },
    { icon: 'Sparkles', text: 'Distillation du génie...' },
    { icon: 'Brain', text: 'Dans les profondeurs...' },
    { icon: 'Database', text: 'Fouille des abysses...' },
    { icon: 'Zap', text: 'Connexion des points...' },
    { icon: 'Wand2', text: 'Légère torsion du réel...' },
    { icon: 'Cpu', text: 'Réduction en cours...' },
    { icon: 'Search', text: 'Filtrage du bruit...' },
    { icon: 'Terminal', text: 'Interrogation du vide...' },
    { icon: 'Sparkles', text: 'Presque là...' },
    { icon: 'Brain', text: 'Suivre le fil...' },
    { icon: 'Database', text: 'Vidange du réservoir...' },
    { icon: 'Zap', text: 'Affûtage du signal...' },
    { icon: 'Wand2', text: 'Tissage de la réponse...' },
    { icon: 'Cpu', text: 'Élagage du superflu...' },
    { icon: 'Search', text: 'Resserrement du focus...' },
    { icon: 'Terminal', text: 'Lecture entre les lignes...' },
    { icon: 'Sparkles', text: 'Polissage de la pensée...' },
    { icon: 'Brain', text: 'Retournement en cours...' },
    { icon: 'Database', text: 'Recoupement des sources...' },
    { icon: 'Zap', text: 'Traversée du bruit...' },
    { icon: 'Wand2', text: 'Invocation de la clarté...' },
    { icon: 'Cpu', text: 'Calcul en silence...' },
    { icon: 'Search', text: 'Traçage de la logique...' },
    { icon: 'Terminal', text: 'Traitement silencieux...' },
    { icon: 'Sparkles', text: 'Laisser mijoter...' },
  ],
};

const ICON_MAP: Record<string, React.ReactNode> = {
  Terminal: <Terminal className="w-3.5 h-3.5" />,
  Brain: <Brain className="w-3.5 h-3.5" />,
  Database: <Database className="w-3.5 h-3.5" />,
  Sparkles: <Sparkles className="w-3.5 h-3.5" />,
  Cpu: <Cpu className="w-3.5 h-3.5" />,
  Zap: <Zap className="w-3.5 h-3.5" />,
  Search: <Search className="w-3.5 h-3.5" />,
  Wand2: <Wand2 className="w-3.5 h-3.5" />,
};

// ─── THINKING PROCESS ─────────────────────────────────────────────────────────
function ThinkingProcess({ language }: { language: Language }) {
  const lines = THINKING_LINES[language] || THINKING_LINES.en;

  const [lineIndex, setLineIndex] = useState(() => Math.floor(Math.random() * lines.length));
  const [displayedText, setDisplayedText] = useState('');
  const [phase, setPhase] = useState<'typing' | 'pause' | 'deleting'>('typing');
  const [isBouncing, setIsBouncing] = useState(false);
  const charIndexRef = useRef(0);
  const cycleCountRef = useRef(0);

  const currentLine = lines[lineIndex];
  const fullText = currentLine.text;

  useEffect(() => {
    charIndexRef.current = 0;
    setDisplayedText('');
    setPhase('typing');
    setIsBouncing(false);
  }, [lineIndex]);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    if (phase === 'typing') {
      if (charIndexRef.current < fullText.length) {
        t = setTimeout(() => {
          charIndexRef.current += 1;
          setDisplayedText(fullText.slice(0, charIndexRef.current));
        }, 48);
      } else {
        cycleCountRef.current += 1;
        // Bounce only every 5th cycle — rare and calm
        if (cycleCountRef.current % 5 === 0) {
          setIsBouncing(true);
          t = setTimeout(() => { setIsBouncing(false); setPhase('pause'); }, 2600);
        } else {
          setPhase('pause');
        }
      }
    } else if (phase === 'pause') {
      t = setTimeout(() => setPhase('deleting'), 3200);
    } else {
      if (charIndexRef.current > 0) {
        t = setTimeout(() => {
          charIndexRef.current -= 1;
          setDisplayedText(fullText.slice(0, charIndexRef.current));
        }, 28);
      } else {
        t = setTimeout(() => {
          setLineIndex(prev => {
            let next = Math.floor(Math.random() * lines.length);
            while (next === prev && lines.length > 1) next = Math.floor(Math.random() * lines.length);
            return next;
          });
        }, 300);
      }
    }
    return () => clearTimeout(t);
  }, [phase, displayedText, fullText, lines.length]);

  return (
    <div className="flex items-center gap-2.5 py-1.5 px-2 h-7">
      {/* Icon with bounce + glow when done typing */}
      <span
        className={`transition-all duration-200 ${isBouncing ? 'thinking-icon-bounce thinking-icon-glow' : ''}`}
        style={{
          color: isBouncing ? '#a78bfa' : 'rgba(255,255,255,0.45)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {ICON_MAP[currentLine.icon] || <Sparkles className="w-3.5 h-3.5" />}
      </span>

      {/* Shining typewriter text — no cursor line */}
      <span
        className="thinking-text text-[11px] font-semibold uppercase tracking-[0.18em] whitespace-nowrap min-w-[200px]"
      >
        {displayedText}
      </span>
    </div>
  );
}

// ─── GLOW BUTTON WRAPPER ───────────────────────────────────────────────────────
function GlowButtonWrapper({ children, opacity }: { children: React.ReactNode; opacity: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  useEffect(() => {
    let t = 0;
    const tick = () => {
      t += 0.006; // slower: was 0.0108, now 0.006 (~44% slower)
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const r = Math.max(rect.width, rect.height) * 0.9;
      el.style.setProperty('--x', (cx + Math.cos(t) * r).toFixed(2));
      el.style.setProperty('--y', (cy + Math.sin(t) * r).toFixed(2));
      el.style.setProperty('--xp', ((cx + Math.cos(t) * r) / window.innerWidth).toFixed(2));
      el.style.setProperty('--yp', ((cy + Math.sin(t) * r) / window.innerHeight).toFixed(2));
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, []);
  return (
    <div
      ref={ref}
      data-glow
      style={{
        '--base': 190, '--spread': 160, '--radius': '999', '--border': '2',
        '--backup-border': 'rgba(255,255,255,0.15)', '--size': '220', '--outer': '1',
        '--border-size': 'calc(var(--border, 2) * 1px)',
        '--spotlight-size': 'calc(var(--size, 150) * 1px)',
        '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
        backgroundImage: `radial-gradient(var(--spotlight-size) var(--spotlight-size) at calc(var(--x,0)*1px) calc(var(--y,0)*1px), hsl(var(--hue,210) 100% 70% / 0.08), transparent)`,
        backgroundAttachment: 'fixed',
        border: 'var(--border-size) solid var(--backup-border)',
        borderRadius: '9999px',
        display: 'inline-flex',
        position: 'relative',
        touchAction: 'none',
        opacity,
      } as React.CSSProperties}
    >
      <div data-glow style={{ position: 'absolute', inset: 0, borderRadius: '9999px' }} />
      {children}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
interface ChatBotProps {
  context: string;
  onContextUsed: () => void;
  language: Language;
}

export default function ChatBot({ context, onContextUsed, language }: ChatBotProps) {
  const t = translations[language];

  const [isOpen, setIsOpen] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);
  const [isVisible] = useState(true);
  const [buttonBrightness, setButtonBrightness] = useState(0);
  const [isHoveringBtn, setIsHoveringBtn] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string; isNew?: boolean }>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [longMessagesSent, setLongMessagesSent] = useState(0);
  const [limitWarning, setLimitWarning] = useState<string | null>(null);
  const [pendingMsg, setPendingMsg] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const chatRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check(); window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  useEffect(() => {
    if (messages.length === 0) setMessages([{ role: 'assistant', content: t.chatGreeting, isNew: false }]);
  }, [language, t.chatGreeting]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    setRecommendations([]); setLimitWarning(null);
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    if (text.length > 500) setLongMessagesSent(prev => prev + 1);
    setIsLoading(true);
    try {
      const history = [...messagesRef.current, { role: 'user', content: text }].slice(-10);
      const response = await fetch('https://n8n.halovisionai.cloud/webhook/halovisionchatbot997655', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, language }),
      });
      const data = await response.json();
      let msg = data?.response || data?.message || data?.output || data?.text || t.bookingError || 'No response.';
      const clean = msg.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').replace(/#+/g, '').replace(/[`>]/g, '').trim();
      setMessages(prev => [...prev, { role: 'assistant', content: clean, isNew: true }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error connecting to service.', isNew: true }]);
    } finally { setIsLoading(false); }
  };

  const submitInput = () => { if (input.trim()) { handleSendMessage(input); setInput(''); } };

  useEffect(() => {
    if (context) {
      openChat();
      const validCategories = ['general', 'lead-generation', 'custom-solutions', 'save-time', 'examples'];
      if (validCategories.includes(context)) {
        const recs = t.chatRecommendations?.[context as keyof typeof t.chatRecommendations] || t.chatRecommendations?.general || [];
        setRecommendations(recs);
      } else setPendingMsg(context);
      onContextUsed();
    }
  }, [context, onContextUsed, t.chatRecommendations]);

  useEffect(() => {
    if (pendingMsg && isOpen) {
      const timer = setTimeout(() => { handleSendMessage(pendingMsg); setPendingMsg(null); }, 500);
      return () => clearTimeout(timer);
    }
  }, [pendingMsg, isOpen]);

  useEffect(() => { if (isOpen) setTimeout(() => inputRef.current?.focus(), 100); }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (chatRef.current && !chatRef.current.contains(e.target as Node)) closeChat();
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const runFadeAnimation = () => {
    let startTime: number | null = null;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / 2000, 1);
      setButtonBrightness(p < 0.5 ? p * 2 : (1 - p) * 2);
      if (p < 1) requestAnimationFrame(animate); else setButtonBrightness(0);
    };
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    timersRef.current.forEach(t => clearTimeout(t)); timersRef.current = [];
    if (isVisible && !isOpen) {
      [27000, 207000, 507000].forEach(d => timersRef.current.push(setTimeout(runFadeAnimation, d)));
      timersRef.current.push(setInterval(runFadeAnimation, 300000) as any);
    }
    return () => timersRef.current.forEach(t => clearTimeout(t));
  }, [isVisible, isOpen]);

  const openChat = () => { setIsOpen(true); setTimeout(() => setAnimateOpen(true), 10); };
  const closeChat = () => { setAnimateOpen(false); setTimeout(() => setIsOpen(false), 300); };
  const toggleChat = () => (isOpen ? closeChat() : openChat());

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    setLimitWarning(value.length > (longMessagesSent < 2 ? 2000 : 500) ? 'Message too long' : null);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 80) + 'px';
    }
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: allStyles }} />
      <link href="https://fonts.cdnfonts.com/css/anurati" rel="stylesheet" />

      {/* ── TOGGLE BUTTON ── */}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 50 }}>
        <GlowButtonWrapper opacity={buttonBrightness > 0 ? 0.7 + buttonBrightness * 0.3 : 1}>
          <button
            onClick={toggleChat}
            onMouseEnter={() => setIsHoveringBtn(true)}
            onMouseLeave={() => setIsHoveringBtn(false)}
            className={`flex items-center gap-2 rounded-full px-4 py-3 font-bold text-white bg-black/80 backdrop-blur-md transition-all duration-300 ${isHoveringBtn ? 'scale-110' : 'scale-100'}`}
            style={{ border: 'none', outline: 'none' }}
          >
            <MessageSquare className={`w-6 h-6 transition-all duration-300 ${isHoveringBtn ? 'rotate-12 scale-110' : ''}`} />
            <span className={`uppercase tracking-widest text-xs transition-all duration-300 ${isHoveringBtn ? 'tracking-[0.25em]' : ''}`}>
              {t.askHaloAI || 'Ask Halo AI'}
            </span>
          </button>
        </GlowButtonWrapper>
      </div>

      {/* ── CHAT WINDOW ── */}
      {isOpen && (
        <div
          className={`chat-window-fixed transform transition-all duration-300 ease-out ${animateOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        >
          <div className="chat-glow-container">
            <span className="chat-glow-orb" />

            <div className="chat-glow-inner" ref={chatRef}>
              {/* Header */}
              <div className="text-white p-5 flex items-center justify-between flex-shrink-0">
                <div>
                  <div className="font-bold select-none" style={{ fontFamily: 'Anurati, sans-serif', fontSize: '1rem', letterSpacing: '0.15em' }}>
                    HALOVISION AI
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">{t.chatSub}</div>
                </div>
                <button onClick={closeChat} className="hover:bg-white/10 p-2 rounded-full transition-colors text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div ref={scrollAreaRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide scroll-smooth">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium transition-all ${
                      message.role === 'user' ? 'bg-white text-black' : 'bg-white/10 text-white border border-white/20'
                    }`}>
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
                      ) : message.content}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <ThinkingProcess language={language} />
                  </div>
                )}

                {recommendations.length > 0 && !isLoading && (
                  <div className="flex flex-col gap-2 pt-2 animate-in fade-in slide-in-from-bottom-2">
                    <div className="text-[10px] font-black uppercase text-white/30 text-center">{t.suggestions}</div>
                    {recommendations.slice(0, isMobile ? 2 : recommendations.length).map((rec, i) => (
                      <button key={i} onClick={() => handleSendMessage(rec)}
                        className="bg-white/10 text-white border border-white/20 p-3 rounded-xl hover:bg-white hover:text-black transition-all text-left text-xs font-bold">
                        {rec}
                      </button>
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} className="h-2" />
              </div>

              {/* Input */}
              <div className="p-4 bg-transparent flex flex-col gap-2 flex-shrink-0">
                {limitWarning && <div className="text-[10px] text-red-400 font-bold uppercase animate-pulse">{limitWarning}</div>}
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitInput(); } }}
                    rows={1}
                    placeholder={t.chatInputPlaceholder}
                    className="flex-1 px-4 py-2 rounded-xl border border-white/20 focus:ring-1 focus:ring-white/40 bg-white/10 text-white placeholder:text-white/30 resize-none text-sm font-bold"
                  />
                  <button onClick={submitInput} disabled={isLoading || !input.trim() || !!limitWarning}
                    className="bg-black text-white p-2.5 rounded-xl hover:scale-105 transition-transform disabled:opacity-30 disabled:hover:scale-100 border border-white/20">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
