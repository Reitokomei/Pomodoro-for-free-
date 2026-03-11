import React from 'react';
import { BarChart2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppContext } from '../context/AppContext';

export function Statistics() {
  const { showStats, setShowStats, user, handleLogin, sessions, mode } = useAppContext();

  const calculateStats = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Start of week (Monday)
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diff)).setHours(0,0,0,0);
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

    let daily = 0, weekly = 0, monthly = 0, yearly = 0;
    
    // Chart Data
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      return { name: d.toLocaleDateString('en-US', { weekday: 'short' }), value: 0, date: new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() };
    }).reverse();

    const last4Weeks = Array.from({length: 4}, (_, i) => {
      return { name: `Week ${4-i}`, value: 0, start: startOfWeek - i * 7 * 24 * 60 * 60 * 1000 };
    }).reverse();

    const last12Months = Array.from({length: 12}, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return { name: d.toLocaleDateString('en-US', { month: 'short' }), value: 0, month: d.getMonth(), year: d.getFullYear() };
    }).reverse();
    
    sessions.forEach(s => {
      if (s.completedAt >= startOfDay) daily += s.duration;
      if (s.completedAt >= startOfWeek) weekly += s.duration;
      if (s.completedAt >= startOfMonth) monthly += s.duration;
      if (s.completedAt >= startOfYear) yearly += s.duration;

      // Populate chart data
      const sessionDate = new Date(s.completedAt);
      
      // Daily chart
      const dayData = last7Days.find(d => d.date === new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate()).getTime());
      if (dayData) dayData.value += s.duration / 3600;

      // Weekly chart
      const weekData = last4Weeks.find((w, i) => {
        const nextStart = i < 3 ? last4Weeks[i+1].start : now.getTime();
        return s.completedAt >= w.start && s.completedAt < nextStart;
      });
      if (weekData) weekData.value += s.duration / 3600;

      // Monthly chart
      const monthData = last12Months.find(m => m.month === sessionDate.getMonth() && m.year === sessionDate.getFullYear());
      if (monthData) monthData.value += s.duration / 3600;
    });

    const formatHours = (seconds: number) => (seconds / 3600).toFixed(1);

    return {
      daily: formatHours(daily),
      weekly: formatHours(weekly),
      monthly: formatHours(monthly),
      yearly: formatHours(yearly),
      chartData: {
        daily: last7Days.map(d => ({ ...d, value: Number(d.value.toFixed(1)) })),
        weekly: last4Weeks.map(w => ({ ...w, value: Number(w.value.toFixed(1)) })),
        monthly: last12Months.map(m => ({ ...m, value: Number(m.value.toFixed(1)) }))
      }
    };
  };

  const stats = calculateStats();

  const themeConfig = {
    pomodoro: { text: 'text-rose-600', primary: 'bg-rose-500', hover: 'hover:bg-rose-600' },
    shortBreak: { text: 'text-emerald-600', primary: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
    longBreak: { text: 'text-blue-600', primary: 'bg-blue-500', hover: 'hover:bg-blue-600' },
  };
  const theme = themeConfig[mode];

  return (
    <AnimatePresence>
      {showStats && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-stone-900/90 backdrop-blur-2xl border border-white/20 rounded-[40px] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
              <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter uppercase">
                <BarChart2 className="w-6 h-6 text-white/60" />
                Study Statistics
              </h2>
              <button 
                onClick={() => setShowStats(false)}
                className="p-3 rounded-2xl hover:bg-white/10 text-white/60 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              {!user ? (
                <div className="text-center py-12 text-white/60 bg-white/5 rounded-[32px] border border-white/10 px-6">
                  <p className="mb-6 font-medium">Sign in to track your study hours across devices.</p>
                  <button 
                    onClick={handleLogin}
                    className={`px-8 py-4 rounded-2xl text-white font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${theme.primary} ${theme.hover} border border-white/10`}
                  >
                    Sign In with Google
                  </button>
                </div>
              ) : (
                <div className="space-y-10">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col items-center text-center">
                      <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">Today</span>
                      <span className={`text-3xl font-black ${theme.text} tracking-tighter`}>{stats.daily}</span>
                      <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-1">hours</span>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col items-center text-center">
                      <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">This Week</span>
                      <span className={`text-3xl font-black ${theme.text} tracking-tighter`}>{stats.weekly}</span>
                      <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-1">hours</span>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col items-center text-center">
                      <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">This Month</span>
                      <span className={`text-3xl font-black ${theme.text} tracking-tighter`}>{stats.monthly}</span>
                      <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-1">hours</span>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col items-center text-center">
                      <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-2">This Year</span>
                      <span className={`text-3xl font-black ${theme.text} tracking-tighter`}>{stats.yearly}</span>
                      <span className="text-white/20 text-[10px] font-bold uppercase tracking-widest mt-1">hours</span>
                    </div>
                  </div>

                  <div className="space-y-10">
                    <div className="bg-white/5 p-8 rounded-[32px] border border-white/10">
                      <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6">Last 7 Days</h3>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.chartData.daily}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold'}} />
                            <Tooltip 
                              cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                              contentStyle={{backgroundColor: 'rgba(23,23,23,0.9)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)'}} 
                              itemStyle={{color: '#fff', fontWeight: 'bold'}}
                            />
                            <Bar dataKey="value" fill={mode === 'pomodoro' ? '#f43f5e' : mode === 'shortBreak' ? '#10b981' : '#3b82f6'} radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    
                    <div className="bg-white/5 p-8 rounded-[32px] border border-white/10">
                      <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6">Last 4 Weeks</h3>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.chartData.weekly}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold'}} />
                            <Tooltip 
                              cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                              contentStyle={{backgroundColor: 'rgba(23,23,23,0.9)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)'}} 
                              itemStyle={{color: '#fff', fontWeight: 'bold'}}
                            />
                            <Bar dataKey="value" fill={mode === 'pomodoro' ? '#f43f5e' : mode === 'shortBreak' ? '#10b981' : '#3b82f6'} radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="bg-white/5 p-8 rounded-[32px] border border-white/10">
                      <h3 className="text-xs font-black text-white/40 uppercase tracking-widest mb-6">Last 12 Months</h3>
                      <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.chartData.monthly}>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: 'rgba(255,255,255,0.4)', fontWeight: 'bold'}} />
                            <Tooltip 
                              cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                              contentStyle={{backgroundColor: 'rgba(23,23,23,0.9)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)'}} 
                              itemStyle={{color: '#fff', fontWeight: 'bold'}}
                            />
                            <Bar dataKey="value" fill={mode === 'pomodoro' ? '#f43f5e' : mode === 'shortBreak' ? '#10b981' : '#3b82f6'} radius={[8, 8, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
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
