import React, { useState, useEffect, useRef } from 'react';
import { 
  AppData, 
  Medication, 
  UserProfile, 
  HistoryLog 
} from './types';
import { 
  loadAppData, 
  saveAppData, 
  getInitialAppData 
} from './utils/storage';
import { 
  getRemindersForDate, 
  sendLocalPushNotification, 
  playSuccessChime 
} from './utils/notifications';
import { translations, Language } from './utils/i18n';
import { AndroidFrame } from './components/common/AndroidFrame';
import { AlarmModal } from './components/common/AlarmModal';
import { PWAInstallButton } from './components/common/PWAInstallButton';
import { triggerDoseTakenCelebration } from './components/common/ConfettiEffect';

// Screens
import { SplashScreen } from './components/screens/SplashScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { TodayScreen } from './components/screens/TodayScreen';
import { MedicationsScreen } from './components/screens/MedicationsScreen';
import { AddEditMedicationScreen } from './components/screens/AddEditMedicationScreen';
import { HistoryScreen } from './components/screens/HistoryScreen';
import { UsersScreen } from './components/screens/UsersScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';

// Navigation icons
import { 
  LayoutDashboard, 
  CalendarCheck, 
  Pill, 
  History, 
  Users, 
  Settings, 
  Smartphone 
} from 'lucide-react';

