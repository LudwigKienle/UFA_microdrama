import React, { useState, useEffect } from 'react';
import HomeView from './components/HomeView';
import PlayerView from './components/PlayerView';
import CoinModal from './components/CoinModal';
import VipModal from './components/VipModal';
import OnboardingView from './components/OnboardingView';
import DiscoverView from './components/DiscoverView';
import ProfileView from './components/ProfileView';
import { MOCK_SHOWS } from './data';
import { Show, User, Episode } from './types';
import { Home, Compass, User as UserIcon, ListVideo, Play, Bookmark, Wifi, WifiOff } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedShow, setSelectedShow] = useState<Show | null>(null);
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [watchlist, setWatchlist] = useState<Show[]>([]);
  const [watchProgress, setWatchProgress] = useState<Record<string, number>>({});
  const [userRatings, setUserRatings] = useState<Record<string, number>>({});
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [hasSeenOnboarding] = useState(() => localStorage.getItem('ufaShortsOnboarding') === 'done');
  const [showOnboarding, setShowOnboarding] = useState(!hasSeenOnboarding);

  const [user, setUser] = useState<User>({
    coins: 50,
    unlockedEpisodes: [],
    isVip: false,
    avatarUrl: null,
  });

  // ── Online / Offline detection ────────────────────────────────────────────
  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleUnlock = (episode: Episode) => {
    if (user.coins >= episode.coinCost) {
      setUser(prev => ({
        ...prev,
        coins: prev.coins - episode.coinCost,
        unlockedEpisodes: [...(prev.unlockedEpisodes ?? []), episode.id],
      }));
    }
  };

  const handleBuyCoins = (amount: number) => {
    setUser(prev => ({ ...prev, coins: prev.coins + amount }));
  };

  const handleActivateVip = () => {
    setUser(prev => ({ ...prev, isVip: true }));
  };

  const toggleWatchlist = (show: Show) => {
    setWatchlist(prev =>
      prev.some(s => s.id === show.id) ? prev.filter(s => s.id !== show.id) : [...prev, show]
    );
  };

  const isInWatchlist = (show: Show) => watchlist.some(s => s.id === show.id);

  const handleWatchProgress = (showId: string, episodeIndex: number) => {
    setWatchProgress(prev => ({ ...prev, [showId]: episodeIndex }));
  };

  const handleRate = (showId: string, rating: number) => {
    setUserRatings(prev => ({ ...prev, [showId]: rating }));
  };

  const handleCompleteOnboarding = () => {
    localStorage.setItem('ufaShortsOnboarding', 'done');
    setShowOnboarding(false);
  };

  const handleUpdateAvatar = (url: string) => {
    setUser(prev => ({ ...prev, avatarUrl: url }));
  };

  return (
    <div className="h-screen w-full bg-black text-white overflow-hidden font-sans flex flex-col">
      {/* ── Onboarding ── */}
      {showOnboarding && <OnboardingView onComplete={handleCompleteOnboarding} />}

      {/* ── Offline Banner ── */}
      {!isOnline && (
        <div className="fixed top-0 inset-x-0 z-[300] flex items-center justify-center gap-2 bg-red-600/95 backdrop-blur-sm py-2 text-white text-sm font-bold pt-safe-top"
          style={{ animation: 'fade-in 0.3s ease-out' }}>
          <WifiOff className="w-4 h-4" />
          Keine Internetverbindung
        </div>
      )}

      {selectedShow ? (
        <PlayerView
          show={selectedShow}
          initialEpisodeIndex={watchProgress[selectedShow.id] ?? 0}
          userCoins={user.coins}
          unlockedEpisodes={user.unlockedEpisodes ?? []}
          isVip={user.isVip ?? false}
          isBookmarked={isInWatchlist(selectedShow)}
          userRating={userRatings[selectedShow.id] ?? 0}
          onBack={() => setSelectedShow(null)}
          onUnlock={handleUnlock}
          onOpenCoinModal={() => setIsCoinModalOpen(true)}
          onOpenVipModal={() => setIsVipModalOpen(true)}
          onToggleWatchlist={() => toggleWatchlist(selectedShow)}
          onWatchProgress={(idx) => handleWatchProgress(selectedShow.id, idx)}
          onRate={(rating) => handleRate(selectedShow.id, rating)}
        />
      ) : (
        <>
          <div className="flex-1 overflow-hidden">
            {activeTab === 'home' && (
              <HomeView
                shows={MOCK_SHOWS}
                onSelectShow={setSelectedShow}
                watchProgress={watchProgress}
                userRatings={userRatings}
                onOpenVipModal={() => setIsVipModalOpen(true)}
              />
            )}
            {activeTab === 'discover' && <DiscoverView onSelectShow={setSelectedShow} />}
            {activeTab === 'profile' && (
              <ProfileView
                user={user}
                onOpenCoinModal={() => setIsCoinModalOpen(true)}
                onOpenVipModal={() => setIsVipModalOpen(true)}
                onUpdateAvatar={handleUpdateAvatar}
              />
            )}
            {activeTab === 'list' && (
              <WatchlistView
                watchlist={watchlist}
                watchProgress={watchProgress}
                onSelectShow={setSelectedShow}
                onRemove={toggleWatchlist}
              />
            )}
          </div>

          {/* Bottom Tab Bar */}
          <div className="bg-[#0a0a0a] border-t border-white/5 pb-safe pt-1 px-2 flex justify-around items-center z-40">
            {[
              { id: 'home',     icon: Home,      label: 'Home' },
              { id: 'discover', icon: Compass,   label: 'Entdecken' },
              { id: 'list',     icon: ListVideo, label: 'Meine Liste', badge: watchlist.length },
              { id: 'profile',  icon: UserIcon,  label: 'Profil' },
            ].map(({ id, icon: Icon, label, badge }) => {
              const isActive = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className="flex flex-col items-center py-2 px-4 relative transition-all duration-200"
                >
                  {isActive && <span className="absolute inset-0 rounded-xl bg-[#003865]/20" />}
                  <div className="relative">
                    <Icon className={`w-6 h-6 mb-0.5 transition-all duration-200 ${isActive ? 'text-[#00a0e9] drop-shadow-[0_0_8px_rgba(0,160,233,0.7)]' : 'text-gray-500'}`} />
                    {badge != null && badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#00a0e9] rounded-full flex items-center justify-center text-[9px] font-black text-white">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-semibold transition-colors duration-200 ${isActive ? 'text-[#00a0e9]' : 'text-gray-600'}`}>
                    {label}
                  </span>
                  {isActive && <span className="absolute -top-px left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#00a0e9] rounded-full" />}
                </button>
              );
            })}
          </div>
        </>
      )}

      <CoinModal isOpen={isCoinModalOpen} onClose={() => setIsCoinModalOpen(false)} onBuy={handleBuyCoins} />
      <VipModal isOpen={isVipModalOpen} onClose={() => setIsVipModalOpen(false)} onActivate={handleActivateVip} />
    </div>
  );
}

