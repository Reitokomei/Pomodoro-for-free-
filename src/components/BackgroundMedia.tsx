import React, { useState, useEffect } from 'react';
import { Youtube, X } from 'lucide-react';
import ReactPlayer from 'react-player';
import { useAppContext } from '../context/AppContext';

export function BackgroundMedia() {
  const { showYoutube, setShowYoutube, youtubeUrl, setYoutubeUrl, isActive, mode } = useAppContext();
  const [youtubeInput, setYoutubeInput] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  // Sync with timer state if desired, or let user control it
  useEffect(() => {
    setIsPlaying(isActive);
  }, [isActive]);

  const themeConfig = {
    pomodoro: { primary: 'bg-rose-500', hover: 'hover:bg-rose-600' },
    shortBreak: { primary: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
    longBreak: { primary: 'bg-blue-500', hover: 'hover:bg-blue-600' },
  };
  const theme = themeConfig[mode];

  const Player = ReactPlayer as any;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all duration-300 ${
        showYoutube ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) setShowYoutube(false);
      }}
    >
      <div 
        className={`bg-stone-900/90 backdrop-blur-2xl border border-white/20 rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transition-all duration-300 ${
          showYoutube ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
        }`}
      >
        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
          <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter">
            <Youtube className="w-6 h-6 text-red-500" />
            MUSIC PLAYER
          </h2>
          <button 
            onClick={() => setShowYoutube(false)}
            className="p-3 rounded-2xl hover:bg-white/10 text-white/60 hover:text-white transition-all pointer-events-auto"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Paste YouTube URL here..."
              value={youtubeInput}
              onChange={(e) => setYoutubeInput(e.target.value)}
              className="flex-1 px-5 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-white/20 transition-all pointer-events-auto"
            />
            <button
              onClick={() => {
                setYoutubeUrl(youtubeInput);
                setIsPlaying(true);
              }}
              className={`px-6 py-3 rounded-2xl text-white font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${theme.primary} ${theme.hover} border border-white/10 pointer-events-auto`}
            >
              Play
            </button>
          </div>
          
          {youtubeUrl ? (
            <div className="aspect-video rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl pointer-events-auto">
              <Player 
                url={youtubeUrl} 
                width="100%" 
                height="100%" 
                playing={isPlaying}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                controls={true}
              />
            </div>
          ) : (
            <div className="aspect-video rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-white/20 gap-4">
              <Youtube className="w-16 h-16 opacity-20" />
              <p className="text-xs font-bold uppercase tracking-widest">No video selected</p>
            </div>
          )}
          
          <p className="text-[10px] text-white/30 text-center font-medium uppercase tracking-widest">
            Music will continue playing in the background
          </p>
        </div>
      </div>
    </div>
  );
}
