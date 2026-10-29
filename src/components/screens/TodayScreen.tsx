import React, { useState } from 'react';
import { Medication, UserProfile, HistoryLog } from '../../types';
import { MedicationVisual } from '../common/MedicationVisual';
import { getRemindersForDate, formatTime24To12 } from '../../utils/notifications';
import { translations, Language } from '../../utils/i18n';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Sun, 
  Sunset, 
  Moon, 
  Calendar, 
  Check, 
  RotateCcw 
} from 'lucide-react';

interface Props {
  medications: Medication[];
  users: UserProfile[];
  activeUserId: string;
  historyLogs: HistoryLog[];
  lang: Language;
  onTakeDose: (medicationId: string, time: string) => void;
  onSnoozeDose: (medicationId: string, time: string) => void;
  onDismissDose: (medicationId: string, time: string) => void;
}

export const TodayScreen: React.FC<Props> = ({
  medications,
  users,
  activeUserId,
  historyLogs,
  lang,
  onTakeDose,
  onSnoozeDose,
  onDismissDose,
}) => {
  const t = translations[lang];
  const todayStr = new Date().toISOString().split('T')[0];
  const [filterState, setFilterState] = useState<'all' | 'pending' | 'taken' | 'missed'>('all');

  const reminders = getRemindersForDate(todayStr, medications, historyLogs, activeUserId);
  const total = reminders.length;
  const taken = reminders.filter((r) => r.status === 'taken').length;
  const missed = reminders.filter((r) => r.status === 'missed').length;
  const progressPercent = total > 0 ? Math.round((taken / total) * 100) : 0;

  const filteredReminders = reminders.filter((r) => {
    if (filterState === 'all') return true;
    if (filterState === 'pending') return r.status === 'pending' || r.status === 'snoozed';
    return r.status === filterState;
  });

  const getTimePeriod = (time24: string) => {
    const hour = parseInt(time24.split(':')[0], 10);
    if (hour >= 5 && hour < 12) return { name: 'Morning', icon: <Sun size={15} className="text-amber-500" /> };
    if (hour >= 12 && hour < 17) return { name: 'Afternoon', icon: <Sun size={15} className="text-orange-500" /> };
    if (hour >= 17 && hour < 22) return { name: 'Evening', icon: <Sunset size={15} className="text-sky-500" /> };
    return { name: 'Night / Bedtime', icon: <Moon size={15} className="text-indigo-500" /> };
  };

  const todayDisplay = new Date().toLocaleDateString(lang === 'fa' ? 'fa-IR' : 'en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-24 text-slate-800 bg-sky-50/50">
      {/* Date Header & Progress */}
      <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-sm shadow-sky-100/50 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-sky-700 flex items-center gap-1.5 uppercase tracking-wider">
              <Calendar size={13} /> {t.today}
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {todayDisplay}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-sky-600">
              {taken}
            </span>
            <span className="text-xs text-slate-500"> / {total} taken</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-sky-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs select-none">
        {(['all', 'pending', 'taken', 'missed'] as const).map((filter) => {
          const isActive = filterState === filter;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => setFilterState(filter)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                isActive
                  ? 'bg-sky-500 text-white shadow-xs shadow-sky-200'
                  : 'bg-white text-slate-600 border border-sky-100 hover:bg-sky-50/60'
              }`}
            >
              {filter === 'all' && `${t.all} (${total})`}
              {filter === 'pending' && `${t.pending} (${total - taken - missed})`}
              {filter === 'taken' && `${t.taken} (${taken})`}
              {filter === 'missed' && `${t.missed} (${missed})`}
            </button>
          );
        })}
      </div>

      {/* Reminders List */}
      {filteredReminders.length === 0 ? (
        <div className="text-center py-12 rounded-3xl border border-dashed border-sky-200 bg-white shadow-xs">
          <CheckCircle2 size={36} className="text-sky-500 mx-auto mb-2 opacity-80" />
          <p className="text-sm font-semibold text-slate-800">
            {t.noData}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            No medication reminders in this filter for today.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReminders.map((reminder) => {
            const period = getTimePeriod(reminder.time);
            const user = users.find((u) => u.id === reminder.userId);
            const isTaken = reminder.status === 'taken';
            const isMissed = reminder.status === 'missed';
            const isSnoozed = reminder.status === 'snoozed';

            return (
              <div
                key={reminder.id}
                className={`p-4 rounded-3xl border transition-all ${
                  isTaken
                    ? 'bg-sky-50/40 border-sky-100'
                    : isMissed
                    ? 'bg-rose-50/60 border-rose-200'
                    : isSnoozed
                    ? 'bg-amber-50/60 border-amber-200'
                    : 'bg-white border-sky-100 shadow-xs hover:border-sky-200'
                }`}
              >
                {/* Header: Period, Time, User Tag */}
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    {period.icon}
                    <span>{period.name}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-sky-600 font-bold">
                      {formatTime24To12(reminder.time)}
                    </span>
                  </div>

                  {user && (
                    <span 
                      className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 border border-sky-200"
                    >
                      {user.name}
                    </span>
                  )}
                </div>

                {/* Medication Details Card */}
                <div className="flex items-center gap-3.5">
                  <MedicationVisual
                    imageUrl={reminder.medication.imageUrl}
                    icon={reminder.medication.icon}
                    color="#0284c7"
                    size="lg"
                    altText={reminder.medication.name}
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className={`text-base font-extrabold truncate ${isTaken ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {reminder.medication.name}
                    </h4>
                    <p className="text-xs font-semibold text-sky-700 mt-0.5">
                      {t.dosage}: {reminder.medication.dosage}
                    </p>
                    {reminder.medication.notes && (
                      <p className="text-[11px] text-slate-500 truncate mt-1">
                        {reminder.medication.notes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions & Status Bar */}
                <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between">
                  <div>
                    {isTaken && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-sky-700 bg-sky-100 px-2.5 py-1 rounded-xl">
                        <Check size={13} className="stroke-[3]" /> {t.taken}
                      </span>
                    )}
                    {isMissed && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-xl">
                        <AlertCircle size={13} /> {t.missed}
                      </span>
                    )}
                    {isSnoozed && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-xl">
                        <Clock size={13} /> {t.snoozed}
                      </span>
                    )}
                    {reminder.status === 'pending' && (
                      <span className="text-xs text-slate-500">
                        Pending scheduled time
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2">
                    {!isTaken ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onSnoozeDose(reminder.medicationId, reminder.time)}
                          className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition flex items-center gap-1 cursor-pointer"
                          title={t.snooze}
                        >
                          <Clock size={12} />
                          <span>{t.snooze}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onTakeDose(reminder.medicationId, reminder.time)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 transition shadow-xs shadow-sky-200 flex items-center gap-1 cursor-pointer active:scale-95"
                        >
                          <CheckCircle2 size={14} />
                          <span>{t.takeMedication}</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onDismissDose(reminder.medicationId, reminder.time)}
                        className="px-2.5 py-1 rounded-xl text-xs font-medium text-slate-500 hover:text-slate-700 bg-slate-100 transition flex items-center gap-1"
                        title="Reset status"
                      >
                        <RotateCcw size={12} />
                        <span>Undo</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
