import { TripStatus } from '../types';

const MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const MONTHS_FULL = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const WEEKDAYS_FULL = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

export function toISODateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTodayISO(): string {
  return toISODateString(new Date());
}

export function parseISODate(iso: string): Date {
  const parts = iso.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return new Date();
  }
  return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
}

export function isValidISODate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

export function addDaysISO(iso: string, days: number): string {
  const dt = parseISODate(iso);
  dt.setDate(dt.getDate() + days);
  return toISODateString(dt);
}

/**
 * Calculates trip duration in days.
 * Return date must be strictly after departure date (e.g. Nov 10 -> Nov 15 = 5 Days).
 */
export function calculateTripDuration(departureISO: string, returnISO: string): number {
  if (!isValidISODate(departureISO) || !isValidISODate(returnISO)) {
    return 0;
  }
  const dep = parseISODate(departureISO);
  const ret = parseISODate(returnISO);
  const diffMs = ret.getTime() - dep.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

export function isReturnAfterDeparture(departureISO: string, returnISO: string): boolean {
  return calculateTripDuration(departureISO, returnISO) >= 1;
}

export function deriveTripStatus(
  departureISO: string,
  returnISO: string,
  explicitStatus?: TripStatus
): TripStatus {
  if (explicitStatus === 'Completed') {
    return 'Completed';
  }
  const today = getTodayISO();
  if (returnISO < today) {
    return 'Completed';
  }
  if (departureISO <= today && today <= returnISO) {
    return 'Ongoing';
  }
  return 'Upcoming';
}

export function formatDateShort(iso: string): string {
  if (!isValidISODate(iso)) return iso;
  const dt = parseISODate(iso);
  return `${dt.getDate()} ${MONTHS_SHORT[dt.getMonth()]} ${dt.getFullYear()}`;
}

export function formatDateCompact(iso: string): string {
  if (!isValidISODate(iso)) return iso;
  const dt = parseISODate(iso);
  return `${dt.getDate()} ${MONTHS_SHORT[dt.getMonth()]}`;
}

export function formatDateRange(departureISO: string, returnISO: string): string {
  if (!isValidISODate(departureISO) || !isValidISODate(returnISO)) {
    return `${departureISO} – ${returnISO}`;
  }
  const dep = parseISODate(departureISO);
  const ret = parseISODate(returnISO);
  if (dep.getFullYear() === ret.getFullYear()) {
    if (dep.getMonth() === ret.getMonth()) {
      return `${dep.getDate()} – ${ret.getDate()} ${MONTHS_SHORT[ret.getMonth()]} ${ret.getFullYear()}`;
    }
    return `${dep.getDate()} ${MONTHS_SHORT[dep.getMonth()]} – ${ret.getDate()} ${MONTHS_SHORT[ret.getMonth()]} ${ret.getFullYear()}`;
  }
  return `${formatDateShort(departureISO)} – ${formatDateShort(returnISO)}`;
}

export function formatFullHeaderDate(date: Date = new Date()): string {
  const weekday = WEEKDAYS_FULL[date.getDay()];
  const month = MONTHS_FULL[date.getMonth()];
  return `${weekday}, ${month} ${date.getDate()}, ${date.getFullYear()}`;
}

export function getTimeGreeting(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning!';
  if (hour < 17) return 'Good afternoon!';
  return 'Good evening!';
}

export function getDaysUntilDeparture(departureISO: string): number {
  const today = parseISODate(getTodayISO());
  const dep = parseISODate(departureISO);
  return Math.round((dep.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function getMonthYearLabel(year: number, monthIndex: number): string {
  return `${MONTHS_FULL[monthIndex]} ${year}`;
}
