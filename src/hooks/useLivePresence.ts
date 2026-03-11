import { useEffect, useRef } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAppContext } from '../context/AppContext';

export function useLivePresence() {
  const { user, isAuthReady, isActive, timeLeft, mode, tasks } = useAppContext();
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!isAuthReady || !user) return;

    const updatePresence = async () => {
      const now = Date.now();
      // Throttle updates to every 5 seconds to reduce writes, unless state changes significantly
      if (now - lastUpdateRef.current < 5000) return;

      const currentTask = tasks.find(t => !t.completed)?.text || '';
      
      let status = 'Idle';
      if (isActive) {
        status = mode === 'pomodoro' ? 'Focusing' : 'On a Break';
      }

      try {
        await setDoc(doc(db, 'users', user.uid), {
          isOnline: true,
          isFocusing: isActive && mode === 'pomodoro',
          status,
          timeRemaining: isActive ? timeLeft : 0,
          totalTime: mode === 'pomodoro' ? 25 * 60 : (mode === 'shortBreak' ? 5 * 60 : 15 * 60), // Simplified, should use settings
          currentTask,
          lastActive: now
        }, { merge: true });
        lastUpdateRef.current = now;
      } catch (error) {
        console.error('Failed to update presence', error);
      }
    };

    // Update immediately on state change
    updatePresence();

    // Set up heartbeat
    const interval = setInterval(updatePresence, 10000); // 10s heartbeat

    return () => {
      clearInterval(interval);
      // Set offline on unmount
      if (user) {
        setDoc(doc(db, 'users', user.uid), {
          isOnline: false,
          isFocusing: false,
          status: 'Offline',
          lastActive: Date.now()
        }, { merge: true }).catch(console.error);
      }
    };
  }, [user, isAuthReady, isActive, timeLeft, mode, tasks]);
}
