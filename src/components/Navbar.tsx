import React, { useState, useEffect } from 'react';
import { 
  Columns2, 
  Hash, 
  QrCode, 
  History, 
  Volume2, 
  VolumeX, 
  SmartphoneNfc,
  Printer,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppViewMode, AppSettings } from '../types';
import { SettingsModal } from './SettingsModal';

interface NavbarProps {
  currentView: AppViewMode;
  onViewChange: (view: AppViewMode) => void;
  settings: AppSettings;
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  activeCount: number;
  totalScans: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onViewChange,
  settings,
  onUpdateSettings,
  activeCount,
  totalScans
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' • ' +
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 shadow-xs">
      {/* Left: Brand Identity */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-xs">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <div>
          <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center">
            Utility Hub
            <span className="text-slate-400 font-normal ml-2 text-xs hidden sm:inline">| Precision Suite</span>
          </h1>
        </div>
      </div>

      {/* Center: View Switcher Tabs */}
      <nav className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs sm:text-sm font-medium">
        <button
          id="nav-tab-dual"
          onClick={() => onViewChange('dual')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            currentView === 'dual'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
          title="Split Dual View (Counter + QR Scanner)"
        >
          <Columns2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
          <span className="hidden md:inline">Dual View</span>
          <span className="md:hidden">Dual</span>
        </button>

        <button
          id="nav-tab-counter"
          onClick={() => onViewChange('counter')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            currentView === 'counter'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
          title="Tally Counter View"
        >
          <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
          <span>Counter</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-mono font-medium hidden sm:inline-flex overflow-hidden min-w-[18px] items-center justify-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={activeCount}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                {activeCount}
              </motion.span>
            </AnimatePresence>
          </span>
        </button>

        <button
          id="nav-tab-scanner"
          onClick={() => onViewChange('scanner')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            currentView === 'scanner'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
          title="Student's Scan Corner (NFC & QR)"
        >
          <SmartphoneNfc className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600" />
          <span className="hidden sm:inline">Student Scan</span>
          <span className="sm:hidden">Scan</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200/80 text-slate-700 font-mono font-medium hidden md:inline-flex overflow-hidden min-w-[18px] items-center justify-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={totalScans}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                {totalScans}
              </motion.span>
            </AnimatePresence>
          </span>
        </button>

        <button
          id="nav-tab-history"
          onClick={() => onViewChange('history')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            currentView === 'history'
              ? 'bg-white text-slate-900 shadow-xs font-semibold'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
          title="Scan Records & History Logs"
        >
          <History className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
          <span className="hidden sm:inline">Records</span>
        </button>
      </nav>

      {/* Right: System Status & Quick Toggles */}
      <div className="flex items-center gap-4 sm:gap-6">
        <div className="hidden lg:flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
          <span className="text-xs font-medium text-slate-600">System Ready</span>
        </div>

        <div className="text-xs text-slate-400 font-mono hidden xl:block">
          {currentTime}
        </div>

        {/* Audio Toggle */}
        <div className="flex items-center gap-1.5">
          <button
            id="btn-toggle-sound"
            onClick={() => onUpdateSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
            className={`p-2 rounded-lg border transition-all ${
              settings.soundEnabled
                ? 'bg-slate-50 border-slate-300 text-indigo-600 hover:bg-slate-100'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title={settings.soundEnabled ? 'Mute Audio Sound' : 'Enable Audio Feedback'}
            aria-label={settings.soundEnabled ? 'Sound On' : 'Sound Muted'}
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Haptic Toggle */}
          <button
            id="btn-toggle-haptic"
            onClick={() => onUpdateSettings(prev => ({ ...prev, hapticEnabled: !prev.hapticEnabled, vibrateOnScan: !prev.hapticEnabled }))}
            className={`hidden sm:flex p-2 rounded-lg border transition-all ${
              settings.hapticEnabled
                ? 'bg-slate-50 border-slate-300 text-emerald-600 hover:bg-slate-100'
                : 'bg-white border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50'
            }`}
            title={settings.hapticEnabled ? 'Haptic Vibration On' : 'Haptic Vibration Disabled'}
            aria-label="Toggle Vibration"
          >
            <SmartphoneNfc className="w-4 h-4" />
          </button>

          {/* Configuration / Settings Button */}
          <button
            id="btn-navbar-settings"
            onClick={() => setIsSettingsOpen(true)}
            className={`p-2 rounded-lg border transition-all flex items-center gap-1.5 ${
              settings.autoPrintOnNFCScan
                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title="System & Scanner Configuration (NFC Auto-Print, Debounce, Audio)"
            aria-label="Open Settings"
          >
            <Settings className="w-4 h-4" />
            {settings.autoPrintOnNFCScan && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Auto-Print Active" />
            )}
          </button>
        </div>
      </div>

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={onUpdateSettings}
      />
    </header>
  );
};
