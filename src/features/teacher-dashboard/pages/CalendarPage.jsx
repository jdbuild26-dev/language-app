import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "@heroicons/react/24/outline";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

  // Mock Events
  const events = [
    {
      day: 1,
      hour: 10,
      title: "Class 5A - French",
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
      day: 2,
      hour: 14,
      title: "IELTS Prep",
      color: "bg-purple-100 text-purple-700 border-purple-200",
    },
    {
      day: 3,
      hour: 9,
      title: "Business English",
      color: "bg-green-100 text-green-700 border-green-200",
    },
    {
      day: 4,
      hour: 11,
      title: "Class 5A - French",
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
      day: 5,
      hour: 16,
      title: "Private Tutor - John",
      color: "bg-orange-100 text-orange-700 border-orange-200",
    },
  ];

  const getEvent = (dayIndex, hour) => {
    return events.find((e) => e.day === dayIndex && e.hour === hour);
  };

  return (
    <div className="space-y-6 animate-fade-in h-[calc(100vh-100px)] flex flex-col">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-primary-dark">
          Schedule
        </h1>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => {}}>
            <ChevronLeftIcon className="w-4 h-4" />
          </Button>
          <Button variant="outline" className="min-w-[150px]">
            February 2026
          </Button>
          <Button variant="outline" size="icon" onClick={() => {}}>
            <ChevronRightIcon className="w-4 h-4" />
          </Button>
          <Button className="ml-2">
            <PlusIcon className="w-4 h-4 mr-2" /> New Class
          </Button>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col border-none shadow-md">
        <CardContent className="p-0 flex-1 flex flex-col overflow-auto">
          {/* Header Row */}
          <div className="grid grid-cols-8 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="p-4 border-r dark:border-gray-700 text-center text-sm font-semibold text-gray-500">
              Time
            </div>
            {days.map((day, i) => (
              <div
                key={i}
                className="p-4 border-r dark:border-gray-700 text-center font-semibold text-gray-700 dark:text-gray-300"
              >
                <div>{day}</div>
                <div className="text-sm font-normal text-gray-500">
                  {16 + i}
                </div>{" "}
                {/* Mock dates */}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="flex-1 overflow-y-auto">
            {timeSlots.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-8 border-b dark:border-gray-700 min-h-[80px]"
              >
                <div className="p-2 border-r dark:border-gray-700 text-xs text-gray-500 text-center">
                  {hour}:00
                </div>
                {days.map((_, dayIndex) => {
                  const event = getEvent(dayIndex, hour);
                  return (
                    <div
                      key={dayIndex}
                      className="border-r dark:border-gray-700 relative p-1 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      {event && (
                        <div
                          className={`w-full h-full rounded-md p-2 text-xs font-medium border ${event.color} cursor-pointer hover:shadow-sm transition-shadow`}
                        >
                          {event.title}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
