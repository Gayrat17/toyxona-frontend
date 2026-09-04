'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchShiftsRequest } from '@/services/venues';
import { fetchHallCalendarRequest } from '@/services/bookings';
import { Shift, HallCalendarData } from '@/types';
import { ChevronLeft, ChevronRight, CalendarDays, AlertCircle, HelpCircle } from 'lucide-react';

interface VenueCalendarProps {
  hallId: number;
}

const UZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr',
];

const WEEKDAYS = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

export const VenueCalendar: React.FC<VenueCalendarProps> = ({ hallId }) => {
  const todayDate = new Date();
  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth() + 1);

  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ['shifts'],
    queryFn: fetchShiftsRequest,
  });

  const hallShifts = shifts.filter((s) => s.hall === hallId && s.is_active);

  const { data: calendarData, isLoading, error } = useQuery<HallCalendarData>({
    queryKey: ['calendar', hallId, currentYear, currentMonth],
    queryFn: () => fetchHallCalendarRequest(hallId, currentYear, currentMonth),
    enabled: !isNaN(hallId),
  });

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayIndex = (new Date(currentYear, currentMonth - 1, 1).getDay() + 6) % 7;

  const padding = Array(firstDayIndex).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const gridDays = [...padding, ...days];

  return (
    <div className="card-lux p-6 sm:p-7">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-dashed border-line pb-5">
        <h3 className="flex items-center gap-2.5 font-display text-lg font-bold text-ink">
          <CalendarDays className="h-5 w-5 text-gold" />
          <span>Bandlik taqvimi</span>
        </h3>

        <div className="flex items-center gap-1 rounded-full border border-line bg-surface-2/70 p-1">
          <button
            onClick={handlePrevMonth}
            className="rounded-full p-2 text-ink-soft transition-colors hover:bg-gold-tint hover:text-gold-strong"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[130px] text-center font-display text-sm font-bold text-ink">
            {UZ_MONTHS[currentMonth - 1]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="rounded-full p-2 text-ink-soft transition-colors hover:bg-gold-tint hover:text-gold-strong"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-5 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/5 p-3 text-xs font-semibold text-danger">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Taqvim ma&apos;lumotlarini yuklashda xatolik yuz berdi.</span>
        </div>
      )}

      {/* Weekday headers */}
      <div className="mt-5 grid grid-cols-7 gap-2 text-center">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1 text-[10px] font-black uppercase tracking-[0.2em] text-ink-faint">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      {isLoading ? (
        <div className="mt-2 grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="skeleton h-20 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-7 gap-2">
          {gridDays.map((day, index) => {
            if (day === null) {
              return (
                <div key={`empty-${index}`} className="h-20 rounded-xl border border-dashed border-line/60 bg-surface-2/30" />
              );
            }

            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === new Date().toISOString().slice(0, 10);

            return (
              <div
                key={`day-${day}`}
                className={`flex h-20 flex-col justify-between rounded-xl border p-2 transition-colors ${
                  isToday ? 'border-gold bg-gold-tint/60' : 'border-line bg-surface-2/40'
                }`}
              >
                <span
                  className={`text-[11px] font-black ${
                    isToday ? 'text-gold-strong' : 'text-ink-faint'
                  }`}
                >
                  {day}
                </span>

                <div className="mt-1 flex flex-col gap-1">
                  {hallShifts.map((shift) => {
                    const busyShift = calendarData?.busy_shifts.find(
                      (b) => b.date === dateStr && b.shift_id === shift.id
                    );

                    let statusClass = 'border-success/40 bg-success/10 text-success';
                    let label = 'Bo‘sh';
                    let title = `${shift.name}: Bo'sh`;

                    if (busyShift) {
                      if (busyShift.status === 'BOOKED') {
                        statusClass = 'border-danger/40 bg-danger/10 text-danger';
                        label = 'Band';
                        title = `${shift.name}: Band qilingan`;
                      } else if (busyShift.status === 'BLOCKED') {
                        statusClass = 'border-gold/50 bg-gold/15 text-gold-strong';
                        label = 'Blok';
                        title = `${shift.name}: Bloklangan (${busyShift.reason || 'Sababsiz'})`;
                      }
                    }

                    return (
                      <div
                        key={`day-${day}-shift-${shift.id}`}
                        title={title}
                        className={`flex items-center justify-center rounded-md border px-1 py-0.5 text-[9px] font-black uppercase tracking-wide ${statusClass}`}
                      >
                        <span className="truncate max-w-[46px]">
                          {shift.name.substring(0, 3)}: {label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-dashed border-line pt-4 text-[11px] font-bold text-ink-faint">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rotate-45 border border-success/50 bg-success/30" />
          Bo&apos;sh smena
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rotate-45 border border-danger/50 bg-danger/30" />
          Band qilingan
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rotate-45 border border-gold/60 bg-gold/40" />
          Bloklangan
        </span>
        <span className="ml-auto flex items-center gap-1 text-[10px]">
          <HelpCircle className="h-3.5 w-3.5" />
          Smenaning birinchi 3 harfi ko&apos;rsatilgan
        </span>
      </div>
    </div>
  );
};

export default VenueCalendar;
