import React, { useState } from 'react';
import { Users, X, Search, UserPlus, Check, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { collection, query, where, getDocs, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { UserProfile } from '../types';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

export function Leaderboard() {
  const { showFriends, setShowFriends, user, handleLogin, friends, friendRequests, mode, sendFriendRequest, respondToFriendRequest } = useAppContext();
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);

  const themeConfig = {
    pomodoro: { primary: 'bg-rose-500', hover: 'hover:bg-rose-600' },
    shortBreak: { primary: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
    longBreak: { primary: 'bg-blue-500', hover: 'hover:bg-blue-600' },
  };
  const theme = themeConfig[mode];

  const searchUsers = async () => {
    if (!searchEmail.trim() || !user) return;
    try {
      const q = query(collection(db, 'users'), where('email', '==', searchEmail.trim()));
      const snap = await getDocs(q);
      const results: UserProfile[] = [];
      snap.forEach(d => {
        if (d.data().uid !== user.uid) {
          results.push(d.data() as UserProfile);
        }
      });
      setSearchResults(results);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
    }
  };

  const handleSendFriendRequest = async (targetUserId: string) => {
    if (!user) return;
    try {
      await sendFriendRequest(targetUserId);
      alert('Friend request sent!');
    } catch (error) {
      // Error handled in hook
    }
  };

  const acceptFriendRequest = async (friendshipId: string) => {
    if (!user) return;
    try {
      await respondToFriendRequest(friendshipId, 'accepted');
    } catch (error) {
      // Error handled in hook
    }
  };

  const removeFriend = async (friendshipId: string) => {
    if (!user) return;
    try {
      await respondToFriendRequest(friendshipId, 'declined');
    } catch (error) {
      // Error handled in hook
    }
  };

  return (
    <AnimatePresence>
      {showFriends && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-6 border-b border-stone-100 flex justify-between items-center bg-stone-50 shrink-0">
              <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-stone-500" />
                Friends
              </h2>
              <button 
                onClick={() => setShowFriends(false)}
                className="p-2 rounded-full hover:bg-stone-200 text-stone-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {!user ? (
                <div className="text-center py-8 text-stone-500">
                  <p className="mb-4">Sign in to connect with friends.</p>
                  <button 
                    onClick={handleLogin}
                    className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${theme.primary} ${theme.hover}`}
                  >
                    Sign In with Google
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Search */}
                  <div>
                    <h3 className="text-sm font-semibold text-stone-700 mb-2">Add Friend</h3>
                    <div className="flex gap-2 mb-4">
                      <input
                        type="email"
                        placeholder="Search by email..."
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        className="flex-1 px-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-200"
                      />
                      <button
                        onClick={searchUsers}
                        className={`px-4 py-2 rounded-xl text-white font-medium transition-colors ${theme.primary} ${theme.hover}`}
                      >
                        <Search className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {searchResults.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {searchResults.map(result => (
                          <div key={result.uid} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                            <div className="flex items-center gap-3">
                              <img src={result.photoURL || ''} alt="" className="w-8 h-8 rounded-full bg-stone-200" />
                              <div>
                                <p className="font-medium text-stone-800 text-sm">{result.displayName}</p>
                                <p className="text-xs text-stone-500">{result.email}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleSendFriendRequest(result.uid)}
                              className="p-2 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-600 transition-colors"
                            >
                              <UserPlus className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Requests */}
                  {friendRequests.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-stone-700 mb-2">Friend Requests</h3>
                      <div className="space-y-2">
                        {friendRequests.map(req => (
                          <div key={req.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                            <span className="text-sm font-medium text-stone-700">Request pending...</span>
                            <div className="flex gap-2">
                              <button
                                onClick={() => acceptFriendRequest(req.id)}
                                className="p-2 rounded-full bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => removeFriend(req.id)}
                                className="p-2 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Friends List */}
                  <div>
                    <h3 className="text-sm font-semibold text-stone-700 mb-2">My Friends</h3>
                    {friends.length === 0 ? (
                      <p className="text-sm text-stone-500 text-center py-4">No friends added yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {friends.map(friend => (
                          <div key={friend.uid} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                            <div className="flex items-center gap-3">
                              <img src={friend.photoURL || ''} alt="" className="w-8 h-8 rounded-full bg-stone-200" />
                              <div>
                                <p className="font-medium text-stone-800 text-sm">{friend.displayName}</p>
                              </div>
                            </div>
                            <UserCheck className="w-5 h-5 text-emerald-500" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
