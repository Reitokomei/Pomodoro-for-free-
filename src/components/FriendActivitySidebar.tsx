import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { Users, UserPlus, Flame, Coffee, Hand, Bell, X, MessageCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { ChatModal } from './ChatModal';

export function FriendActivitySidebar() {
  const { showRightSidebar, setShowRightSidebar, setShowSocialModal, friends } = useAppContext();
  const [activeChatFriend, setActiveChatFriend] = useState<UserProfile | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Drawer Overlay */}
      <AnimatePresence>
        {showRightSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowRightSidebar(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ 
          x: showRightSidebar ? 0 : 320,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed right-0 top-0 bottom-0 w-80 h-full bg-stone-950/40 backdrop-blur-3xl border-l border-white/10 z-[70] flex flex-col shadow-2xl overflow-hidden`}
      >
        <div className="w-80 h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-black text-white uppercase tracking-widest">Activity</h2>
              </div>
              <button 
                onClick={() => setShowRightSidebar(false)}
                className="p-2 rounded-xl hover:bg-white/5 text-white/40"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setShowSocialModal(true)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs font-black uppercase tracking-widest"
            >
              <UserPlus className="w-4 h-4" />
              Add Friend
            </button>
          </div>

          {/* Friend List */}
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-3">
            {friends.length === 0 ? (
              <div className="text-center p-6 text-white/40 text-sm">
                No friends added yet.
              </div>
            ) : (
              friends.map((friend) => (
                <motion.div
                  key={friend.uid}
                  layout
                  onClick={() => setActiveChatFriend(friend)}
                  className={`group relative p-4 rounded-[32px] border transition-all cursor-pointer ${
                    friend.isFocusing 
                      ? 'bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar with Progress Ring */}
                    <div className="relative shrink-0">
                      {friend.isFocusing && friend.timeRemaining !== undefined && friend.totalTime !== undefined && friend.totalTime > 0 && (
                        <svg className="absolute -inset-1 w-12 h-12 -rotate-90">
                          <circle
                            cx="24"
                            cy="24"
                            r="20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-white/5"
                          />
                          <motion.circle
                            cx="24"
                            cy="24"
                            r="20"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeDasharray="125.6"
                            animate={{ strokeDashoffset: 125.6 * (1 - friend.timeRemaining / friend.totalTime) }}
                            className="text-emerald-500"
                          />
                        </svg>
                      )}
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 bg-stone-800 flex items-center justify-center">
                        {friend.photoURL ? (
                          <img src={friend.photoURL} alt={friend.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-white/50 text-sm font-bold">{friend.displayName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      {/* Status Dot */}
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-stone-900 ${
                        friend.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-stone-600'
                      }`} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">@{friend.displayName.split(' ')[0].toLowerCase()}</h3>
                      <div className="flex items-center gap-1.5">
                        {friend.isFocusing ? (
                          <>
                            <Flame className="w-3 h-3 text-orange-500 animate-pulse" />
                            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
                              {formatTime(friend.timeRemaining || 0)}
                            </span>
                          </>
                        ) : friend.status === 'On a Break' ? (
                          <>
                            <Coffee className="w-3 h-3 text-blue-400" />
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Break</span>
                          </>
                        ) : (
                          <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">
                            {friend.status || 'Offline'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Hover Actions */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveChatFriend(friend);
                        }}
                        className="p-2 rounded-xl bg-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer Stats */}
          <div className="p-6 bg-white/5 border-t border-white/5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Active Now</span>
              <span className="text-xs font-bold text-emerald-400">{friends.filter(f => f.isOnline).length} Friends</span>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Chat Modal */}
      <AnimatePresence>
        {activeChatFriend && (
          <ChatModal 
            friend={activeChatFriend} 
            onClose={() => setActiveChatFriend(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
