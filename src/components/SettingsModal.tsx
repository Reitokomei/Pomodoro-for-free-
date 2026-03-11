import { Settings2, X, Volume2, Image as ImageIcon, Clock, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppContext } from '../context/AppContext';
import { ALARMS } from '../constants';
import { playUISound } from '../utils/audio';

export function SettingsModal() {
  const { showSettings, setShowSettings, settings, saveSettings, mode } = useAppContext();

  const themeConfig = {
    pomodoro: { primary: 'bg-rose-500', hover: 'hover:bg-rose-600', text: 'text-rose-400' },
    shortBreak: { primary: 'bg-emerald-500', hover: 'hover:bg-emerald-600', text: 'text-emerald-400' },
    longBreak: { primary: 'bg-blue-500', hover: 'hover:bg-blue-600', text: 'text-blue-400' },
  };
  const theme = themeConfig[mode];

  return (
    <AnimatePresence>
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-stone-900/90 backdrop-blur-2xl border border-white/20 rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh]"
          >
            <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
              <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tighter">
                <Settings2 className="w-6 h-6 text-white/60" />
                SETTINGS
              </h2>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-3 rounded-2xl hover:bg-white/10 text-white/60 hover:text-white transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-10 custom-scrollbar">
              {/* Timers */}
              <section>
                <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> TIMER DURATIONS
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Focus', key: 'pomodoro' },
                    { label: 'Short', key: 'shortBreak' },
                    { label: 'Long', key: 'longBreak' },
                  ].map(({ label, key }) => (
                    <div key={key}>
                      <label className="block text-[10px] font-bold text-white/60 uppercase mb-2 tracking-wider">{label}</label>
                      <input 
                        type="number" 
                        value={settings[key as keyof typeof settings] as number}
                        onChange={(e) => saveSettings({ ...settings, [key]: Number(e.target.value) })}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Video Background */}
              <section>
                <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Video className="w-4 h-4" /> VIDEO BACKGROUND
                </h3>
                <div className="space-y-4">
                  <div className="p-5 bg-white/5 rounded-3xl border border-white/10">
                    <label className="block text-[10px] font-bold text-white/60 uppercase mb-3 tracking-wider">MP4 VIDEO URL</label>
                    <input 
                      type="text" 
                      placeholder="Paste .mp4 link here..."
                      value={settings.videoUrl || ''}
                      onChange={(e) => saveSettings({ ...settings, videoUrl: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    />
                    <p className="mt-3 text-[10px] text-white/30 italic">Tip: Use direct links from Mixkit or Pexels for best results.</p>
                  </div>
                </div>
              </section>

              {/* Preferences */}
              <section>
                <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-6">AUTOMATION</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Auto-start Breaks', key: 'autoStartBreaks' },
                    { label: 'Auto-start Focus', key: 'autoStartPomodoros' },
                  ].map(({ label, key }) => (
                    <div key={key} className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10">
                      <span className="text-sm font-bold text-white/80">{label}</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={settings[key as keyof typeof settings] as boolean}
                          onChange={(e) => saveSettings({ ...settings, [key]: e.target.checked })}
                          className="sr-only peer" 
                        />
                        <div className={`w-12 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${settings[key as keyof typeof settings] ? theme.primary : ''}`}></div>
                      </label>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10">
                    <span className="text-sm font-bold text-white/80">Long Break Interval</span>
                    <input 
                      type="number" 
                      value={settings.longBreakInterval}
                      onChange={(e) => saveSettings({ ...settings, longBreakInterval: Number(e.target.value) })}
                      className="w-20 px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white font-bold text-center focus:outline-none focus:ring-2 focus:ring-white/20"
                    />
                  </div>
                </div>
              </section>

              {/* Sound */}
              <section>
                <h3 className="text-xs font-black text-white/40 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                  <Volume2 className="w-4 h-4" /> AUDIO
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10">
                    <span className="text-sm font-bold text-white/80">Alarm Sound</span>
                    <select 
                      value={settings.alarmSound}
                      onChange={(e) => {
                        saveSettings({ ...settings, alarmSound: e.target.value });
                        const audio = new Audio(ALARMS[e.target.value]);
                        audio.play().catch(() => {});
                      }}
                      className="px-4 py-2 bg-white/10 border border-white/10 rounded-xl text-white text-sm font-bold cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/20"
                    >
                      {Object.keys(ALARMS).map(key => (
                        <option key={key} value={key} className="bg-stone-900">{key.charAt(0).toUpperCase() + key.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center justify-between p-5 bg-white/5 rounded-3xl border border-white/10">
                    <span className="text-sm font-bold text-white/80">UI Interaction Sounds</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={settings.uiSounds}
                        onChange={(e) => {
                          saveSettings({ ...settings, uiSounds: e.target.checked });
                          if (e.target.checked) playUISound('switch', true);
                        }}
                        className="sr-only peer" 
                      />
                      <div className={`w-12 h-7 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all ${settings.uiSounds ? theme.primary : ''}`}></div>
                    </label>
                  </div>
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
