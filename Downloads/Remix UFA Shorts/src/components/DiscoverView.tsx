import React, { useState, useMemo } from 'react';
import { Search, Play, TrendingUp, Sparkles, X, Clock, Flame } from 'lucide-react';
import { MOCK_SHOWS } from '../data';
import { Show } from '../types';

interface DiscoverViewProps {
  onSelectShow: (show: Show) => void;
}

const GENRES = [
  { label: 'Romantik', from: 'from-pink-600',  to: 'to-rose-900',   emoji: '💕', tag: 'Romantik' },
  { label: 'Drama',    from: 'from-purple-700', to: 'to-indigo-900', emoji: '🎭', tag: 'Drama' },
  { label: 'Fantasy',  from: 'from-violet-600', to: 'to-purple-900', emoji: '✨', tag: 'Fantasy' },
  { label: 'Comedy',   from: 'from-yellow-500', to: 'to-orange-700', emoji: '😂', tag: 'Comedy' },
  { label: 'Thriller', from: 'from-gray-700',   to: 'to-gray-950',   emoji: '🔪', tag: 'Thriller' },
  { label: 'Action',   from: 'from-red-600',    to: 'to-red-950',    emoji: '💥', tag: 'Action' },
  { label: 'Sci-Fi',   from: 'from-cyan-600',   to: 'to-blue-900',   emoji: '🚀', tag: 'Sci-Fi' },
  { label: 'Horror',   from: 'from-green-800',  to: 'to-gray-950',   emoji: '👻', tag: 'Horror' },
];

const MAX_HISTORY = 5;

function loadHistory(): string[] {
  try { return JSON.parse(localStorage.getItem('ufaShortsSearchHistory') || '[]'); }
  catch { return []; }
}

function saveHistory(history: string[]) {
  try { localStorage.setItem('ufaShortsSearchHistory', JSON.stringify(history)); }
  catch { }
}

