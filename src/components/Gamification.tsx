import React from 'react';
import { useAppContext } from '../context/AppContext';

export function Gamification() {
  const { settings, pomodorosCompleted, mode } = useAppContext();
  const hasCustomBg = settings.background !== 'default';

  const themeConfig = {
    pomodoro: { primary: 'bg-rose-500' },
    shortBreak: { primary: 'bg-emerald-500' },
    longBreak: { primary: 'bg-blue-500' },
  };
  const theme = themeConfig[mode];

  return (
    <div className={`mt-8 flex gap-2 p-3 rounded-full transition-all duration-500 ${hasCustomBg ? 'bg-white/90 backdrop-blur-md shadow-sm' : ''}`}>
      {Array.from({ length: settings.longBreakInterval }).map((_, i) => (
        <div 
          key={i} 
          className={`w-3 h-3 rounded-full transition-colors duration-300 ${
            i < (pomodorosCompleted % settings.longBreakInterval) 
              ? theme.primary 
              : 'bg-stone-200'
          }`}
        />
      ))}
    </div>
  );
}
