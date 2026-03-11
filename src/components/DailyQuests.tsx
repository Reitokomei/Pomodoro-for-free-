import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { CheckCircle2, Circle, Zap } from 'lucide-react';

export function DailyQuests() {
  const { quests, toggleQuest } = useAppContext();

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-[32px] shadow-xl w-full">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        <h3 className="text-lg font-black tracking-tighter text-white uppercase">Daily Quests</h3>
      </div>
      
      <div className="space-y-2">
        {quests.map((quest) => (
          <motion.div
            key={quest.id}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleQuest(quest.id)}
            className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${
              quest.completed 
                ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-100' 
                : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'
            }`}
          >
            {quest.completed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <Circle className="w-5 h-5 text-white/30" />
            )}
            <div className="flex-1">
              <p className={`text-xs font-bold ${quest.completed ? 'line-through opacity-60' : ''}`}>
                {quest.text}
              </p>
              <p className="text-[9px] font-black text-yellow-400 uppercase tracking-widest">+{quest.expReward} EXP</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
