import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useFirebaseLogic } from '../hooks/useFirebaseLogic';
import { usePomodoro } from '../hooks/usePomodoro';
import { useLivePresence } from '../hooks/useLivePresence';
import { Settings, Mode, Task, UserProfile, Friendship, StudySession, Quest } from '../types';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';
import confetti from 'canvas-confetti';
import { calculateStreak } from '../utils/streak';
import { useAmbientMixer, SoundState } from '../hooks/useAmbientMixer';

const DEFAULT_QUESTS: Quest[] = [
  { id: 'q1', text: 'Complete 4 Pomodoros', completed: false, expReward: 100 },
  { id: 'q2', text: 'Study for 2 hours', completed: false, expReward: 100 },
  { id: 'q3', text: 'Finish 3 tasks', completed: false, expReward: 100 },
];

const DEFAULT_SETTINGS: Settings = {
  pomodoro: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
  alarmSound: 'beep',
  background: 'default',
  uiSounds: true,
};

interface AppContextType {
  user: any;
  userProfile: UserProfile | null;
  isAuthReady: boolean;
  tasks: Task[];
  sessions: StudySession[];
  friends: UserProfile[];
  friendRequests: Friendship[];
  settings: Settings;
  handleLogin: () => void;
  isLoggingIn: boolean;
  handleLogout: () => void;
  saveSettings: (newSettings: Settings) => void;
  sendFriendRequest: (targetUserId: string) => Promise<void>;
  respondToFriendRequest: (requestId: string, status: 'accepted' | 'declined') => Promise<void>;
  updateStreak: (newStreak: number, newLongest: number) => Promise<void>;
  
  mode: Mode;
  timeLeft: number;
  isActive: boolean;
  pomodorosCompleted: number;
  formatTime: (seconds: number) => string;
  toggleTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;
  switchMode: (newMode: Mode) => void;
  alarmAudioRef: React.RefObject<HTMLAudioElement>;
  
  mixerSounds: Record<string, SoundState>;
  toggleMixerSound: (id: string) => void;
  setMixerVolume: (id: string, volume: number) => void;
  mixerPlaying: boolean;
  setMixerPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  mixerActiveCount: number;
  
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  showStats: boolean;
  setShowStats: (show: boolean) => void;
  showYoutube: boolean;
  setShowYoutube: (show: boolean) => void;
  showFriends: boolean;
  setShowFriends: (show: boolean) => void;
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
  showSocialModal: boolean;
  setShowSocialModal: (show: boolean) => void;
  showRightSidebar: boolean;
  setShowRightSidebar: (show: boolean) => void;
  showSidebar: boolean;
  setShowSidebar: (show: boolean) => void;
  
  youtubeUrl: string;
  setYoutubeUrl: (url: string) => void;

  // Gamification
  level: number;
  exp: number;
  nextLevelExp: number;
  quests: Quest[];
  addExp: (amount: number) => void;
  toggleQuest: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function PresenceManager() {
  useLivePresence();
  return null;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const firebaseLogic = useFirebaseLogic();
  const currentSettings = firebaseLogic.settings || DEFAULT_SETTINGS;
  
  const [youtubeUrl, setYoutubeUrl] = useState('');

  // Gamification State
  const [level, setLevel] = useState(() => Number(localStorage.getItem('pomodoro_level')) || 1);
  const [exp, setExp] = useState(() => Number(localStorage.getItem('pomodoro_exp')) || 0);
  const [quests, setQuests] = useState<Quest[]>(() => {
    const saved = localStorage.getItem('pomodoro_quests');
    return saved ? JSON.parse(saved) : DEFAULT_QUESTS;
  });

  const nextLevelExp = level * 200;

  const addExp = (amount: number) => {
    setExp(prev => {
      let newExp = prev + amount;
      let newLevel = level;
      
      if (newExp >= nextLevelExp) {
        newExp -= nextLevelExp;
        newLevel += 1;
        setLevel(newLevel);
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#ffffff']
        });
      }
      
      localStorage.setItem('pomodoro_level', newLevel.toString());
      localStorage.setItem('pomodoro_exp', newExp.toString());
      return newExp;
    });
  };

  const toggleQuest = (id: string) => {
    setQuests(prev => {
      const newQuests = prev.map(q => {
        if (q.id === id && !q.completed) {
          addExp(q.expReward);
          return { ...q, completed: true };
        }
        return q;
      });
      localStorage.setItem('pomodoro_quests', JSON.stringify(newQuests));
      return newQuests;
    });
  };

  const handleSessionComplete = (duration: number) => {
    // EXP Logic
    if (duration > 0) {
      const isBreak = pomodoroLogic.mode !== 'pomodoro';
      
      let expEarned = isBreak ? 10 : 50;
      
      if (!isBreak && firebaseLogic.userProfile) {
        // Co-op Bonus
        const focusingFriends = firebaseLogic.friends.filter(f => f.isFocusing);
        if (focusingFriends.length > 0) {
          expEarned += 20 * focusingFriends.length; // Bonus 20 EXP per focusing friend
          // Optional: Show toast for co-op bonus
        }

        // Streak Logic
        const currentStats = firebaseLogic.userProfile.stats || { current_streak: 0, longest_streak: 0, last_study_date: null };
        const streakResult = calculateStreak(currentStats.last_study_date, currentStats.current_streak);
        
        if (streakResult.incremented) {
          const newLongest = Math.max(streakResult.newStreak, currentStats.longest_streak);
          firebaseLogic.updateStreak(streakResult.newStreak, newLongest);
        }
      }

      addExp(expEarned);
    }

    if (firebaseLogic.user) {
      const sessionId = crypto.randomUUID();
      setDoc(doc(db, 'sessions', sessionId), {
        userId: firebaseLogic.user.uid,
        duration,
        completedAt: Date.now()
      }).catch(e => handleFirestoreError(e, OperationType.WRITE, `sessions/${sessionId}`));
    }
  };

  const pomodoroLogic = usePomodoro(currentSettings, handleSessionComplete);
  
  const [mixerPlaying, setMixerPlaying] = useState(false);
  const { sounds: mixerSounds, toggleSound: toggleMixerSound, setVolume: setMixerVolume, activeCount: mixerActiveCount } = useAmbientMixer(mixerPlaying);
  
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showYoutube, setShowYoutube] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Sync mixer playing state with timer
  React.useEffect(() => {
    setMixerPlaying(pomodoroLogic.isActive);
  }, [pomodoroLogic.isActive]);

  const value = {
    ...firebaseLogic,
    settings: currentSettings,
    ...pomodoroLogic,
    mixerSounds,
    toggleMixerSound,
    setMixerVolume,
    mixerPlaying,
    setMixerPlaying,
    mixerActiveCount,
    showSettings,
    setShowSettings,
    showStats,
    setShowStats,
    showYoutube,
    setShowYoutube,
    showFriends,
    setShowFriends,
    showProfileModal,
    setShowProfileModal,
    showSocialModal,
    setShowSocialModal,
    showRightSidebar,
    setShowRightSidebar,
    showSidebar,
    setShowSidebar,
    youtubeUrl,
    setYoutubeUrl,
    level,
    exp,
    nextLevelExp,
    quests,
    addExp,
    toggleQuest
  };

  return (
    <AppContext.Provider value={value}>
      <PresenceManager />
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