// ── Watchlist Tab ─────────────────────────────────────────────────────────────
function WatchlistView({
  watchlist, watchProgress, onSelectShow, onRemove,
}: {
  watchlist: Show[];
  watchProgress: Record<string, number>;
  onSelectShow: (show: Show) => void;
  onRemove: (show: Show) => void;
}) {
  if (watchlist.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-8 bg-black">
        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-4 border border-white/5">
          <Bookmark className="w-9 h-9 text-gray-600" />
        </div>
        <h2 className="text-xl font-black text-white mb-2">Meine Liste</h2>
        <p className="text-gray-500 text-sm leading-relaxed">
          Tippe im Player auf das{' '}
          <span className="text-white font-semibold">Lesezeichen-Symbol</span>,<br />
          um Serien hier zu speichern.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-black pb-20 scrollbar-hide">
      <div className="pt-safe-top px-4 pt-6 pb-3">
        <h1 className="text-2xl font-black text-white">Meine Liste</h1>
        <p className="text-gray-500 text-sm mt-0.5">{watchlist.length} {watchlist.length === 1 ? 'Serie' : 'Serien'} gespeichert</p>
      </div>

      <div className="grid grid-cols-2 gap-3 px-3">
        {watchlist.map(show => {
          const lastEpIdx = watchProgress[show.id];
          const progressPct = lastEpIdx != null ? ((lastEpIdx + 1) / show.episodes.length) * 100 : 0;

          return (
            <div key={show.id} className="flex flex-col group cursor-pointer">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2 bg-gray-900" onClick={() => onSelectShow(show)}>
                <img src={show.coverImage} alt={show.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                {/* Watch progress bar */}
                {progressPct > 0 && (
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
                    <div className="h-full bg-[#00a0e9] rounded-full" style={{ width: `${progressPct}%` }} />
                  </div>
                )}

                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                  </div>
                </div>

                {/* Remove bookmark */}
                <button
                  onClick={(e) => { e.stopPropagation(); onRemove(show); }}
                  className="absolute top-2 right-2 w-7 h-7 bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/10 active:scale-90 transition-transform"
                >
                  <Bookmark className="w-3.5 h-3.5 text-[#00a0e9] fill-[#00a0e9]" />
                </button>

                {lastEpIdx != null && (
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    EP {lastEpIdx + 1}
                  </div>
                )}
              </div>
              <h3 className="text-sm font-bold leading-tight line-clamp-2 mb-0.5">{show.title}</h3>
              <p className="text-xs text-gray-500 truncate">{show.tags.join(' · ')}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
