export type Weekday = 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri';

export type MedicationCategory = 
  | 'prescription'
  | 'chronic'
  | 'vitamin'
  | 'antibiotic'
  | 'pain_relief'
  | 'heart_bp'
  | 'diabetes'
  | 'allergy'
  | 'mental_health'
  | 'other';

export type MedicationIconType = 
  | 'pill'
  | 'capsule'
  | 'tablet'
  | 'liquid'
  | 'injection'
  | 'inhaler'
  | 'drops'
  | 'cream'
  | 'patch'
  | 'powder'
  | 'spray'
  | 'herb';

export type MealTiming = 'before_meal' | 'with_meal' | 'after_meal' | 'empty_stomach' | 'any_time';

export type HistoryStatus = 'taken' | 'missed' | 'snoozed' | 'skipped';

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string; // photo base64 or avatar preset key
  avatarColor: string;
  gender?: 'male' | 'female' | 'other';
  birthYear?: number;
  notes?: string;
  createdAt: string;
}

export interface MedicationSchedule {
  times: string[]; // e.g. ["08:00", "14:00", "20:00"]
  weekdays: Weekday[]; // ['mon', 'wed', 'fri']
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD or undefined for ongoing
  mealTiming: MealTiming;
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string; // e.g. "500mg" or "1 tablet" or "10ml"
  dosageUnit: string; // e.g. "tablet", "capsule", "ml", "drop", "puff"
  category: MedicationCategory;
  notes?: string;
  
  // Image & visual representation
  imageUrl?: string; // User-uploaded photo (data URL / base64)
  icon: MedicationIconType; // Predefined icon fallback
  color: string; // Theme accent hex
  
  schedule: MedicationSchedule;
  inventoryCount?: number;
  refillReminder?: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface ReminderInstance {
  id: string; // unique reminder id for that day + time
  medicationId: string;
  userId: string;
  time: string; // HH:mm
  date: string; // YYYY-MM-DD
  status: 'pending' | 'taken' | 'missed' | 'snoozed';
  takenAt?: string;
  snoozedUntil?: string; // ISO string
}

export interface HistoryLog {
  id: string;
  userId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  actionTime: string; // ISO string
  status: HistoryStatus;
  note?: string;
}

export interface AppSettings {
  language: 'en' | 'fa';
  soundEnabled: boolean;
  alarmSound: 'gentle' | 'pulse' | 'digital' | 'bell';
  repeatUntilConfirmed: boolean;
  repeatIntervalMinutes: number; // e.g. 5 or 10 min
  snoozeDurationMinutes: number; // default 10
  notificationsEnabled: boolean;
  androidSimulatorMode: boolean; // Toggle between Android frame and responsive desktop/tablet
}

export interface AppData {
  users: UserProfile[];
  medications: Medication[];
  historyLogs: HistoryLog[];
  activeUserId: string; // current active profile or 'all'
  settings: AppSettings;
  version: number;
}
