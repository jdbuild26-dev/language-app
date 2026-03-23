"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { NewClassModal, type ClassEvent } from "@/features/teacher-dashboard/components/NewClassModal";

const STORAGE_KEY = "teacher_calendar_events";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM – 8 PM

function getWeekDates(baseDate: Date): Date[] {
  const start = new Date(baseDate);
  start.setDate(baseDate.getDate() - baseDate.getDay());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function toYMD(d: Date) {
  return d.toISOString().split("T")[0];
}

function formatMonthYear(d: Date) {
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<ClassEvent[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [clickedDate, setClickedDate] = useState<string | undefined>();
  const [tooltip, setTooltip] = useState<{ event: ClassEvent; x: number; y: number } | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setEvents(JSON.parse(stored));
    } catch {}
  }, []);

  const persist = (updated: ClassEvent[]) => {
    setEvents(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleSave = (event: ClassEvent) => {
    persist([...events, event]);
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove this class?")) return;
    persist(events.filter((e) => e.id !== id));
    setTooltip(null);
  };

  const weekDates = getWeekDates(currentDate);

  const prevWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const nextWeek = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const getEventsForSlot = (date: Date, hour: number) => {
    const ymd = toYMD(date);
    return events.filter((e) => {
      if (e.date !== ymd) return false;
      const startHour = parseInt(e.startTime.split(":")[0]);
      return startHour === hour;
    });
  };

  const handleCellClick = (date: Date) => {
    setClickedDate(toYMD(date));
    setShowModal(true);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-100px)] flex flex-col" onClick={() => setTooltip(null)}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-primary-dark">Schedule</h1>
        <div className="flex gap-2 items-center">
          <Button variant="outline" size="icon" onClick={prevWeek}>
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="min-w-[160px] pointer-events-none">
            {formatMonthYear(currentDate)}
          </Button>
          <Button variant="outline" size="icon" onClick={nextWeek}>
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
          <Button
            className="ml-2 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => { setClickedDate(undefined); setShowModal(true); }}
          >
            <PlusIcon className="w-4 h-4 mr-2" /> New Class
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <Card className="flex-1 overflow-hidden flex flex-col border-none shadow-md">
        <CardContent className="p-0 flex-1 flex flex-col overflow-auto">
          {/* Day headers */}
          <div className="grid grid-cols-8 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
            <div className="p-4 border-r dark:border-gray-700 text-center text-sm font-semibold text-gray-500">
              Time
            </div>
            {weekDates.map((date, i) => {
              const isToday = toYMD(date) === toYMD(new Date());
              return (
                <div key={i} className="p-3 border-r dark:border-gray-700 text-center">
                  <div className="text-xs font-semibold text-gray-500 uppercase">{DAYS[i]}</div>
                  <div
                    className={`mt-1 text-lg font-bold w-9 h-9 flex items-center justify-center rounded-full mx-auto transition-colors ${
                      isToday
                        ? "bg-blue-600 text-white"
                        : "text-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {date.getDate()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time rows */}
          <div className="flex-1 overflow-y-auto">
            {TIME_SLOTS.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b dark:border-gray-700 min-h-[72px]">
                <div className="p-2 border-r dark:border-gray-700 text-xs text-gray-400 text-right pr-3 pt-2 select-none">
                  {hour % 12 === 0 ? 12 : hour % 12}{hour < 12 ? " AM" : " PM"}
                </div>
                {weekDates.map((date, dayIdx) => {
                  const slotEvents = getEventsForSlot(date, hour);
                  return (
                    <div
                      key={dayIdx}
                      className="border-r dark:border-gray-700 relative group cursor-pointer hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors"
                      onClick={() => handleCellClick(date)}
                    >
                      {/* Add hint on hover when empty */}
                      {slotEvents.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <PlusIcon className="w-4 h-4 text-blue-400" />
                        </div>
                      )}
                      {slotEvents.map((ev) => (
                        <div
                          key={ev.id}
                          className={`w-full rounded-md px-2 py-1 text-xs font-medium border cursor-pointer hover:shadow-sm transition-shadow mb-1 ${ev.color}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            const rect = (e.target as HTMLElement).getBoundingClientRect();
                            setTooltip({ event: ev, x: rect.left, y: rect.bottom + 8 });
                          }}
                        >
                          <div className="font-semibold truncate">{ev.title}</div>
                          <div className="opacity-70">{ev.startTime} – {ev.endTime}</div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event tooltip/popover */}
      {tooltip && (
        <div
          className="fixed z-50 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 p-4 w-64 animate-in fade-in zoom-in-95 duration-150"
          style={{ top: Math.min(tooltip.y, window.innerHeight - 200), left: Math.min(tooltip.x, window.innerWidth - 280) }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border mb-2 ${tooltip.event.color}`}>
            {tooltip.event.startTime} – {tooltip.event.endTime}
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{tooltip.event.title}</h3>
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-1">{tooltip.event.date}</p>
          {tooltip.event.description && (
            <p className="text-xs text-gray-600 dark:text-slate-300 mb-3">{tooltip.event.description}</p>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            onClick={() => handleDelete(tooltip.event.id)}
          >
            <TrashIcon className="h-4 w-4 mr-2" /> Remove Class
          </Button>
        </div>
      )}

      <NewClassModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        defaultDate={clickedDate}
      />
    </div>
  );
}
