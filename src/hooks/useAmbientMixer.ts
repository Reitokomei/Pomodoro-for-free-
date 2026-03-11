import { useState, useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';
import { AMBIENT_SOUNDS } from '../constants';

export interface SoundState {
  isPlaying: boolean;
  volume: number;
}

export function useAmbientMixer(masterPlaying: boolean) {
  const [sounds, setSounds] = useState<Record<string, SoundState>>({});
  const howls = useRef<Record<string, Howl>>({});

  // Initialize howls
  useEffect(() => {
    AMBIENT_SOUNDS.forEach(sound => {
      if (!howls.current[sound.id]) {
        howls.current[sound.id] = new Howl({
          src: [sound.url],
          loop: true,
          volume: 0.5,
          preload: true,
        });
      }
    });

    return () => {
      Object.values(howls.current).forEach(howl => howl.unload());
      howls.current = {};
    };
  }, []);

  // Sync playback with state and master playing
  useEffect(() => {
    Object.entries(sounds).forEach(([id, state]) => {
      const howl = howls.current[id];
      if (howl) {
        const shouldPlay = state.isPlaying && masterPlaying;
        
        if (shouldPlay) {
          if (!howl.playing()) {
            howl.volume(0);
            howl.play();
            howl.fade(0, state.volume, 500);
          } else {
            howl.volume(state.volume);
          }
        } else {
          if (howl.playing()) {
            howl.pause();
          }
        }
      }
    });
  }, [sounds, masterPlaying]);

  const toggleSound = useCallback((id: string) => {
    setSounds(prev => {
      const current = prev[id] || { isPlaying: false, volume: 0.5 };
      return {
        ...prev,
        [id]: { ...current, isPlaying: !current.isPlaying }
      };
    });
  }, []);

  const setVolume = useCallback((id: string, volume: number) => {
    setSounds(prev => {
      const current = prev[id] || { isPlaying: false, volume: 0.5 };
      return {
        ...prev,
        [id]: { ...current, volume }
      };
    });
  }, []);

  const activeCount = Object.values(sounds).filter(s => s.isPlaying).length;

  return {
    sounds,
    toggleSound,
    setVolume,
    activeCount
  };
}
