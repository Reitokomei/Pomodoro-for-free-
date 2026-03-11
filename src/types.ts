export type Mode = 'pomodoro' | 'shortBreak' | 'longBreak';

export interface StudySession {
  id: string;
  userId: string;
  duration: number;
  completedAt: number;
}

export interface Settings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  alarmSound: string;
  background: string;
  videoUrl?: string;
  uiSounds: boolean;
  userId?: string;
  updatedAt?: number;
}

export interface SubTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  text: string;
  completed: boolean;
  subtasks?: SubTask[];
  notes?: string;
  isExpanded?: boolean;
}

export interface UserStats {
  current_streak: number;
  longest_streak: number;
  last_study_date: number | null;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  isOnline?: boolean;
  isFocusing?: boolean;
  status?: string;
  timeRemaining?: number;
  totalTime?: number;
  currentTask?: string;
  lastActive?: number;
  stats?: UserStats;
}

export interface Quest {
  id: string;
  text: string;
  completed: boolean;
  expReward: number;
}

export interface FriendStreak {
  id: string;
  name: string;
  avatar: string;
  streakDays: number;
  isStudiedToday: boolean;
}

export interface Friendship {
  id?: string;
  user1: string;
  user2: string;
  status: 'pending' | 'accepted';
  requester: string;
  createdAt?: number;
  requesterProfile?: UserProfile;
}

export interface Chat {
  id: string;
  participants: string[];
  updatedAt: number;
  lastMessage?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  createdAt: number;
}