export default function DiscoverView({ onSelectShow }: DiscoverViewProps) {
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>(loadHistory);
  const [activeGenre, setActiveGenre]     = useState<string | null>(null);

  const trendingShows = MOCK_SHOWS.slice(1, 5);

  // Live search results
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return null;
    return {
      shows:  MOCK_SHOWS.filter(s =>
        s.title.toLowerCase().includes(q) ||
        s.tags.some(t => t.toLowerCase().includes(q)) ||
        s.description.toLowerCase().includes(q)
      ),
      genres: GENRES.filter(g => g.label.toLowerCase().includes(q)),
    };
  }, [searchQuery]);

  // Genre-filtered trending
  const filteredTrending = activeGenre
    ? trendingShows.filter(s => s.tags.some(t => t.toLowerCase() === activeGenre.toLowerCase()))
    : trendingShows;

  const commitSearch = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...searchHistory.filter(h => h !== trimmed)].slice(0, MAX_HISTORY);
    setSearchHistory(updated);
    saveHistory(updated);
  };

  const removeHistory = (item: string) => {
    const updated = searchHistory.filter(h => h !== item);
    setSearchHistory(updated);
    saveHistory(updated);
  };

  const pickHistory = (item: string) => setSearchQuery(item);

  const noResults = searchResults && searchResults.shows.length === 0 && searchResults.genres.length === 0;

  return (
    <div className="h-full flex flex-col bg-black overflow-y-auto pb-20 scrollbar-hide">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-black/95 backdrop-blur-md pt-safe-top px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-2xl font-black text-white">Entdecken</h1>
          <div className="flex items-center gap-1 text-[#00a0e9] bg-[#00a0e9]/10 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-xs font-bold">Neu</span>
          </div>
        </div>
        <div className="bg-gray-900/80 rounded-full flex items-center px-4 py-2.5 border border-white/8 focus-within:border-[#00a0e9]/50 transition-colors">
          <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Serien, Genres, Schauspieler..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && commitSearch(searchQuery)}
            onBlur={() => commitSearch(searchQuery)}
            className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-500"
          />
          {searchQuery.length > 0 && (
            <button onClick={() => setSearchQuery('')} className="ml-2 text-gray-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 space-y-6 mt-1">

        {/* ── Search Results ── */}
        {searchResults && (
          <>
            {noResults && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Search className="w-12 h-12 text-gray-700 mb-3" />
                <p className="text-gray-400 font-medium">Nichts gefunden für „{searchQuery}"</p>
                <p className="text-gray-600 text-sm mt-1">Versuch einen anderen Suchbegriff</p>
              </div>
            )}
            {searchResults.shows.length > 0 && (
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
                  Serien ({searchResults.shows.length})
                </p>
                <div className="space-y-3">
                  {searchResults.shows.map(show => (
                    <SearchShowCard key={show.id} show={show} onSelectShow={onSelectShow} />
                  ))}
                </div>
              </div>
            )}
            {searchResults.genres.length > 0 && (
              <div>
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-3">
                  Genres ({searchResults.genres.length})
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {searchResults.genres.map(genre => (
                    <button
                      key={genre.label}
                      className={`bg-gradient-to-br ${genre.from} ${genre.to} rounded-2xl p-4 flex items-center gap-3 border border-white/10 active:scale-95 transition-transform`}
                    >
                      <span className="text-2xl">{genre.emoji}</span>
                      <span className="text-white font-bold text-sm">{genre.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Default view ── */}
        {!searchResults && (
          <>
            {/* Search history */}
            {searchHistory.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Zuletzt gesucht</span>
                  </div>
                  <button
                    onClick={() => { setSearchHistory([]); saveHistory([]); }}
                    className="text-gray-600 text-xs hover:text-gray-400 transition-colors"
                  >
                    Alle löschen
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {searchHistory.map(item => (
                    <div key={item} className="flex items-center gap-1 bg-gray-900/80 border border-white/8 rounded-full pl-3 pr-2 py-1.5">
                      <button
                        onClick={() => pickHistory(item)}
                        className="text-white text-sm font-medium"
                      >
                        {item}
                      </button>
                      <button
                        onClick={() => removeHistory(item)}
                        className="text-gray-600 hover:text-gray-300 transition-colors ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-red-500" />
                  <h2 className="text-lg font-black text-white">Im Trend</h2>
                </div>
              </div>

              {/* Genre filter chips */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-3 pb-0.5">
                <button
                  onClick={() => setActiveGenre(null)}
                  className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    activeGenre === null
                      ? 'bg-[#00a0e9] border-[#00a0e9] text-white'
                      : 'bg-gray-900 border-white/10 text-gray-400'
                  }`}
                >
                  <Flame className="w-3 h-3" />
                  Alle
                </button>
                {GENRES.slice(0, 6).map(g => (
                  <button
                    key={g.label}
                    onClick={() => setActiveGenre(activeGenre === g.tag ? null : g.tag)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                      activeGenre === g.tag
                        ? 'bg-[#00a0e9] border-[#00a0e9] text-white'
                        : 'bg-gray-900 border-white/10 text-gray-400'
                    }`}
                  >
                    {g.emoji} {g.label}
                  </button>
                ))}
              </div>

              {filteredTrending.length > 0 ? (
                <div className="space-y-3">
                  {filteredTrending.map((show, index) => (
                    <SearchShowCard key={show.id} show={show} onSelectShow={onSelectShow} rank={index + 1} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600 text-sm">
                  Keine Serien in diesem Genre im Trend.
                </div>
              )}
            </div>

            {/* Genre grid */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-black text-white">Beliebte Genres</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {GENRES.map((genre) => (
                  <button
                    key={genre.label}
                    onClick={() => setActiveGenre(activeGenre === genre.tag ? null : genre.tag)}
                    className={`bg-gradient-to-br ${genre.from} ${genre.to} rounded-2xl p-4 flex items-center gap-3 border transition-all active:scale-95 shadow-lg ${
                      activeGenre === genre.tag ? 'border-white/40 scale-[0.97]' : 'border-white/10'
                    }`}
                  >
                    <span className="text-2xl">{genre.emoji}</span>
                    <span className="text-white font-bold text-sm">{genre.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SearchShowCard({ show, onSelectShow, rank }: { show: Show; onSelectShow: (s: Show) => void; rank?: number }) {
  return (
    <div
      className="flex gap-3 bg-gray-900/60 rounded-2xl p-3 border border-white/5 active:bg-gray-800/60 transition-colors cursor-pointer"
      onClick={() => !show.comingSoon && onSelectShow(show)}
    >
      {rank != null && (
        <div className="flex-shrink-0 flex items-center justify-center w-8">
          <span className={`text-3xl font-black ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-300' : rank === 3 ? 'text-amber-600' : 'text-gray-600'}`}>
            {rank}
          </span>
        </div>
      )}
      <div className="relative w-20 h-28 flex-shrink-0 rounded-xl overflow-hidden">
        <img src={show.coverImage} alt={show.title} className="w-full h-full object-cover" />
        {show.comingSoon && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white text-[9px] font-bold text-center px-1">DEMNÄCHST</span>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center flex-1 min-w-0">
        <h3 className="text-white font-bold text-sm mb-1 line-clamp-2 leading-tight">{show.title}</h3>
        <p className="text-gray-500 text-xs mb-2 truncate">{show.tags.join(' · ')}</p>
        <div className="flex items-center gap-3">
          <div className="flex items-center text-gray-400 text-xs">
            <Play className="w-3 h-3 mr-1 fill-gray-400" />
            {show.views}
          </div>
          {show.badge && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${show.comingSoon ? 'text-gray-400 bg-gray-800 border-gray-700' : 'text-red-400 bg-red-500/10 border-red-500/20'}`}>
              {show.badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
