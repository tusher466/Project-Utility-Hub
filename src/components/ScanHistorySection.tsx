import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Trash2, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Wifi, 
  Mail, 
  Phone, 
  FileText, 
  Calendar, 
  Layers, 
  ArrowUpDown,
  FileSpreadsheet,
  CheckCircle2,
  X,
  SlidersHorizontal,
  Radio,
  GraduationCap,
  Eye,
  BarChart3,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Printer
} from 'lucide-react';
import { ScanRecord, CounterLog, StudentCardInfo } from '../types';
import { 
  exportQRScansToCSV, 
  exportCounterLogsToCSV, 
  exportAllDataToCSV 
} from '../utils/csvExporter';
import { StudentCardDetailsModal } from './StudentCardDetailsModal';
import { DailyInsights } from './DailyInsights';
import { printStudentNFCCard } from '../utils/printCard';

interface ScanHistorySectionProps {
  scanRecords: ScanRecord[];
  counterLogs: CounterLog[];
  onDeleteScanRecord?: (id: string) => void;
  onDeleteCounterLog?: (id: string) => void;
  onDeleteMultipleScanRecords?: (ids: string[]) => void;
  onDeleteMultipleCounterLogs?: (ids: string[]) => void;
  onClearHistory: () => void;
  onClearCounterLogs: () => void;
  onShowToast?: (message: string, type?: 'info' | 'success') => void;
}

