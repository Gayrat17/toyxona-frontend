'use client';

import { useState } from 'react';
import type { HallCalendarData, BarCalendarData } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchShiftsRequest } from '@/services/venues';
import {
  fetchBarCalendarRequest,
  fetchHallCalendarRequest,
} from '@/services/bookings';
import {
  UZ_MONTHS,
  localDateString,
  formatDateUz,
  parseLocalDate,
} from '@/utils/date';
import { busyShift, busyBarSlot } from '@/utils/booking';
import { ErrorAlert } from './error-alert';
import { LoadingState } from './loading-state';

export function VenueCalendar({
  id,
  type,
  onSelectDate,
  initialDate = '',
}: {
  id: number;
  type: 'halls' | 'bars';
  onSelectDate?: (date: string) => void;
  initialDate?: string;
}) {
  const [monthDate, setMonthDate] = useState(
    () => parseLocalDate(initialDate) || new Date(),
  );
  const [selected, setSelected] = useState(
    () => initialDate || localDateString(),
  );
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth() + 1;
  const shifts = useQuery({
    queryKey: ['shifts'],
    queryFn: fetchShiftsRequest,
    enabled: type === 'halls',
  });
  const calendar = useQuery<HallCalendarData | BarCalendarData>({
    queryKey: ['calendar', type, id, year, month],
    queryFn: () =>
      type === 'halls'
        ? fetchHallCalendarRequest(id, year, month)
        : fetchBarCalendarRequest(id, year, month),
    staleTime: 15000,
  });
  const hallShifts =
    shifts.data?.filter((shift) => shift.hall === id && shift.is_active) || [];
  const busyShifts =
    calendar.data && 'busy_shifts' in calendar.data
      ? calendar.data.busy_shifts.filter(busyShift)
      : [];
  const busySlots =
    calendar.data && 'busy_slots' in calendar.data
      ? calendar.data.busy_slots.filter(busyBarSlot)
      : [];
  const loading = calendar.isLoading || (type === 'halls' && shifts.isLoading);
  const error = calendar.isError || (type === 'halls' && shifts.isError);
  const days = new Date(year, month, 0).getDate();
  const padding = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  const today = localDateString();
  const moveMonth = (offset: number) => {
    setMonthDate(new Date(year, month - 1 + offset, 1));
    setSelected('');
  };

  return (
    <section className="card-lux p-4 sm:p-6" aria-label="Bandlik taqvimi">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-line pb-4">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <CalendarDays className="h-5 w-5 text-gold-strong" />
          Bandlik taqvimi
        </h2>
        <div className="flex items-center gap-1 rounded-full border border-line p-1">
          <button
            type="button"
            aria-label="Oldingi oy"
            onClick={() => moveMonth(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gold-tint"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span
            aria-live="polite"
            className="min-w-28 text-center text-sm font-bold"
          >
            {UZ_MONTHS[month - 1]} {year}
          </span>
          <button
            type="button"
            aria-label="Keyingi oy"
            onClick={() => moveMonth(1)}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gold-tint"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      {error ? (
        <div className="mt-4">
          <ErrorAlert
            message="Taqvimni yuklab bo‘lmadi. Bandlik holati hozircha noma’lum."
            onRetry={() => {
              void calendar.refetch();
              if (type === 'halls') void shifts.refetch();
            }}
          />
        </div>
      ) : loading ? (
        <LoadingState />
      ) : (
        <>
          {type === 'halls' && !hallShifts.length && (
            <p className="mt-4 text-sm text-ink-soft">
              Bu zalga hali faol smena qo‘shilmagan.
            </p>
          )}
          <p className="mt-4 text-xs leading-relaxed text-ink-soft">
            Tafsilotlarni ko‘rish uchun sanani bosing.
            {type === 'bars' &&
              ' Band soatlar orasida bo‘sh vaqt bo‘lishi mumkin.'}
          </p>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center sm:gap-2">
            {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'].map((day) => (
              <span key={day} className="py-1 text-xs font-bold text-ink-soft">
                {day}
              </span>
            ))}
            {Array.from({ length: padding }, (_, index) => (
              <span key={`empty-${index}`} aria-hidden="true" />
            ))}
            {Array.from({ length: days }, (_, index) => {
              const date = `${year}-${String(month).padStart(2, '0')}-${String(index + 1).padStart(2, '0')}`;
              const slots = busySlots.filter((slot) => slot.date === date);
              const isPast = date < today;
              return (
                <button
                  key={date}
                  type="button"
                  aria-label={`${formatDateUz(date)}${type === 'bars' ? `, ${slots.length} ta band vaqt` : ''}`}
                  aria-pressed={selected === date}
                  aria-current={date === today ? 'date' : undefined}
                  onClick={() => setSelected(date)}
                  className={`flex min-h-20 min-w-0 flex-col items-center gap-1 rounded-lg border p-1.5 text-xs sm:items-stretch sm:rounded-xl sm:p-2 ${selected === date ? 'border-gold bg-gold-tint' : 'border-line bg-surface-2/40'} ${isPast ? 'border-dashed' : ''}`}
                >
                  <span className="mb-1 font-bold">{index + 1}</span>
                  {type === 'halls' ? (
                    hallShifts.map((shift) => {
                      const busy = busyShifts.find(
                        (item) =>
                          item.date === date && item.shift_id === shift.id,
                      );
                      const status =
                        busy?.status === 'BLOCKED'
                          ? 'Bloklangan'
                          : busy
                            ? 'Band'
                            : 'Bo‘sh';
                      return (
                        <span
                          key={shift.id}
                          title={`${shift.name}: ${status}`}
                          className={`flex min-w-0 items-center justify-center gap-1 text-[10px] ${busy?.status === 'BLOCKED' ? 'text-gold-strong' : busy ? 'text-danger' : 'text-success'}`}
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
                          <span className="hidden truncate sm:inline">
                            {shift.name.slice(0, 3)}: {status}
                          </span>
                          <span className="sr-only sm:hidden">
                            {shift.name}: {status}
                          </span>
                        </span>
                      );
                    })
                  ) : (
                    <span
                      className={`text-[10px] font-bold ${slots.length ? 'text-danger' : 'text-success'}`}
                    >
                      {slots.length ? `${slots.length} band` : 'Bo‘sh'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {selected && (
            <div
              className="mt-5 space-y-3 rounded-xl border border-line bg-surface-2/50 p-4"
              aria-live="polite"
            >
              <h3 className="text-sm font-bold">{formatDateUz(selected)}</h3>
              {type === 'halls' ? (
                <ul className="space-y-2 text-xs">
                  {hallShifts.map((shift) => {
                    const busy = busyShifts.find(
                      (item) =>
                        item.date === selected && item.shift_id === shift.id,
                    );
                    return (
                      <li
                        key={shift.id}
                        className="flex flex-wrap items-center justify-between gap-2"
                      >
                        <span>
                          {shift.name} ({shift.start_time.slice(0, 5)} –{' '}
                          {shift.end_time.slice(0, 5)})
                        </span>
                        <strong
                          className={busy ? 'text-danger' : 'text-success'}
                        >
                          {busy?.status === 'BLOCKED'
                            ? 'Bloklangan'
                            : busy
                              ? 'Band'
                              : 'Bo‘sh'}
                        </strong>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <ul className="space-y-2 text-xs">
                  {busySlots
                    .filter((slot) => slot.date === selected)
                    .map((slot, index) => (
                      <li key={index} className="text-danger">
                        {slot.start_time.slice(0, 5)} –{' '}
                        {slot.end_time.slice(0, 5)}: band
                      </li>
                    ))}
                  {!busySlots.some((slot) => slot.date === selected) && (
                    <li className="text-success">Band vaqtlar yo‘q.</li>
                  )}
                </ul>
              )}
              {onSelectDate &&
                selected >= today &&
                (type === 'bars' || hallShifts.length > 0) && (
                  <button
                    type="button"
                    onClick={() => onSelectDate(selected)}
                    className="btn-outline !px-4 !py-2 !text-xs"
                  >
                    Shu sanani tanlash
                  </button>
                )}
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-ink-soft">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-success" />
              Bo‘sh
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-danger" />
              Band
            </span>
            {type === 'halls' && (
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-gold" />
                Bloklangan
              </span>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default VenueCalendar;
