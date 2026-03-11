import { useEffect, useState, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import { hasStudiedToday } from '../utils/streak';

export function useStreakReminder() {
  const { userProfile, friends } = useAppContext();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const notifiedFriends = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userProfile) return;

    // Check if current user has NOT completed their daily Pomodoro goal
    const hasStudied = hasStudiedToday(userProfile.stats?.last_study_date || null);
    if (hasStudied) return;

    // Listen to onlineFriends array (friends who are focusing)
    const focusingFriends = friends.filter(f => f.isFocusing);

    focusingFriends.forEach(friend => {
      if (!notifiedFriends.current.has(friend.uid)) {
        // Trigger notification
        const streakDays = userProfile.stats?.current_streak || 0;
        setToastMessage(`Your friend @${friend.displayName} is studying! Join them now to keep your ${streakDays}-day streak alive!`);
        notifiedFriends.current.add(friend.uid);
        
        // Auto-hide toast after 5 seconds
        setTimeout(() => setToastMessage(null), 5000);
      }
    });

  }, [userProfile, friends]);

  return { toastMessage, setToastMessage };
}
