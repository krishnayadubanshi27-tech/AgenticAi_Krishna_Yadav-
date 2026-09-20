// Reusable Date Utilities for EduPath

export function getNext7DaysFromCurrentDate(startDate = new Date()): {
  dayName: string;
  dateStr: string;
  isRestDay: boolean;
  isToday: boolean;
  timestamp: number;
}[] {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    // Format strictly as 'Mon, Sep 21'
    const dateStr = d.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
    const isRestDay = d.getDay() === 0; // Sunday is the rest day
    days.push({
      dayName,
      dateStr,
      isRestDay,
      isToday: i === 0,
      timestamp: d.getTime()
    });
  }
  return days;
}

export function getCurrentWeekDates() {
  return getNext7DaysFromCurrentDate();
}

export function isTimestampInCurrentCalendarWeek(timestamp: number, referenceDate = new Date()): boolean {
  if (!timestamp || typeof timestamp !== 'number') return false;

  const ref = new Date(referenceDate);
  const day = ref.getDay();
  const diffToMonday = (day + 6) % 7;

  const mondayStart = new Date(ref);
  mondayStart.setDate(ref.getDate() - diffToMonday);
  mondayStart.setHours(0, 0, 0, 0);

  const sundayEnd = new Date(mondayStart);
  sundayEnd.setDate(mondayStart.getDate() + 6);
  sundayEnd.setHours(23, 59, 59, 999);

  return timestamp >= mondayStart.getTime() && timestamp <= sundayEnd.getTime();
}

export function getCurrentCalendarWeekRangeStr(referenceDate = new Date()): string {
  const ref = new Date(referenceDate);
  const day = ref.getDay();
  const diffToMonday = (day + 6) % 7;

  const monday = new Date(ref);
  monday.setDate(ref.getDate() - diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const monStr = monday.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const sunStr = sunday.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return `${monStr} – ${sunStr}`;
}
