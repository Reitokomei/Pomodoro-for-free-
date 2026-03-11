import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Message, Chat } from '../types';
import { useAppContext } from '../context/AppContext';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

export function useChat(friendId: string | null) {
  const { user } = useAppContext();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !friendId) {
      setMessages([]);
      setChatId(null);
      return;
    }

    const initChat = async () => {
      setLoading(true);
      try {
        // Find existing chat
        const q1 = query(collection(db, 'chats'), where('participants', '==', [user.uid, friendId]));
        const q2 = query(collection(db, 'chats'), where('participants', '==', [friendId, user.uid]));
        
        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
        
        let currentChatId = null;
        if (!snap1.empty) {
          currentChatId = snap1.docs[0].id;
        } else if (!snap2.empty) {
          currentChatId = snap2.docs[0].id;
        } else {
          // Create new chat
          const newChatRef = await addDoc(collection(db, 'chats'), {
            participants: [user.uid, friendId],
            updatedAt: Date.now()
          });
          currentChatId = newChatRef.id;
        }
        
        setChatId(currentChatId);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'chats');
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [user, friendId]);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages: Message[] = [];
      snapshot.forEach((doc) => {
        newMessages.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(newMessages);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `chats/${chatId}/messages`));

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async (text: string) => {
    if (!user || !chatId || !text.trim()) return;

    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        chatId,
        senderId: user.uid,
        text: text.trim(),
        createdAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `chats/${chatId}/messages`);
    }
  };

  return { messages, sendMessage, loading, chatId };
}
