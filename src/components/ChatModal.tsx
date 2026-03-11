import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Send, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { useChat } from '../hooks/useChat';
import { useAppContext } from '../context/AppContext';

interface ChatModalProps {
  friend: UserProfile;
  onClose: () => void;
}

export function ChatModal({ friend, onClose }: ChatModalProps) {
  const { user } = useAppContext();
  const { messages, sendMessage, loading } = useChat(friend.uid);
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await sendMessage(text);
    setText('');
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-88 w-80 bg-stone-900 border border-white/10 rounded-2xl shadow-2xl z-[80] flex flex-col overflow-hidden"
      style={{ height: '400px' }}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-stone-950/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-stone-800 flex items-center justify-center">
              {friend.photoURL ? (
                <img src={friend.photoURL} alt={friend.displayName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <span className="text-white/50 text-xs font-bold">{friend.displayName.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-stone-900 ${
              friend.isOnline ? 'bg-emerald-500' : 'bg-stone-600'
            }`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{friend.displayName}</h3>
            <p className="text-[10px] text-white/50">{friend.status || 'Offline'}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/30 text-xs">
            No messages yet. Say hi!
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                  isMe ? 'bg-emerald-500 text-white rounded-tr-sm' : 'bg-white/10 text-white/90 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[9px] text-white/30 mt-1 px-1">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 border-t border-white/10 bg-stone-950/50 flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="p-2 rounded-xl bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-600 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
}
