import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  CheckCircle2, 
  Radio, 
  Cpu, 
  Copy, 
  Check, 
  Printer, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  Clock, 
  Calendar, 
  Award,
  Layers,
  GraduationCap,
  FileCheck
} from 'lucide-react';
import { StudentCardInfo, ScanRecord } from '../types';
import { printStudentNFCCard } from '../utils/printCard';

interface StudentCardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardInfo: StudentCardInfo | null;
  scanRecord?: ScanRecord | null;
  activeCounterName?: string;
  activeCount?: number;
  autoIncremented?: boolean;
}

export const StudentCardDetailsModal: React.FC<StudentCardDetailsModalProps> = ({
  isOpen,
  onClose,
  cardInfo,
  scanRecord,
  activeCounterName = 'Attendance Counter',
  activeCount,
  autoIncremented = true,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUID, setCopiedUID] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [autoCloseSeconds, setAutoCloseSeconds] = useState<number | null>(null);
  const [isAutoCloseEnabled, setIsAutoCloseEnabled] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Auto-close timer if enabled
  useEffect(() => {
    if (!isOpen || !isAutoCloseEnabled) {
      setAutoCloseSeconds(null);
      return;
    }

    setAutoCloseSeconds(6);
    const interval = setInterval(() => {
      setAutoCloseSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          onClose();
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isAutoCloseEnabled, onClose]);

  if (!cardInfo) return null;

  const copyToClipboard = (text: string, type: 'id' | 'uid' | 'all') => {
    navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else if (type === 'uid') {
      setCopiedUID(true);
      setTimeout(() => setCopiedUID(false), 2000);
    } else {
      setCopiedAll(true);
      setTimeout(() => setCopiedAll(false), 2000);
    }
  };

  const handlePrint = (format: 'badge_duo' | 'single_badge' | 'full_slip' = 'badge_duo') => {
    setIsPrinting(true);
    printStudentNFCCard(cardInfo, {
      format,
      scanRecord,
      counterName: activeCounterName,
      activeCount,
      onSuccess: () => {
        setTimeout(() => setIsPrinting(false), 1500);
      }
    });
  };

  const fullPayloadSummary = `--- STUDENT NFC PASS VERIFICATION ---
Name: ${cardInfo.studentName}
Student ID: ${cardInfo.studentId}
Department: ${cardInfo.department}
Institution: ${cardInfo.institution || 'Daffodil International University'}
Card Type: ${cardInfo.cardType}
NFC Serial UID: ${cardInfo.nfcSerialNumber}
Status: ${cardInfo.status}
Issued Date: ${cardInfo.issuedDate || new Date().toLocaleDateString()}
Scanned At: ${scanRecord ? new Date(scanRecord.scannedAt).toLocaleString() : new Date().toLocaleString()}
Auto Logged Count: +1 to ${activeCounterName} (Current: ${activeCount ?? 'Active'})
`;

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          id="student-card-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-950/75 backdrop-blur-md"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            id="student-card-modal-content"
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Glowing Header Accent */}
            <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400" />

            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 font-heading">
                      Student Card Verified
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {cardInfo.status || 'Verified'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Contactless NFC Smart Card successfully read and logged
                  </p>
                </div>
              </div>

              <button
                id="btn-close-card-modal"
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-600 flex items-center justify-center transition-colors"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Virtual Holographic Smart Card Display */}
              <div className="relative rounded-2xl p-5 sm:p-6 text-white shadow-2xl overflow-hidden bg-gradient-to-br from-[#090d16] via-[#0f172a] to-[#1e1b4b] border border-slate-700/80">
                {/* Subtle lighting accents */}
                <div className="absolute -top-16 -right-16 w-52 h-52 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-52 h-52 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none" />

                {/* Holographic Top Security Accent */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 opacity-90" />

                {/* Diagonal Card Sheen */}
                <div className="absolute top-0 right-1/3 w-28 h-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent skew-x-12 pointer-events-none" />

                {/* Card Top Row */}
                <div className="relative z-10 flex items-start justify-between gap-2 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-white shadow-2xs">
                      <GraduationCap className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-[10px] font-extrabold tracking-wider text-slate-200 uppercase">
                        {cardInfo.institution || 'Daffodil International University'}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 mt-0.5">
                        <span className="text-cyan-300">CAMPUS SMART PASS</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-bold">{cardInfo.cardType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="px-2.5 py-1 rounded-xl bg-slate-800/90 border border-slate-700 text-[10px] font-mono text-cyan-300 font-semibold flex items-center gap-1.5 shadow-xs">
                      <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                      <span>NFC 13.56MHz</span>
                    </div>

                    {/* NFC Waves with Pulse */}
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shadow-xs">
                      <Radio className="w-4 h-4 text-cyan-300 animate-pulse" />
                    </div>
                  </div>
                </div>

                {/* Card Center: Student Avatar & Names */}
                <div className="relative z-10 flex items-center gap-3.5 py-1 mb-4">
                  <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-slate-800 border border-cyan-400/50 flex items-center justify-center text-white text-lg font-black shadow-md shrink-0">
                    {cardInfo.studentName
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((n) => n[0])
                      .join('') || 'ST'}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="text-lg sm:text-xl font-bold text-white tracking-wide truncate">
                      {cardInfo.studentName}
                    </h4>
                    <p className="text-xs text-cyan-200 truncate mt-0.5 font-medium">
                      {cardInfo.department}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>VERIFIED</span>
                      </span>
                      {cardInfo.batch && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {cardInfo.batch}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Bottom Row: Student ID & NFC UID */}
                <div className="relative z-10 pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[10px] font-sans uppercase tracking-wider">STUDENT ID:</span>
                    <span className="font-black text-white tracking-widest text-sm bg-slate-800/90 px-2.5 py-0.5 rounded border border-slate-700">
                      {cardInfo.studentId}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(cardInfo.studentId, 'id')}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                      title="Copy Student ID"
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <span className="font-sans text-slate-500">UID:</span>
                    <span className="text-slate-300 font-semibold px-1.5 py-0.5 bg-slate-800/80 rounded border border-slate-700/60">
                      {cardInfo.nfcSerialNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attendance Counter Linkage Callout */}
              {autoIncremented && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
                      <Layers className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="font-bold text-emerald-950">
                        Attendance Counter Updated (+1)
                      </div>
                      <div className="text-emerald-700 text-[11px]">
                        Logged to <strong className="font-semibold">{activeCounterName}</strong>
                        {activeCount !== undefined && ` • New count: ${activeCount}`}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-2xs">
                    +1 COUNT
                  </span>
                </div>
              )}

              {/* Detailed Breakdown Grid */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                    <Award className="w-3 h-3 text-indigo-500" /> Card Type
                  </span>
                  <div className="font-bold text-slate-800">{cardInfo.cardType}</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                    <Calendar className="w-3 h-3 text-indigo-500" /> Issued / Validity
                  </span>
                  <div className="font-bold text-slate-800">{cardInfo.issuedDate || 'Active 2026-2027'}</div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                    <Radio className="w-3 h-3 text-indigo-500" /> NFC Chip Standard
                  </span>
                  <div className="font-mono text-slate-800 text-[11px] truncate" title="ISO/IEC 14443-A (MIFARE DESFire / NTAG215)">
                    ISO 14443-A (NTAG)
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1">
                    <Clock className="w-3 h-3 text-indigo-500" /> Scan Timestamp
                  </span>
                  <div className="font-mono text-slate-800 text-[11px]">
                    {scanRecord ? new Date(scanRecord.scannedAt).toLocaleTimeString() : new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>

              {/* NFC Hardware Serial UID Details */}
              <div className="p-3 bg-slate-100/80 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Physical NFC Tag UID (Hardware Serial)
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {cardInfo.nfcSerialNumber}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(cardInfo.nfcSerialNumber, 'uid')}
                  className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold text-xs flex items-center gap-1 transition-colors shadow-2xs shrink-0"
                >
                  {copiedUID ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedUID ? 'Copied' : 'Copy UID'}</span>
                </button>
              </div>
            </div>

            {/* Modal Footer Bar with Quick Actions */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={isAutoCloseEnabled}
                    onChange={(e) => setIsAutoCloseEnabled(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                  />
                  <span>
                    Auto-close {autoCloseSeconds !== null ? `(${autoCloseSeconds}s)` : '(6s)'}
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => copyToClipboard(fullPayloadSummary, 'all')}
                  className="text-xs text-slate-600 hover:text-indigo-600 flex items-center gap-1 font-medium transition-colors"
                >
                  {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copiedAll ? 'Summary Copied' : 'Copy Full Summary'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  id="btn-modal-print-card"
                  type="button"
                  onClick={() => handlePrint('badge_duo')}
                  disabled={isPrinting}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                    isPrinting 
                      ? 'bg-indigo-700 cursor-wait' 
                      : 'bg-slate-900 hover:bg-slate-800 active:scale-95'
                  }`}
                  title="Print Student Smart Card Badge & Slip"
                >
                  <Printer className={`w-3.5 h-3.5 ${isPrinting ? 'animate-bounce text-cyan-300' : 'text-cyan-400'}`} />
                  <span>{isPrinting ? 'Opening Print...' : 'Print Card'}</span>
                </button>

                <button
                  id="btn-done-modal"
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-initial px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Done</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
