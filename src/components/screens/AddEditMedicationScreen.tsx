import React, { useState } from 'react';
import { 
  Medication, 
  UserProfile, 
  Weekday, 
  MedicationCategory, 
  MedicationIconType, 
  MealTiming 
} from '../../types';
import { MedicationImageSelector } from '../common/MedicationImageSelector';
import { 
  translations, 
  Language, 
  getCategoryLabel, 
  getWeekdayName, 
  getMealTimingLabel 
} from '../../utils/i18n';
import { 
  X, 
  Check, 
  Plus, 
  Trash2, 
  Clock 
} from 'lucide-react';

interface Props {
  initialMedication?: Medication | null;
  users: UserProfile[];
  activeUserId: string;
  lang: Language;
  onSave: (medication: Medication) => void;
  onCancel: () => void;
}

const ALL_WEEKDAYS: Weekday[] = ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'];

const CATEGORIES: MedicationCategory[] = [
  'prescription',
  'chronic',
  'vitamin',
  'antibiotic',
  'pain_relief',
  'heart_bp',
  'diabetes',
  'allergy',
  'mental_health',
  'other',
];

const MEAL_TIMINGS: MealTiming[] = [
  'with_meal',
  'before_meal',
  'after_meal',
  'empty_stomach',
  'any_time',
];

