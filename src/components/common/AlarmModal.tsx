import React, { useEffect, useState } from 'react';
import { Medication, UserProfile } from '../../types';
import { MedicationVisual } from './MedicationVisual';
import { playAlarmSound, playSuccessChime, formatTime24To12 } from '../../utils/notifications';
import { triggerDoseTakenCelebration } from './ConfettiEffect';
import { translations, Language, getMealTimingLabel } from '../../utils/i18n';
import { 
  Bell, 
  CheckCircle2, 
  Clock, 
  X, 
  Volume2, 
  VolumeX, 
  AlertCircle
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  medication: Medication | null;
  user: UserProfile | null;
  scheduledTime: string;
  lang: Language;
  soundEnabled: boolean;
  alarmSound: 'gentle' | 'pulse' | 'digital' | 'bell';
  onTake: () => void;
  onSnooze: () => void;
  onDismiss: () => void;
}

export const AlarmModal: React.FC<Props> = ({
  isOpen,
  medication,
  user,
  scheduledTime,
  lang,
  soundEnabled,
  alarmSound,
  onTake,
  onSnooze,
  onDismiss,
}) => {
  const t = translations[lang];
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (!isOpen || !soundEnabled || isMuted) return;

    const stopSound = playAlarmSound(alarmSound);
    return () => {
      stopSound();
    };
  }, [isOpen, soundEnabled, isMuted, alarmSound]);

  if (!isOpen || !medication) return null;

  const handleTake = () => {
    playSuccessChime();
    triggerDoseTakenCelebration();
    onTake();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-md bg-white border-2 border-sky-300 rounded-3xl p-6 shadow-2xl shadow-sky-900/20 relative overflow-hidden text-slate-800"
      >
        {/* Glow ambient background */}
        <div 
          className="absolute -top-24 -left-24 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none bg-sky-200"
        />
        <div 
          className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none bg-sky-200"
        />

        {/* Top bar: Alert icon, User tag, Mute toggle, Close button */}
        <div className="flex items-center justify-between relative z-10 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center animate-pulse-ring">
              <Bell size={20} className="animate-bounce" />
            </div>
            <div>
              <span className="text-xs uppercase font-bold tracking-wider text-sky-600 flex items-center gap-1">
                <AlertCircle size={12} /> {t.alarmTitle}
              </span>
              <p className="text-[11px] text-slate-500">
                {t.alarmSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {soundEnabled && (
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2 rounded-xl transition ${
                  isMuted 
                    ? 'bg-slate-100 text-slate-400 hover:text-slate-600' 
                    : 'bg-sky-50 text-sky-600 hover:bg-sky-100'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
            )}
            <button
              type="button"
              onClick={onDismiss}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              title={t.dismiss}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* User Profile Badge */}
        {user && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100 mb-4 text-xs">
            <div 
              className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
              style={{ backgroundColor: user.avatarColor || '#0284c7' }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-slate-700 font-medium">
              <strong className="text-slate-500">{t.userName}:</strong> {user.name}
            </span>
          </div>
        )}

        {/* Main Medication Visual & Info Card */}
        <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-5 mb-5 flex flex-col items-center text-center relative z-10">
          <div className="mb-3">
            <MedicationVisual 
              imageUrl={medication.imageUrl} 
              icon={medication.icon} 
              color={medication.color || '#0284c7'} 
              size="hero" 
              altText={medication.name}
            />
          </div>

          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {medication.name}
          </h3>

          <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-center">
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
              {t.dosage}: {medication.dosage}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-white text-slate-600 border border-slate-200 flex items-center gap-1">
              <Clock size={12} className="text-sky-500" /> {formatTime24To12(scheduledTime)}
            </span>
            {medication.schedule.mealTiming && medication.schedule.mealTiming !== 'any_time' && (
              <span className="px-2.5 py-0.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                {getMealTimingLabel(medication.schedule.mealTiming, lang)}
              </span>
            )}
          </div>

          {medication.notes && (
            <p className="text-xs text-slate-600 bg-white border border-sky-100 rounded-xl p-2.5 mt-3 max-w-full italic">
              &ldquo;{medication.notes}&rdquo;
            </p>
          )}
        </div>

        {/* 3 Notification Action Buttons */}
        <div className="space-y-2.5 relative z-10">
          {/* 1. Take Medication */}
          <button
            type="button"
            onClick={handleTake}
            className="w-full py-3.5 px-4 rounded-2xl font-bold text-base text-white flex items-center justify-center gap-2 shadow-lg shadow-sky-200 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:scale-[0.98] transition cursor-pointer"
          >
            <CheckCircle2 size={20} className="stroke-[2.5]" />
            {t.takeMedication}
          </button>

          {/* 2. Snooze & 3. Dismiss */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onSnooze}
              className="py-3 px-3 rounded-2xl font-semibold text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 active:scale-[0.98] transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Clock size={15} />
              {t.snooze}
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className="py-3 px-3 rounded-2xl font-semibold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 active:scale-[0.98] transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <X size={15} />
              {t.dismiss}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
