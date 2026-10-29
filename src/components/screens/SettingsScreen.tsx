import React, { useRef, useState } from 'react';
import { AppSettings, AppData } from '../../types';
import { playAlarmSound, requestNotificationPermission } from '../../utils/notifications';
import { translations, Language } from '../../utils/i18n';
import { 
  Globe, 
  Bell, 
  Smartphone, 
  Download, 
  Upload, 
  RotateCcw, 
  ShieldCheck, 
  Check, 
  Play, 
  AlertCircle 
} from 'lucide-react';

interface Props {
  settings: AppSettings;
  appData: AppData;
  lang: Language;
  onUpdateSettings: (settings: AppSettings) => void;
  onRestoreData: (restoredData: AppData) => void;
  onResetData: () => void;
}

export const SettingsScreen: React.FC<Props> = ({
  settings,
  appData,
  lang,
  onUpdateSettings,
  onRestoreData,
  onResetData,
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetModal, setResetModal] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const handleLanguageChange = (newLang: Language) => {
    onUpdateSettings({ ...settings, language: newLang });
    document.documentElement.dir = newLang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const handleRequestPermission = async () => {
    const granted = await requestNotificationPermission();
    setNotificationStatus(granted ? 'granted' : 'denied');
  };

  const handlePreviewSound = (soundType: AppSettings['alarmSound']) => {
    const stopSound = playAlarmSound(soundType);
    setTimeout(stopSound, 3200);
  };

  const handleExportBackup = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(appData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `medr_backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.users && parsed.medications) {
          onRestoreData(parsed);
          alert('Backup restored successfully!');
        } else {
          alert('Invalid MEDR backup file structure.');
        }
      } catch (err) {
        alert('Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 pb-24 text-slate-800 bg-sky-50/50">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {t.settingsTitle}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Customize notifications, language, and offline data
        </p>
      </div>

      {/* 1. Language & Full RTL Support */}
      <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-sm shadow-sky-100/60 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Globe size={18} className="text-sky-500" />
          <span>{t.languageSection}</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleLanguageChange('en')}
            className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
              settings.language === 'en'
                ? 'bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-200'
                : 'bg-sky-50/60 text-slate-700 border-sky-200 hover:bg-sky-100/60'
            }`}
          >
            <span>English (LTR)</span>
            {settings.language === 'en' && <Check size={14} className="stroke-[3]" />}
          </button>

          <button
            type="button"
            onClick={() => handleLanguageChange('fa')}
            className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition flex items-center justify-center gap-2 ${
              settings.language === 'fa'
                ? 'bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-200'
                : 'bg-sky-50/60 text-slate-700 border-sky-200 hover:bg-sky-100/60'
            }`}
          >
            <span>فارسی (RTL)</span>
            {settings.language === 'fa' && <Check size={14} className="stroke-[3]" />}
          </button>
        </div>
      </div>

      {/* 2. Notifications & Audio Alarms */}
      <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-sm shadow-sky-100/60 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Bell size={18} className="text-sky-500" />
          <span>{t.notificationSection}</span>
        </div>

        {/* Push Notifications Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 block">
              {t.enableNotifications}
            </span>
            <span className="text-[11px] text-slate-500">
              {t.enableNotificationsDesc}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRequestPermission}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              notificationStatus === 'granted'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-sky-500 text-white hover:bg-sky-600 shadow-sm shadow-sky-200'
            }`}
          >
            {notificationStatus === 'granted' ? 'Allowed ✓' : 'Enable'}
          </button>
        </div>

        {/* Sound Toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-sky-100">
          <div>
            <span className="text-xs font-bold text-slate-800 block">
              {t.enableSound}
            </span>
            <span className="text-[11px] text-slate-500">
              Synthesizes gentle medical alarm chimes
            </span>
          </div>

          <button
            type="button"
            onClick={() => onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
              settings.soundEnabled ? 'bg-sky-500' : 'bg-slate-200'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Alarm Sound Type Picker with Preview */}
        {settings.soundEnabled && (
          <div className="space-y-2 pt-3 border-t border-sky-100">
            <label className="block text-xs font-semibold text-slate-700">
              {t.alarmSoundType}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'pulse', label: t.soundPulse },
                { id: 'gentle', label: t.soundGentle },
                { id: 'digital', label: t.soundDigital },
                { id: 'bell', label: t.soundBell },
              ].map((sound) => {
                const isSelected = settings.alarmSound === sound.id;
                return (
                  <div
                    key={sound.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition ${
                      isSelected
                        ? 'border-sky-400 bg-sky-50 text-sky-800 font-semibold'
                        : 'border-sky-100 bg-white text-slate-600 hover:bg-sky-50/50'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onUpdateSettings({ ...settings, alarmSound: sound.id as AppSettings['alarmSound'] })}
                      className="flex-1 text-left font-medium truncate"
                    >
                      {sound.label}
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePreviewSound(sound.id as AppSettings['alarmSound'])}
                      className="p-1 text-sky-600 hover:text-sky-700"
                      title="Preview sound"
                    >
                      <Play size={12} fill="currentColor" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Repeating Notifications Until Confirmed */}
        <div className="flex items-center justify-between pt-3 border-t border-sky-100">
          <div>
            <span className="text-xs font-bold text-slate-800 block">
              {t.repeatUntilConfirmed}
            </span>
            <span className="text-[11px] text-slate-500">
              {t.repeatUntilConfirmedDesc}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...settings,
                repeatUntilConfirmed: !settings.repeatUntilConfirmed,
              })
            }
            className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
              settings.repeatUntilConfirmed ? 'bg-sky-500' : 'bg-slate-200'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                settings.repeatUntilConfirmed ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 3. Display & Android Frame Simulator */}
      <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-sm shadow-sky-100/60 space-y-3">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
          <Smartphone size={18} className="text-sky-500" />
          <span>{t.viewModeSection}</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-800 block">
              {t.androidFrameMode}
            </span>
            <span className="text-[11px] text-slate-500">
              {t.androidFrameModeDesc}
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              onUpdateSettings({
                ...settings,
                androidSimulatorMode: !settings.androidSimulatorMode,
              })
            }
            className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
              settings.androidSimulatorMode ? 'bg-sky-500' : 'bg-slate-200'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                settings.androidSimulatorMode ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* 4. Offline Data & Backup */}
      <div className="bg-white border border-sky-100 rounded-3xl p-5 shadow-sm shadow-sky-100/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <ShieldCheck size={18} className="text-sky-500" />
            <span>{t.dataManagementSection}</span>
          </div>
          <span className="text-[10px] font-bold text-sky-700 bg-sky-100/80 px-2 py-0.5 rounded-full border border-sky-200">
            100% Offline
          </span>
        </div>

        <p className="text-xs text-slate-500">
          {t.backupNotice}
        </p>

        {/* Hidden input for import */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImportBackup}
          className="hidden"
        />

        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            type="button"
            onClick={handleExportBackup}
            className="py-2.5 px-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-xs font-bold text-white flex items-center justify-center gap-1.5 transition shadow-sm shadow-sky-200"
          >
            <Download size={14} />
            <span>{t.downloadBackup}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-2.5 px-3 rounded-2xl bg-sky-50 hover:bg-sky-100 text-xs font-bold text-sky-800 border border-sky-200 flex items-center justify-center gap-1.5 transition"
          >
            <Upload size={14} />
            <span>{t.restoreBackup}</span>
          </button>
        </div>

        {/* Direct APK Download (.build-outputs/app-debug.apk) */}
        <div className="pt-2">
          <a
            href="/app-debug.apk"
            download="MEDR-By-Saj-debug.apk"
            className="w-full py-2.5 px-3 rounded-2xl bg-sky-100 hover:bg-sky-200 text-xs font-bold text-sky-800 border border-sky-300 flex items-center justify-center gap-2 transition"
          >
            <Download size={14} className="text-sky-600" />
            <span>{t.downloadDebugApk}</span>
          </a>
          <span className="block text-[10px] text-slate-500 text-center mt-1">
            {t.apkInBuildOutputs}
          </span>
        </div>

        {/* Reset to sample data */}
        <div className="pt-2 border-t border-sky-100">
          <button
            type="button"
            onClick={() => setResetModal(true)}
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-500 hover:bg-rose-50 transition flex items-center justify-center gap-1.5"
          >
            <RotateCcw size={14} />
            <span>{t.resetData}</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {resetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white border border-sky-200 rounded-3xl p-6 shadow-2xl text-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-rose-500">
              <AlertCircle size={24} />
              <h3 className="text-base font-bold text-slate-900">
                {t.resetData}
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              {t.resetWarning}
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-600 hover:bg-slate-200"
              >
                {t.cancel}
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetData();
                  setResetModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white shadow-sm"
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
