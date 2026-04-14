import React, { useState, useEffect } from 'react';
import { Search, Crown, Play, X, Flame, Clock, BarChart2, Bell, BellRing, Star } from 'lucide-react';
import { Show } from '../types';

interface HomeViewProps {
  shows: Show[];
  onSelectShow: (show: Show) => void;
  watchProgress: Record<string, number>;
  userRatings: Record<string, number>;
  onOpenVipModal: () => void;
}

const CATEGORIES = [
  { id: 'popular', label: 'POPULÄR', icon: Flame },
  { id: 'newest',  label: 'NEUESTE', icon: Clock },
  { id: 'ranking', label: 'RANGLISTE', icon: BarChart2 },
  { id: 'anime',   label: 'ANIME',   icon: null },
  { id: 'asia',    label: 'ASIEN',   icon: null },
  { id: 'forhim',  label: 'FÜR IHN', icon: null },
];

// ── Skeleton Card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex flex-col">
      <div
        className="aspect-[3/4] rounded-xl mb-2 bg-gray-800"
        style={{ animation: 'skeleton-pulse 1.4s ease-in-out infinite' }}
      />
      <div className="h-3 bg-gray-800 rounded w-3/4 mb-1.5" style={{ animation: 'skeleton-pulse 1.4s ease-in-out infinite 0.1s' }} />
      <div className="h-2.5 bg-gray-800 rounded w-1/2"     style={{ animation: 'skeleton-pulse 1.4s ease-in-out infinite 0.2s' }} />
    </div>
  );
}

