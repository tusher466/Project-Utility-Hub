import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CounterSection } from './components/CounterSection';
import { StudentScanCorner } from './components/StudentScanCorner';
import { ScanHistorySection } from './components/ScanHistorySection';
import { 
  CounterItem, 
  CounterLog, 
  ScanRecord, 
  AppSettings, 
  AppViewMode 
} from './types';

const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  hapticEnabled: true,
  autoIncrementOnQR: true,
  autoIncrementDebounceSeconds: 2,
  vibrateOnScan: true,
  keepScreenAwake: false,
  continuousScan: true,
  defaultStep: 1,
  autoPrintOnNFCScan: false,
};

const INITIAL_COUNTERS: CounterItem[] = [
  {
    id: 'counter_main',
    name: 'Class Attendance & Tally',
    count: 1284,
    step: 1,
    target: 2000,
    color: '#4f46e5',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'counter_passes',
    name: 'Student Event Check-in',
    count: 142,
    step: 1,
    target: 500,
    color: '#0ea5e9',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState<AppViewMode>('dual');

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('count_qr_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [counters, setCounters] = useState<CounterItem[]>(() => {
    try {
      const saved = localStorage.getItem('count_qr_counters');
      return saved ? JSON.parse(saved) : INITIAL_COUNTERS;
    } catch {
      return INITIAL_COUNTERS;
    }
  });

  const [activeCounterId, setActiveCounterId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('count_qr_active_id');
      return saved || (INITIAL_COUNTERS[0]?.id ?? 'counter_main');
    } catch {
      return 'counter_main';
    }
  });

  const [counterLogs, setCounterLogs] = useState<CounterLog[]>(() => {
    try {
      const saved = localStorage.getItem('count_qr_counter_logs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [scanRecords, setScanRecords] = useState<ScanRecord[]>(() => {
    try {
      const saved = localStorage.getItem('count_qr_scan_records');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<{ id: string; text: string; type: 'info' | 'success' } | null>(null);

  useEffect(() => {
    localStorage.setItem('count_qr_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('count_qr_counters', JSON.stringify(counters));
  }, [counters]);

  useEffect(() => {
    localStorage.setItem('count_qr_active_id', activeCounterId);
  }, [activeCounterId]);

  useEffect(() => {
    localStorage.setItem('count_qr_counter_logs', JSON.stringify(counterLogs.slice(0, 100)));
  }, [counterLogs]);

  useEffect(() => {
    localStorage.setItem('count_qr_scan_records', JSON.stringify(scanRecords.slice(0, 200)));
  }, [scanRecords]);

  const showToast = (text: string, type: 'info' | 'success' = 'info') => {
    const id = Math.random().toString();
    setToastMessage({ id, text, type });
    setTimeout(() => {
      setToastMessage(current => (current?.id === id ? null : current));
    }, 2800);
  };

  const activeCounter = counters.find(c => c.id === activeCounterId) || counters[0] || INITIAL_COUNTERS[0];

  const handleUpdateCounterCount = (
    id: string,
    delta: number,
    reason: CounterLog['reason'],
    note?: string
  ) => {
    setCounters(prevCounters =>
      prevCounters.map(counter => {
        if (counter.id === id) {
          const previousValue = counter.count;
          const newValue = Math.max(counter.minLimit ?? 0, previousValue + delta);
          
          const newLog: CounterLog = {
            id: 'log_' + Math.random().toString(36).substring(2, 9),
            counterId: counter.id,
            counterName: counter.name,
            previousValue,
            newValue,
            delta,
            reason,
            timestamp: Date.now(),
            note
          };
          setCounterLogs(logs => [newLog, ...logs]);

          return {
            ...counter,
            count: newValue,
            updatedAt: Date.now(),
          };
        }
        return counter;
      })
    );
  };

  const handleSetCounterDirect = (id: string, newCount: number) => {
    setCounters(prevCounters =>
      prevCounters.map(counter => {
        if (counter.id === id) {
          const previousValue = counter.count;
          const delta = newCount - previousValue;
          
          const newLog: CounterLog = {
            id: 'log_' + Math.random().toString(36).substring(2, 9),
            counterId: counter.id,
            counterName: counter.name,
            previousValue,
            newValue: newCount,
            delta,
            reason: 'manual_set',
            timestamp: Date.now(),
          };
          setCounterLogs(logs => [newLog, ...logs]);

          return {
            ...counter,
            count: newCount,
            updatedAt: Date.now(),
          };
        }
        return counter;
      })
    );
    showToast(`Set ${activeCounter.name} to ${newCount}`, 'success');
  };

  const handleResetCounter = (id: string) => {
    setCounters(prevCounters =>
      prevCounters.map(counter => {
        if (counter.id === id) {
          const previousValue = counter.count;
          const newLog: CounterLog = {
            id: 'log_' + Math.random().toString(36).substring(2, 9),
            counterId: counter.id,
            counterName: counter.name,
            previousValue,
            newValue: 0,
            delta: -previousValue,
            reason: 'reset',
            timestamp: Date.now(),
          };
          setCounterLogs(logs => [newLog, ...logs]);

          return {
            ...counter,
            count: 0,
            updatedAt: Date.now(),
          };
        }
        return counter;
      })
    );
    showToast(`Reset ${activeCounter.name} to 0`, 'info');
  };

  const handleAddCounter = (name: string, target?: number) => {
    const palette = ['#4f46e5', '#0284c7', '#059669', '#d97706', '#db2777', '#7c3aed'];
    const newId = 'counter_' + Math.random().toString(36).substring(2, 9);
    const newCounter: CounterItem = {
      id: newId,
      name,
      count: 0,
      step: 1,
      target,
      color: palette[counters.length % palette.length],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCounters(prev => [...prev, newCounter]);
    setActiveCounterId(newId);
    showToast(`Created counter "${name}"`, 'success');
  };

  const handleDeleteCounter = (id: string) => {
    if (counters.length <= 1) return;
    setCounters(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (activeCounterId === id) {
        setActiveCounterId(filtered[0].id);
      }
      return filtered;
    });
    showToast('Counter removed', 'info');
  };

  const handleUpdateCounterSettings = (id: string, updates: Partial<CounterItem>) => {
    setCounters(prev =>
      prev.map(c => (c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c))
    );
  };

  const handleScanSuccess = (recordPayload: Omit<ScanRecord, 'id' | 'scannedAt'>) => {
    const newRecord: ScanRecord = {
      ...recordPayload,
      id: 'scan_' + Math.random().toString(36).substring(2, 9),
      scannedAt: Date.now(),
      linkedCounterId: settings.autoIncrementOnQR ? activeCounter.id : undefined,
    };

    setScanRecords(prev => [newRecord, ...prev]);

    const isNFC = newRecord.type === 'nfc_card' || newRecord.source === 'nfc_tap' || newRecord.source === 'nfc_reader';
    const logReason: CounterLog['reason'] = isNFC ? 'nfc_scan' : 'qr_scan';
    
    let noteText = `QR: ${newRecord.rawText.substring(0, 25)}`;
    if (newRecord.studentInfo) {
      noteText = `NFC: ${newRecord.studentInfo.studentId} (${newRecord.studentInfo.studentName})`;
    }

    if (settings.autoIncrementOnQR) {
      handleUpdateCounterCount(activeCounter.id, 1, logReason, noteText);
      if (newRecord.studentInfo) {
        showToast(`Student Verified: ${newRecord.studentInfo.studentName} (+1)`, 'success');
      } else {
        showToast(`Card Scanned: +1 counted for ${activeCounter.name}`, 'success');
      }
    } else {
      if (newRecord.studentInfo) {
        showToast(`Student Identified: ${newRecord.studentInfo.studentName}`, 'info');
      } else {
        showToast(`Scan Recorded: ${newRecord.type.toUpperCase()}`, 'info');
      }
    }
  };

  const handleDeleteScanRecord = (id: string) => {
    setScanRecords(prev => prev.filter(r => r.id !== id));
    showToast('Record removed from history', 'info');
  };

  const handleDeleteCounterLog = (id: string) => {
    setCounterLogs(prev => prev.filter(l => l.id !== id));
    showToast('Counter log removed', 'info');
  };

  const handleDeleteMultipleScanRecords = (ids: string[]) => {
    const setIds = new Set(ids);
    setScanRecords(prev => prev.filter(r => !setIds.has(r.id)));
    showToast(`Deleted ${ids.length} scan record${ids.length === 1 ? '' : 's'}`, 'info');
  };

  const handleDeleteMultipleCounterLogs = (ids: string[]) => {
    const setIds = new Set(ids);
    setCounterLogs(prev => prev.filter(l => !setIds.has(l.id)));
    showToast(`Deleted ${ids.length} counter log${ids.length === 1 ? '' : 's'}`, 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-600/20 selection:text-indigo-900">
      {/* Top Header */}
      <Navbar
        currentView={currentView}
        onViewChange={setCurrentView}
        settings={settings}
        onUpdateSettings={setSettings}
        activeCount={activeCounter?.count ?? 0}
        totalScans={scanRecords.length}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 flex flex-col">
        {/* Dual View Mode */}
        {currentView === 'dual' && (
          <div className="grid grid-cols-12 gap-6 sm:gap-8 flex-1">
            {/* Left 5 Cols on Desktop: Precision Counter */}
            <div className="col-span-12 lg:col-span-5 flex flex-col">
              <CounterSection
                counters={counters}
                activeCounterId={activeCounterId}
                onSelectCounter={setActiveCounterId}
                onAddCounter={handleAddCounter}
                onDeleteCounter={handleDeleteCounter}
                onUpdateCounterCount={handleUpdateCounterCount}
                onSetCounterDirect={handleSetCounterDirect}
                onResetCounter={handleResetCounter}
                onUpdateCounterSettings={handleUpdateCounterSettings}
                logs={counterLogs}
                settings={settings}
              />
            </div>

            {/* Right 7 Cols on Desktop: Student's Scan Corner */}
            <div className="col-span-12 lg:col-span-7 flex flex-col">
              <StudentScanCorner
                onScanSuccess={handleScanSuccess}
                settings={settings}
                onUpdateSettings={setSettings}
                activeCounterName={activeCounter.name}
                activeCount={activeCounter.count}
              />
            </div>
          </div>
        )}

        {/* Counter Dedicated View */}
        {currentView === 'counter' && (
          <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col">
            <CounterSection
              counters={counters}
              activeCounterId={activeCounterId}
              onSelectCounter={setActiveCounterId}
              onAddCounter={handleAddCounter}
              onDeleteCounter={handleDeleteCounter}
              onUpdateCounterCount={handleUpdateCounterCount}
              onSetCounterDirect={handleSetCounterDirect}
              onResetCounter={handleResetCounter}
              onUpdateCounterSettings={handleUpdateCounterSettings}
              logs={counterLogs}
              settings={settings}
            />
          </div>
        )}

        {/* Student's Scan Corner Dedicated View */}
        {currentView === 'scanner' && (
          <div className="max-w-3xl mx-auto w-full flex-1 flex flex-col">
            <StudentScanCorner
              onScanSuccess={handleScanSuccess}
              settings={settings}
              onUpdateSettings={setSettings}
              activeCounterName={activeCounter.name}
              activeCount={activeCounter.count}
            />
          </div>
        )}

        {/* Activity Records View */}
        {currentView === 'history' && (
          <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
            <ScanHistorySection
              scanRecords={scanRecords}
              counterLogs={counterLogs}
              onDeleteScanRecord={handleDeleteScanRecord}
              onDeleteCounterLog={handleDeleteCounterLog}
              onDeleteMultipleScanRecords={handleDeleteMultipleScanRecords}
              onDeleteMultipleCounterLogs={handleDeleteMultipleCounterLogs}
              onClearHistory={() => {
                setScanRecords([]);
                showToast('Cleared all scan records', 'info');
              }}
              onClearCounterLogs={() => {
                setCounterLogs([]);
                showToast('Cleared all counter logs', 'info');
              }}
              onShowToast={showToast}
            />
          </div>
        )}
      </main>

      {/* Station Status Telemetry Footer */}
      <footer className="h-10 bg-slate-900 px-4 sm:px-8 flex items-center justify-between shrink-0 text-[10px] text-slate-400 uppercase tracking-widest font-mono border-t border-slate-800">
        <div>Station 04-A // Operator: ACTIVE_SESSION</div>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline">Engine: Calibrated</span>
          <span className="hidden sm:inline">•</span>
          <span>NFC & Optical Scanner: Online</span>
        </div>
      </footer>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-14 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2 backdrop-blur-xs ${
              toastMessage.type === 'success'
                ? 'bg-slate-900 text-white border-slate-700 shadow-slate-900/30'
                : 'bg-white text-slate-900 border-slate-200 shadow-slate-300/50'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${toastMessage.type === 'success' ? 'bg-emerald-400' : 'bg-indigo-500'}`} />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
