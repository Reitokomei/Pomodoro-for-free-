import React from 'react';
import { motion } from 'motion/react';
import { Flame, BellRing } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { hasStudiedToday } from '../utils/streak';

export function SocialStreak() {
  const { userProfile, friends } = useAppContext();
  const [reminded, setReminded] = React.useState<string[]>([]);

  const handleRemind = (name: string, id: string) => {
    if (reminded.includes(id)) return;
    setReminded([...reminded, id]);
    
    const messages = [
      `Sent a study nudge to ${name}!`,
      `Reminded ${name} to keep their streak alive!`,
      `Sent a focus signal to ${name}!`,
    ];
    const randomMsg = messages[Math.floor(Math.random() * messages.length)];
    
    alert(randomMsg);
  };

  // Combine current user and friends for the streak leaderboard
  const allUsersMap = new Map();
  
  if (userProfile && userProfile.uid) {
    allUsersMap.set(userProfile.uid, {
      id: userProfile.uid,
      name: userProfile.displayName + ' (You)',
      avatar: userProfile.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userProfile.uid}`,
      streakDays: userProfile.stats?.current_streak || 0,
      isStudiedToday: hasStudiedToday(userProfile.stats?.last_study_date || null)
    });
  }

  friends.forEach(friend => {
    if (friend && friend.uid && !allUsersMap.has(friend.uid)) {
      allUsersMap.set(friend.uid, {
        id: friend.uid,
        name: friend.displayName,
        avatar: friend.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${friend.uid}`,
        streakDays: friend.stats?.current_streak || 0,
        isStudiedToday: hasStudiedToday(friend.stats?.last_study_date || null)
      });
    }
  });

  const allUsers = Array.from(allUsersMap.values());
  // Sort by streak days descending
  allUsers.sort((a, b) => b.streakDays - a.streakDays);

  if (allUsers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[32px] shadow-xl w-full">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
        <h3 className="text-lg font-black tracking-tighter text-white uppercase">Streaks</h3>
      </div>

      <div className="space-y-3">
        {allUsers.map((u) => (
          <div key={u.id} className="flex items-center gap-3">
            <div className="relative shrink-0">
              <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full border border-white/20" referrerPolicy="no-referrer" />
              <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-stone-900 ${u.isStudiedToday ? 'bg-emerald-500' : 'bg-stone-500'}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{u.name}</p>
              <div className="flex items-center gap-1">
                <Flame className={`w-3 h-3 ${u.isStudiedToday ? 'text-orange-500 fill-orange-500' : 'text-white/20 fill-white/20'}`} />
                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">{u.streakDays} days</span>
              </div>
            </div>

            {!u.isStudiedToday && u.id !== userProfile?.uid && (
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleRemind(u.name, u.id)}
                disabled={reminded.includes(u.id)}
                className={`p-2 rounded-xl transition-all ${
                  reminded.includes(u.id) 
                    ? 'bg-white/5 text-white/10' 
                    : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                }`}
                title="Send a reminder"
              >
                <BellRing className="w-3.5 h-3.5" />
              </motion.button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
