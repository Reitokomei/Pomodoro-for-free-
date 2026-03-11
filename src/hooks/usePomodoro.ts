import { useState, useEffect, useRef } from 'react';
import { Mode, Settings, StudySession } from '../types';
import { playUISound } from '../utils/audio';
import { ALARMS } from '../constants';

export function usePomodoro(
  settings: Settings,
  onSessionComplete: (duration: number) => void
) {
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(settings.pomodoro * 60);
  const [isActive, setIsActive] = useState(false);
  const [pomodorosCompleted, setPomodorosCompleted] = useState(0);
  
  const stateRef = useRef({ mode, settings, pomodorosCompleted, isActive });
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    stateRef.current = { mode, settings, pomodorosCompleted, isActive };
  }, [mode, settings, pomodorosCompleted, isActive]);

  // Sync timeLeft when settings change and timer is not active
  useEffect(() => {
    if (!isActive) {
      setTimeLeft(settings[mode] * 60);
    }
  }, [settings, mode, isActive]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    document.title = `${formatTime(timeLeft)} - ${mode === 'pomodoro' ? 'Focus' : 'Break'}`;
  }, [timeLeft, mode]);

  const transitionToNextMode = () => {
    const { mode: currentMode, settings: currentSettings, pomodorosCompleted: completed } = stateRef.current;
    
    if (currentMode === 'pomodoro') {
      const newCompleted = completed + 1;
      setPomodorosCompleted(newCompleted);
      
      onSessionComplete(currentSettings.pomodoro * 60);
      
      if (newCompleted % currentSettings.longBreakInterval === 0) {
        setMode('longBreak');
        setTimeLeft(currentSettings.longBreak * 60);
        setIsActive(currentSettings.autoStartBreaks);
      } else {
        setMode('shortBreak');
        setTimeLeft(currentSettings.shortBreak * 60);
        setIsActive(currentSettings.autoStartBreaks);
      }
    } else {
      setMode('pomodoro');
      setTimeLeft(currentSettings.pomodoro * 60);
      setIsActive(currentSettings.autoStartPomodoros);
    }
  };

  useEffect(() => {
    let interval: number | undefined;
    
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (alarmAudioRef.current) {
        alarmAudioRef.current.currentTime = 0;
        alarmAudioRef.current.play().catch(e => console.error("Alarm play error:", e));
      }
      transitionToNextMode();
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    playUISound('click', settings.uiSounds);
    setIsActive(!isActive);
  };
  
  const resetTimer = () => {
    playUISound('click', settings.uiSounds);
    setIsActive(false);
    setTimeLeft(settings[mode] * 60);
  };

  const skipTimer = () => {
    playUISound('switch', settings.uiSounds);
    transitionToNextMode();
  };

  const switchMode = (newMode: Mode) => {
    playUISound('switch', settings.uiSounds);
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(settings[newMode] * 60);
  };

  return {
    mode,
    timeLeft,
    isActive,
    pomodorosCompleted,
    formatTime,
    toggleTimer,
    resetTimer,
    skipTimer,
    switchMode,
    alarmAudioRef
  };
}