export const AddEditMedicationScreen: React.FC<Props> = ({
  initialMedication,
  users,
  activeUserId,
  lang,
  onSave,
  onCancel,
}) => {
  const t = translations[lang];

  // Form State
  const [userId, setUserId] = useState<string>(
    initialMedication?.userId || (activeUserId !== 'all' ? activeUserId : users[0]?.id || '')
  );
  const [name, setName] = useState(initialMedication?.name || '');
  const [dosage, setDosage] = useState(initialMedication?.dosage || '');
  const [dosageUnit, setDosageUnit] = useState(initialMedication?.dosageUnit || 'tablet');
  const [category, setCategory] = useState<MedicationCategory>(initialMedication?.category || 'prescription');
  const [notes, setNotes] = useState(initialMedication?.notes || '');

  // Visual representation
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialMedication?.imageUrl);
  const [icon, setIcon] = useState<MedicationIconType>(initialMedication?.icon || 'pill');

  // Schedule
  const [startDate, setStartDate] = useState(
    initialMedication?.schedule.startDate || new Date().toISOString().split('T')[0]
  );
  const [hasEndDate, setHasEndDate] = useState(Boolean(initialMedication?.schedule.endDate));
  const [endDate, setEndDate] = useState(initialMedication?.schedule.endDate || '');
  const [times, setTimes] = useState<string[]>(
    initialMedication?.schedule.times?.length ? initialMedication.schedule.times : ['08:00']
  );
  const [weekdays, setWeekdays] = useState<Weekday[]>(
    initialMedication?.schedule.weekdays?.length ? initialMedication.schedule.weekdays : ALL_WEEKDAYS
  );
  const [mealTiming, setMealTiming] = useState<MealTiming>(
    initialMedication?.schedule.mealTiming || 'with_meal'
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleAddTime = (timeStr = '12:00') => {
    if (!times.includes(timeStr)) {
      setTimes([...times, timeStr].sort());
    }
  };

  const handleRemoveTime = (indexToRemove: number) => {
    if (times.length <= 1) return;
    setTimes(times.filter((_, idx) => idx !== indexToRemove));
  };

  const handleTimeChange = (index: number, newTime: string) => {
    const updated = [...times];
    updated[index] = newTime;
    setTimes(updated.sort());
  };

  const handleToggleWeekday = (day: Weekday) => {
    if (weekdays.includes(day)) {
      if (weekdays.length > 1) {
        setWeekdays(weekdays.filter((d) => d !== day));
      }
    } else {
      setWeekdays([...weekdays, day]);
    }
  };

  const handleSelectAllDays = () => setWeekdays(ALL_WEEKDAYS);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Medication name is required';
    }
    if (!dosage.trim()) {
      newErrors.dosage = 'Dosage is required';
    }
    if (!userId) {
      newErrors.userId = 'Please select a profile';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const med: Medication = {
      id: initialMedication?.id || `med_${Date.now()}`,
      userId,
      name: name.trim(),
      dosage: dosage.trim(),
      dosageUnit: dosageUnit.trim() || 'tablet',
      category,
      notes: notes.trim() || undefined,
      imageUrl,
      icon,
      color: '#0284c7', // Minimal light blue theme
      schedule: {
        times,
        weekdays,
        startDate,
        endDate: hasEndDate && endDate ? endDate : undefined,
        mealTiming,
      },
      isActive: initialMedication ? initialMedication.isActive : true,
      createdAt: initialMedication?.createdAt || new Date().toISOString(),
    };

    onSave(med);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 pb-28 text-slate-800 bg-sky-50/50">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-sky-100">
        <h2 className="text-xl font-bold text-slate-900">
          {initialMedication ? t.editMedication : t.addMedication}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-sky-100 transition"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* User Selection */}
        <div>
          <label className="block text-xs font-bold text-sky-700 uppercase tracking-wider mb-2">
            {t.activeUser}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {users.map((u) => {
              const isSelected = userId === u.id;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setUserId(u.id)}
                  className={`flex items-center gap-2 p-2.5 rounded-2xl border transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-100/80 text-sky-900 shadow-xs'
                      : 'border-sky-100 bg-white hover:bg-sky-50 text-slate-700'
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white flex-shrink-0 bg-sky-500"
                  >
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold truncate">
                    {u.name}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.userId && (
            <p className="text-rose-500 text-xs mt-1">{errors.userId}</p>
          )}
        </div>

        {/* Medication Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {t.medName} *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            placeholder={t.medNamePlaceholder}
            className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm px-4 py-3 rounded-2xl border border-sky-200 focus:outline-none focus:border-sky-500 transition shadow-xs"
          />
          {errors.name && (
            <p className="text-rose-500 text-xs mt-1">{errors.name}</p>
          )}
        </div>

        {/* Dosage and Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.dosage} *
            </label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => {
                setDosage(e.target.value);
                if (errors.dosage) setErrors({ ...errors, dosage: '' });
              }}
              placeholder={t.dosagePlaceholder}
              className="w-full bg-white text-slate-900 placeholder-slate-400 text-sm px-4 py-3 rounded-2xl border border-sky-200 focus:outline-none focus:border-sky-500 transition shadow-xs"
            />
            {errors.dosage && (
              <p className="text-rose-500 text-xs mt-1">{errors.dosage}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.category}
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as MedicationCategory)}
              className="w-full bg-white text-slate-900 text-sm px-4 py-3 rounded-2xl border border-sky-200 focus:outline-none focus:border-sky-500 transition shadow-xs cursor-pointer"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat, lang)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Medication Image & Icon Customizer */}
        <MedicationImageSelector
          imageUrl={imageUrl}
          icon={icon}
          color="#0284c7"
          lang={lang}
          onImageChange={setImageUrl}
          onIconChange={setIcon}
        />

        {/* Reminder Schedule Section */}
        <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-sky-100 pb-2.5">
            <Clock size={16} className="text-sky-600" />
            <h3 className="text-sm font-bold text-slate-900">
              {t.scheduleSection}
            </h3>
          </div>

          {/* Times List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                {t.reminderTimes}
              </label>
              <button
                type="button"
                onClick={() => handleAddTime()}
                className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} />
                <span>{t.addTime}</span>
              </button>
            </div>

            <div className="space-y-2">
              {times.map((time, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(idx, e.target.value)}
                    className="flex-1 bg-sky-50/70 text-slate-900 text-sm font-bold px-3 py-2.5 rounded-xl border border-sky-200 focus:outline-none focus:border-sky-500"
                  />
                  {times.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTime(idx)}
                      className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Presets */}
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] text-slate-500">Presets:</span>
              {['08:00', '12:00', '18:00', '21:00'].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleAddTime(preset)}
                  className="px-2 py-0.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 text-[10px] font-medium border border-sky-100"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          {/* Weekday Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700">
                {t.weekdays}
              </label>
              <button
                type="button"
                onClick={handleSelectAllDays}
                className="text-[11px] text-sky-600 hover:underline font-medium"
              >
                {t.everyday}
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {ALL_WEEKDAYS.map((day) => {
                const isSelected = weekdays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleWeekday(day)}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      isSelected
                        ? 'bg-sky-500 text-white shadow-xs shadow-sky-200'
                        : 'bg-sky-50/60 text-slate-600 border border-sky-100 hover:bg-sky-100'
                    }`}
                  >
                    {getWeekdayName(day, lang, true)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meal Timing */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              {t.mealTiming}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {MEAL_TIMINGS.map((timing) => {
                const isSelected = mealTiming === timing;
                return (
                  <button
                    key={timing}
                    type="button"
                    onClick={() => setMealTiming(timing)}
                    className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all text-center ${
                      isSelected
                        ? 'border-sky-400 bg-sky-50 text-sky-800 font-semibold'
                        : 'border-sky-100 bg-white text-slate-600 hover:bg-sky-50/50'
                    }`}
                  >
                    {getMealTimingLabel(timing, lang)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dates: Start & End */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-sky-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {t.startDate}
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-sky-50/70 text-slate-800 text-xs px-3 py-2 rounded-xl border border-sky-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  {t.endDate}
                </label>
                <label className="text-[11px] text-slate-500 flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!hasEndDate}
                    onChange={(e) => setHasEndDate(!e.target.checked)}
                    className="rounded bg-sky-50 border-sky-300 text-sky-600 focus:ring-0"
                  />
                  <span>{t.ongoing}</span>
                </label>
              </div>
              {hasEndDate ? (
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-sky-50/70 text-slate-800 text-xs px-3 py-2 rounded-xl border border-sky-200 focus:outline-none focus:border-sky-500"
                />
              ) : (
                <div className="text-xs text-slate-500 italic bg-sky-50/50 px-3 py-2 rounded-xl border border-sky-100">
                  Continuous schedule
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            {t.notes}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder={t.notesPlaceholder}
            className="w-full bg-white text-slate-800 placeholder-slate-400 text-xs px-4 py-2.5 rounded-2xl border border-sky-200 focus:outline-none focus:border-sky-500 transition shadow-xs resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-2xl font-bold text-xs text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            className="flex-1 py-3 px-4 rounded-2xl font-bold text-xs text-white bg-sky-500 hover:bg-sky-600 transition shadow-md shadow-sky-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Check size={16} />
            <span>{t.save}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
