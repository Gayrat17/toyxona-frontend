import type { BookingStatus, BusyBarSlot, BusyShift } from '@/types';

export function activeBooking(status?: BookingStatus) {
  return !status || ['HOLD', 'PENDING', 'CONFIRMED'].includes(status);
}
export function busyShift(shift: BusyShift) {
  return shift.status === 'BLOCKED' || activeBooking(shift.booking_status);
}
export function busyBarSlot(slot: BusyBarSlot) {
  return activeBooking(slot.booking_status);
}
export function formatMoney(value: string | number | undefined | null) {
  const amount =
    value === undefined ||
    value === null ||
    (typeof value === 'string' && !value.trim())
      ? NaN
      : Number(value);
  return Number.isFinite(amount)
    ? `${amount.toLocaleString('uz-UZ')} UZS`
    : '—';
}
