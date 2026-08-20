import React, { useMemo, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Radio, 
  QrCode, 
  ArrowUpDown, 
  Calendar,
  Sparkles,
  Award
} from 'lucide-react';
import { ScanRecord, CounterLog } from '../types';

interface DailyInsightsProps {
  scanRecords: ScanRecord[];
  counterLogs: CounterLog[];
}

interface DayData {
  dateKey: string;
  dayLabel: string;
  shortDay: string;
  fullDate: string;
  isToday: boolean;
  scans: number;
  nfcScans: number;
  qrScans: number;
  counterIncrements: number;
  totalEvents: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string;
}

export const DailyInsights: React.FC<DailyInsightsProps> = ({
  scanRecords,
  counterLogs
}) => {
  const [chartMode, setChartMode] = useState<'grouped' | 'stacked'>('grouped');
  const [timeRange, setTimeRange] = useState<7 | 14>(7);

  // Compute aggregated daily stats for the last 7 (or 14) days
  const dailyData: DayData[] = useMemo(() => {
    const days: DayData[] = [];
    const now = new Date();

    for (let i = timeRange - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);

      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);

      const startMs = d.getTime();
      const endMs = endOfDay.getTime();

      const isCurrentDay = i === 0;

      // Filter scans for this day
      const dayScans = scanRecords.filter(
        (s) => s.scannedAt >= startMs && s.scannedAt <= endMs
      );
      const nfcScans = dayScans.filter(
        (s) => s.type === 'nfc_card' || s.source === 'nfc_tap' || s.source === 'nfc_reader'
      ).length;
      const qrScans = dayScans.length - nfcScans;

      // Filter logs for this day
      const dayLogs = counterLogs.filter(
        (l) => l.timestamp >= startMs && l.timestamp <= endMs
      );
      const counterIncrements = dayLogs.length;

      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayName = d.toLocaleDateString([], { weekday: 'short' });
      const monthDay = d.toLocaleDateString([], { month: 'short', day: 'numeric' });

      days.push({
        dateKey,
        dayLabel: isCurrentDay ? 'Today' : `${dayName} ${d.getDate()}`,
        shortDay: isCurrentDay ? 'Today' : dayName,
        fullDate: `${dayName}, ${monthDay}`,
        isToday: isCurrentDay,
        scans: dayScans.length,
        nfcScans,
        qrScans,
        counterIncrements,
        totalEvents: dayScans.length + counterIncrements
      });
    }

    return days;
  }, [scanRecords, counterLogs, timeRange]);

  // Aggregate summary statistics
  const summary = useMemo(() => {
    let totalScans = 0;
    let totalNFC = 0;
    let totalQR = 0;
    let totalIncrements = 0;
    let maxEvents = 0;
    let peakDay = 'None';

    dailyData.forEach((day) => {
      totalScans += day.scans;
      totalNFC += day.nfcScans;
      totalQR += day.qrScans;
      totalIncrements += day.counterIncrements;

      if (day.totalEvents > maxEvents) {
        maxEvents = day.totalEvents;
        peakDay = day.fullDate;
      }
    });

    const totalEvents = totalScans + totalIncrements;
    const avgDaily = (totalEvents / timeRange).toFixed(1);

    return {
      totalScans,
      totalNFC,
      totalQR,
      totalIncrements,
      totalEvents,
      peakDay,
      maxEvents,
      avgDaily
    };
  }, [dailyData, timeRange]);

  // Custom polished Tooltip component for Recharts
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const currentItem = dailyData.find((d) => d.dayLabel === label || d.shortDay === label);

      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-700/80 backdrop-blur-xs text-xs font-sans min-w-[190px]">
          <div className="flex items-center justify-between gap-2 border-b border-slate-700 pb-2 mb-2">
            <span className="font-bold text-slate-100 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              {currentItem?.fullDate || label}
            </span>
            {currentItem?.isToday && (
              <span className="text-[10px] font-bold bg-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-400/30">
                Today
              </span>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-slate-200">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <span>Total Scans:</span>
              </span>
              <strong className="font-mono text-white text-sm">
                {currentItem?.scans ?? 0}
              </strong>
            </div>

            {currentItem && currentItem.scans > 0 && (
              <div className="pl-4 text-[11px] text-slate-400 space-y-0.5 border-l border-slate-800 ml-1">
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <Radio className="w-3 h-3 text-indigo-300" /> NFC Passes:
                  </span>
                  <span className="font-mono text-slate-300">{currentItem.nfcScans}</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-1">
                    <QrCode className="w-3 h-3 text-indigo-400" /> QR Codes:
                  </span>
                  <span className="font-mono text-slate-300">{currentItem.qrScans}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-200 pt-1 border-t border-slate-800">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Counter Updates:</span>
              </span>
              <strong className="font-mono text-emerald-400 text-sm">
                {currentItem?.counterIncrements ?? 0}
              </strong>
            </div>

            <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800 font-semibold">
              <span>Combined Total:</span>
              <strong className="font-mono text-indigo-300">
                {currentItem?.totalEvents ?? 0}
              </strong>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 p-5 sm:p-6 shadow-xs">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600 shadow-2xs">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                Daily Insights & Analytics
                <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                  Last {timeRange} Days
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Visualizing student NFC card taps, QR scans & counter activities over time
              </p>
            </div>
          </div>
        </div>

        {/* View Mode & Range Toggles */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center text-xs">
            <button
              type="button"
              onClick={() => setTimeRange(7)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                timeRange === 7 
                  ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange(14)}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                timeRange === 14 
                  ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14 Days
            </button>
          </div>

          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center text-xs">
            <button
              type="button"
              onClick={() => setChartMode('grouped')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                chartMode === 'grouped' 
                  ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Grouped
            </button>
            <button
              type="button"
              onClick={() => setChartMode('stacked')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                chartMode === 'stacked' 
                  ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Stacked
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Scans</span>
            <QrCode className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-slate-900">
            {summary.totalScans}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span className="text-indigo-600 font-semibold">{summary.totalNFC} NFC</span>
            <span>•</span>
            <span>{summary.totalQR} QR</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Counter Events</span>
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-700">
            {summary.totalIncrements}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Count increments & adjustments
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Peak Activity</span>
            <Award className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">
            {summary.maxEvents > 0 ? summary.peakDay : 'No activity yet'}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {summary.maxEvents > 0 ? `${summary.maxEvents} total actions recorded` : 'Awaiting scans'}
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Daily Average</span>
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-indigo-600">
            {summary.avgDaily}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Operations / day in window
          </div>
        </div>
      </div>

      {/* Main Bar Chart Container */}
      <div className="w-full h-64 sm:h-72 mt-2 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={dailyData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            barGap={4}
            barCategoryGap="25%"
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="dayLabel" 
              tickLine={false} 
              axisLine={{ stroke: '#CBD5E1' }}
              tick={{ fill: '#64748B', fontSize: 11, fontWeight: 500 }}
            />
            <YAxis 
              allowDecimals={false}
              tickLine={false}
              axisLine={{ stroke: '#CBD5E1' }}
              tick={{ fill: '#64748B', fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="top" 
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: 10, fontSize: 12, fontWeight: 600 }}
            />

            {chartMode === 'grouped' ? (
              <>
                <Bar 
                  dataKey="scans" 
                  name="Scans (NFC & QR)" 
                  fill="#4F46E5" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={38}
                />
                <Bar 
                  dataKey="counterIncrements" 
                  name="Counter Increments" 
                  fill="#10B981" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={38}
                />
              </>
            ) : (
              <>
                <Bar 
                  dataKey="nfcScans" 
                  name="NFC Card Taps" 
                  fill="#6366F1" 
                  stackId="scans"
                  radius={[0, 0, 0, 0]} 
                  maxBarSize={44}
                />
                <Bar 
                  dataKey="qrScans" 
                  name="QR Code Scans" 
                  fill="#818CF8" 
                  stackId="scans"
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={44}
                />
                <Bar 
                  dataKey="counterIncrements" 
                  name="Counter Increments" 
                  fill="#10B981" 
                  stackId="counter"
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={44}
                />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info note */}
      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          <span>Real-time aggregation from local scan sessions and synchronized counter tallies.</span>
        </span>
        <span className="font-mono text-[11px] text-slate-400">
          Last 7 Days Range: {dailyData[0]?.fullDate} → {dailyData[dailyData.length - 1]?.fullDate}
        </span>
      </div>
    </div>
  );
};
