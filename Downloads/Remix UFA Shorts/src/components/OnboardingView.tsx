import React, { useState } from 'react';
import { Crown, Coins, Play, ChevronRight } from 'lucide-react';

interface OnboardingViewProps {
  onComplete: () => void;
}

const SLIDES = [
  {
    icon: <Play className="w-14 h-14 text-white fill-white" />,
    bg: 'from-[#003865] to-[#001f3f]',
    accent: '#00a0e9',
    title: 'Willkommen bei UFA Shorts',
    body: 'Erlebe packende Kurzserien direkt auf deinem Handy – jederzeit, überall. Spannende Dramen, Romantik und mehr.',
  },
  {
    icon: <Coins className="w-14 h-14 text-yellow-400" />,
    bg: 'from-yellow-700 to-amber-900',
    accent: '#f59e0b',
    title: 'So funktionieren Coins',
    body: 'Die ersten 3 Episoden jeder Serie sind kostenlos. Weitere Episoden schaltest du mit Coins frei – schnell und einfach.',
  },
  {
    icon: <Crown className="w-14 h-14 text-yellow-400" />,
    bg: 'from-purple-800 to-indigo-900',
    accent: '#a855f7',
    title: 'Werde VIP',
    body: 'Mit VIP genießt du alle Episoden unbegrenzt, ohne Coins ausgeben zu müssen. Exklusiver Inhalt inklusive.',
  },
];

export default function OnboardingView({ onComplete }: OnboardingViewProps) {
  const [slide, setSlide] = useState(0);
  const current = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;

  const next = () => {
    if (isLast) onComplete();
    else setSlide(s => s + 1);
  };

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col bg-gradient-to-b ${current.bg} transition-all duration-500`}
      style={{ animation: 'fade-in 0.4s ease-out' }}
    >
      {/* Skip */}
      <div className="flex justify-end pt-safe-top px-6 pt-4">
        <button
          onClick={onComplete}
          className="text-white/50 text-sm font-semibold hover:text-white/80 transition-colors"
        >
          Überspringen
        </button>
      </div>

      {/* Icon area */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div
          className="w-32 h-32 rounded-3xl flex items-center justify-center mb-10 shadow-2xl border border-white/10"
          style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(12px)' }}
        >
          {current.icon}
        </div>

        <h1 className="text-3xl font-black text-white mb-4 leading-tight">{current.title}</h1>
        <p className="text-white/70 text-base leading-relaxed">{current.body}</p>
      </div>

      {/* Dots + CTA */}
      <div className="px-8 pb-safe pb-12">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setSlide(i)}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === slide ? 24 : 6,
                background: i === slide ? 'white' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95"
          style={{ background: 'white', color: '#111' }}
        >
          {isLast ? 'Jetzt loslegen' : 'Weiter'}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
