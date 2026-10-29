import { AppData, UserProfile, Medication, HistoryLog, AppSettings } from '../types';

const STORAGE_KEY = 'medr_by_saj_data_v1';

export const INITIAL_SETTINGS: AppSettings = {
  language: 'en',
  soundEnabled: true,
  alarmSound: 'pulse',
  repeatUntilConfirmed: true,
  repeatIntervalMinutes: 5,
  snoozeDurationMinutes: 10,
  notificationsEnabled: true,
  androidSimulatorMode: false,
};

// Realistic demonstration data matching user requirements
const SAMPLE_USERS: UserProfile[] = [
  {
    id: 'usr_john',
    name: 'John',
    avatarColor: '#0284c7', // Sky Blue
    gender: 'male',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_sarah',
    name: 'Sarah',
    avatarColor: '#ec4899', // Pink
    gender: 'female',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_david',
    name: 'David',
    avatarColor: '#10b981', // Emerald
    gender: 'male',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'usr_emma',
    name: 'Emma',
    avatarColor: '#8b5cf6', // Violet
    gender: 'female',
    createdAt: new Date().toISOString(),
  },
];

const getTodayString = (offsetDays = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

const SAMPLE_MEDS: Medication[] = [
  {
    id: 'med_metformin',
    userId: 'usr_john',
    name: 'Metformin 500mg',
    dosage: '1 tablet',
    dosageUnit: 'tablet',
    category: 'diabetes',
    notes: 'Take with main meals to reduce stomach discomfort.',
    icon: 'tablet',
    color: '#0d9488',
    schedule: {
      times: ['08:00', '20:00'],
      weekdays: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'],
      startDate: getTodayString(-14),
      mealTiming: 'with_meal',
    },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med_lisinopril',
    userId: 'usr_john',
    name: 'Lisinopril 10mg',
    dosage: '1 tablet',
    dosageUnit: 'tablet',
    category: 'heart_bp',
    notes: 'Blood pressure control. Take in the morning with a full glass of water.',
    icon: 'pill',
    color: '#ef4444',
    schedule: {
      times: ['08:00'],
      weekdays: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'],
      startDate: getTodayString(-30),
      mealTiming: 'before_meal',
    },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med_sarah_vit_d',
    userId: 'usr_sarah',
    name: 'Vitamin D3 2000 IU',
    dosage: '1 softgel capsule',
    dosageUnit: 'capsule',
    category: 'vitamin',
    notes: 'Immunity & bone health booster. Best taken with healthy fats.',
    icon: 'capsule',
    color: '#f59e0b',
    schedule: {
      times: ['09:00'],
      weekdays: ['mon', 'wed', 'fri', 'sun'],
      startDate: getTodayString(-20),
      mealTiming: 'with_meal',
    },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med_sarah_claritin',
    userId: 'usr_sarah',
    name: 'Loratadine (Claritin) 10mg',
    dosage: '1 tablet',
    dosageUnit: 'tablet',
    category: 'allergy',
    notes: 'Seasonal allergy relief.',
    icon: 'pill',
    color: '#3b82f6',
    schedule: {
      times: ['14:00'],
      weekdays: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'],
      startDate: getTodayString(-5),
      mealTiming: 'any_time',
    },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med_david_inhaler',
    userId: 'usr_david',
    name: 'Albuterol Inhaler',
    dosage: '2 puffs',
    dosageUnit: 'puff',
    category: 'chronic',
    notes: 'Rinse mouth with water after use.',
    icon: 'inhaler',
    color: '#06b6d4',
    schedule: {
      times: ['08:00', '18:00'],
      weekdays: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'],
      startDate: getTodayString(-60),
      mealTiming: 'any_time',
    },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'med_emma_omega',
    userId: 'usr_emma',
    name: 'Omega 3 Fish Oil 1000mg',
    dosage: '2 capsules',
    dosageUnit: 'capsule',
    category: 'vitamin',
    notes: 'Heart & cognitive support.',
    icon: 'capsule',
    color: '#10b981',
    schedule: {
      times: ['12:30'],
      weekdays: ['sat', 'sun', 'mon', 'tue', 'wed', 'thu', 'fri'],
      startDate: getTodayString(-10),
      mealTiming: 'after_meal',
    },
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// Pre-fill some realistic past 7 days history logs for John & Sarah
const generateSampleHistory = (): HistoryLog[] => {
  const logs: HistoryLog[] = [];
  const days = 7;
  
  for (let i = days; i >= 1; i--) {
    const dateStr = getTodayString(-i);
    // Metformin Morning: John
    logs.push({
      id: `log_met_m_${i}`,
      userId: 'usr_john',
      medicationId: 'med_metformin',
      medicationName: 'Metformin 500mg',
      dosage: '1 tablet',
      scheduledDate: dateStr,
      scheduledTime: '08:00',
      actionTime: `${dateStr}T08:05:00.000Z`,
      status: 'taken',
    });

    // Metformin Evening: John (sometimes missed)
    logs.push({
      id: `log_met_e_${i}`,
      userId: 'usr_john',
      medicationId: 'med_metformin',
      medicationName: 'Metformin 500mg',
      dosage: '1 tablet',
      scheduledDate: dateStr,
      scheduledTime: '20:00',
      actionTime: `${dateStr}T20:12:00.000Z`,
      status: i === 3 ? 'missed' : 'taken',
    });

    // Lisinopril: John
    logs.push({
      id: `log_lis_${i}`,
      userId: 'usr_john',
      medicationId: 'med_lisinopril',
      medicationName: 'Lisinopril 10mg',
      dosage: '1 tablet',
      scheduledDate: dateStr,
      scheduledTime: '08:00',
      actionTime: `${dateStr}T08:02:00.000Z`,
      status: 'taken',
    });
  }
  
  return logs;
};

export function getInitialAppData(): AppData {
  return {
    users: SAMPLE_USERS,
    medications: SAMPLE_MEDS,
    historyLogs: generateSampleHistory(),
    activeUserId: 'usr_john', // Default active profile
    settings: INITIAL_SETTINGS,
    version: 1,
  };
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialAppData();
      saveAppData(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as AppData;
    // Merge settings in case new settings properties were added
    parsed.settings = { ...INITIAL_SETTINGS, ...(parsed.settings || {}) };
    return parsed;
  } catch (err) {
    console.error('Failed to load local medication data:', err);
    return getInitialAppData();
  }
}

export function saveAppData(data: AppData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save local medication data:', err);
  }
}

// Helper to resize user uploaded photos efficiently to avoid localStorage bloat
export function processImageUpload(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Compress as image/jpeg with 0.82 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = event.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
