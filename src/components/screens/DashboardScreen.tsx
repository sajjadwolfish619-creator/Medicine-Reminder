import React from 'react';
import { Medication, UserProfile, HistoryLog } from '../../types';
import { MedicationVisual } from '../common/MedicationVisual';
import { getRemindersForDate, formatTime24To12 } from '../../utils/notifications';
import { translations, Language, getMealTimingLabel } from '../../utils/i18n';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Plus, 
  Bell, 
  Pill, 
  Sparkles, 
  TrendingUp, 
  ChevronRight,
  ChevronDown
} from 'lucide-react';

interface Props {
  medications: Medication[];
  users: UserProfile[];
  activeUserId: string;
  historyLogs: HistoryLog[];
  lang: Language;
  onSelectUser: (userId: string) => void;
  onNavigate: (tab: 'dashboard' | 'today' | 'medications' | 'history' | 'users' | 'settings') => void;
  onAddMedication: () => void;
  onTakeDose: (medicationId: string, time: string) => void;
  onSnoozeDose: (medicationId: string, time: string) => void;
  onTriggerTestAlarm: () => void;
}

export const DashboardScreen: React.FC<Props> = ({
  medications,
  users,
  activeUserId,
  historyLogs,
  lang,
  onSelectUser,
  onNavigate,
  onAddMedication,
  onTakeDose,
  onTriggerTestAlarm,
}) => {
  const t = translations[lang];
  const todayStr = new Date().toISOString().split('T')[0];

  const activeUser = users.find((u) => u.id === activeUserId);

  const todayReminders = getRemindersForDate(todayStr, medications, historyLogs, activeUserId);
  const takenCount = todayReminders.filter((r) => r.status === 'taken').length;
  const missedCount = todayReminders.filter((r) => r.status === 'missed').length;
  const totalCount = todayReminders.length;
  const adherencePercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 100;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const upcomingReminders = todayReminders.filter((r) => {
    if (r.status === 'taken') return false;
    const [h, m] = r.time.split(':').map(Number);
    const reminderMinutes = h * 60 + m;
    return reminderMinutes >= currentMinutes - 20;
  });

  const nextReminder = upcomingReminders[0] || null;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-24 text-slate-800 bg-sky-50/50">
      {/* Top Header: Active User Switcher & Test Alarm */}
      <div className="flex items-center justify-between">
        <div className="relative group">
          <label className="text-[11px] font-bold text-sky-700 uppercase tracking-wider block">
            {t.activeUser}
          </label>
          <div className="flex items-center gap-2 mt-0.5">
            <select
              value={activeUserId}
              onChange={(e) => onSelectUser(e.target.value)}
              className="bg-white text-slate-900 font-bold text-sm py-1.5 px-3 rounded-2xl border border-sky-200 focus:outline-none focus:border-sky-500 cursor-pointer shadow-xs appearance-none pr-8"
            >
              <option value="all">{t.allUsers}</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none -ml-7 text-sky-500">
              <ChevronDown size={16} />
            </div>

            {activeUser && (
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs flex-shrink-0 bg-sky-500"
              >
                {activeUser.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Quick Test Alarm Button */}
        <button
          type="button"
          onClick={onTriggerTestAlarm}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-sky-700 transition shadow-xs active:scale-95 cursor-pointer"
          title="Simulate a live alarm notification"
        >
          <Bell size={14} className="text-sky-500 animate-bounce" />
          <span>{t.testAlarm}</span>
        </button>
      </div>

      {/* Adherence & Key Stats Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Today's reminders */}
        <div className="bg-white border border-sky-100 rounded-3xl p-4 shadow-sm shadow-sky-100/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{t.todayReminders}</span>
            <Clock size={15} className="text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">{totalCount}</span>
            <span className="text-xs text-slate-500">doses</span>
          </div>
        </div>

        {/* Taken Today */}
        <div className="bg-white border border-sky-100 rounded-3xl p-4 shadow-sm shadow-sky-100/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{t.takenToday}</span>
            <CheckCircle2 size={15} className="text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600">{takenCount}</span>
            <span className="text-xs text-slate-500">/ {totalCount}</span>
          </div>
        </div>

        {/* Adherence Score */}
        <div className="bg-white border border-sky-100 rounded-3xl p-4 shadow-sm shadow-sky-100/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{t.adherenceRate}</span>
            <TrendingUp size={15} className="text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span 
              className={`text-2xl font-black ${
                adherencePercent >= 80 ? 'text-sky-600' : adherencePercent >= 50 ? 'text-amber-500' : 'text-rose-500'
              }`}
            >
              {adherencePercent}%
            </span>
          </div>
        </div>

        {/* Total Active Meds */}
        <div className="bg-white border border-sky-100 rounded-3xl p-4 shadow-sm shadow-sky-100/50 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>{t.totalMeds}</span>
            <Pill size={15} className="text-sky-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {medications.filter((m) => m.isActive && (activeUserId === 'all' || m.userId === activeUserId)).length}
            </span>
            <span className="text-xs text-slate-500">active</span>
          </div>
        </div>
      </div>

      {/* Next Dose Featured Card */}
      {nextReminder ? (
        <div 
          className="relative overflow-hidden rounded-3xl p-5 border border-sky-200 shadow-md shadow-sky-100 bg-white"
        >
          {/* Subtle glow background */}
          <div 
            className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-2xl opacity-20 pointer-events-none bg-sky-200"
          />

          <div className="flex items-center justify-between mb-3 relative z-10">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-sky-100 text-sky-700 border border-sky-200 flex items-center gap-1.5">
              <Sparkles size={13} /> {t.nextDose}
            </span>
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-100">
              <Clock size={13} className="text-sky-600" />
              {formatTime24To12(nextReminder.time)}
            </span>
          </div>

          <div className="flex items-center gap-4 relative z-10 my-2">
            <MedicationVisual
              imageUrl={nextReminder.medication.imageUrl}
              icon={nextReminder.medication.icon}
              color="#0284c7"
              size="xl"
              altText={nextReminder.medication.name}
            />
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-extrabold text-slate-900 truncate">
                {nextReminder.medication.name}
              </h3>
              <p className="text-xs font-semibold text-sky-700 mt-0.5">
                {nextReminder.medication.dosage}
              </p>
              {nextReminder.medication.schedule.mealTiming && nextReminder.medication.schedule.mealTiming !== 'any_time' && (
                <span className="inline-block mt-1 text-[11px] text-amber-700 font-medium">
                  {getMealTimingLabel(nextReminder.medication.schedule.mealTiming, lang)}
                </span>
              )}
            </div>
          </div>

          {/* Quick Action Button */}
          <div className="mt-4 pt-3 border-t border-sky-100 flex items-center justify-between relative z-10">
            <span className="text-xs text-slate-500">
              {nextReminder.status === 'snoozed' ? '⏰ Snoozed (will remind soon)' : 'Scheduled for today'}
            </span>
            <button
              type="button"
              onClick={() => onTakeDose(nextReminder.medicationId, nextReminder.time)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 transition shadow-sm shadow-sky-200 flex items-center gap-1.5 active:scale-95 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              {t.takeMedication}
            </button>
          </div>
        </div>
      ) : totalCount > 0 ? (
        <div className="rounded-3xl p-5 border border-sky-200 bg-white shadow-xs text-center">
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 size={24} />
          </div>
          <h4 className="text-sm font-bold text-sky-800">
            All Doses Completed for Today! 🎉
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Great adherence record. You have taken all scheduled medications.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl p-6 border border-dashed border-sky-200 bg-white text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mx-auto mb-2">
            <Pill size={24} />
          </div>
          <h4 className="text-sm font-semibold text-slate-800">
            {t.emptyToday}
          </h4>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            {t.addFirstMed}
          </p>
          <button
            type="button"
            onClick={onAddMedication}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 hover:bg-sky-600 text-white transition shadow-sm shadow-sky-200"
          >
            <Plus size={15} />
            {t.addMedication}
          </button>
        </div>
      )}

      {/* Today's Schedule Overview List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>{t.todaySchedule}</span>
            <span className="text-xs font-normal text-slate-500">
              ({todayReminders.length})
            </span>
          </h3>
          <button
            type="button"
            onClick={() => onNavigate('today')}
            className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1"
          >
            <span>{t.all}</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {todayReminders.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-2">
            {t.noData}
          </p>
        ) : (
          <div className="space-y-2.5">
            {todayReminders.slice(0, 4).map((reminder) => {
              const isTaken = reminder.status === 'taken';
              const isMissed = reminder.status === 'missed';

              return (
                <div
                  key={reminder.id}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isTaken
                      ? 'bg-sky-50/40 border-sky-100 text-slate-600'
                      : isMissed
                      ? 'bg-rose-50/50 border-rose-200'
                      : 'bg-white border-sky-100 shadow-xs hover:border-sky-200'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MedicationVisual
                      imageUrl={reminder.medication.imageUrl}
                      icon={reminder.medication.icon}
                      color="#0284c7"
                      size="md"
                      altText={reminder.medication.name}
                    />
                    <div className="min-w-0">
                      <h4 className={`text-sm font-bold truncate ${isTaken ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {reminder.medication.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5 text-xs">
                        <span className="text-slate-500 font-medium">
                          {reminder.medication.dosage}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-sky-600 font-semibold flex items-center gap-0.5">
                          <Clock size={11} /> {formatTime24To12(reminder.time)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge & Take Action */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isTaken ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold text-sky-700 bg-sky-100 border border-sky-200">
                        <CheckCircle2 size={13} /> {t.taken}
                      </span>
                    ) : isMissed ? (
                      <button
                        type="button"
                        onClick={() => onTakeDose(reminder.medicationId, reminder.time)}
                        className="px-2.5 py-1 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                        title="Mark dose as taken late"
                      >
                        <AlertTriangle size={13} />
                        <span>Take Late</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onTakeDose(reminder.medicationId, reminder.time)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 transition shadow-xs shadow-sky-200 flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <CheckCircle2 size={14} />
                        <span>{t.takeMedication}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Add Bar */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onAddMedication}
          className="w-full py-3.5 px-4 rounded-2xl font-bold text-sm text-sky-700 bg-white hover:bg-sky-50 border border-sky-200 transition flex items-center justify-center gap-2 shadow-xs"
        >
          <Plus size={18} className="text-sky-600" />
          <span>{t.addMedication}</span>
        </button>
      </div>
    </div>
  );
};
