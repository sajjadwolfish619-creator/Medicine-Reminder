import { Medication, UserProfile, ReminderInstance, HistoryLog, Weekday } from '../types';

let audioCtx: AudioContext | null = null;
let currentAlarmInterval: number | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Synthesizes a distinctive alarm melody using the Web Audio API.
 * 100% offline, zero network dependencies.
 */
export function playAlarmSound(type: 'gentle' | 'pulse' | 'digital' | 'bell' = 'pulse'): () => void {
  try {
    const ctx = getAudioContext();
    let isPlaying = true;

    const playBeepSeq = () => {
      if (!isPlaying) return;

      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.3, now);
      masterGain.connect(ctx.destination);

      if (type === 'pulse') {
        // Double medical pulse beep
        [0, 0.18, 0.36].forEach((offset, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(idx === 2 ? 880 : 660, now + offset);
          gain.gain.setValueAtTime(0.25, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.12);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + offset);
          osc.stop(now + offset + 0.14);
        });
      } else if (type === 'gentle') {
        // Soothing warm chord
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.2, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.8);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.9);
        });
      } else if (type === 'digital') {
        // Crisp high-tech digital beep
        [0, 0.12, 0.24, 0.36].forEach((offset) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(1046.5, now + offset);
          gain.gain.setValueAtTime(0.12, now + offset);
          gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.07);

          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + offset);
          osc.stop(now + offset + 0.08);
        });
      } else {
        // Zen bell resonance
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 1.3);
      }
    };

    // Play immediately, then repeat every 2.4 seconds while alarm is active
    playBeepSeq();
    const intervalId = window.setInterval(playBeepSeq, 2400);

    return () => {
      isPlaying = false;
      window.clearInterval(intervalId);
    };
  } catch (e) {
    console.warn('Audio playback error:', e);
    return () => {};
  }
}

export function playSuccessChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    [523.25, 659.25, 1046.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.09);
      gain.gain.setValueAtTime(0.2, now + i * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.09 + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.09);
      osc.stop(now + i * 0.09 + 0.45);
    });
  } catch (err) {
    console.warn('Success chime error:', err);
  }
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

export function sendLocalPushNotification(title: string, body: string, icon = '/icon.svg'): void {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return;
  }
  try {
    new Notification(title, {
      body,
      icon,
      badge: '/icon.svg',
      silent: false,
      tag: 'medr-reminder',
    });
  } catch (e) {
    console.warn('Could not post notification:', e);
  }
}

export const WEEKDAYS_MAP: { [key: number]: Weekday } = {
  0: 'sun',
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};

export function getTodayWeekday(): Weekday {
  const day = new Date().getDay();
  return WEEKDAYS_MAP[day];
}

export function formatTime24To12(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time24;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Calculates all scheduled doses for a given date for the selected user (or all users)
 */
export function getRemindersForDate(
  dateStr: string,
  medications: Medication[],
  historyLogs: HistoryLog[],
  activeUserId?: string
): (ReminderInstance & { medication: Medication; user?: UserProfile })[] {
  const targetDate = new Date(dateStr + 'T00:00:00');
  const targetWeekday = WEEKDAYS_MAP[targetDate.getDay()];

  const relevantMeds = medications.filter((m) => {
    if (!m.isActive) return false;
    if (activeUserId && activeUserId !== 'all' && m.userId !== activeUserId) return false;

    // Check date bounds
    if (m.schedule.startDate && dateStr < m.schedule.startDate) return false;
    if (m.schedule.endDate && dateStr > m.schedule.endDate) return false;

    // Check weekday
    if (!m.schedule.weekdays.includes(targetWeekday)) return false;

    return true;
  });

  const reminders: (ReminderInstance & { medication: Medication })[] = [];

  const now = new Date();
  const isToday = dateStr === now.toISOString().split('T')[0];
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();
  const currentTimeMinutes = currentHours * 60 + currentMinutes;

  relevantMeds.forEach((med) => {
    med.schedule.times.forEach((time) => {
      const [h, m] = time.split(':').map(Number);
      const reminderTimeMinutes = h * 60 + m;

      // Check if logged in history
      const existingLog = historyLogs.find(
        (log) =>
          log.medicationId === med.id &&
          log.scheduledDate === dateStr &&
          log.scheduledTime === time
      );

      let status: ReminderInstance['status'] = 'pending';
      let takenAt: string | undefined;

      if (existingLog) {
        if (existingLog.status === 'taken') {
          status = 'taken';
          takenAt = existingLog.actionTime;
        } else if (existingLog.status === 'missed') {
          status = 'missed';
        } else if (existingLog.status === 'snoozed') {
          status = 'snoozed';
        }
      } else if (isToday) {
        // If 30+ minutes past reminder time and not taken, mark as missed (unless snoozed)
        if (currentTimeMinutes > reminderTimeMinutes + 30) {
          status = 'missed';
        } else {
          status = 'pending';
        }
      } else if (dateStr < now.toISOString().split('T')[0]) {
        // In the past and not logged -> missed
        status = 'missed';
      }

      reminders.push({
        id: `${med.id}_${dateStr}_${time}`,
        medicationId: med.id,
        userId: med.userId,
        time,
        date: dateStr,
        status,
        takenAt,
        medication: med,
      });
    });
  });

  // Sort by time
  return reminders.sort((a, b) => a.time.localeCompare(b.time));
}
