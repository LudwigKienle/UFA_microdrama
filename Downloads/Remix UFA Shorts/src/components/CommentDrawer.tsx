import React, { useState, useRef, useEffect } from 'react';
import { X, Heart, Send } from 'lucide-react';

interface CommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  showTitle: string;
}

interface Comment {
  id: string;
  user: string;
  avatarSeed: string;
  text: string;
  likes: number;
  time: string;
  liked: boolean;
}

const INITIAL_COMMENTS: Comment[] = [
  { id: '1', user: 'sarah_m',       avatarSeed: 'sarah',   text: 'Ich kann nicht aufhören zu schauen! 😍',             likes: 234,  time: 'vor 2h',  liked: false },
  { id: '2', user: 'drama_fan99',   avatarSeed: 'drama',   text: 'Episode 5 hat mich zum Weinen gebracht 😭',          likes: 89,   time: 'vor 4h',  liked: false },
  { id: '3', user: 'MaxMustermann', avatarSeed: 'max',     text: 'Wann kommt die nächste Staffel?! Ich brauche mehr!', likes: 412,  time: 'vor 1d',  liked: false },
  { id: '4', user: 'lena_k',        avatarSeed: 'lena',    text: 'Die Schauspieler sind unglaublich gut 👏',            likes: 56,   time: 'vor 2d',  liked: false },
  { id: '5', user: 'UFA_Fan',       avatarSeed: 'ufa',     text: 'Beste Serie auf der Plattform 🔥',                   likes: 1203, time: 'vor 3d',  liked: false },
  { id: '6', user: 'filmnerdin',    avatarSeed: 'film',    text: 'Hab die ganze Serie in einer Nacht durchgeschaut 😅', likes: 178,  time: 'vor 4d',  liked: false },
  { id: '7', user: 'TinaB',         avatarSeed: 'tina',    text: 'Das Ende von Folge 8 — ich bin sprachlos.',           likes: 304,  time: 'vor 5d',  liked: false },
];

export default function CommentDrawer({ isOpen, onClose, showTitle }: CommentDrawerProps) {
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 400);
  }, [isOpen]);

  const toggleLike = (id: string) => {
    setComments(prev => prev.map(c =>
      c.id === id
        ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
        : c
    ));
  };

  const sendComment = () => {
    const text = input.trim();
    if (!text) return;
    const newComment: Comment = {
      id: Date.now().toString(),
      user: 'Du',
      avatarSeed: 'user',
      text,
      likes: 0,
      time: 'Gerade eben',
      liked: false,
    };
    setComments(prev => [newComment, ...prev]);
    setInput('');
  };

  const formatLikes = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" style={{ animation: 'fade-in 0.2s ease-out' }} />

      {/* Drawer */}
      <div
        className="relative w-full bg-[#111] rounded-t-3xl overflow-hidden flex flex-col"
        style={{ height: '70vh', animation: 'slide-up 0.3s ease-out' }}
      >
        {/* Handle + Header */}
        <div className="flex-shrink-0">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 bg-gray-700 rounded-full" />
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-b border-white/5">
            <div>
              <h3 className="text-white font-black text-base">Kommentare</h3>
              <p className="text-gray-500 text-xs">{showTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/8 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollbar-hide">
          {comments.map(c => (
            <div key={c.id} className="flex gap-3">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.avatarSeed}`}
                alt={c.user}
                className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 border border-white/10"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-white font-bold text-xs">{c.user}</span>
                  <span className="text-gray-600 text-[10px]">{c.time}</span>
                </div>
                <p className="text-gray-300 text-sm leading-snug">{c.text}</p>
              </div>
              <button
                onClick={() => toggleLike(c.id)}
                className="flex-shrink-0 flex flex-col items-center gap-0.5 pt-0.5 active:scale-90 transition-transform"
              >
                <Heart className={`w-4 h-4 ${c.liked ? 'text-red-500 fill-red-500' : 'text-gray-500'}`} />
                <span className={`text-[10px] ${c.liked ? 'text-red-400' : 'text-gray-600'}`}>{formatLikes(c.likes)}</span>
              </button>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex-shrink-0 border-t border-white/5 px-4 py-3 pb-safe flex items-center gap-3">
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=user"
            alt="Du"
            className="w-8 h-8 rounded-full bg-gray-800 flex-shrink-0 border border-white/10"
          />
          <div className="flex-1 bg-gray-800/80 rounded-full flex items-center px-4 py-2 border border-white/8 focus-within:border-[#00a0e9]/50 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendComment()}
              placeholder="Kommentar schreiben..."
              className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-gray-500"
            />
          </div>
          <button
            onClick={sendComment}
            disabled={!input.trim()}
            className={`p-2 rounded-full transition-all active:scale-90 ${
              input.trim() ? 'bg-[#00a0e9] text-white' : 'bg-gray-800 text-gray-600'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