export default function App() {
  const [appData, setAppData] = useState<AppData>(() => loadAppData());
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'today' | 'medications' | 'history' | 'users' | 'settings'
  >('dashboard');

  // Add / Edit Medication Form modal
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [isMedicationFormOpen, setIsMedicationFormOpen] = useState(false);

  // Active Reminder Alarm State
  const [activeAlarm, setActiveAlarm] = useState<{
    medication: Medication;
    user: UserProfile | null;
    time: string;
  } | null>(null);

  const triggeredAlarmsRef = useRef<Set<string>>(new Set());

  // Save changes to localStorage whenever appData updates
  useEffect(() => {
    saveAppData(appData);
  }, [appData]);

  // Sync RTL and language on html element
  useEffect(() => {
    const lang = appData.settings.language;
    document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [appData.settings.language]);

  // Scheduled Reminder Background Checker
  useEffect(() => {
    const checkScheduledReminders = () => {
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];
      const hoursStr = now.getHours().toString().padStart(2, '0');
      const minutesStr = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${hoursStr}:${minutesStr}`;

      const reminders = getRemindersForDate(
        todayStr,
        appData.medications,
        appData.historyLogs,
        'all'
      );

      reminders.forEach((r) => {
        const alarmKey = `${r.medicationId}_${todayStr}_${r.time}`;

        if (r.time === currentTimeStr && (r.status === 'pending' || r.status === 'snoozed')) {
          if (!triggeredAlarmsRef.current.has(alarmKey)) {
            triggeredAlarmsRef.current.add(alarmKey);
            const user = appData.users.find((u) => u.id === r.userId) || null;

            setActiveAlarm({
              medication: r.medication,
              user,
              time: r.time,
            });

            if (appData.settings.notificationsEnabled) {
              const body = `User: ${user?.name || 'You'}\n${r.medication.name} (${r.medication.dosage})\nTime to take your medication.`;
              sendLocalPushNotification('💊 Medication Reminder - MEDR By Saj', body);
            }
          }
        }
      });
    };

    checkScheduledReminders();
    const interval = setInterval(checkScheduledReminders, 10000);
    return () => clearInterval(interval);
  }, [appData.medications, appData.historyLogs, appData.users, appData.settings.notificationsEnabled]);

  const lang: Language = appData.settings.language;
  const t = translations[lang];

  // Action: Take Medication
  const handleTakeDose = (medicationId: string, scheduledTime: string) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const med = appData.medications.find((m) => m.id === medicationId);
    if (!med) return;

    const newLog: HistoryLog = {
      id: `log_${Date.now()}`,
      userId: med.userId,
      medicationId: med.id,
      medicationName: med.name,
      dosage: med.dosage,
      scheduledDate: todayStr,
      scheduledTime,
      actionTime: now.toISOString(),
      status: 'taken',
    };

    const filteredLogs = appData.historyLogs.filter(
      (l) => !(l.medicationId === medicationId && l.scheduledDate === todayStr && l.scheduledTime === scheduledTime)
    );

    setAppData((prev) => ({
      ...prev,
      historyLogs: [newLog, ...filteredLogs],
    }));

    playSuccessChime();
    triggerDoseTakenCelebration();
    if (activeAlarm && activeAlarm.medication.id === medicationId) {
      setActiveAlarm(null);
    }
  };

  // Action: Snooze Medication
  const handleSnoozeDose = (medicationId: string, scheduledTime: string) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const med = appData.medications.find((m) => m.id === medicationId);
    if (!med) return;

    const newLog: HistoryLog = {
      id: `log_${Date.now()}`,
      userId: med.userId,
      medicationId: med.id,
      medicationName: med.name,
      dosage: med.dosage,
      scheduledDate: todayStr,
      scheduledTime,
      actionTime: now.toISOString(),
      status: 'snoozed',
      note: 'Snoozed for 10 minutes',
    };

    const filteredLogs = appData.historyLogs.filter(
      (l) => !(l.medicationId === medicationId && l.scheduledDate === todayStr && l.scheduledTime === scheduledTime)
    );

    setAppData((prev) => ({
      ...prev,
      historyLogs: [newLog, ...filteredLogs],
    }));

    if (activeAlarm && activeAlarm.medication.id === medicationId) {
      setActiveAlarm(null);
    }
  };

  // Action: Dismiss Dose
  const handleDismissDose = (medicationId: string, scheduledTime: string) => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    setAppData((prev) => ({
      ...prev,
      historyLogs: prev.historyLogs.filter(
        (l) => !(l.medicationId === medicationId && l.scheduledDate === todayStr && l.scheduledTime === scheduledTime)
      ),
    }));

    if (activeAlarm && activeAlarm.medication.id === medicationId) {
      setActiveAlarm(null);
    }
  };

  // Action: Test Alarm Simulation
  const handleTriggerTestAlarm = () => {
    const med = appData.medications[0];
    if (!med) return;
    const user = appData.users.find((u) => u.id === med.userId) || null;
    setActiveAlarm({
      medication: med,
      user,
      time: med.schedule.times[0] || '08:00',
    });
  };

  // Medication CRUD
  const handleSaveMedication = (med: Medication) => {
    setAppData((prev) => {
      const exists = prev.medications.some((m) => m.id === med.id);
      const updatedMeds = exists
        ? prev.medications.map((m) => (m.id === med.id ? med : m))
        : [med, ...prev.medications];
      return {
        ...prev,
        medications: updatedMeds,
      };
    });
    setIsMedicationFormOpen(false);
    setEditingMedication(null);
  };

  const handleDeleteMedication = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      medications: prev.medications.filter((m) => m.id !== id),
      historyLogs: prev.historyLogs.filter((l) => l.medicationId !== id),
    }));
  };

  const handleToggleMedicationActive = (id: string) => {
    setAppData((prev) => ({
      ...prev,
      medications: prev.medications.map((m) =>
        m.id === id ? { ...m, isActive: !m.isActive } : m
      ),
    }));
  };

  // User CRUD
  const handleSaveUser = (user: UserProfile) => {
    setAppData((prev) => {
      const exists = prev.users.some((u) => u.id === user.id);
      const updatedUsers = exists
        ? prev.users.map((u) => (u.id === user.id ? user : u))
        : [...prev.users, user];
      return {
        ...prev,
        users: updatedUsers,
        activeUserId: user.id,
      };
    });
  };

  const handleDeleteUser = (userId: string) => {
    setAppData((prev) => {
      const remainingUsers = prev.users.filter((u) => u.id !== userId);
      return {
        ...prev,
        users: remainingUsers,
        medications: prev.medications.filter((m) => m.userId !== userId),
        historyLogs: prev.historyLogs.filter((l) => l.userId !== userId),
        activeUserId: remainingUsers[0]?.id || 'all',
      };
    });
  };

  const handleResetData = () => {
    const initial = getInitialAppData();
    setAppData(initial);
  };

  return (
    <AndroidFrame
      enabled={appData.settings.androidSimulatorMode}
      onToggleFrame={() =>
        setAppData((prev) => ({
          ...prev,
          settings: {
            ...prev.settings,
            androidSimulatorMode: !prev.settings.androidSimulatorMode,
          },
        }))
      }
    >
      {/* Splash Screen */}
      {showSplash && (
        <SplashScreen lang={lang} onFinish={() => setShowSplash(false)} />
      )}

      {/* Main Container */}
      <div className="flex flex-col h-full w-full bg-sky-50/50 text-slate-800 select-none overflow-hidden font-sans">
        {/* Top App Bar Header */}
        <header className="h-14 px-4 bg-white/95 backdrop-blur-md border-b border-sky-100 shadow-xs flex items-center justify-between flex-shrink-0 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-500 flex items-center justify-center text-white shadow-xs shadow-sky-200">
              <Pill size={18} className="rotate-45" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold text-slate-900 tracking-tight leading-none flex items-center gap-1.5">
                <span>{t.appName}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
              </h1>
              <span className="text-[10px] text-sky-700 font-semibold">
                {t.offlineBadge}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Install / Download App Button */}
            <PWAInstallButton lang={lang} />

            {/* Quick Toggle Android Simulator Mode */}
            <button
              type="button"
              onClick={() =>
                setAppData((prev) => ({
                  ...prev,
                  settings: {
                    ...prev.settings,
                    androidSimulatorMode: !prev.settings.androidSimulatorMode,
                  },
                }))
              }
              className={`p-2 rounded-xl border transition ${
                appData.settings.androidSimulatorMode
                  ? 'bg-sky-100 text-sky-700 border-sky-300'
                  : 'bg-white text-slate-500 border-sky-200 hover:text-slate-800'
              }`}
              title={
                appData.settings.androidSimulatorMode
                  ? 'Switch to Responsive Fullscreen'
                  : 'Switch to Android Phone Simulator'
              }
            >
              <Smartphone size={16} />
            </button>
          </div>
        </header>

        {/* Dynamic Screen Viewport */}
        <main className="flex-1 overflow-hidden flex flex-col relative bg-sky-50/50">
          {activeTab === 'dashboard' && (
            <DashboardScreen
              medications={appData.medications}
              users={appData.users}
              activeUserId={appData.activeUserId}
              historyLogs={appData.historyLogs}
              lang={lang}
              onSelectUser={(uid) => setAppData((prev) => ({ ...prev, activeUserId: uid }))}
              onNavigate={(tab) => setActiveTab(tab)}
              onAddMedication={() => {
                setEditingMedication(null);
                setIsMedicationFormOpen(true);
              }}
              onTakeDose={handleTakeDose}
              onSnoozeDose={handleSnoozeDose}
              onTriggerTestAlarm={handleTriggerTestAlarm}
            />
          )}

          {activeTab === 'today' && (
            <TodayScreen
              medications={appData.medications}
              users={appData.users}
              activeUserId={appData.activeUserId}
              historyLogs={appData.historyLogs}
              lang={lang}
              onTakeDose={handleTakeDose}
              onSnoozeDose={handleSnoozeDose}
              onDismissDose={handleDismissDose}
            />
          )}

          {activeTab === 'medications' && (
            <MedicationsScreen
              medications={appData.medications}
              users={appData.users}
              activeUserId={appData.activeUserId}
              lang={lang}
              onAddMedication={() => {
                setEditingMedication(null);
                setIsMedicationFormOpen(true);
              }}
              onEditMedication={(med) => {
                setEditingMedication(med);
                setIsMedicationFormOpen(true);
              }}
              onDeleteMedication={handleDeleteMedication}
              onToggleActive={handleToggleMedicationActive}
            />
          )}

          {activeTab === 'history' && (
            <HistoryScreen
              historyLogs={appData.historyLogs}
              medications={appData.medications}
              users={appData.users}
              activeUserId={appData.activeUserId}
              lang={lang}
            />
          )}

          {activeTab === 'users' && (
            <UsersScreen
              users={appData.users}
              medications={appData.medications}
              historyLogs={appData.historyLogs}
              activeUserId={appData.activeUserId}
              lang={lang}
              onSelectUser={(uid) => setAppData((prev) => ({ ...prev, activeUserId: uid }))}
              onSaveUser={handleSaveUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen
              settings={appData.settings}
              appData={appData}
              lang={lang}
              onUpdateSettings={(newSettings) =>
                setAppData((prev) => ({ ...prev, settings: newSettings }))
              }
              onRestoreData={(restored) => setAppData(restored)}
              onResetData={handleResetData}
            />
          )}
        </main>

        {/* Add / Edit Medication Form Modal */}
        {isMedicationFormOpen && (
          <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex flex-col animate-fade-in">
            <AddEditMedicationScreen
              initialMedication={editingMedication}
              users={appData.users}
              activeUserId={appData.activeUserId}
              lang={lang}
              onSave={handleSaveMedication}
              onCancel={() => {
                setIsMedicationFormOpen(false);
                setEditingMedication(null);
              }}
            />
          </div>
        )}

        {/* Real-Time Reminder Alert Dialog */}
        <AlarmModal
          isOpen={Boolean(activeAlarm)}
          medication={activeAlarm?.medication || null}
          user={activeAlarm?.user || null}
          scheduledTime={activeAlarm?.time || '08:00'}
          lang={lang}
          soundEnabled={appData.settings.soundEnabled}
          alarmSound={appData.settings.alarmSound}
          onTake={() => {
            if (activeAlarm) {
              handleTakeDose(activeAlarm.medication.id, activeAlarm.time);
            }
          }}
          onSnooze={() => {
            if (activeAlarm) {
              handleSnoozeDose(activeAlarm.medication.id, activeAlarm.time);
            }
          }}
          onDismiss={() => {
            setActiveAlarm(null);
          }}
        />

        {/* Android Material Design 3 Bottom Navigation Bar */}
        <nav className="h-16 bg-white/95 backdrop-blur-lg border-t border-sky-100 shadow-xs flex items-center justify-around px-2 flex-shrink-0 z-20">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeTab === 'dashboard' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition ${
                activeTab === 'dashboard' ? 'bg-sky-100' : ''
              }`}
            >
              <LayoutDashboard size={19} />
            </div>
            <span className="text-[10px] mt-0.5">{t.navDashboard}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeTab === 'today' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition ${
                activeTab === 'today' ? 'bg-sky-100' : ''
              }`}
            >
              <CalendarCheck size={19} />
            </div>
            <span className="text-[10px] mt-0.5">{t.navToday}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('medications')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeTab === 'medications' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition ${
                activeTab === 'medications' ? 'bg-sky-100' : ''
              }`}
            >
              <Pill size={19} />
            </div>
            <span className="text-[10px] mt-0.5">{t.navMeds}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeTab === 'history' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition ${
                activeTab === 'history' ? 'bg-sky-100' : ''
              }`}
            >
              <History size={19} />
            </div>
            <span className="text-[10px] mt-0.5">{t.navHistory}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeTab === 'users' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition ${
                activeTab === 'users' ? 'bg-sky-100' : ''
              }`}
            >
              <Users size={19} />
            </div>
            <span className="text-[10px] mt-0.5">{t.navUsers}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
              activeTab === 'settings' ? 'text-sky-600 font-bold' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <div
              className={`p-1 rounded-xl transition ${
                activeTab === 'settings' ? 'bg-sky-100' : ''
              }`}
            >
              <Settings size={19} />
            </div>
            <span className="text-[10px] mt-0.5">{t.navSettings}</span>
          </button>
        </nav>
      </div>
    </AndroidFrame>
  );
}
