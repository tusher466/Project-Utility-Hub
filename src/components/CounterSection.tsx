import React, { useState, useEffect, useRef } from 'react';
import { 
  Target, 
  PlusCircle, 
  Trash2, 
  Edit3,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { CounterItem, CounterLog, AppSettings } from '../types';
import { sound } from '../utils/audio';

interface CounterSectionProps {
  counters: CounterItem[];
  activeCounterId: string;
  onSelectCounter: (id: string) => void;
  onAddCounter: (name: string, target?: number) => void;
  onDeleteCounter: (id: string) => void;
  onUpdateCounterCount: (id: string, delta: number, reason: CounterLog['reason'], note?: string) => void;
  onSetCounterDirect: (id: string, newCount: number) => void;
  onResetCounter: (id: string) => void;
  onUpdateCounterSettings: (id: string, updates: Partial<CounterItem>) => void;
  logs: CounterLog[];
  settings: AppSettings;
}

export const CounterSection: React.FC<CounterSectionProps> = ({
  counters,
  activeCounterId,
  onSelectCounter,
  onAddCounter,
  onDeleteCounter,
  onUpdateCounterCount,
  onSetCounterDirect,
  onResetCounter,
  onUpdateCounterSettings,
  logs,
  settings,
}) => {
  const activeCounter = counters.find(c => c.id === activeCounterId) || counters[0];

  const [stepSize, setStepSize] = useState<number>(activeCounter?.step || 1);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>('');
  const [editTargetValue, setEditTargetValue] = useState<string>('');
  const [showNewCounterModal, setShowNewCounterModal] = useState<boolean>(false);
  const [newCounterName, setNewCounterName] = useState<string>('');
  const [newCounterTarget, setNewCounterTarget] = useState<string>('');
  const [showResetConfirm, setShowResetConfirm] = useState<boolean>(false);
  const [animatePulse, setAnimatePulse] = useState<boolean>(false);

  // Sync step size when active counter changes
  useEffect(() => {
    if (activeCounter) {
      setStepSize(activeCounter.step || 1);
    }
  }, [activeCounter?.id]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.code === 'Space' || e.key === 'ArrowUp') {
        e.preventDefault();
        handleIncrement();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleDecrement();
      } else if (e.key === 'r' || e.key === 'R') {
        if (!showResetConfirm) {
          setShowResetConfirm(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeCounter, stepSize, settings]);

  const triggerAnimation = () => {
    setAnimatePulse(true);
    setTimeout(() => setAnimatePulse(false), 180);
  };

  const handleIncrement = (amount: number = stepSize) => {
    if (!activeCounter) return;

    if (settings.soundEnabled) sound.playIncrement();
    if (settings.hapticEnabled) sound.vibrate(30);

    triggerAnimation();

    const previousCount = activeCounter.count;
    const newCount = previousCount + amount;

    if (activeCounter.target && previousCount < activeCounter.target && newCount >= activeCounter.target) {
      if (settings.soundEnabled) sound.playTargetFanfare();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    onUpdateCounterCount(activeCounter.id, amount, 'manual_increment');
  };

  const handleDecrement = (amount: number = stepSize) => {
    if (!activeCounter) return;

    if (settings.soundEnabled) sound.playDecrement();
    if (settings.hapticEnabled) sound.vibrate(25);

    triggerAnimation();

    onUpdateCounterCount(activeCounter.id, -amount, 'manual_decrement');
  };

  const handleReset = () => {
    if (!activeCounter) return;

    if (settings.soundEnabled) sound.playReset();
    if (settings.hapticEnabled) sound.vibrate([40, 40, 40]);

    onResetCounter(activeCounter.id);
    setShowResetConfirm(false);
  };

  const handleDirectSetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCounter) return;

    const parsed = parseInt(editValue, 10);
    if (!isNaN(parsed)) {
      onSetCounterDirect(activeCounter.id, parsed);
    }

    const parsedTarget = editTargetValue.trim() === '' ? undefined : parseInt(editTargetValue, 10);
    onUpdateCounterSettings(activeCounter.id, {
      target: isNaN(parsedTarget as number) ? undefined : parsedTarget,
      step: stepSize
    });

    setShowEditModal(false);
  };

  const handleCreateCounterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newCounterName.trim() || `Counter ${counters.length + 1}`;
    const target = newCounterTarget.trim() ? parseInt(newCounterTarget, 10) : undefined;
    onAddCounter(name, isNaN(target as number) ? undefined : target);
    setNewCounterName('');
    setNewCounterTarget('');
    setShowNewCounterModal(false);
  };

  const target = activeCounter?.target;
  const count = activeCounter?.count ?? 0;
  const progressPercent = target && target > 0 ? Math.min(100, Math.max(0, Math.round((count / target) * 100))) : null;
  const isTargetMet = target && count >= target;

  const activeLogs = logs.filter(l => l.counterId === activeCounter?.id).slice(0, 4);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 sm:p-8 flex flex-col h-full">
      {/* Top Header & Counter Category Switcher */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Precision Counter
          </h2>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
            CALIBRATED
          </span>
        </div>

        <div className="flex items-center gap-2">
          {showResetConfirm ? (
            <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 p-1 rounded-lg">
              <span className="text-[11px] text-rose-700 font-medium px-1">Reset to 0?</span>
              <button
                id="btn-confirm-reset"
                onClick={handleReset}
                className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors"
              >
                Yes
              </button>
              <button
                id="btn-cancel-reset"
                onClick={() => setShowResetConfirm(false)}
                className="px-2 py-0.5 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs"
              >
                No
              </button>
            </div>
          ) : (
            <button
              id="btn-reset-counter"
              onClick={() => setShowResetConfirm(true)}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset All</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs for Multiple Counters */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3 border-b border-slate-100 max-w-full">
        {counters.map(c => (
          <button
            key={c.id}
            id={`counter-tab-${c.id}`}
            onClick={() => onSelectCounter(c.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
              c.id === activeCounter?.id
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: c.color || '#6366f1' }} />
            <span>{c.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono overflow-hidden inline-flex items-center justify-center min-w-[20px] ${c.id === activeCounter?.id ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'}`}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={c.count}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                >
                  {c.count}
                </motion.span>
              </AnimatePresence>
            </span>
          </button>
        ))}
        <button
          id="btn-new-counter"
          onClick={() => setShowNewCounterModal(true)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-900 bg-white border border-dashed border-slate-300 hover:border-slate-400 transition-all shrink-0"
          title="Add another counter category"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New</span>
        </button>

        {counters.length > 1 && (
          <button
            id="btn-delete-counter"
            onClick={() => onDeleteCounter(activeCounter.id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all ml-auto shrink-0"
            title="Delete this counter"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Center Tally Display */}
      <div className="flex-1 flex flex-col items-center justify-center my-6 sm:my-8 select-none">
        <div className="text-xs text-slate-400 mb-1 uppercase tracking-widest font-semibold">
          Current Tally
        </div>

        {/* Big Number with Framer Motion slide-up animation */}
        <div
          onClick={() => {
            setEditValue(count.toString());
            setEditTargetValue(target !== undefined ? target.toString() : '');
            setShowEditModal(true);
          }}
          className={`cursor-pointer group relative flex flex-col items-center justify-center py-2 min-h-[110px] sm:min-h-[140px] transition-transform duration-150 ${
            animatePulse ? 'scale-105' : 'hover:scale-[1.01]'
          }`}
          title="Click to directly adjust value or target"
        >
          <div className="relative overflow-hidden py-1 px-4 flex items-center justify-center min-w-[120px]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={`${activeCounter?.id}-${count}`}
                initial={{ opacity: 0, y: 22, filter: 'blur(2px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -22, filter: 'blur(2px)' }}
                transition={{
                  type: 'spring',
                  stiffness: 420,
                  damping: 28,
                  mass: 0.7
                }}
                className="text-7xl sm:text-8xl md:text-9xl font-black text-slate-900 tabular-nums tracking-tight drop-shadow-xs select-none"
              >
                {count.toLocaleString()}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-slate-400 group-hover:text-indigo-600 transition-colors mt-1 font-medium">
            <Edit3 className="w-3 h-3" />
            <span>Click number to edit</span>
          </div>
        </div>

        {/* Target Goal Progress Bar if configured */}
        {target !== undefined && (
          <div className="w-full max-w-xs mt-3 px-2">
            <div className="flex items-center justify-between text-xs mb-1 font-medium">
              <span className="text-slate-500 flex items-center gap-1">
                <Target className="w-3 h-3 text-indigo-600" />
                Target: {target}
              </span>
              <span className={`font-mono font-semibold ${isTargetMet ? 'text-emerald-600' : 'text-slate-700'}`}>
                {progressPercent}% {isTargetMet && '✓ Reached'}
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isTargetMet ? 'bg-emerald-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Increment / Decrement Buttons Grid */}
      <div className="grid grid-cols-2 gap-4 w-full mb-5">
        {/* Increment (Primary Dark Slate Button) */}
        <button
          id="btn-counter-increment"
          onClick={() => handleIncrement()}
          className="h-20 sm:h-24 bg-slate-900 text-white rounded-xl flex flex-col items-center justify-center hover:bg-slate-800 active:scale-95 transition-all shadow-sm group"
          title="Increment count (Shortcut: Space or Up Arrow)"
        >
          <span className="text-3xl sm:text-4xl font-light leading-none group-hover:scale-110 transition-transform">+</span>
          <span className="text-xs font-semibold uppercase tracking-wider mt-1.5">
            Increment (+{stepSize})
          </span>
        </button>

        {/* Decrement (Crisp Light Border Button) */}
        <button
          id="btn-counter-decrement"
          onClick={() => handleDecrement()}
          className="h-20 sm:h-24 border-2 border-slate-200 text-slate-700 bg-white rounded-xl flex flex-col items-center justify-center hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all shadow-2xs group"
          title="Decrement count (Shortcut: Down Arrow)"
        >
          <span className="text-3xl sm:text-4xl font-light leading-none group-hover:scale-110 transition-transform">−</span>
          <span className="text-xs font-semibold uppercase tracking-wider mt-1.5">
            Decrement (-{stepSize})
          </span>
        </button>
      </div>

      {/* Step Size Selector Pills */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 mb-4">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
          Step:
        </span>
        <div className="flex items-center gap-1 overflow-x-auto">
          {[1, 5, 10, 25, 50, 100].map(val => (
            <button
              key={val}
              id={`btn-step-${val}`}
              onClick={() => {
                setStepSize(val);
                onUpdateCounterSettings(activeCounter.id, { step: val });
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold transition-all ${
                stepSize === val
                  ? 'bg-white text-slate-900 border border-slate-300 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Session Activity Info */}
      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
        <span>Session high: {Math.max(...counters.map(c => c.count), count)}</span>
        <span>
          {activeLogs.length > 0
            ? `Last activity: ${new Date(activeLogs[0].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'Hotkeys: Space / ↑ (+), ↓ (-)'}
        </span>
      </div>

      {/* Manual Direct Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-indigo-600" />
              Edit Counter Value
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Directly adjust the count number and optional target goal for "{activeCounter.name}".
            </p>

            <form onSubmit={handleDirectSetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Current Count
                </label>
                <input
                  type="number"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-base focus:outline-none focus:border-indigo-600 focus:bg-white"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Target Goal (Optional)</span>
                  <span className="text-[11px] text-slate-400">Leave blank for none</span>
                </label>
                <input
                  type="number"
                  placeholder="e.g. 100"
                  value={editTargetValue}
                  onChange={e => setEditTargetValue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Counter Tab Modal */}
      {showNewCounterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              Create New Counter
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add a separate tally counter for event check-ins, sets, or inventory.
            </p>

            <form onSubmit={handleCreateCounterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Counter Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Gate 1 Passes, Inventory"
                  value={newCounterName}
                  onChange={e => setNewCounterName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                  autoFocus
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Goal (Optional)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 500"
                  value={newCounterTarget}
                  onChange={e => setNewCounterTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono text-sm focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCounterModal(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
