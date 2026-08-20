import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Settings, 
  Printer, 
  Volume2, 
  SmartphoneNfc, 
  Clock, 
  Layers, 
  RotateCcw,
  Sparkles,
  Info,
  Check
} from 'lucide-react';
import { AppSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (updater: (prev: AppSettings) => AppSettings) => void;
  activeCounterName?: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  activeCounterName = 'Attendance Counter'
}) => {
  if (!isOpen) return null;

  const handleResetDefaults = () => {
    onUpdateSettings(() => ({
      soundEnabled: true,
      hapticEnabled: true,
      autoIncrementOnQR: true,
      autoIncrementDebounceSeconds: 2,
      vibrateOnScan: true,
      keepScreenAwake: false,
      continuousScan: true,
      defaultStep: 1,
      autoPrintOnNFCScan: false,
    }));
  };

  return (
    <AnimatePresence>
      <div 
        id="settings-modal-overlay"
        className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          id="settings-modal-container"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>System & Scanner Configuration</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Manage NFC card printing, automatic counting, debounce & hardware audio
                </p>
              </div>
            </div>

            <button
              id="btn-close-settings-modal"
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl border border-slate-200 hover:bg-slate-200/80 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
              title="Close Settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body / Settings List */}
          <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            
            {/* 1. NFC PRINTING CONFIGURATION (KEY HIGHLIGHT) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/60 border-2 border-indigo-200 shadow-2xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs shrink-0 mt-0.5">
                    <Printer className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900">
                        Automatic NFC Card Printing
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        settings.autoPrintOnNFCScan
                          ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          : 'bg-slate-200 border-slate-300 text-slate-600'
                      }`}>
                        {settings.autoPrintOnNFCScan ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Immediately trigger the printer to output the student smart pass badge & verification certificate as soon as an NFC contactless scan succeeds.
                    </p>
                  </div>
                </div>

                <button
                  id="toggle-auto-print-nfc"
                  type="button"
                  onClick={() => onUpdateSettings(prev => ({ ...prev, autoPrintOnNFCScan: !prev.autoPrintOnNFCScan }))}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    settings.autoPrintOnNFCScan ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={settings.autoPrintOnNFCScan}
                  title="Enable or disable automatic printing upon NFC scan"
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                      settings.autoPrintOnNFCScan ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {settings.autoPrintOnNFCScan && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-2 border-t border-indigo-100 flex items-center gap-2 text-[11px] text-indigo-900"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>
                    When active, a high-resolution CR80 ID pass is sent straight to your connected badge or thermal printer without manual confirmation.
                  </span>
                </motion.div>
              )}
            </div>

            {/* 2. AUTO INCREMENT LINKAGE */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-slate-200 flex items-center justify-center text-indigo-700 shrink-0 mt-0.5">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900">
                    Auto-Increment Attendance Counter (+1 on scan)
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Automatically add +1 to <strong className="text-slate-800">{activeCounterName}</strong> on every student card or QR scan.
                  </p>
                </div>
              </div>

              <button
                id="toggle-auto-increment-setting"
                type="button"
                onClick={() => onUpdateSettings(prev => ({ ...prev, autoIncrementOnQR: !prev.autoIncrementOnQR }))}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.autoIncrementOnQR ? 'bg-indigo-600' : 'bg-slate-300'
                }`}
                role="switch"
                aria-checked={settings.autoIncrementOnQR}
              >
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                    settings.autoIncrementOnQR ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* 3. HARDWARE SCAN DEBOUNCE DELAY */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-600" />
                  <span className="text-xs sm:text-sm font-bold text-slate-900">
                    Duplicate Scan Cooldown (Debounce)
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-lg">
                  {settings.autoIncrementDebounceSeconds || 2}s
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Prevents accidental double scans when holding or waving a student card over the NFC terminal.
              </p>
              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 5].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => onUpdateSettings(prev => ({ ...prev, autoIncrementDebounceSeconds: sec }))}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      (settings.autoIncrementDebounceSeconds || 2) === sec
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {sec} sec
                  </button>
                ))}
              </div>
            </div>

            {/* 4. AUDIO & HAPTIC FEEDBACK */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sound Audio Feedback */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-4 h-4 text-indigo-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Audio Chime</div>
                    <div className="text-[10px] text-slate-500">Scan & tally sound FX</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    settings.soundEnabled ? 'bg-indigo-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={settings.soundEnabled}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                      settings.soundEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Haptic Vibration Feedback */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <SmartphoneNfc className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Haptic Vibration</div>
                    <div className="text-[10px] text-slate-500">Pulse on card tap</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateSettings(prev => ({ ...prev, hapticEnabled: !prev.hapticEnabled, vibrateOnScan: !prev.hapticEnabled }))}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    settings.hapticEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                  role="switch"
                  aria-checked={settings.hapticEnabled}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ease-in-out ${
                      settings.hapticEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

          </div>

          {/* Footer Bar */}
          <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Save & Done</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
