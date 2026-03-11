import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, X } from 'lucide-react';
import { useStreakReminder } from '../hooks/useStreakReminder';

export function StreakToast() {
  const { toastMessage, setToastMessage } = useStreakReminder();

  return (
    <AnimatePresence>
      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm"
        >
          <div className="bg-stone-900/90 backdrop-blur-xl border border-orange-500/30 p-4 rounded-2xl shadow-2xl flex items-start gap-4">
            <div className="p-2 bg-orange-500/20 rounded-xl shrink-0">
              <Flame className="w-6 h-6 text-orange-500 fill-orange-500" />
            </div>
            
            <div className="flex-1">
              <h4 className="text-white font-bold text-sm mb-1">Social Streak Reminder</h4>
              <p className="text-white/70 text-sm leading-relaxed">
                {toastMessage}
              </p>
            </div>

            <button
              onClick={() => setToastMessage(null)}
              className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
