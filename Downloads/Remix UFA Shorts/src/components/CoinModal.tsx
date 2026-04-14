import React from 'react';
import { X, Coins, Zap, Shield } from 'lucide-react';

interface CoinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuy: (amount: number) => void;
}

const PACKAGES = [
  { id: '1', coins: 100, bonus: 0, price: '0,99 €', icon: '🪙' },
  { id: '2', coins: 500, bonus: 50, price: '4,99 €', popular: true, icon: '💰' },
  { id: '3', coins: 1000, bonus: 150, price: '9,99 €', bestValue: true, icon: '💎' },
  { id: '4', coins: 5000, bonus: 1000, price: '49,99 €', icon: '👑' },
];

export default function CoinModal({ isOpen, onClose, onBuy }: CoinModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-[#111] rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-4 flex items-center justify-between border-b border-white/5">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Coins className="w-6 h-6 text-yellow-400" />
              Coins aufladen
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">Mehr Coins, mehr Episoden</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/8 text-gray-400 hover:text-white hover:bg-white/12 transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Packages */}
        <div className="p-4 space-y-2.5 pb-safe">
          {PACKAGES.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => {
                onBuy(pkg.coins + pkg.bonus);
                onClose();
              }}
              className={`w-full relative rounded-2xl p-4 flex items-center justify-between border-2 transition-all active:scale-[0.98] ${
                pkg.popular
                  ? 'bg-[#003865]/40 border-[#00a0e9]/60 shadow-[0_0_16px_rgba(0,160,233,0.2)]'
                  : pkg.bestValue
                  ? 'bg-green-900/20 border-green-500/40'
                  : 'bg-gray-900/60 border-white/8 hover:border-white/16'
              }`}
            >
              {/* Label badges */}
              {pkg.popular && (
                <div className="absolute -top-px right-4 bg-gradient-to-r from-[#003865] to-[#00a0e9] text-white text-[9px] font-black px-3 py-1 rounded-b-lg tracking-wider">
                  BELIEBTESTES
                </div>
              )}
              {pkg.bestValue && (
                <div className="absolute -top-px right-4 bg-gradient-to-r from-green-700 to-emerald-500 text-white text-[9px] font-black px-3 py-1 rounded-b-lg tracking-wider">
                  BESTES ANGEBOT
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                  pkg.popular ? 'bg-[#00a0e9]/20' : pkg.bestValue ? 'bg-green-500/15' : 'bg-yellow-500/10'
                }`}>
                  {pkg.icon}
                </div>
                <div className="text-left">
                  <div className="flex items-baseline gap-2">
                    <span className="text-white font-black text-xl">{pkg.coins.toLocaleString('de-DE')}</span>
                    {pkg.bonus > 0 && (
                      <span className="text-green-400 text-xs font-bold bg-green-400/10 border border-green-400/20 px-1.5 py-0.5 rounded-full">
                        +{pkg.bonus}
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500 text-xs">
                    {pkg.bonus > 0 ? `${pkg.coins + pkg.bonus} Coins gesamt` : 'Coins'}
                  </span>
                </div>
              </div>

              <div className={`font-black px-4 py-2.5 rounded-xl text-sm transition-colors ${
                pkg.popular
                  ? 'bg-[#00a0e9] text-white'
                  : pkg.bestValue
                  ? 'bg-green-500 text-white'
                  : 'bg-white/10 text-white hover:bg-white/15'
              }`}>
                {pkg.price}
              </div>
            </button>
          ))}

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-4 pt-2 pb-1">
            <div className="flex items-center gap-1 text-gray-600 text-xs">
              <Shield className="w-3.5 h-3.5" />
              <span>Sicher & verschlüsselt</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600 text-xs">
              <Zap className="w-3.5 h-3.5" />
              <span>Sofort verfügbar</span>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600 px-4">
            Durch den Kauf stimmst du unseren{' '}
            <span className="text-gray-400 underline underline-offset-2">Nutzungsbedingungen</span> zu.
          </p>
        </div>
      </div>
    </div>
  );
}
