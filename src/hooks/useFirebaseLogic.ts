import { useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, where, getDoc, getDocs, addDoc } from 'firebase/firestore';
import { Settings, Task, UserProfile, Friendship, StudySession } from '../types';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

export function useFirebaseLogic() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friendship[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      
      if (currentUser) {
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userRef);
          
          if (!userDoc.exists()) {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'User',
              photoURL: currentUser.photoURL || '',
              stats: {
                current_streak: 0,
                longest_streak: 0,
                last_study_date: null
              }
            };
            await setDoc(userRef, newProfile, { merge: true });
            setUserProfile(newProfile);
          } else {
            setUserProfile(userDoc.data() as UserProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, `users/${currentUser.uid}`);
        }
      } else {
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthReady) return;
    if (!user) {
      setTasks([]);
      setSessions([]);
      setFriends([]);
      setFriendRequests([]);
      setSettings(null);
      setUserProfile(null);
      return;
    }

    // Listen to user profile updates
    const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserProfile(docSnap.data() as UserProfile);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${user.uid}`));

    // Load Settings
    const settingsRef = doc(db, 'settings', user.uid);
    getDoc(settingsRef).then((docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as Settings);
      }
    }).catch(error => handleFirestoreError(error, OperationType.GET, `settings/${user.uid}`));

    // Listen to Tasks
    const qTasks = query(collection(db, 'tasks'), where('userId', '==', user.uid));
    const unsubTasks = onSnapshot(qTasks, (snap) => {
      const data: Task[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Task));
      setTasks(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'tasks'));

    // Listen to Sessions
    const qSessions = query(collection(db, 'sessions'), where('userId', '==', user.uid));
    const unsubSessions = onSnapshot(qSessions, (snap) => {
      const data: StudySession[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as StudySession));
      setSessions(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'sessions'));

    // Listen to Friend Requests
    const qRequests = query(collection(db, 'friendships'), where('user2', '==', user.uid), where('status', '==', 'pending'));
    
    const unsubRequests = onSnapshot(qRequests, async (snap) => {
      const requests: Friendship[] = [];
      snap.forEach(doc => requests.push({ id: doc.id, ...doc.data() } as Friendship));
      
      // Fetch requester profiles
      const enrichedRequests = await Promise.all(requests.map(async (req) => {
        try {
          const userDoc = await getDoc(doc(db, 'users', req.requester));
          if (userDoc.exists()) {
            return { ...req, requesterProfile: userDoc.data() as UserProfile };
          }
        } catch (error) {
          console.error("Failed to fetch requester profile", error);
        }
        return req;
      }));
      
      setFriendRequests(enrichedRequests);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'friendships'));

    // Listen to Friends
    const qFriends1 = query(collection(db, 'friendships'), where('user1', '==', user.uid), where('status', '==', 'accepted'));
    const qFriends2 = query(collection(db, 'friendships'), where('user2', '==', user.uid), where('status', '==', 'accepted'));
    
    let friendIds: string[] = [];
    let unsubFriends: (() => void)[] = [];

    const updateFriendsListeners = (newFriendIds: string[]) => {
      // Unsubscribe from old listeners
      unsubFriends.forEach(unsub => unsub());
      unsubFriends = [];

      if (newFriendIds.length === 0) {
        setFriends([]);
        return;
      }

      const currentFriends: Record<string, UserProfile> = {};

      newFriendIds.forEach(id => {
        const unsub = onSnapshot(doc(db, 'users', id), (docSnap) => {
          if (docSnap.exists()) {
            currentFriends[id] = docSnap.data() as UserProfile;
            setFriends(Object.values(currentFriends));
          }
        }, (error) => handleFirestoreError(error, OperationType.GET, `users/${id}`));
        unsubFriends.push(unsub);
      });
    };

    let f1: string[] = [];
    let f2: string[] = [];

    const unsubF1 = onSnapshot(qFriends1, (snap) => {
      f1 = snap.docs.map(doc => doc.data().user2);
      const newIds = [...new Set([...f1, ...f2])];
      if (JSON.stringify(newIds) !== JSON.stringify(friendIds)) {
        friendIds = newIds;
        updateFriendsListeners(friendIds);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'friendships'));

    const unsubF2 = onSnapshot(qFriends2, (snap) => {
      f2 = snap.docs.map(doc => doc.data().user1);
      const newIds = [...new Set([...f1, ...f2])];
      if (JSON.stringify(newIds) !== JSON.stringify(friendIds)) {
        friendIds = newIds;
        updateFriendsListeners(friendIds);
      }
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'friendships'));

    return () => {
      unsubProfile();
      unsubTasks();
      unsubSessions();
      unsubRequests();
      unsubF1();
      unsubF2();
      unsubFriends.forEach(unsub => unsub());
    };
  }, [user, isAuthReady]);

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      if (error.code !== 'auth/cancelled-popup-request' && error.code !== 'auth/popup-closed-by-user') {
        console.error("Login failed", error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const saveSettings = async (newSettings: Settings) => {
    if (!user) return;
    try {
      const settingsToSave = {
        ...newSettings,
        userId: user.uid,
        updatedAt: Date.now()
      };
      await setDoc(doc(db, 'settings', user.uid), settingsToSave);
      setSettings(newSettings);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `settings/${user.uid}`);
    }
  };

  const sendFriendRequest = async (targetUserId: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'friendships'), {
        user1: user.uid,
        user2: targetUserId,
        status: 'pending',
        requester: user.uid,
        createdAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'friendships');
    }
  };

  const respondToFriendRequest = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      if (status === 'accepted') {
        await setDoc(doc(db, 'friendships', requestId), { status: 'accepted' }, { merge: true });
      } else {
        await deleteDoc(doc(db, 'friendships', requestId));
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `friendships/${requestId}`);
    }
  };

  const updateStreak = async (newStreak: number, newLongest: number) => {
    if (!user || !userProfile) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        stats: {
          current_streak: newStreak,
          longest_streak: newLongest,
          last_study_date: Date.now()
        }
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}`);
    }
  };

  return {
    user,
    userProfile,
    isAuthReady,
    tasks,
    sessions,
    friends,
    friendRequests,
    settings,
    handleLogin,
    isLoggingIn,
    handleLogout,
    saveSettings,
    sendFriendRequest,
    respondToFriendRequest,
    updateStreak
  };
}
