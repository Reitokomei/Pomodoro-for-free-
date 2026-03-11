import React from 'react';
import { SlidersHorizontal, Play, Pause } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { AMBIENT_SOUNDS } from '../constants';
import { playUISound } from '../utils/audio';

export function Mixer() {
  const { mixerSounds, toggleMixerSound, setMixerVolume, mixerPlaying, setMixerPlaying, mixerActiveCount, settings, mode } = useAppContext();
  const hasCustomBg = settings.background !== 'default';

  const themeConfig = {
    pomodoro: { bg: 'bg-rose-500' },
    shortBreak: { bg: 'bg-emerald-500' },
    longBreak: { bg: 'bg-blue-500' },
  };
  const theme = themeConfig[mode];

  return (
    <div className="w-full bg-white/5 backdrop-blur-xl p-5 rounded-[32px] border border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-white">
          <SlidersHorizontal className="w-5 h-5" />
          <h2 className="text-lg font-black tracking-tighter uppercase">Mixer</h2>
        </div>
        <div className="flex items-center gap-2">
          {mixerActiveCount > 0 && (
            <button
              onClick={() => setMixerPlaying(!mixerPlaying)}
              className={`p-2.5 rounded-xl transition-all hover:scale-110 active:scale-90 ${mixerPlaying ? theme.bg + ' text-white shadow-lg' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
              title={mixerPlaying ? "Pause Mixer" : "Play Mixer"}
            >
              {mixerPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {AMBIENT_SOUNDS.map(sound => {
           const soundState = mixerSounds[sound.id];
           const isSoundActive = soundState?.isPlaying || false;
           const volume = soundState?.volume ?? 0.5;
           return (
             <div key={sound.id} className="flex flex-col items-center gap-2">
               <button
                 onClick={() => {
                   playUISound('click', settings.uiSounds);
                   toggleMixerSound(sound.id);
                   if (!mixerPlaying && !isSoundActive) setMixerPlaying(true);
                 }}
                 className={`p-4 rounded-2xl transition-all hover:scale-110 active:scale-90 border border-white/10 ${isSoundActive ? theme.bg + ' text-white shadow-xl' : 'bg-white/5 text-white/30 hover:bg-white/10'}`}
                 title={sound.name}
               >
                 <sound.icon className="w-6 h-6" />
               </button>
               {isSoundActive ? (
                 <input
                   type="range"
                   min="0" max="1" step="0.01"
                   value={volume}
                   onChange={(e) => setMixerVolume(sound.id, parseFloat(e.target.value))}
                   className="w-full h-1 accent-white cursor-pointer opacity-80 hover:opacity-100 transition-opacity"
                 />
               ) : (
                 <span className="text-[9px] font-black uppercase tracking-widest text-white/20 truncate w-full text-center">{sound.name}</span>
               )}
             </div>
           )
        })}
      </div>
    </div>
  );
}
