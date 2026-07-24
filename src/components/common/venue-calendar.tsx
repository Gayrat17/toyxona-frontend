'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchShiftsRequest } from '@/services/venues';
import { fetchHallCalendarRequest } from '@/services/bookings';
import { Shift, HallCalendarData } from '@/types';
import { ChevronLeft, ChevronRight, Calendar, AlertCircle, HelpCircle } from 'lucide-react';

interface VenueCalendarProps {
  hallId: number;
}

const UZ_MONTHS = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", 
  "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
];

const WEEKDAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

export const VenueCalendar: React.FC<VenueCalendarProps> = ({ hallId }) => {
  const todayDate = new Date();
  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth() + 1); // 1-indexed (1-12)

  // Fetch shifts for this hall
  const { data: shifts = [] } = useQuery<Shift[]>({
    queryKey: ['shifts'],
    queryFn: fetchShiftsRequest,
  });

  const hallShifts = shifts.filter((s) => s.hall === hallId && s.is_active);

  // Fetch busy calendar data from backend calendar endpoint
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

  // Calendar grid calculations
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayIndex = (new Date(currentYear, currentMonth - 1, 1).getDay() + 6) % 7; // Monday = 0

  const padding = Array(firstDayIndex).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const gridDays = [...padding, ...days];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900">
      
      {/* Calendar Header with Controls */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
          <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          <span>Smenalar bandlik taqvimi</span>
        </h3>
        
        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          <button
            onClick={handlePrevMonth}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-white hover:text-indigo-600 shadow-sm transition-all dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-bold text-slate-800 dark:text-white min-w-[100px] text-center">
            {UZ_MONTHS[currentMonth - 1]} {currentYear}
          </span>
          <button
            onClick={handleNextMonth}
            className="rounded-lg p-1.5 text-slate-600 hover:bg-white hover:text-indigo-600 shadow-sm transition-all dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Query errors indicator */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-500/10 p-3 text-xs text-rose-500 border border-rose-500/20">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>Taqvim ma&apos;lumotlarini yuklashda xatolik yuz berdi.</span>
        </div>
      )}

      {/* Weekday headers */}
      <div className="mt-6 grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">{day}</div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      {isLoading ? (
        <div className="mt-2 grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="h-16 rounded-xl bg-slate-100 animate-pulse dark:bg-slate-800" />
          ))}
        </div>
      ) : (
        <div className="mt-2 grid grid-cols-7 gap-2">
          {gridDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="h-20" />;
            }

            // Format date string for search matching
            const dateStr = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

            return (
              <div 
                key={`day-${day}`} 
                className="flex flex-col h-20 justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-slate-800/40"
              >
                {/* Day number */}
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{day}</span>
                
                {/* Smenalar rendering */}
                <div className="flex flex-col gap-1 mt-1">
                  {hallShifts.map((shift) => {
                    // Match shifts in busy calendar list
                    const busyShift = calendarData?.busy_shifts.find(
                      (b) => b.date === dateStr && b.shift_id === shift.id
                    );

                    let statusClass = 'bg-emerald-500 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400';
                    let label = 'Bo\'sh';
                    let title = `${shift.name}: Bo'sh`;

                    if (busyShift) {
                      if (busyShift.status === 'BOOKED') {
                        statusClass = 'bg-rose-500 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400';
                        label = 'Band';
                        title = `${shift.name}: Band qilingan`;
                      } else if (busyShift.status === 'BLOCKED') {
                        statusClass = 'bg-amber-500 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
                        label = 'Blok';
                        title = `${shift.name}: Bloklangan (${busyShift.reason || "Sababsiz"})`;
                      }
                    }

                    return (
                      <div
                        key={`day-${day}-shift-${shift.id}`}
                        title={title}
                        className={`flex items-center justify-center rounded px-1 py-0.5 text-[9px] font-bold ${statusClass}`}
                      >
                        <span className="truncate max-w-[40px]">{shift.name.substring(0, 3)}: {label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend guide info bar */}
      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-400 dark:border-slate-800">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Bo&apos;sh smena
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-rose-500" /> Band qilingan smena
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> Bloklangan (Remont/Boshqa sabab)
        </span>
        <span className="ml-auto flex items-center gap-1 text-[11px]">
          <HelpCircle className="h-3.5 w-3.5" /> Smenaning birinchi 3 harfi ko&apos;rsatilgan
        </span>
      </div>
    </div>
  );
};
export default VenueCalendar;
