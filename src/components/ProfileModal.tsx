import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { X, Camera, Save, User, BarChart3, Star, Trophy, Clock } from 'lucide-react';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

export function ProfileModal() {
  const { 
    showProfileModal, 
    setShowProfileModal, 
    user,
    userProfile, 
    level, 
    exp, 
    nextLevelExp,
    sessions
  } = useAppContext();

  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');
  const [displayName, setDisplayName] = useState(userProfile?.displayName || user?.displayName || '');
  const [photoURL, setPhotoURL] = useState(userProfile?.photoURL || user?.photoURL || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!showProfileModal) return null;

  const totalFocusTime = sessions
    .filter(s => s.duration > 0)
    .reduce((acc, s) => acc + s.duration, 0);

  const formatFocusTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, 'users', user.uid), {
        displayName,
        photoURL,
      }, { merge: true });
      setActiveTab('view');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowProfileModal(false)}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-stone-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-8 border-b border-white/5">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('view')}
                className={`text-sm font-black uppercase tracking-widest transition-all ${
                  activeTab === 'view' ? 'text-white' : 'text-white/30 hover:text-white/60'
                }`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveTab('edit')}
                className={`text-sm font-black uppercase tracking-widest transition-all ${
                  activeTab === 'edit' ? 'text-white' : 'text-white/30 hover:text-white/60'
                }`}
              >
                Settings
              </button>
            </div>
            <button
              onClick={() => setShowProfileModal(false)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'view' ? (
              <div className="space-y-8">
                {/* Profile Hero */}
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full border-4 border-yellow-400/20 p-1">
                      <img 
                        src={userProfile?.photoURL || user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'default'}`} 
                        alt="Avatar" 
                        className="w-full h-full rounded-full object-cover border-2 border-white/10"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black text-xs font-black px-3 py-1 rounded-full border-4 border-stone-900 shadow-xl">
                      LVL {level}
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tighter">@{(userProfile?.displayName || user?.displayName || 'explorer').split(' ')[0].toLowerCase()}</h2>
                  <p className="text-white/40 text-sm font-medium mt-1 uppercase tracking-widest">Focus Flow Member</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 p-4 rounded-3xl border border-white/5 text-center">
                    <Clock className="w-5 h-5 text-blue-400 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Focus</p>
                    <p className="text-sm font-bold text-white">{formatFocusTime(totalFocusTime)}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-3xl border border-white/5 text-center">
                    <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Rank</p>
                    <p className="text-sm font-bold text-white">Novice</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-3xl border border-white/5 text-center">
                    <Star className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
                    <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">EXP</p>
                    <p className="text-sm font-bold text-white">{exp}/{nextLevelExp}</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-black text-white/40 uppercase tracking-widest">Level Progress</span>
                    <span className="text-xs font-black text-white/60">{Math.round((exp/nextLevelExp)*100)}%</span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 shadow-[0_0_15px_rgba(250,204,21,0.3)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(exp/nextLevelExp)*100}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Profile Picture URL</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={photoURL}
                      onChange={(e) => setPhotoURL(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                    />
                    <Camera className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Display Name</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                    />
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  </div>
                </div>

                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
