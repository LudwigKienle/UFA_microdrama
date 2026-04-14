import React, { useState } from 'react';
import { X, Crown, Check, Zap } from 'lucide-react';

interface VipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onActivate: () => void;
}

const FEATURES = [
  'Alle Episoden unbegrenzt ansehen',
  'Kein Coin-System nötig',
  'Exklusiver VIP-Inhalt',
  'Keine Werbung',
  'Neue Episoden zuerst',
];

export default function VipModal({ isOpen, onClose, onActivate }: VipModalProps) {
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[150] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-md bg-[#111] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl"
        style={{ animation: 'slide-up 0.3s ease-out' }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 bg-gray-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="relative bg-gradient-to-br from-purple-800 via-purple-900 to-indigo-900 px-6 py-8 text-center overflow-hidden">
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #a855f7 0%, transparent 70%)' }}
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="relative">
            <div className="w-16 h-16 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-yellow-400/30">
              <Crown className="w-8 h-8 text-yellow-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-1">UFA Shorts VIP</h2>
            <p className="text-purple-300 text-sm">Grenzenloser Spaß. Null Stress.</p>
          </div>
        </div>

        <div className="px-5 py-5 space-y-5 pb-safe">
          {/* Features */}
          <div className="space-y-2.5">
            {FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-purple-400" />
                </div>
                <span className="text-white text-sm">{f}</span>
              </div>
            ))}
          </div>

          {/* Plan Toggle */}
          <div className="flex gap-3">
            <button
              onClick={() => setPlan('monthly')}
              className={`flex-1 rounded-2xl p-4 border-2 text-left transition-all ${
                plan === 'monthly'
                  ? 'border-purple-500 bg-purple-500/15'
                  : 'border-white/10 bg-gray-900/60'
              }`}
            >
              <p className="text-white font-bold text-sm">Monatlich</p>
              <p className="text-white text-xl font-black mt-0.5">4,99 €</p>
              <p className="text-gray-500 text-xs">/ Monat</p>
            </button>

            <button
              onClick={() => setPlan('yearly')}
              className={`flex-1 rounded-2xl p-4 border-2 text-left transition-all relative overflow-hidden ${
                plan === 'yearly'
                  ? 'border-purple-500 bg-purple-500/15'
                  : 'border-white/10 bg-gray-900/60'
              }`}
            >
              <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[9px] font-black px-2.5 py-1 rounded-bl-xl">
                33% SPAREN
              </div>
              <p className="text-white font-bold text-sm">Jährlich</p>
              <p className="text-white text-xl font-black mt-0.5">39,99 €</p>
              <p className="text-gray-500 text-xs">/ Jahr · 3,33 €/Mo</p>
            </button>
          </div>

          {/* CTA */}
          <button
            onClick={() => { onActivate(); onClose(); }}
            className="w-full py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_24px_rgba(168,85,247,0.4)] active:scale-95 transition-transform"
          >
            <Zap className="w-5 h-5" />
            VIP {plan === 'monthly' ? 'monatlich' : 'jährlich'} aktivieren
          </button>

          <p className="text-center text-xs text-gray-600 px-4">
            Jederzeit kündbar. Durch den Kauf stimmst du unseren{' '}
            <span className="text-gray-400 underline underline-offset-2">AGB</span> zu.
          </p>
        </div>
      </div>
    </div>
  );
}