export default function HomeView({ shows, onSelectShow, watchProgress, userRatings, onOpenVipModal }: HomeViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('popular');
  const [notified, setNotified]   = useState<Set<string>>(new Set());
  const [ringing, setRinging]     = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Brief delay so skeletons flash for at least one frame
  useEffect(() => { const t = setTimeout(() => setIsReady(true), 100); return () => clearTimeout(t); }, []);

  const filteredShows = shows.filter(show =>
    show.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    show.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const featuredShow = shows.find(s => !s.comingSoon);

  const handleNotify = (e: React.MouseEvent, show: Show) => {
    e.stopPropagation();
    const isNowNotified = !notified.has(show.id);
    setRinging(prev => new Set(prev).add(show.id));
    setTimeout(() => setRinging(prev => { const n = new Set(prev); n.delete(show.id); return n; }), 700);
    setNotified(prev => { const n = new Set(prev); isNowNotified ? n.add(show.id) : n.delete(show.id); return n; });
    setToast(isNowNotified
      ? `Benachrichtigung für „${show.title}" aktiviert`
      : `Benachrichtigung für „${show.title}" deaktiviert`
    );
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const markLoaded = (id: string) => setLoadedImages(prev => new Set(prev).add(id));

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-black pb-20 scrollbar-hide">
      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-24 left-1/2 z-50 bg-gray-800 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-xl border border-white/10 whitespace-nowrap max-w-[90vw] truncate"
          style={{ animation: 'toast-in 0.25s ease-out', transform: 'translateX(-50%)' }}
        >
          🔔 {toast}
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/95 backdrop-blur-md pt-safe-top">
        <div className="px-4 pt-4 pb-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <div className="text-2xl font-black tracking-tighter text-white bg-[#003865] px-2 py-0.5 rounded-sm">UFA</div>
              <span className="text-white font-bold text-xl">Shorts</span>
            </div>
            <button
              onClick={onOpenVipModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 to-amber-400 px-3.5 py-1.5 rounded-full text-black font-bold text-xs shadow-[0_0_12px_rgba(234,179,8,0.4)]"
            >
              <Crown className="w-3.5 h-3.5" />
              <span>VIP werden</span>
            </button>
          </div>

          <div className="bg-gray-900/80 rounded-full flex items-center px-4 py-2.5 border border-white/8 focus-within:border-[#00a0e9]/50 transition-colors">
            <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
            <input
              type="text"
              placeholder="Serien, Genres suchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-500"
            />
            {searchQuery.length > 0 && (
              <button onClick={() => setSearchQuery('')} className="ml-2 text-gray-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`whitespace-nowrap text-xs font-bold tracking-wider pb-1.5 transition-all duration-200 border-b-2 ${
                    isActive ? 'text-white border-[#00a0e9]' : 'text-gray-500 border-transparent hover:text-gray-300'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      {!searchQuery && featuredShow && (
        <div
          className="relative mx-3 mt-1 mb-4 rounded-2xl overflow-hidden cursor-pointer group"
          style={{ height: '200px' }}
          onClick={() => onSelectShow(featuredShow)}
        >
          {/* Skeleton while loading */}
          {!loadedImages.has('hero') && (
            <div className="absolute inset-0 bg-gray-800" style={{ animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
          )}
          <img
            src={featuredShow.coverImage}
            alt={featuredShow.title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 ${loadedImages.has('hero') ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => markLoaded('hero')}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

          {featuredShow.badge && (
            <div className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-md">{featuredShow.badge}</div>
          )}
          {watchProgress[featuredShow.id] != null && (
            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
              <div className="h-full bg-[#00a0e9]" style={{ width: `${((watchProgress[featuredShow.id] + 1) / featuredShow.episodes.length) * 100}%` }} />
            </div>
          )}
          <div className="absolute bottom-2 left-0 p-4 pr-28">
            <p className="text-[#00a0e9] text-xs font-bold uppercase tracking-widest mb-1">Featured</p>
            <h2 className="text-white font-black text-xl leading-tight line-clamp-2 mb-1">{featuredShow.title}</h2>
            <div className="flex items-center gap-2">
              <p className="text-gray-300 text-xs line-clamp-1">{featuredShow.tags.join(' · ')}</p>
              {userRatings[featuredShow.id] != null && (
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(n => (
                    <Star key={n} className={`w-3 h-3 ${n <= userRatings[featuredShow.id] ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onSelectShow(featuredShow); }}
            className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white text-black font-bold text-xs px-3 py-2 rounded-full shadow-lg"
          >
            <Play className="w-3.5 h-3.5 fill-black" />
            {watchProgress[featuredShow.id] != null ? 'Weiterschauen' : 'Jetzt ansehen'}
          </button>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 px-3">
        {!isReady ? (
          // Skeleton placeholders on first load
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filteredShows.length > 0 ? (
          filteredShows.map((show, index) => {
            const lastEpIdx  = watchProgress[show.id];
            const progressPct = lastEpIdx != null ? ((lastEpIdx + 1) / show.episodes.length) * 100 : 0;
            const rating      = userRatings[show.id];
            const imgLoaded   = loadedImages.has(show.id);

            return (
              <div
                key={show.id}
                className="flex flex-col group cursor-pointer"
                onClick={() => !show.comingSoon && onSelectShow(show)}
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-2 bg-gray-800">
                  {/* Skeleton overlay */}
                  {!imgLoaded && (
                    <div className="absolute inset-0 bg-gray-800" style={{ animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
                  )}
                  <img
                    src={show.coverImage}
                    alt={show.title}
                    className={`w-full h-full object-cover transition-all duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'} ${!show.comingSoon ? 'group-hover:scale-105' : ''}`}
                    onLoad={() => markLoaded(show.id)}
                  />

                  {/* Ranking badge */}
                  {activeCategory === 'ranking' && index < 3 && (
                    <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                      <span className="text-black text-xs font-black">#{index + 1}</span>
                    </div>
                  )}

                  {show.badge && !(activeCategory === 'ranking' && index < 3) && (
                    <div className={`absolute top-2 left-2 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md ${show.comingSoon ? 'bg-gray-700' : 'bg-red-600'}`}>
                      {show.badge}
                    </div>
                  )}

                  {show.comingSoon && (
                    <button
                      onClick={(e) => handleNotify(e, show)}
                      className={`absolute bottom-2 right-2 p-1.5 rounded-full backdrop-blur-sm border transition-all active:scale-90 ${notified.has(show.id) ? 'bg-[#00a0e9]/30 border-[#00a0e9]/50' : 'bg-black/40 border-white/20'}`}
                    >
                      {notified.has(show.id)
                        ? <BellRing className="w-4 h-4 text-[#00a0e9]" style={ringing.has(show.id) ? { animation: 'bell-ring 0.7s ease-out' } : {}} />
                        : <Bell    className="w-4 h-4 text-white"      style={ringing.has(show.id) ? { animation: 'bell-ring 0.7s ease-out' } : {}} />
                      }
                    </button>
                  )}

                  {progressPct > 0 && (
                    <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
                      <div className="h-full bg-[#00a0e9]" style={{ width: `${progressPct}%` }} />
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 to-transparent pointer-events-none" />

                  {!show.comingSoon && (
                    <div className="absolute bottom-2 left-2 flex items-center text-white text-[11px] font-semibold">
                      <Play className="w-3 h-3 mr-1 fill-white" />
                      {show.views}
                    </div>
                  )}

                  {!show.comingSoon && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  )}

                  {notified.has(show.id) && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-[#00a0e9] rounded-full shadow-[0_0_6px_rgba(0,160,233,0.8)]" />
                  )}
                </div>

                <h3 className="text-sm font-bold leading-tight line-clamp-2 mb-0.5">{show.title}</h3>
                {rating != null ? (
                  <div className="flex items-center gap-0.5 mb-0.5">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} className={`w-3 h-3 ${n <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-700'}`} />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 truncate">{show.tags.join(' · ')}</p>
                )}
              </div>
            );
          })
        ) : (
          <div className="col-span-2 flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-12 h-12 text-gray-700 mb-3" />
            <p className="text-gray-400 font-medium">Keine Serien gefunden</p>
            <p className="text-gray-600 text-sm mt-1">Versuch einen anderen Suchbegriff</p>
          </div>
        )}
      </div>
    </div>
  );
}
