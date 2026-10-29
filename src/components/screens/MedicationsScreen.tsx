import React, { useState } from 'react';
import { Medication, UserProfile, MedicationCategory } from '../../types';
import { MedicationVisual } from '../common/MedicationVisual';
import { formatTime24To12 } from '../../utils/notifications';
import { 
  translations, 
  Language, 
  getCategoryLabel, 
  getWeekdayName, 
  getMealTimingLabel 
} from '../../utils/i18n';
import { 
  Search, 
  Plus, 
  Clock, 
  Calendar, 
  Edit3, 
  Trash2, 
  Power, 
  AlertCircle 
} from 'lucide-react';

interface Props {
  medications: Medication[];
  users: UserProfile[];
  activeUserId: string;
  lang: Language;
  onAddMedication: () => void;
  onEditMedication: (medication: Medication) => void;
  onDeleteMedication: (id: string) => void;
  onToggleActive: (id: string) => void;
}

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

export const MedicationsScreen: React.FC<Props> = ({
  medications,
  users,
  activeUserId,
  lang,
  onAddMedication,
  onEditMedication,
  onDeleteMedication,
  onToggleActive,
}) => {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredMeds = medications.filter((m) => {
    if (activeUserId !== 'all' && m.userId !== activeUserId) return false;
    if (selectedCategory !== 'all' && m.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = m.name.toLowerCase().includes(q);
      const matchNotes = m.notes?.toLowerCase().includes(q);
      const matchDosage = m.dosage.toLowerCase().includes(q);
      if (!matchName && !matchNotes && !matchDosage) return false;
    }
    return true;
  });

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 pb-28 text-slate-800 bg-sky-50/50">
      {/* Search Bar */}
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t.search}
          className="w-full bg-white text-slate-800 placeholder-slate-400 text-sm pl-10 pr-4 py-3 rounded-2xl border border-sky-200 focus:outline-none focus:border-sky-500 transition shadow-xs"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Category Chips Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs select-none">
        <button
          type="button"
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-sky-500 text-white shadow-xs shadow-sky-200'
              : 'bg-white text-slate-600 border border-sky-100 hover:bg-sky-50'
          }`}
        >
          {t.all}
        </button>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-sky-500 text-white shadow-xs shadow-sky-200'
                  : 'bg-white text-slate-600 border border-sky-100 hover:bg-sky-50'
              }`}
            >
              {getCategoryLabel(cat, lang)}
            </button>
          );
        })}
      </div>

      {/* Medication Cards List */}
      {filteredMeds.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-dashed border-sky-200 bg-white shadow-xs">
          <p className="text-sm font-semibold text-slate-800">
            {t.noData}
          </p>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try adjusting your search or category filter.
          </p>
          <button
            type="button"
            onClick={onAddMedication}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-sky-500 text-white hover:bg-sky-600 shadow-sm shadow-sky-200"
          >
            <Plus size={15} />
            {t.addMedication}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMeds.map((med) => {
            const user = users.find((u) => u.id === med.userId);
            const isDeleting = deleteConfirmId === med.id;

            return (
              <div
                key={med.id}
                className={`p-4 rounded-3xl border transition-all relative overflow-hidden bg-white shadow-xs ${
                  med.isActive
                    ? 'border-sky-100 hover:border-sky-200'
                    : 'border-slate-200 opacity-60 bg-slate-50/50'
                }`}
              >
                {/* Visual Strip Accent on left */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500"
                />

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <MedicationVisual
                      imageUrl={med.imageUrl}
                      icon={med.icon}
                      color="#0284c7"
                      size="lg"
                      altText={med.name}
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900 truncate">
                          {med.name}
                        </h4>
                        {!med.isActive && (
                          <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            {t.paused}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                        <span className="font-semibold text-sky-700">
                          {med.dosage}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-slate-600 bg-sky-50 px-2 py-0.5 rounded-lg text-[11px] border border-sky-100">
                          {getCategoryLabel(med.category, lang)}
                        </span>
                        {user && activeUserId === 'all' && (
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-100 text-sky-800"
                          >
                            {user.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Toggle Active */}
                  <button
                    type="button"
                    onClick={() => onToggleActive(med.id)}
                    className={`p-2 rounded-xl transition ${
                      med.isActive
                        ? 'text-sky-600 hover:bg-sky-50'
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                    }`}
                    title={med.isActive ? 'Pause Medication' : 'Activate Medication'}
                  >
                    <Power size={18} />
                  </button>
                </div>

                {/* Schedule Summary Bar */}
                <div className="mt-3 pt-3 border-t border-sky-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1 font-semibold text-slate-800 bg-sky-50 px-2.5 py-1 rounded-xl border border-sky-100">
                      <Clock size={12} className="text-sky-600" />
                      {med.schedule.times.map((tm) => formatTime24To12(tm)).join(', ')}
                    </span>

                    <span className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-2 py-1 rounded-xl">
                      <Calendar size={12} />
                      {med.schedule.weekdays.length === 7
                        ? t.everyday
                        : med.schedule.weekdays.map((d) => getWeekdayName(d, lang, true)).join(', ')}
                    </span>

                    {med.schedule.mealTiming && med.schedule.mealTiming !== 'any_time' && (
                      <span className="text-[11px] text-amber-700 font-medium">
                        {getMealTimingLabel(med.schedule.mealTiming, lang)}
                      </span>
                    )}
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1.5 ml-auto">
                    <button
                      type="button"
                      onClick={() => onEditMedication(med)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-sky-50 transition"
                      title={t.edit}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(med.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition"
                      title={t.delete}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation Overlay */}
                {isDeleting && (
                  <div className="absolute inset-0 bg-white/95 backdrop-blur-xs z-20 flex items-center justify-between p-4 animate-fade-in border-2 border-rose-200 rounded-3xl">
                    <div className="flex items-center gap-2 text-xs text-rose-600 font-bold">
                      <AlertCircle size={16} />
                      <span>Delete {med.name}?</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onDeleteMedication(med.id);
                          setDeleteConfirmId(null);
                        }}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
                      >
                        {t.delete}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-20 right-5 z-30">
        <button
          type="button"
          onClick={onAddMedication}
          className="w-14 h-14 rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-300 flex items-center justify-center transition transform active:scale-95 cursor-pointer ring-4 ring-sky-50"
          title={t.addMedication}
        >
          <Plus size={28} className="stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
