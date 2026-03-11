import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { X, Search, UserPlus, Check, XCircle, Users, Flame, UserCheck } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';
import { UserProfile } from '../types';

export function SocialModal() {
  const { 
    showSocialModal, 
    setShowSocialModal, 
    user, 
    friends, 
    friendRequests,
    sendFriendRequest,
    respondToFriendRequest
  } = useAppContext();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');

  if (!showSocialModal) return null;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !user) return;
    setIsSearching(true);
    try {
      const q = query(
        collection(db, 'users'), 
        where('displayName', '>=', searchQuery),
        where('displayName', '<=', searchQuery + '\uf8ff')
      );
      const snap = await getDocs(q);
      const results: UserProfile[] = [];
      snap.forEach(doc => {
        const data = doc.data() as UserProfile;
        if (data.uid !== user.uid) results.push(data);
      });
      setSearchResults(results);
      setActiveTab('search');
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (targetUser: UserProfile) => {
    if (!user) return;
    try {
      await sendFriendRequest(targetUser.uid);
      alert(`Request sent to ${targetUser.displayName}`);
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleRespond = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      await respondToFriendRequest(requestId, status);
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowSocialModal(false)}
          className="absolute inset-0 bg-black/80 backdrop-blur-xl"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-lg bg-stone-900 border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="p-8 border-b border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white tracking-tighter uppercase">Social Hub</h2>
              <button
                onClick={() => setShowSocialModal(false)}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative">
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by username..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              {isSearching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              )}
            </form>
          </div>

          {/* Tabs */}
          <div className="flex px-8 gap-6 border-b border-white/5">
            {[
              { id: 'friends', label: 'Friends', icon: Users, count: friends.length },
              { id: 'requests', label: 'Requests', icon: UserPlus, count: friendRequests.length },
              { id: 'search', label: 'Results', icon: Search, count: searchResults.length, hide: searchResults.length === 0 }
            ].map((tab) => !tab.hide && (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${
                  activeTab === tab.id ? 'text-emerald-400 border-emerald-400' : 'text-white/30 border-transparent hover:text-white/60'
                }`}
              >
                <tab.icon className="w-3 h-3" />
                {tab.label}
                {tab.count > 0 && (
                  <span className="bg-white/10 px-1.5 py-0.5 rounded-md text-[8px]">{tab.count}</span>
                )}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <div className="space-y-4">
              {activeTab === 'friends' && (
                friends.length > 0 ? (
                  friends.map(friend => (
                    <div key={friend.uid} className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full border border-white/10 bg-stone-800 flex items-center justify-center overflow-hidden">
                            {friend.photoURL ? (
                              <img src={friend.photoURL} alt={friend.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            ) : (
                              <span className="text-white/50 font-bold">{friend.displayName.charAt(0).toUpperCase()}</span>
                            )}
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-stone-900 ${
                            friend.isOnline ? 'bg-emerald-500' : 'bg-stone-600'
                          }`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">@{friend.displayName.toLowerCase()}</p>
                          <div className="flex items-center gap-1">
                            {friend.isFocusing ? (
                              <>
                                <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">Focusing</span>
                              </>
                            ) : (
                              <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{friend.status || 'Offline'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-all">
                        <Users className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Users className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/40 text-sm font-medium">No friends yet. Start searching!</p>
                  </div>
                )
              )}

              {activeTab === 'requests' && (
                friendRequests.length > 0 ? (
                  friendRequests.map(req => (
                    <div key={req.id} className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center overflow-hidden border border-white/10">
                          {req.requesterProfile?.photoURL ? (
                            <img src={req.requesterProfile.photoURL} alt={req.requesterProfile.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <UserPlus className="w-5 h-5 text-white/40" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {req.requesterProfile ? `@${req.requesterProfile.displayName.toLowerCase()}` : 'Unknown User'}
                          </p>
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Pending Approval</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleRespond(req.id!, 'accepted')}
                          className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleRespond(req.id!, 'declined')}
                          className="p-2 rounded-xl bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <UserPlus className="w-12 h-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/40 text-sm font-medium">No pending requests.</p>
                  </div>
                )
              )}

              {activeTab === 'search' && (
                searchResults.map(result => (
                  <div key={result.uid} className="flex items-center justify-between p-4 bg-white/5 rounded-3xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full border border-white/10 bg-stone-800 flex items-center justify-center overflow-hidden">
                        {result.photoURL ? (
                          <img src={result.photoURL} alt={result.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span className="text-white/50 font-bold">{result.displayName.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">@{result.displayName.toLowerCase()}</p>
                        <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Level {Math.floor(Math.random() * 10) + 1}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleSendRequest(result)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all"
                    >
                      <UserPlus className="w-3 h-3" />
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
