import React from 'react';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import { motion } from 'motion/react';
import { useAppContext } from '../context/AppContext';

export function Timer() {
  const { mode, timeLeft, isActive, toggleTimer, resetTimer, skipTimer, switchMode, formatTime, settings } = useAppContext();

  const themeConfig = {
    pomodoro: { text: 'text-rose-400', primary: 'bg-rose-500', hover: 'hover:bg-rose-600', ring: 'stroke-rose-500' },
    shortBreak: { text: 'text-emerald-400', primary: 'bg-emerald-500', hover: 'hover:bg-emerald-600', ring: 'stroke-emerald-500' },
    longBreak: { text: 'text-blue-400', primary: 'bg-blue-500', hover: 'hover:bg-blue-600', ring: 'stroke-blue-400' },
  };
  const theme = themeConfig[mode];

  const totalSeconds = settings[mode] * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  return (
    <main className={`w-full max-w-xl rounded-[48px] shadow-2xl overflow-hidden transition-all duration-700 bg-white/5 backdrop-blur-3xl border border-white/10 ${isActive ? 'scale-105 shadow-white/5' : ''}`}>
      {/* Mode Selector */}
      <div className={`flex p-4 gap-2 bg-white/5 border-b border-white/5 transition-all duration-500 ${isActive ? 'opacity-0 h-0 p-0 overflow-hidden' : 'opacity-100'}`}>
        {(['pomodoro', 'shortBreak', 'longBreak'] as const).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 py-3 px-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${
              mode === m 
                ? `${theme.primary} text-white shadow-xl scale-[1.02]` 
                : 'text-white/30 hover:bg-white/5 hover:text-white'
            }`}
          >
            {m === 'pomodoro' ? 'Focus' : m === 'shortBreak' ? 'Short' : 'Long'}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="p-16 flex flex-col items-center">
        <div className="relative w-80 h-80 flex items-center justify-center mb-12">
          {/* Circular Progress */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle 
              cx="50" cy="50" r="46" 
              className="stroke-white/[0.03]" 
              strokeWidth="2" 
              fill="none" 
            />
            <motion.circle 
              cx="50" cy="50" r="46" 
              className={theme.ring} 
              strokeWidth="3" 
              fill="none" 
              strokeLinecap="round"
              initial={{ strokeDasharray: "289 289", strokeDashoffset: 289 }}
              animate={{ strokeDashoffset: 289 - (289 * progress) / 100 }}
              transition={{ duration: 1, ease: "linear" }}
              style={{ filter: 'drop-shadow(0 0 12px currentColor)' }}
            />
          </svg>
          <div className={`text-8xl font-mono font-extralight tracking-tighter z-10 drop-shadow-2xl transition-all duration-700 ${isActive ? 'scale-110 text-white' : 'text-white/90'}`}>
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Controls */}
        <div className={`flex items-center gap-10 transition-all duration-500 ${isActive ? 'opacity-30 hover:opacity-100' : 'opacity-100'}`}>
          <button 
            onClick={toggleTimer}
            className={`w-24 h-24 flex items-center justify-center rounded-[32px] text-white shadow-2xl transition-all hover:scale-110 active:scale-95 ${theme.primary} ${theme.hover} border border-white/10`}
          >
            {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 fill-current ml-1.5" />}
          </button>
          
          <div className={`flex items-center gap-5 transition-all duration-500 ${isActive ? 'w-0 overflow-hidden opacity-0' : 'w-auto opacity-100'}`}>
            <button 
              onClick={skipTimer}
              className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/5"
              title="Skip"
            >
              <SkipForward className="w-6 h-6" />
            </button>
            <button 
              onClick={resetTimer}
              className="w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/5"
              title="Reset"
            >
              <RotateCcw className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
