export const UZ_MONTHS = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
];
const UZ_WEEKDAYS = [
  'Yakshanba',
  'Dushanba',
  'Seshanba',
  'Chorshanba',
  'Payshanba',
  'Juma',
  'Shanba',
];

export function localDateString(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function parseLocalDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return localDateString(date) === value ? date : null;
}

export function formatDateUz(value: string): string {
  const date = parseLocalDate(value);
  if (!date) return '';
  return `${date.getDate()}-${UZ_MONTHS[date.getMonth()]} ${date.getFullYear()}, ${UZ_WEEKDAYS[date.getDay()]}`;
}

export function quickDate(
  type: 'today' | 'tomorrow' | 'saturday' | 'sunday',
): string {
  const date = new Date();
  if (type === 'tomorrow') date.setDate(date.getDate() + 1);
  if (type === 'saturday')
    date.setDate(date.getDate() + ((6 - date.getDay() + 7) % 7));
  if (type === 'sunday')
    date.setDate(date.getDate() + ((7 - date.getDay()) % 7));
  return localDateString(date);
}

export function timeMinutes(value: string): number {
  if (!/^([01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/.test(value)) return NaN;
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

export function isPastTime(date: string, time: string): boolean {
  const now = new Date();
  return (
    date < localDateString(now) ||
    (date === localDateString(now) &&
      timeMinutes(time) <= now.getHours() * 60 + now.getMinutes())
  );
}

export function timesOverlap(
  start: string,
  end: string,
  busyStart: string,
  busyEnd: string,
): boolean {
  return (
    timeMinutes(start) < timeMinutes(busyEnd) &&
    timeMinutes(end) > timeMinutes(busyStart)
  );
}