export const ScanHistorySection: React.FC<ScanHistorySectionProps> = ({
  scanRecords,
  counterLogs,
  onDeleteScanRecord,
  onDeleteCounterLog,
  onDeleteMultipleScanRecords,
  onDeleteMultipleCounterLogs,
  onClearHistory,
  onClearCounterLogs,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'scans' | 'counts'>('scans');
  const [showInsights, setShowInsights] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportScope, setExportScope] = useState<'all' | 'filtered' | 'today'>('all');
  const [selectedModalCard, setSelectedModalCard] = useState<StudentCardInfo | null>(null);
  const [selectedScanRecord, setSelectedScanRecord] = useState<ScanRecord | null>(null);

  // In-app batch delete confirmation modal
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState<boolean>(false);

  // Multi-selection state for batch actions
  const [selectedScanIds, setSelectedScanIds] = useState<Set<string>>(new Set());
  const [selectedLogIds, setSelectedLogIds] = useState<Set<string>>(new Set());

  // Filtered scans for UI list
  const filteredScans = scanRecords.filter(record => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      record.rawText.toLowerCase().includes(query) ||
      (record.studentInfo?.studentId && record.studentInfo.studentId.toLowerCase().includes(query)) ||
      (record.studentInfo?.studentName && record.studentInfo.studentName.toLowerCase().includes(query)) ||
      (record.studentInfo?.department && record.studentInfo.department.toLowerCase().includes(query));
      
    const matchesType = filterType === 'all' || record.type === filterType;
    return matchesSearch && matchesType;
  });

  // Filtered logs for UI list
  const filteredLogs = counterLogs.filter(log => {
    return (
      log.counterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.note && log.note.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  // Selection helpers
  const isAllScansSelected = filteredScans.length > 0 && filteredScans.every(s => selectedScanIds.has(s.id));
  const isAllLogsSelected = filteredLogs.length > 0 && filteredLogs.every(l => selectedLogIds.has(l.id));

  const handleToggleSelectScan = (id: string) => {
    setSelectedScanIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleSelectLog = (id: string) => {
    setSelectedLogIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAllScans = () => {
    if (isAllScansSelected) {
      // Deselect all filtered scans
      setSelectedScanIds(prev => {
        const next = new Set(prev);
        filteredScans.forEach(s => next.delete(s.id));
        return next;
      });
    } else {
      // Select all filtered scans
      setSelectedScanIds(prev => {
        const next = new Set(prev);
        filteredScans.forEach(s => next.add(s.id));
        return next;
      });
    }
  };

  const handleSelectAllLogs = () => {
    if (isAllLogsSelected) {
      // Deselect all filtered logs
      setSelectedLogIds(prev => {
        const next = new Set(prev);
        filteredLogs.forEach(l => next.delete(l.id));
        return next;
      });
    } else {
      // Select all filtered logs
      setSelectedLogIds(prev => {
        const next = new Set(prev);
        filteredLogs.forEach(l => next.add(l.id));
        return next;
      });
    }
  };

  const handleExecuteBatchDelete = () => {
    if (activeTab === 'scans') {
      const ids = Array.from(selectedScanIds);
      if (ids.length === 0) return;
      if (onDeleteMultipleScanRecords) {
        onDeleteMultipleScanRecords(ids);
      } else if (onDeleteScanRecord) {
        ids.forEach(id => onDeleteScanRecord(id));
      }
      setSelectedScanIds(new Set());
      onShowToast?.(`Successfully deleted ${ids.length} scan record${ids.length === 1 ? '' : 's'}`, 'info');
    } else {
      const ids = Array.from(selectedLogIds);
      if (ids.length === 0) return;
      if (onDeleteMultipleCounterLogs) {
        onDeleteMultipleCounterLogs(ids);
      } else if (onDeleteCounterLog) {
        ids.forEach(id => onDeleteCounterLog(id));
      }
      setSelectedLogIds(new Set());
      onShowToast?.(`Successfully deleted ${ids.length} counter log${ids.length === 1 ? '' : 's'}`, 'info');
    }
    setShowBatchDeleteModal(false);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isToday = (timestamp: number) => {
    const d = new Date(timestamp);
    const today = new Date();
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear();
  };

  // Get records based on chosen export scope
  const getScopedScans = () => {
    if (exportScope === 'today') return scanRecords.filter(r => isToday(r.scannedAt));
    if (exportScope === 'filtered') return filteredScans;
    return scanRecords;
  };

  const getScopedLogs = () => {
    if (exportScope === 'today') return counterLogs.filter(l => isToday(l.timestamp));
    if (exportScope === 'filtered') return filteredLogs;
    return counterLogs;
  };

  // Quick export handlers
  const handleExportScansCSV = () => {
    const scansToExport = getScopedScans();
    if (scansToExport.length === 0) {
      onShowToast?.('No scan records to export in selected scope', 'info');
      return;
    }
    const count = exportQRScansToCSV(scansToExport);
    onShowToast?.(`Exported ${count} scan record${count === 1 ? '' : 's'} as CSV`, 'success');
    setShowExportModal(false);
  };

  const handleExportLogsCSV = () => {
    const logsToExport = getScopedLogs();
    if (logsToExport.length === 0) {
      onShowToast?.('No counter logs to export in selected scope', 'info');
      return;
    }
    const count = exportCounterLogsToCSV(logsToExport);
    onShowToast?.(`Exported ${count} counter log entry${count === 1 ? '' : 'ies'} as CSV`, 'success');
    setShowExportModal(false);
  };

  const handleExportAllCombinedCSV = () => {
    const scansToExport = getScopedScans();
    const logsToExport = getScopedLogs();
    if (scansToExport.length === 0 && logsToExport.length === 0) {
      onShowToast?.('No data available to export', 'info');
      return;
    }
    const result = exportAllDataToCSV(scansToExport, logsToExport);
    onShowToast?.(`Exported ${result.scanCount} scans & ${result.logCount} counter logs to CSV`, 'success');
    setShowExportModal(false);
  };

  const selectedCount = activeTab === 'scans' ? selectedScanIds.size : selectedLogIds.size;

  return (
    <section className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 sm:p-8 flex flex-col">
      {/* Header & Main Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-600" />
              Activity & History Records
            </h2>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
              CSV Export Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit logs of student NFC scans, QR codes, and counter changes with 7-day insights
          </p>
        </div>

        {/* Action Buttons: Insights Toggle, Export Data Dialog & Tab Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Daily Insights Toggle Button */}
          <button
            id="btn-toggle-daily-insights"
            type="button"
            onClick={() => setShowInsights(!showInsights)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-2xs ${
              showInsights 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' 
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
            title="Toggle 7-day visual bar chart insights"
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
            <span>{showInsights ? 'Hide Insights' : 'Daily Insights'}</span>
            {showInsights ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Batch Delete Selected Button if any items are selected */}
          {selectedCount > 0 && (
            <button
              id="btn-delete-selected"
              type="button"
              onClick={() => setShowBatchDeleteModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs animate-in fade-in"
              title="Delete selected records"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>
                Delete Selected ({selectedCount})
              </span>
            </button>
          )}

          {/* Main Export Data Button */}
          <button
            id="btn-export-data-main"
            type="button"
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-semibold transition-all shadow-xs"
            title="Open Export Data options for CSV download"
          >
            <Download className="w-3.5 h-3.5 text-indigo-300" />
            <span>Export Data</span>
          </button>

          {/* Tab Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center text-xs font-medium">
            <button
              id="tab-history-scans"
              type="button"
              onClick={() => {
                setActiveTab('scans');
                setSelectedLogIds(new Set());
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'scans'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Scans & NFC ({scanRecords.length})
            </button>
            <button
              id="tab-history-counts"
              type="button"
              onClick={() => {
                setActiveTab('counts');
                setSelectedScanIds(new Set());
              }}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'counts'
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Counter Logs ({counterLogs.length})
            </button>
          </div>

          {/* Clear All Button */}
          <button
            id="btn-clear-history"
            type="button"
            onClick={() => {
              if (window.confirm(`Are you sure you want to clear ALL ${activeTab === 'scans' ? 'scan records' : 'counter logs'}? This action cannot be undone.`)) {
                if (activeTab === 'scans') {
                  onClearHistory();
                  setSelectedScanIds(new Set());
                } else {
                  onClearCounterLogs();
                  setSelectedLogIds(new Set());
                }
              }
            }}
            className="p-1.5 rounded-lg bg-white text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors"
            title="Clear all records in active tab"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Daily Insights Component Section */}
      {showInsights && (
        <div className="mt-5 animate-in fade-in duration-200">
          <DailyInsights 
            scanRecords={scanRecords} 
            counterLogs={counterLogs} 
          />
        </div>
      )}

      {/* Filter, Search & Selection Bar */}
      <div className="my-4 flex flex-col gap-2.5">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={activeTab === 'scans' ? 'Search Student IDs, names, NFC UIDs, QR texts...' : 'Search logs, counter categories, reason notes...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white"
            />
          </div>

          {activeTab === 'scans' && (
            <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'All' },
                { id: 'nfc_card', label: 'NFC Cards' },
                { id: 'url', label: 'URLs' },
                { id: 'wifi', label: 'Wi-Fi' },
                { id: 'text', label: 'Text' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilterType(item.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all border ${
                    filterType === item.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-semibold'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selection helper row */}
        {((activeTab === 'scans' && filteredScans.length > 0) || (activeTab === 'counts' && filteredLogs.length > 0)) && (
          <div className="flex flex-wrap items-center justify-between px-1 py-1 bg-slate-50 border border-slate-200/70 rounded-xl text-xs text-slate-600 gap-2">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 hover:text-slate-900">
                <input
                  type="checkbox"
                  checked={activeTab === 'scans' ? isAllScansSelected : isAllLogsSelected}
                  onChange={activeTab === 'scans' ? handleSelectAllScans : handleSelectAllLogs}
                  className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300 cursor-pointer"
                />
                <span>
                  {activeTab === 'scans'
                    ? isAllScansSelected ? 'Deselect All Scans' : `Select All Visible Scans (${selectedScanIds.size}/${filteredScans.length})`
                    : isAllLogsSelected ? 'Deselect All Logs' : `Select All Visible Logs (${selectedLogIds.size}/${filteredLogs.length})`}
                </span>
              </label>

              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    if (activeTab === 'scans') setSelectedScanIds(new Set());
                    else setSelectedLogIds(new Set());
                  }}
                  className="text-[11px] text-slate-500 hover:text-rose-600 underline font-medium"
                >
                  Clear Selection
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500">
                {activeTab === 'scans' 
                  ? `Showing ${filteredScans.length} of ${scanRecords.length} scans`
                  : `Showing ${filteredLogs.length} of ${counterLogs.length} logs`}
              </span>

              {selectedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setShowBatchDeleteModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] flex items-center gap-1 shadow-2xs"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete ({selectedCount})</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* List Content */}
      {activeTab === 'scans' ? (
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {filteredScans.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <History className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              No student scans or QR codes recorded yet. Tap an NFC card or scan a QR in Student's Scan Corner.
            </div>
          ) : (
            filteredScans.map((scan) => {
              const isSelected = selectedScanIds.has(scan.id);
              return (
                <div
                  key={scan.id}
                  className={`p-3 border rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected 
                      ? 'bg-indigo-50/70 border-indigo-300 shadow-2xs' 
                      : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Checkbox for batch selection */}
                    <div className="pt-2 sm:pt-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelectScan(scan.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300 cursor-pointer"
                        title="Select this scan record"
                      />
                    </div>

                    <div className="p-2 rounded-lg bg-white border border-slate-200 text-indigo-600 shrink-0 mt-0.5 shadow-2xs">
                      {scan.type === 'nfc_card' ? (
                        <Radio className="w-4 h-4 text-indigo-600" />
                      ) : scan.type === 'url' ? (
                        <ExternalLink className="w-4 h-4 text-indigo-600" />
                      ) : scan.type === 'wifi' ? (
                        <Wifi className="w-4 h-4 text-emerald-600" />
                      ) : scan.type === 'email' ? (
                        <Mail className="w-4 h-4 text-amber-600" />
                      ) : scan.type === 'phone' ? (
                        <Phone className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <FileText className="w-4 h-4 text-slate-600" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          {scan.studentInfo ? scan.studentInfo.cardType : scan.type}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(scan.scannedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                        <span className="text-[10px] text-slate-500 px-1.5 py-0.2 rounded bg-slate-200/70">
                          {scan.source === 'nfc_tap' ? 'NFC Card Tap' : scan.source === 'camera' ? 'Live Cam' : scan.source === 'clipboard_paste' ? 'Pasted' : 'Uploaded'}
                        </span>
                      </div>

                      {scan.studentInfo ? (
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
                            <span>{scan.studentInfo.studentName}</span>
                            <span className="font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded text-[11px] border border-indigo-100">
                              {scan.studentInfo.studentId}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 truncate mt-0.5">
                            {scan.studentInfo.department} • UID: <span className="font-mono">{scan.studentInfo.nfcSerialNumber}</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs font-mono text-slate-800 truncate select-all">
                          {scan.rawText}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {scan.studentInfo && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            if (scan.studentInfo) {
                              printStudentNFCCard(scan.studentInfo, {
                                scanRecord: scan,
                              });
                            }
                          }}
                          className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                          title="Print Student NFC Pass Badge"
                        >
                          <Printer className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Print</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedModalCard(scan.studentInfo || null);
                            setSelectedScanRecord(scan);
                          }}
                          className="px-2 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
                          title="View Student Pass Popup"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Pass</span>
                        </button>
                      </>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopy(scan.id, scan.studentInfo?.studentId || scan.rawText)}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs flex items-center gap-1 transition-colors shadow-2xs"
                      title="Copy payload"
                    >
                      {copiedId === scan.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {scan.type === 'url' && (
                      <a
                        href={scan.parsedDetails?.url || scan.rawText}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs flex items-center gap-1 transition-colors shadow-2xs"
                        title="Open link in new window"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Delete Individual Scan Record Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onDeleteScanRecord) {
                          onDeleteScanRecord(scan.id);
                          setSelectedScanIds(prev => {
                            const next = new Set(prev);
                            next.delete(scan.id);
                            return next;
                          });
                        }
                      }}
                      className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs flex items-center gap-1 transition-colors shadow-2xs"
                      title="Delete this record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Counter Logs Tab */
        <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
          {filteredLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-40 text-slate-400" />
              No counter updates recorded yet. Click Increment/Decrement or tap Student NFC cards!
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isSelected = selectedLogIds.has(log.id);
              return (
                <div
                  key={log.id}
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
                    isSelected 
                      ? 'bg-indigo-50/70 border-indigo-300 shadow-2xs' 
                      : 'bg-slate-50 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Checkbox for batch selection */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectLog(log.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300 cursor-pointer shrink-0"
                      title="Select this log"
                    />

                    <div className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 font-sans shadow-2xs shrink-0">
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-900 font-sans">{log.counterName}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-sans truncate block">
                        {log.reason === 'nfc_scan' ? 'Scanned from NFC Student Card' : log.reason === 'qr_scan' ? 'Scanned from QR code' : log.reason === 'manual_set' ? 'Manual value set' : log.reason === 'reset' ? 'Reset to zero' : 'Manual increment/decrement'}
                        {log.note && <span className="text-slate-400 ml-1">({log.note})</span>}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-2">
                    <div className="text-right">
                      <div className={`font-bold ${log.delta > 0 ? 'text-emerald-600' : log.delta < 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                        {log.delta > 0 ? `+${log.delta}` : log.delta}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Total: <strong className="text-slate-800">{log.newValue}</strong>
                      </div>
                    </div>

                    {/* Delete Individual Log Button */}
                    <button
                      type="button"
                      onClick={() => {
                        if (onDeleteCounterLog) {
                          onDeleteCounterLog(log.id);
                          setSelectedLogIds(prev => {
                            const next = new Set(prev);
                            next.delete(log.id);
                            return next;
                          });
                        }
                      }}
                      className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs flex items-center gap-1 transition-colors shadow-2xs"
                      title="Delete this counter log"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Export Data Modal Dialog */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 relative">
            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowExportModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Export Data to CSV
                </h3>
                <p className="text-xs text-slate-500">
                  Download structured comma-separated values compatible with Excel, Google Sheets & databases.
                </p>
              </div>
            </div>

            {/* Scope selection */}
            <div className="mb-5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                Select Export Scope
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setExportScope('all')}
                  className={`p-2 rounded-lg text-center transition-all border ${
                    exportScope === 'all'
                      ? 'bg-white text-slate-900 font-semibold border-slate-300 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60 border-transparent'
                  }`}
                >
                  All Records ({scanRecords.length + counterLogs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setExportScope('today')}
                  className={`p-2 rounded-lg text-center transition-all border ${
                    exportScope === 'today'
                      ? 'bg-white text-slate-900 font-semibold border-slate-300 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60 border-transparent'
                  }`}
                >
                  Today Only
                </button>
                <button
                  type="button"
                  onClick={() => setExportScope('filtered')}
                  className={`p-2 rounded-lg text-center transition-all border ${
                    exportScope === 'filtered'
                      ? 'bg-white text-slate-900 font-semibold border-slate-300 shadow-xs'
                      : 'text-slate-600 hover:bg-slate-200/60 border-transparent'
                  }`}
                >
                  Filtered Scope
                </button>
              </div>
            </div>

            {/* Export Format Action Cards */}
            <div className="space-y-2.5 mb-6">
              {/* Option 1: QR & NFC Scans CSV */}
              <button
                id="btn-download-qr-csv"
                type="button"
                onClick={handleExportScansCSV}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-slate-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      Download Student & QR Scan Records (.csv)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {getScopedScans().length} records • Includes student IDs, names, NFC UIDs, timestamps
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                  Download →
                </span>
              </button>

              {/* Option 2: Counter Logs CSV */}
              <button
                id="btn-download-counter-csv"
                type="button"
                onClick={handleExportLogsCSV}
                className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-slate-50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 group-hover:scale-105 transition-transform">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      Download Counter Audit Logs (.csv)
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {getScopedLogs().length} entries • Includes delta, previous/new value, actions
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                  Download →
                </span>
              </button>

              {/* Option 3: Combined Everything Bundle CSV */}
              <button
                id="btn-download-all-csv"
                type="button"
                onClick={handleExportAllCombinedCSV}
                className="w-full text-left p-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-between shadow-xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-indigo-300 group-hover:scale-105 transition-transform">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      Download Combined Student Data Report (.csv)
                    </div>
                    <div className="text-[11px] text-slate-300">
                      Combined bundle of all {getScopedScans().length} scans & {getScopedLogs().length} tally logs
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-300 group-hover:translate-x-0.5 transition-transform">
                  Export All →
                </span>
              </button>
            </div>

            {/* Footer Notice */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> UTF-8 RFC 4180 Format
              </span>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-slate-600 hover:text-slate-900 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Delete Confirmation Modal */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150 relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete Selected Records?
                </h3>
                <p className="text-xs text-slate-500">
                  This will permanently delete the selected entries from history.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-100 rounded-xl text-xs text-rose-800 mb-5 space-y-1">
              <p className="font-semibold">
                You are about to delete {selectedCount} {activeTab === 'scans' ? 'scan record(s)' : 'counter log entry(ies)'}.
              </p>
              <p className="text-[11px] text-rose-700/90">
                This action cannot be undone. Associated records will be removed from your active audit log.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteBatchDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete {selectedCount} Record{selectedCount === 1 ? '' : 's'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up Card Details Modal */}
      <StudentCardDetailsModal
        isOpen={!!selectedModalCard}
        onClose={() => {
          setSelectedModalCard(null);
          setSelectedScanRecord(null);
        }}
        cardInfo={selectedModalCard}
        scanRecord={selectedScanRecord}
        autoIncremented={false}
      />
    </section>
  );
};
