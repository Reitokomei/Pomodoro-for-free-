import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { Trophy, Star, Camera, Edit3, ChevronDown, User as UserIcon, LogOut } from 'lucide-react';

export function GamificationHeader() {
  const { user, userProfile, level, exp, nextLevelExp, handleLogout, setShowProfileModal } = useAppContext();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const progress = (exp / nextLevelExp) * 100;

  return (
    <div className="relative flex items-center gap-6">
      {/* Profile Widget */}
      <div className="flex items-center gap-4 bg-stone-900/40 backdrop-blur-xl border border-white/10 p-2 pr-4 rounded-[32px] shadow-2xl transition-all hover:border-white/20 group">
        {/* Avatar Section */}
        <div className="relative cursor-pointer group/avatar" onClick={() => setShowProfileModal(true)}>
          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-white/20 transition-all group-hover/avatar:border-yellow-400/50">
            <img 
              src={userProfile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'default'}`} 
              alt="Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            {/* Camera Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-stone-900 shadow-lg">
            {level}
          </div>
        </div>
        
        {/* Info Section */}
        <div className="flex flex-col gap-1 min-w-[140px]">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-1 cursor-pointer"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="text-sm font-black text-white tracking-tight">
                @{(userProfile?.displayName || user?.displayName || 'explorer').split(' ')[0].toLowerCase()}
              </span>
              <ChevronDown className={`w-3 h-3 text-white/40 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-400/10 rounded-full border border-yellow-400/20">
              <Trophy className="w-2.5 h-2.5 text-yellow-400" />
              <span className="text-[9px] font-black text-yellow-400 uppercase tracking-tighter">Novice</span>
            </div>
          </div>

          <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-yellow-400 to-orange-500 shadow-[0_0_8px_rgba(250,204,21,0.4)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ type: 'spring', stiffness: 50 }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[8px] font-black text-white/30 uppercase tracking-widest">EXP Progress</span>
            <span className="text-[8px] font-black text-white/50 uppercase tracking-widest">{exp}/{nextLevelExp}</span>
          </div>
        </div>
      </div>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full mt-4 left-1/2 -translate-x-1/2 w-56 bg-stone-900/90 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl z-50 overflow-hidden p-2"
            >
              <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 text-white/80 hover:text-white transition-all group">
                <div className="p-2 rounded-xl bg-white/5 group-hover:bg-yellow-400/10 transition-all">
                  <UserIcon className="w-4 h-4 group-hover:text-yellow-400" />
                </div>
                <span className="text-xs font-bold">View Profile</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 text-white/80 hover:text-white transition-all group">
                <div className="p-2 rounded-xl bg-white/5 group-hover:bg-blue-400/10 transition-all">
                  <Edit3 className="w-4 h-4 group-hover:text-blue-400" />
                </div>
                <span className="text-xs font-bold">Edit Profile</span>
              </button>
              <div className="h-px bg-white/5 my-2 mx-2" />
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-rose-500/10 text-rose-400 transition-all group"
              >
                <div className="p-2 rounded-xl bg-rose-500/5 group-hover:bg-rose-500/20 transition-all">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Sign Out</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
