import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, Trash2, User, ChevronUp, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { collection, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/errorHandling';

export function Tasks() {
  const { tasks, user, handleLogin, isLoggingIn, mode } = useAppContext();
  const [newTaskText, setNewTaskText] = useState('');

  const themeConfig = {
    pomodoro: { primary: 'bg-rose-500', hover: 'hover:bg-rose-600', text: 'text-rose-400', border: 'border-rose-500/20' },
    shortBreak: { primary: 'bg-emerald-500', hover: 'hover:bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-500/20' },
    longBreak: { primary: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-blue-400', border: 'border-blue-500/20' },
  };
  const theme = themeConfig[mode];

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !user) return;
    
    try {
      const docRef = doc(collection(db, 'tasks'));
      await setDoc(docRef, {
        text: newTaskText,
        completed: false,
        userId: user.uid,
        createdAt: Date.now(),
        subtasks: [],
        notes: '',
        isExpanded: false
      });
      setNewTaskText('');
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'tasks');
    }
  };

  const toggleTask = async (id: string, completed: boolean) => {
    try {
      await setDoc(doc(db, 'tasks', id), { completed: !completed }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${id}`);
    }
  };

  const toggleTaskExpand = async (id: string, isExpanded: boolean) => {
    try {
      await setDoc(doc(db, 'tasks', id), { isExpanded: !isExpanded }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${id}`);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'tasks', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `tasks/${id}`);
    }
  };

  const addSubtask = async (taskId: string, subtasks: any[], text: string) => {
    if (!text.trim()) return;
    const newSubtask = {
      id: crypto.randomUUID(),
      text,
      completed: false
    };
    try {
      await setDoc(doc(db, 'tasks', taskId), { 
        subtasks: [...(subtasks || []), newSubtask] 
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const toggleSubtask = async (taskId: string, subtasks: any[], subtaskId: string) => {
    const updatedSubtasks = subtasks.map(st => 
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    try {
      await setDoc(doc(db, 'tasks', taskId), { subtasks: updatedSubtasks }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  const deleteSubtask = async (taskId: string, subtasks: any[], subtaskId: string) => {
    const updatedSubtasks = subtasks.filter(st => st.id !== subtaskId);
    try {
      await setDoc(doc(db, 'tasks', taskId), { subtasks: updatedSubtasks }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `tasks/${taskId}`);
    }
  };

  return (
    <div className="w-full bg-stone-900/40 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl ${theme.primary}/10 border ${theme.border}`}>
            <CheckCircle2 className={`w-6 h-6 ${theme.text}`} />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tighter uppercase">Tasks</h2>
            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Focus on one at a time</p>
          </div>
        </div>
        <div className="px-4 py-1.5 bg-white/5 rounded-full border border-white/10">
          <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">
            {tasks.filter(t => t.completed).length}/{tasks.length} Done
          </span>
        </div>
      </div>

      {user ? (
        <div className="space-y-6">
          <form onSubmit={addTask} className="relative group">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="What are you working on?"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all placeholder:text-white/20 font-medium"
            />
            <button
              type="submit"
              disabled={!newTaskText.trim()}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl ${theme.primary} text-white transition-all shadow-lg disabled:opacity-30`}
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {tasks.map((task) => (
                <motion.div
                  key={task.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`group flex flex-col rounded-3xl border transition-all overflow-hidden ${
                    task.completed 
                      ? 'bg-emerald-500/5 border-emerald-500/10 opacity-60' 
                      : 'bg-white/5 border-white/5 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => toggleTask(task.id, task.completed)}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                          task.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                      >
                        {task.completed && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                      <span className={`text-sm font-bold transition-all tracking-tight ${
                        task.completed ? 'text-white/40 line-through' : 'text-white/90'
                      }`}>
                        {task.text}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleTaskExpand(task.id, !!task.isExpanded)}
                        className={`p-2 rounded-xl transition-all ${task.isExpanded ? theme.text + ' bg-white/5' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
                      >
                        {task.isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 rounded-xl text-white/0 group-hover:text-white/20 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {task.isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-white/5 bg-black/20 p-6 space-y-6"
                      >
                        {/* Subtasks Section */}
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Subtasks</p>
                          <div className="space-y-2">
                            {task.subtasks?.map((subtask) => (
                              <div key={subtask.id} className="flex items-center justify-between group/sub">
                                <div className="flex items-center gap-3">
                                  <button
                                    onClick={() => toggleSubtask(task.id, task.subtasks || [], subtask.id)}
                                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                                      subtask.completed
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : 'border-white/20 hover:border-white/40'
                                    }`}
                                  >
                                    {subtask.completed && <CheckCircle2 className="w-3 h-3" />}
                                  </button>
                                  <span className={`text-xs font-medium transition-all ${
                                    subtask.completed ? 'text-white/30 line-through' : 'text-white/70'
                                  }`}>
                                    {subtask.text}
                                  </span>
                                </div>
                                <button
                                  onClick={() => deleteSubtask(task.id, task.subtasks || [], subtask.id)}
                                  className="p-1 rounded text-white/0 group-hover/sub:text-white/20 hover:text-rose-400 transition-all"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                          <form 
                            onSubmit={(e) => {
                              e.preventDefault();
                              const input = e.currentTarget.elements.namedItem('subtask') as HTMLInputElement;
                              addSubtask(task.id, task.subtasks || [], input.value);
                              input.value = '';
                            }}
                            className="relative"
                          >
                            <input
                              name="subtask"
                              type="text"
                              placeholder="Add a subtask..."
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-white/20 transition-all placeholder:text-white/10"
                            />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-all">
                              <Plus className="w-4 h-4" />
                            </button>
                          </form>
                        </div>

                        {/* Notes Section */}
                        <div className="space-y-2">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-widest ml-1">Notes</p>
                          <textarea
                            value={task.notes || ''}
                            onChange={async (e) => {
                              try {
                                await setDoc(doc(db, 'tasks', task.id), { notes: e.target.value }, { merge: true });
                              } catch (err) {
                                handleFirestoreError(err, OperationType.UPDATE, `tasks/${task.id}`);
                              }
                            }}
                            placeholder="Add details, links, or thoughts..."
                            className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-xs text-white/80 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all resize-none min-h-[100px] font-medium leading-relaxed"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {tasks.length === 0 && (
              <div className="text-center py-12 bg-white/5 rounded-[32px] border border-dashed border-white/10">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6 text-white/10" />
                </div>
                <p className="text-white/30 text-xs font-black uppercase tracking-widest">Your list is empty</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white/5 rounded-[32px] border border-dashed border-white/10">
          <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-white/10" />
          </div>
          <h3 className="text-white font-black uppercase tracking-widest mb-2">Sign in to save tasks</h3>
          <p className="text-white/30 text-xs mb-8 max-w-[200px] mx-auto">Sync your progress across devices and earn focus rewards.</p>
          <button
            onClick={handleLogin}
            disabled={isLoggingIn}
            className={`px-8 py-3 ${theme.primary} text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 shadow-xl`}
          >
            {isLoggingIn ? 'Signing In...' : 'Sign In with Google'}
          </button>
        </div>
      )}
    </div>
  );
}
