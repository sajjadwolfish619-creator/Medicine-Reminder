import React, { useState } from 'react';
import { HistoryLog, UserProfile, Medication } from '../../types';
import { formatTime24To12 } from '../../utils/notifications';
import { translations, Language } from '../../utils/i18n';
import { 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Calendar, 
  Download, 
  Award 
} from 'lucide-react';

interface Props {
  historyLogs: HistoryLog[];
  medications: Medication[];
  users: UserProfile[];
  activeUserId: string;
  lang: Language;
}

export const HistoryScreen: React.FC<Props> = ({
  historyLogs,
  users,
  activeUserId,
  lang,
}) => {
  const t = translations[lang];
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [selectedUserFilter, setSelectedUserFilter] = useState<string>(activeUserId);

  const userFilteredLogs = historyLogs.filter((log) => {
    if (selectedUserFilter !== 'all' && log.userId !== selectedUserFilter) return false;
    return true;
  });

  const now = new Date();
  const getDaysLimit = () => {
    if (reportType === 'daily') return 1;
    if (reportType === 'weekly') return 7;
    return 30;
  };

  const daysLimit = getDaysLimit();
  const cutoffDate = new Date();
  cutoffDate.setDate(now.getDate() - daysLimit);
  const cutoffStr = cutoffDate.toISOString().split('T')[0];

  const periodLogs = userFilteredLogs.filter((l) => l.scheduledDate >= cutoffStr);

  const totalDoses = periodLogs.length;
  const takenDoses = periodLogs.filter((l) => l.status === 'taken').length;
  const missedDoses = periodLogs.filter((l) => l.status === 'missed').length;
  const snoozedDoses = periodLogs.filter((l) => l.status === 'snoozed').length;
  const adherencePercent = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 100;

  const past7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dStr = d.toISOString().split('T')[0];
    const dayLogs = userFilteredLogs.filter((l) => l.scheduledDate === dStr);
    const dayTaken = dayLogs.filter((l) => l.status === 'taken').length;
    const dayTotal = dayLogs.length;
    const pct = dayTotal > 0 ? Math.round((dayTaken / dayTotal) * 100) : 100;
    const dayName = d.toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', { weekday: 'narrow' });
    return { date: dStr, dayName, pct, dayTaken, dayTotal };
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'User', 'Medication', 'Dosage', 'Scheduled Date', 'Scheduled Time', 'Status', 'Action Time'];
    const rows = periodLogs.map((l) => {
      const u = users.find((usr) => usr.id === l.userId)?.name || l.userId;
      return [l.id, u, l.medicationName, l.dosage, l.scheduledDate, l.scheduledTime, l.status, l.actionTime];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `medr_adherence_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-24 text-slate-800 bg-sky-50/50">
      {/* Top Bar: Title & User Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {t.historyTitle}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Adherence metrics & historical log records
          </p>
        </div>

        <select
          value={selectedUserFilter}
          onChange={(e) => setSelectedUserFilter(e.target.value)}
          className="bg-white text-xs text-slate-800 font-semibold py-1.5 px-3 rounded-xl border border-sky-200 focus:outline-none shadow-xs"
        >
          <option value="all">{t.allUsers}</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
      </div>

      {/* Report Tabs */}
      <div className="flex rounded-2xl bg-white p-1 border border-sky-100 shadow-xs">
        {(['daily', 'weekly', 'monthly'] as const).map((type) => {
          const isActive = reportType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setReportType(type)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                isActive
                  ? 'bg-sky-500 text-white shadow-xs shadow-sky-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {type === 'daily' && t.dailyReport}
              {type === 'weekly' && t.weeklyReport}
              {type === 'monthly' && t.monthlyReport}
            </button>
          );
        })}
      </div>

      {/* Adherence Hero Card */}
      <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-sm shadow-sky-100/60 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-700 flex items-center gap-1.5">
              <TrendingUp size={14} /> {t.adherenceScore}
            </span>
            <div className="text-4xl font-black text-slate-900 flex items-baseline gap-2">
              <span className="text-sky-600">{adherencePercent}%</span>
              <span className="text-xs text-slate-500 font-medium">
                {adherencePercent >= 90 ? '🏆 ' + t.adherenceLegendExcellent : adherencePercent >= 75 ? '👍 ' + t.adherenceLegendGood : '⚠️ ' + t.adherenceLegendAttention}
              </span>
            </div>
            <p className="text-xs text-slate-500 pt-1">
              {takenDoses} of {totalDoses} doses confirmed on schedule
            </p>
          </div>

          <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center border border-sky-200">
            <Award size={32} />
          </div>
        </div>

        {/* 7-Day Visual Mini Bar Chart */}
        <div className="mt-5 pt-4 border-t border-sky-100">
          <span className="text-[11px] font-semibold text-slate-600 block mb-2">
            Weekly Trend (Last 7 Days)
          </span>
          <div className="grid grid-cols-7 gap-2 items-end h-20 pt-2">
            {past7Days.map((item, idx) => {
              const heightPct = Math.max(15, item.pct);
              return (
                <div key={idx} className="flex flex-col items-center h-full justify-end group">
                  <div className="text-[9px] text-slate-400 opacity-0 group-hover:opacity-100 transition mb-0.5">
                    {item.pct}%
                  </div>
                  <div className="w-full bg-sky-100/70 rounded-t-lg h-full max-h-12 flex items-end overflow-hidden">
                    <div
                      className="w-full transition-all duration-500 rounded-t-lg bg-sky-500"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-slate-500 mt-1">
                    {item.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4 Stat Boxes */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-sky-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{t.totalScheduled}</span>
            <Calendar size={14} className="text-sky-500" />
          </div>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {totalDoses}
          </span>
        </div>

        <div className="bg-white border border-sky-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{t.takenOnTime}</span>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">
            {takenDoses}
          </span>
        </div>

        <div className="bg-white border border-sky-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{t.missedDoses}</span>
            <AlertCircle size={14} className="text-rose-500" />
          </div>
          <span className="text-2xl font-black text-rose-500 mt-1 block">
            {missedDoses}
          </span>
        </div>

        <div className="bg-white border border-sky-100 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>{t.snoozed}</span>
            <Clock size={14} className="text-amber-500" />
          </div>
          <span className="text-2xl font-black text-amber-500 mt-1 block">
            {snoozedDoses}
          </span>
        </div>
      </div>

      {/* Timeline Event Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            {t.recentActivity}
          </h3>
          <button
            type="button"
            onClick={handleExportCSV}
            className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
          >
            <Download size={13} />
            <span>{t.export}</span>
          </button>
        </div>

        {periodLogs.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4 text-center">
            {t.noData}
          </p>
        ) : (
          <div className="space-y-2">
            {periodLogs.slice(0, 10).map((log) => {
              const u = users.find((usr) => usr.id === log.userId);
              const isTaken = log.status === 'taken';
              const isMissed = log.status === 'missed';

              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-sky-100 shadow-xs text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        isTaken
                          ? 'bg-emerald-50 text-emerald-600'
                          : isMissed
                          ? 'bg-rose-50 text-rose-600'
                          : 'bg-amber-50 text-amber-600'
                      }`}
                    >
                      {isTaken ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    </div>

                    <div className="min-w-0">
                      <span className="font-bold text-slate-900 block truncate">
                        {log.medicationName} ({log.dosage})
                      </span>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span>{log.scheduledDate}</span>
                        <span>•</span>
                        <span>{formatTime24To12(log.scheduledTime)}</span>
                        {u && (
                          <>
                            <span>•</span>
                            <span className="text-sky-600 font-medium">{u.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      isTaken
                        ? 'text-emerald-700 bg-emerald-50 border border-emerald-100'
                        : isMissed
                        ? 'text-rose-700 bg-rose-50 border border-rose-100'
                        : 'text-amber-700 bg-amber-50 border border-amber-100'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
