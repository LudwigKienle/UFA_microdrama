import React, { useRef } from 'react';
import { Settings, ChevronRight, History, Bookmark, CreditCard, Bell, HelpCircle, LogOut, Crown, Zap, Star, Camera } from 'lucide-react';
import { User } from '../types';

interface ProfileViewProps {
  user: User;
  onOpenCoinModal: () => void;
  onOpenVipModal: () => void;
  onUpdateAvatar: (url: string) => void;
}

export default function ProfileView({ user, onOpenCoinModal, onOpenVipModal, onUpdateAvatar }: ProfileViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onUpdateAvatar(url);
    // Reset so same file can be picked again
    e.target.value = '';
  };

  return (
    <div className="h-full flex flex-col bg-black overflow-y-auto pb-20 scrollbar-hide">
      {/* Header gradient area */}
      <div className="pt-safe-top px-4 py-6 bg-gradient-to-b from-[#001f3f] via-gray-900/80 to-black">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-black text-white">Profil</h1>
          <button className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full transition-colors active:scale-95">
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <button onClick={handleAvatarClick} className="block">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#00a0e9] to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center overflow-hidden">
                  <img
                    src={user.avatarUrl ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              {/* Camera overlay */}
              <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </button>
            {/* Change photo badge */}
            <button
              onClick={handleAvatarClick}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#00a0e9] rounded-full flex items-center justify-center border-2 border-black active:scale-90 transition-transform"
            >
              <Camera className="w-3 h-3 text-white" />
            </button>
            {/* Online dot */}
            <div className="absolute bottom-4 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          <div>
            <h2 className="text-xl font-black text-white">Gast_18492</h2>
            <p className="text-gray-400 text-sm">{user.isVip ? 'VIP-Mitglied' : 'Kostenloses Konto'}</p>
            {user.isVip && (
              <div className="flex items-center gap-1 mt-1 text-yellow-400">
                <Crown className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">VIP-Mitglied</span>
              </div>
            )}
          </div>
        </div>

        {/* Coins Card (hidden for VIP) */}
        {!user.isVip && (
          <div className="bg-gradient-to-r from-yellow-600/20 to-amber-500/10 border border-yellow-500/25 rounded-2xl p-4 flex items-center justify-between mb-4">
            <div>
              <p className="text-yellow-500/70 text-[10px] font-bold uppercase tracking-widest mb-0.5">Mein Guthaben</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-black text-yellow-400">{user.coins}</span>
                <span className="text-yellow-500/70 text-sm font-medium">Coins</span>
              </div>
            </div>
            <button
              onClick={onOpenCoinModal}
              className="bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-bold py-2.5 px-5 rounded-full text-sm shadow-[0_0_20px_rgba(234,179,8,0.3)] active:scale-95 transition-transform"
            >
              Aufladen
            </button>
          </div>
        )}

        {/* VIP Card or Upgrade Banner */}
        {user.isVip ? (
          <div className="bg-gradient-to-r from-purple-800/40 to-indigo-800/40 rounded-2xl p-4 flex items-center gap-3 border border-purple-500/30">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <Crown className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-white font-black text-sm">Du bist VIP!</p>
              <p className="text-purple-300 text-xs">Alle Episoden unbegrenzt</p>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-[#003865] to-[#00274d] rounded-2xl p-4 flex items-center justify-between border border-[#00a0e9]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">VIP freischalten</p>
                <p className="text-gray-400 text-xs">Unbegrenzt schauen</p>
              </div>
            </div>
            <button
              onClick={onOpenVipModal}
              className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-amber-400 text-black font-bold text-xs px-3 py-2 rounded-full active:scale-95 transition-transform"
            >
              <Zap className="w-3 h-3" />
              Jetzt
            </button>
          </div>
        )}
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900/80 rounded-2xl p-4 flex flex-col items-center border border-white/5">
            <History className="w-5 h-5 text-[#00a0e9] mb-2" />
            <span className="text-white font-black text-xl">{user.unlockedEpisodes?.length ?? 0}</span>
            <span className="text-gray-500 text-[10px] text-center leading-tight mt-0.5">Freige-<br/>schaltet</span>
          </div>
          <div className="bg-gray-900/80 rounded-2xl p-4 flex flex-col items-center border border-white/5">
            <Bookmark className="w-5 h-5 text-purple-400 mb-2" />
            <span className="text-white font-black text-xl">0</span>
            <span className="text-gray-500 text-[10px] text-center leading-tight mt-0.5">Ge-<br/>merkt</span>
          </div>
          <div className="bg-gray-900/80 rounded-2xl p-4 flex flex-col items-center border border-white/5">
            <Star className="w-5 h-5 text-yellow-400 mb-2" />
            <span className="text-white font-black text-xl">2</span>
            <span className="text-gray-500 text-[10px] text-center leading-tight mt-0.5">Level</span>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-gray-900/60 rounded-2xl border border-white/5 overflow-hidden">
          <MenuItem icon={<CreditCard className="w-5 h-5 text-[#00a0e9]" />} title="Zahlungsverlauf" subtitle="Transaktionen einsehen" />
          <MenuItem icon={<Bell className="w-5 h-5 text-purple-400" />} title="Benachrichtigungen" subtitle="Push-Nachrichten verwalten" />
          <MenuItem icon={<HelpCircle className="w-5 h-5 text-green-400" />} title="Hilfe & Support" subtitle="FAQ und Kontakt" />
        </div>

        {/* Logout */}
        <button className="w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center justify-center gap-2 text-red-400 font-bold active:scale-95 transition-transform">
          <LogOut className="w-5 h-5" />
          Abmelden
        </button>

        <p className="text-center text-gray-700 text-xs pb-2">Version 1.0.0 · UFA Shorts</p>
      </div>
    </div>
  );
}

function MenuItem({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <button className="w-full flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/3 active:bg-white/5 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center">
          {icon}
        </div>
        <div className="text-left">
          <span className="text-white font-semibold text-sm block">{title}</span>
          {subtitle && <span className="text-gray-500 text-xs">{subtitle}</span>}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-600" />
    </button>
  );
}
