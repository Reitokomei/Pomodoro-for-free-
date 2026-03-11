import React from 'react';
import { CheckCircle2, LogIn, Youtube, Users, BarChart2, Settings2, Menu, X as CloseIcon, PanelLeftClose, PanelLeftOpen, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Timer } from './components/Timer';
import { Statistics } from './components/Statistics';
import { BackgroundMedia } from './components/BackgroundMedia';
import { Leaderboard } from './components/Leaderboard';
import { Tasks } from './components/Tasks';
import { Mixer } from './components/Mixer';
import { SettingsModal } from './components/SettingsModal';
import { BackgroundVideo } from './components/BackgroundVideo';
import { GamificationHeader } from './components/GamificationHeader';
import { DailyQuests } from './components/DailyQuests';
import { SocialStreak } from './components/SocialStreak';
import { ProfileModal } from './components/ProfileModal';
import { SocialModal } from './components/SocialModal';
import { FriendActivitySidebar } from './components/FriendActivitySidebar';
import { StreakToast } from './components/StreakToast';
import { AMBIENT_SOUNDS, ALARMS } from './constants';

function AppContent() {
  const { 
    settings, 
    mode, 
    user, 
    handleLogin, 
    handleLogout, 
    setShowYoutube, 
    setShowSocialModal, 
    setShowStats, 
    setShowSettings,
    showRightSidebar,
    setShowRightSidebar,
    mixerPlaying,
    alarmAudioRef,
    isActive,
    showSidebar,
    setShowSidebar,
    isLoggingIn
  } = useAppContext();

  const themeConfig = {
    pomodoro: { text: 'text-rose-400', accent: 'bg-rose-500' },
    shortBreak: { text: 'text-emerald-400', accent: 'bg-emerald-500' },
    longBreak: { text: 'text-blue-400', accent: 'bg-blue-500' },
  };
  const theme = themeConfig[mode];

  return (
    <div className="min-h-screen text-white font-sans relative overflow-hidden flex">
      <BackgroundVideo url={settings.videoUrl} />
      
      <audio ref={alarmAudioRef} src={ALARMS[settings.alarmSound]} />

      {/* Sidebar Overlay (Mobile) */}
      <AnimatePresence>
        {showSidebar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowSidebar(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ 
          x: showSidebar ? 0 : -320,
          width: showSidebar ? 320 : 0,
          opacity: showSidebar ? 1 : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed lg:relative z-[70] h-full bg-stone-900/80 backdrop-blur-3xl border-r border-white/10 flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="w-80 h-full flex flex-col p-6 custom-scrollbar overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black tracking-tighter text-white/40 uppercase">Dashboard</h2>
            <button 
              onClick={() => setShowSidebar(false)}
              className="p-2 rounded-xl hover:bg-white/10 text-white/60 lg:hidden"
            >
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-8 pb-12">
            <div className="md:hidden">
              <GamificationHeader />
            </div>
            <DailyQuests />
            <Mixer />
            <SocialStreak />
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative h-screen overflow-hidden">
        {/* Header */}
        <header className={`w-full px-6 py-6 flex items-center justify-between transition-all duration-500 z-50 relative ${isActive ? 'opacity-20 blur-sm pointer-events-none' : 'opacity-100'}`}>
          {/* Left: Sidebar Toggle & Logo */}
          <div className="flex items-center gap-4 z-10">
            <button 
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all group"
              title={showSidebar ? "Close Sidebar" : "Open Sidebar"}
            >
              {showSidebar ? <PanelLeftClose className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h1 className={`text-2xl font-black tracking-tighter ${theme.text} flex items-center gap-2 drop-shadow-lg hidden lg:flex`}>
              <CheckCircle2 className="w-7 h-7" />
              FOCUSFLOW
            </h1>
          </div>

          {/* Center: Profile Widget */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:block">
            <GamificationHeader />
          </div>

          {/* Right: Action Buttons */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-xl z-10">
            {!user && (
              <button 
                onClick={handleLogin}
                disabled={isLoggingIn}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all border border-white/10 ${isLoggingIn ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <LogIn className={`w-4 h-4 ${isLoggingIn ? 'animate-pulse' : ''}`} />
                <span>{isLoggingIn ? 'Signing In...' : 'Sign In'}</span>
              </button>
            )}
            
            {user && <div className="w-px h-5 bg-white/20 mx-1 hidden md:block" />}
            
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setShowYoutube(true)}
                className="p-2 rounded-xl hover:bg-white/10 transition-all text-white/80 hover:text-white"
                title="YouTube Music"
              >
                <Youtube className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowSocialModal(true)}
                className="p-2 rounded-xl hover:bg-white/10 transition-all text-white/80 hover:text-white"
                title="Social Hub"
              >
                <Users className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowRightSidebar(!showRightSidebar)}
                className={`p-2 rounded-xl hover:bg-white/10 transition-all text-white/80 hover:text-white ${showRightSidebar ? 'bg-white/10 text-white' : ''}`}
                title="Friend Activity"
              >
                <Activity className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowStats(true)}
                className="p-2 rounded-xl hover:bg-white/10 transition-all text-white/80 hover:text-white"
                title="Statistics"
              >
                <BarChart2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setShowSettings(true)}
                className="p-2 rounded-xl hover:bg-white/10 transition-all text-white/80 hover:text-white"
                title="Settings"
              >
                <Settings2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Central Timer Area */}
        <main className="flex-1 flex flex-col items-center p-6 relative overflow-y-auto custom-scrollbar">
          <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-12 py-12">
            <Timer />
            <Tasks />
          </div>
        </main>
      </div>

      <FriendActivitySidebar />

      {/* Modals */}
      <SettingsModal />
      <Statistics />
      <BackgroundMedia />
      <Leaderboard />
      <ProfileModal />
      <SocialModal />
      <StreakToast />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
