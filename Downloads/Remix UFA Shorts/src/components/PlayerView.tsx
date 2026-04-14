import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  ChevronLeft, Share2, Heart, MessageCircle, Bookmark,
  Coins, Lock, Play, ChevronDown, ChevronUp, Crown, Star,
  Volume2, VolumeX,
} from 'lucide-react';
import { Show, Episode } from '../types';
import { MOCK_SHOWS } from '../data';
import CommentDrawer from './CommentDrawer';

interface PlayerViewProps {
  show: Show;
  initialEpisodeIndex?: number;
  userCoins: number;
  unlockedEpisodes: string[];
  isVip: boolean;
  isBookmarked: boolean;
  userRating: number;
  onBack: () => void;
  onUnlock: (episode: Episode) => void;
  onOpenCoinModal: () => void;
  onOpenVipModal: () => void;
  onToggleWatchlist: () => void;
  onWatchProgress: (episodeIndex: number) => void;
  onRate: (rating: number) => void;
  onUpdateStreak: () => void;
}

const haptic = (pattern: number | number[] = 40) => {
  try { navigator.vibrate(pattern); } catch (_) {}
};

export default function PlayerView({
  show, initialEpisodeIndex = 0, userCoins, unlockedEpisodes,
  isVip, isBookmarked, userRating,
  onBack, onUnlock, onOpenCoinModal, onOpenVipModal,
  onToggleWatchlist, onWatchProgress, onRate, onUpdateStreak,
}: PlayerViewProps) {
  const [currentIndex, setCurrentIndex]       = useState(initialEpisodeIndex);
  const [isPlaying, setIsPlaying]             = useState(true);
  const [isMuted, setIsMuted]                 = useState(false);
  const [showEpisodesList, setShowEpisodesList] = useState(false);
  const [videoError, setVideoError]           = useState(false);
  const [liked, setLiked]                     = useState(false);
  const [likeCount, setLikeCount]             = useState(124);
  const [progress, setProgress]               = useState(0);
  const [showHeartAnim, setShowHeartAnim]     = useState(false);
  const [showRatingPicker, setShowRatingPicker] = useState(false);
  const [localRating, setLocalRating]         = useState(userRating);
  const [isCommentsOpen, setIsCommentsOpen]   = useState(false);
  const [autoplaySeconds, setAutoplaySeconds] = useState<number | null>(null);
  const [coinFloat, setCoinFloat]             = useState(false);
  const [shakeCoins, setShakeCoins]           = useState(false);

  const videoRef       = useRef<HTMLVideoElement>(null);
  const touchStartRef  = useRef<{ x: number; y: number } | null>(null);
  const lastTapRef     = useRef<number>(0);
  const singleTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoplayRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentEpisode = show.episodes[currentIndex];
  const isUnlocked     = isVip || currentEpisode.coinCost === 0 || unlockedEpisodes.includes(currentEpisode.id);

  // Similar shows (same tags, different show)
  const similarShows = MOCK_SHOWS.filter(s =>
    s.id !== show.id &&
    !s.comingSoon &&
    s.tags.some(t => show.tags.includes(t))
  ).slice(0, 3);

  // ── Portrait lock ────────────────────────────────────────────────────────
  useEffect(() => {
    try { (screen.orientation as any).lock?.('portrait').catch(() => {}); } catch (_) {}
    return () => { try { (screen.orientation as any).unlock?.(); } catch (_) {} };
  }, []);

  // ── Video control ────────────────────────────────────────────────────────
  useEffect(() => {
    setVideoError(false);
    setProgress(0);
    cancelAutoplay();
    onWatchProgress(currentIndex);
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      if (isPlaying && isUnlocked) {
        videoRef.current.play().catch(() => setIsPlaying(false));
        onUpdateStreak();
      } else {
        videoRef.current.pause();
      }
    }
  }, [currentIndex, isUnlocked]);

  // ── Autoplay countdown ───────────────────────────────────────────────────
  const startAutoplay = () => {
    setAutoplaySeconds(5);
    autoplayRef.current = setInterval(() => {
      setAutoplaySeconds(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(autoplayRef.current!);
          setCurrentIndex(i => i + 1);
          setIsPlaying(true);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const cancelAutoplay = () => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    setAutoplaySeconds(null);
  };

  const handleEnded = () => {
    if (currentIndex < show.episodes.length - 1) startAutoplay();
  };

  // ── Play toggle ──────────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    if (!isUnlocked) return;
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else { videoRef.current.play(); onUpdateStreak(); }
      setIsPlaying(p => !p);
    }
  }, [isPlaying, isUnlocked]);

  // ── Mute ────────────────────────────────────────────────────────────────
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) videoRef.current.muted = !isMuted;
    setIsMuted(m => !m);
  };

  const handlePrev = () => { if (currentIndex > 0) { cancelAutoplay(); setCurrentIndex(i => i - 1); setIsPlaying(true); } };
  const handleNext = () => { if (currentIndex < show.episodes.length - 1) { cancelAutoplay(); setCurrentIndex(i => i + 1); setIsPlaying(true); } };

  // ── Unlock ───────────────────────────────────────────────────────────────
  const handleUnlock = () => {
    if (userCoins >= currentEpisode.coinCost) {
      haptic([40, 30, 80]);
      setCoinFloat(true);
      setTimeout(() => setCoinFloat(false), 800);
      onUnlock(currentEpisode);
    } else {
      haptic([40, 20, 40, 20, 40]);
      setShakeCoins(true);
      setTimeout(() => setShakeCoins(false), 500);
      onOpenCoinModal();
    }
  };

  // ── Double-tap to like ───────────────────────────────────────────────────
  const handleVideoTap = (e: React.MouseEvent) => {
    if (autoplaySeconds !== null) return;
    const now   = Date.now();
    const delta = now - lastTapRef.current;
    lastTapRef.current = now;

    if (delta < 300) {
      if (singleTapTimer.current) { clearTimeout(singleTapTimer.current); singleTapTimer.current = null; }
      if (!liked) { setLiked(true); setLikeCount(p => p + 1); haptic(60); }
      setShowHeartAnim(true);
      setTimeout(() => setShowHeartAnim(false), 900);
    } else {
      singleTapTimer.current = setTimeout(() => { togglePlay(); singleTapTimer.current = null; }, 280);
    }
  };

  // ── Swipe ────────────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;
    if (Math.abs(dx) < 50 && Math.abs(dy) < 50) return;
    if (Math.abs(dy) >= Math.abs(dx)) {
      if (dy < -50) handleNext();
      else if (dy > 50) handlePrev();
    } else {
      if (dx > 80) onBack();
    }
  };

  // ── Share ────────────────────────────────────────────────────────────────
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator.share) await navigator.share({ title: show.title, text: `Schau dir „${show.title}" auf UFA Shorts an!`, url: window.location.href });
      else await navigator.clipboard.writeText(window.location.href);
    } catch (_) {}
  };

  // ── Rating ───────────────────────────────────────────────────────────────
  const handleRate = (n: number) => {
    haptic(30);
    setLocalRating(n);
    onRate(n);
    setShowRatingPicker(false);
  };

  const handleTimeUpdate = () => {
    const v = videoRef.current;
    if (v && v.duration > 0) setProgress(v.currentTime / v.duration);
  };

  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;

  return (
    <>
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        {/* Top Nav */}
        <div className="absolute top-0 inset-x-0 z-20 p-4 pt-safe-top flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent">
          <button onClick={onBack} className="p-2 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 active:scale-95 transition-transform">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 text-center pointer-events-none">
            <p className="text-white font-bold text-sm line-clamp-1 max-w-[180px]">{show.title}</p>
            <p className="text-gray-400 text-xs">Ep. {currentEpisode.episodeNumber} / {show.episodes.length}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mute button */}
            <button onClick={toggleMute} className="p-2 rounded-full bg-black/30 backdrop-blur-sm border border-white/10 active:scale-95 transition-transform">
              {isMuted
                ? <VolumeX className="w-4 h-4 text-white" />
                : <Volume2  className="w-4 h-4 text-white" />
              }
            </button>

            {isVip ? (
              <div className="flex items-center gap-1.5 bg-yellow-500/20 backdrop-blur-sm px-3 py-1.5 rounded-full border border-yellow-500/30">
                <Crown className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-black text-sm">VIP</span>
              </div>
            ) : (
              <button
                onClick={onOpenCoinModal}
                className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/10 active:scale-95 transition-transform"
                style={shakeCoins ? { animation: 'shake 0.5s ease-out' } : {}}
              >
                <Coins className="w-4 h-4 text-yellow-400" />
                <span className="text-white font-bold text-sm">{userCoins}</span>
              </button>
            )}
          </div>
        </div>

        {/* Episode dots */}
        {show.episodes.length <= 12 && (
          <div className="absolute top-[72px] inset-x-0 z-20 flex justify-center gap-1 px-8">
            {show.episodes.map((ep, idx) => {
              const epUnlocked = isVip || ep.coinCost === 0 || unlockedEpisodes.includes(ep.id);
              return (
                <button key={idx} onClick={() => setCurrentIndex(idx)}
                  className="h-1 rounded-full transition-all duration-300"
                  style={{ width: idx === currentIndex ? 24 : 8, background: idx === currentIndex ? '#00a0e9' : epUnlocked ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)' }}
                />
              );
            })}
          </div>
        )}

        {/* Video */}
        <div
          className="relative flex-1 bg-gray-950 select-none"
          onClick={handleVideoTap}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {isUnlocked ? (
            <>
              <video
                ref={videoRef}
                src={currentEpisode.videoUrl}
                className={`w-full h-full object-cover ${videoError ? 'hidden' : ''}`}
                playsInline
                muted={isMuted}
                onEnded={handleEnded}
                onTimeUpdate={handleTimeUpdate}
                onError={() => setVideoError(true)}
              />

              {/* Progress bar */}
              {!videoError && (
                <div className="absolute bottom-0 inset-x-0 h-0.5 bg-white/15 z-30">
                  <div className="h-full bg-[#00a0e9] rounded-full" style={{ width: `${progress * 100}%` }} />
                </div>
              )}

              {videoError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-950 px-6 text-center">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-700">
                    <Play className="w-9 h-9 text-gray-500" />
                  </div>
                  <p className="text-white font-bold mb-1">Video nicht verfügbar</p>
                  <p className="text-gray-500 text-sm">Bitte überprüfe, ob die Datei hochgeladen wurde.</p>
                </div>
              )}

              {!isPlaying && !videoError && autoplaySeconds === null && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/25 pointer-events-none">
                  <div className="w-20 h-20 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
                    <Play className="w-9 h-9 text-white fill-white ml-1" />
                  </div>
                </div>
              )}

              {/* Autoplay countdown overlay */}
              {autoplaySeconds !== null && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 z-20">
                  <p className="text-gray-400 text-sm mb-2">Nächste Episode</p>
                  <p className="text-white font-black text-lg mb-4">
                    Episode {show.episodes[currentIndex + 1]?.episodeNumber}
                  </p>
                  <div className="relative w-20 h-20 mb-6">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                      <circle
                        cx="18" cy="18" r="15.9" fill="none"
                        stroke="#00a0e9" strokeWidth="2.5"
                        strokeDasharray="100"
                        strokeDashoffset={(1 - autoplaySeconds / 5) * 100}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 1s linear' }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-white font-black text-2xl">
                      {autoplaySeconds}
                    </span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); cancelAutoplay(); }}
                    className="bg-white/15 backdrop-blur-sm border border-white/20 text-white font-bold px-6 py-2.5 rounded-full active:scale-95 transition-transform"
                  >
                    Abbrechen
                  </button>
                </div>
              )}

              {/* Double-tap heart */}
              {showHeartAnim && (
                <div className="absolute pointer-events-none" style={{ top: '50%', left: '50%', animation: 'heart-pop 0.9s ease-out forwards' }}>
                  <Heart className="w-24 h-24 text-red-500 fill-red-500 drop-shadow-2xl" style={{ marginLeft: '-48px', marginTop: '-48px' }} />
                </div>
              )}
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 px-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-700 shadow-2xl">
                <Lock className="w-10 h-10 text-gray-300" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Episode gesperrt</h2>
              <p className="text-gray-400 mb-2 text-sm">Diese Episode kostet</p>

              {/* Coin cost badge with float animation */}
              <div className="relative flex items-center gap-2 mb-6 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-full">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-yellow-400 font-black text-xl">{currentEpisode.coinCost}</span>
                <span className="text-yellow-400/70 text-sm">Coins</span>
                {/* Coin float animation */}
                {coinFloat && (
                  <span
                    className="absolute left-1/2 -translate-x-1/2 text-yellow-400 font-black text-sm pointer-events-none"
                    style={{ animation: 'coin-float 0.8s ease-out forwards', bottom: '100%' }}
                  >
                    -{currentEpisode.coinCost} 🪙
                  </span>
                )}
              </div>

              <button
                onClick={(e) => { e.stopPropagation(); handleUnlock(); }}
                className="w-full max-w-xs bg-gradient-to-r from-[#003865] to-[#005fa3] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,56,101,0.5)] active:scale-95 transition-transform mb-3"
              >
                <Coins className="w-5 h-5 text-yellow-400" />
                Für {currentEpisode.coinCost} Coins freischalten
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); onOpenVipModal(); }}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-700 to-indigo-700 text-white font-bold py-3 px-6 rounded-2xl active:scale-95 transition-transform"
              >
                <Crown className="w-4 h-4 text-yellow-400" />
                VIP – alle Episoden frei
              </button>

              {userCoins < currentEpisode.coinCost && (
                <button onClick={(e) => { e.stopPropagation(); onOpenCoinModal(); }} className="mt-3 text-[#00a0e9] text-sm font-semibold underline underline-offset-2">
                  Coins aufladen
                </button>
              )}
            </div>
          )}

          {/* Right Sidebar */}
          <div className="absolute right-3 bottom-36 flex flex-col items-center gap-5 z-20">
            <button className="flex flex-col items-center group" onClick={(e) => {
              e.stopPropagation();
              haptic(40);
              setLiked(p => { setLikeCount(c => p ? c - 1 : c + 1); return !p; });
            }}>
              <div className={`p-3 rounded-full backdrop-blur-sm transition-all active:scale-90 ${liked ? 'bg-red-500/30' : 'bg-black/25 group-hover:bg-black/40'}`}>
                <Heart className={`w-7 h-7 ${liked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
              </div>
              <span className="text-white text-xs font-semibold mt-1 drop-shadow-md">{fmt(likeCount)}K</span>
            </button>

            <button className="flex flex-col items-center group" onClick={(e) => { e.stopPropagation(); setIsCommentsOpen(true); }}>
              <div className="p-3 rounded-full bg-black/25 backdrop-blur-sm group-hover:bg-black/40 transition active:scale-90">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <span className="text-white text-xs font-semibold mt-1 drop-shadow-md">8.2K</span>
            </button>

            <button className="flex flex-col items-center group" onClick={(e) => { e.stopPropagation(); haptic(30); onToggleWatchlist(); }}>
              <div className={`p-3 rounded-full backdrop-blur-sm transition-all active:scale-90 ${isBookmarked ? 'bg-[#00a0e9]/25' : 'bg-black/25 group-hover:bg-black/40'}`}>
                <Bookmark className={`w-7 h-7 ${isBookmarked ? 'text-[#00a0e9] fill-[#00a0e9]' : 'text-white'}`} />
              </div>
              <span className="text-white text-xs font-semibold mt-1 drop-shadow-md">{isBookmarked ? 'Gespeichert' : 'Merken'}</span>
            </button>

            {/* Star rating */}
            <div className="relative flex flex-col items-center">
              {showRatingPicker && (
                <div
                  className="absolute right-14 bottom-0 flex gap-1 bg-black/70 backdrop-blur-md rounded-2xl p-2.5 border border-white/10"
                  onClick={(e) => e.stopPropagation()}
                  style={{ animation: 'fade-in 0.15s ease-out' }}
                >
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => handleRate(n)} className="active:scale-110 transition-transform">
                      <Star className={`w-7 h-7 ${n <= localRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
                    </button>
                  ))}
                </div>
              )}
              <button className="flex flex-col items-center group" onClick={(e) => { e.stopPropagation(); setShowRatingPicker(p => !p); }}>
                <div className={`p-3 rounded-full backdrop-blur-sm transition-all active:scale-90 ${localRating > 0 ? 'bg-yellow-400/20' : 'bg-black/25 group-hover:bg-black/40'}`}>
                  <Star className={`w-7 h-7 ${localRating > 0 ? 'text-yellow-400 fill-yellow-400' : 'text-white'}`} />
                </div>
                <span className="text-white text-xs font-semibold mt-1 drop-shadow-md">{localRating > 0 ? `${localRating}/5` : 'Bewerten'}</span>
              </button>
            </div>

            <button className="flex flex-col items-center group" onClick={handleShare}>
              <div className="p-3 rounded-full bg-black/25 backdrop-blur-sm group-hover:bg-black/40 transition active:scale-90">
                <Share2 className="w-7 h-7 text-white" />
              </div>
              <span className="text-white text-xs font-semibold mt-1 drop-shadow-md">Teilen</span>
            </button>
          </div>

          {/* Bottom Info */}
          <div className="absolute bottom-0 inset-x-0 p-4 pr-20 pt-16 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 pointer-events-none">
            <h2 className="text-white font-black text-lg mb-0.5 drop-shadow-md">{show.title}</h2>
            {currentEpisode.description && (
              <p className="text-gray-300 text-xs drop-shadow-md line-clamp-2">{currentEpisode.description}</p>
            )}
          </div>
        </div>

        {/* Bottom Episodes Bar */}
        <div className="bg-[#0d0d0d] border-t border-white/5 pb-safe">
          <button
            className="w-full px-4 py-3 flex items-center justify-between active:bg-white/5 transition-colors"
            onClick={() => setShowEpisodesList(p => !p)}
          >
            <div className="flex items-center gap-2">
              <div className="bg-[#003865]/60 border border-[#00a0e9]/30 rounded-lg px-2.5 py-1 flex items-center gap-1">
                <span className="text-[#00a0e9] text-xs font-black">EP {currentEpisode.episodeNumber}</span>
                <span className="text-gray-500 text-xs">/</span>
                <span className="text-gray-500 text-xs">{show.episodes.length}</span>
              </div>
              <div className="min-w-0">
                <span className="text-white text-sm font-medium line-clamp-1">{currentEpisode.title}</span>
                {currentEpisode.duration && <span className="text-gray-500 text-xs ml-2">{currentEpisode.duration}</span>}
              </div>
            </div>
            {showEpisodesList
              ? <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
              : <ChevronUp   className="w-5 h-5 text-gray-400 flex-shrink-0" />
            }
          </button>

          {showEpisodesList && (
            <div className="h-72 bg-[#0d0d0d] overflow-y-auto px-4 pb-4 scrollbar-hide">
              <div className="space-y-2 mb-4">
                {show.episodes.map((ep, idx) => {
                  const epUnlocked = isVip || ep.coinCost === 0 || unlockedEpisodes.includes(ep.id);
                  const isCurrent  = idx === currentIndex;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => { cancelAutoplay(); setCurrentIndex(idx); setShowEpisodesList(false); }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl border-2 transition-all active:scale-[0.98] ${
                        isCurrent ? 'border-[#00a0e9] bg-[#003865]/30' : 'border-transparent bg-gray-800/60 hover:bg-gray-700/60'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-sm ${isCurrent ? 'bg-[#00a0e9]/20 text-[#00a0e9]' : epUnlocked ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-500'}`}>
                        {ep.episodeNumber}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className={`text-xs font-semibold truncate ${isCurrent ? 'text-[#00a0e9]' : 'text-white'}`}>{ep.title}</p>
                        {ep.description && <p className="text-gray-500 text-[10px] truncate">{ep.description}</p>}
                      </div>
                      <div className="flex-shrink-0 text-right">
                        {ep.duration && <p className="text-gray-500 text-[10px]">{ep.duration}</p>}
                        {!epUnlocked && <Lock className="w-3 h-3 text-gray-500 ml-auto mt-0.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Ähnliche Serien */}
              {similarShows.length > 0 && (
                <div>
                  <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">Ähnliche Serien</p>
                  <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                    {similarShows.map(s => (
                      <button
                        key={s.id}
                        onClick={() => { setShowEpisodesList(false); /* navigate handled outside */ }}
                        className="flex-shrink-0 w-24 text-left active:scale-95 transition-transform"
                      >
                        <div className="w-24 h-32 rounded-xl overflow-hidden mb-1 bg-gray-800">
                          <img src={s.coverImage} alt={s.title} className="w-full h-full object-cover" />
                        </div>
                        <p className="text-white text-[10px] font-semibold line-clamp-2 leading-tight">{s.title}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CommentDrawer isOpen={isCommentsOpen} onClose={() => setIsCommentsOpen(false)} showTitle={show.title} />
    </>
  );
}
