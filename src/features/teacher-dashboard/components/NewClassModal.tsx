"use client";

import { useState } from "react";
import { X, CalendarPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ClassEvent {
  id: string;
  title: string;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:MM
  endTime: string;    // HH:MM
  color: string;
  description?: string;
}

const COLOR_OPTIONS = [
  { label: "Blue",   value: "bg-blue-100 text-blue-700 border-blue-200" },
  { label: "Purple", value: "bg-purple-100 text-purple-700 border-purple-200" },
  { label: "Green",  value: "bg-green-100 text-green-700 border-green-200" },
  { label: "Orange", value: "bg-orange-100 text-orange-700 border-orange-200" },
  { label: "Red",    value: "bg-red-100 text-red-700 border-red-200" },
  { label: "Teal",   value: "bg-teal-100 text-teal-700 border-teal-200" },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: ClassEvent) => void;
  defaultDate?: string; // YYYY-MM-DD
}

export function NewClassModal({ isOpen, onClose, onSave, defaultDate }: Props) {
  const today = defaultDate || new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    title: "",
    date: today,
    startTime: "09:00",
    endTime: "10:00",
    color: COLOR_OPTIONS[0].value,
    description: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Class title is required.";
    if (!form.date) e.date = "Date is required.";
    if (!form.startTime) e.startTime = "Start time is required.";
    if (!form.endTime) e.endTime = "End time is required.";
    if (form.startTime && form.endTime && form.startTime >= form.endTime)
      e.endTime = "End time must be after start time.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setTimeout(() => {
      onSave({
        id: `class-${Date.now()}`,
        title: form.title.trim(),
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        color: form.color,
        description: form.description.trim(),
      });
      setSaving(false);
      handleClose();
    }, 400);
  };

  const handleClose = () => {
    setForm({ title: "", date: today, startTime: "09:00", endTime: "10:00", color: COLOR_OPTIONS[0].value, description: "" });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <CalendarPlus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">New Class</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400">Schedule a new class session</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <Label htmlFor="title">Class Title <span className="text-red-500">*</span></Label>
            <Input
              id="title"
              value={form.title}
              onChange={e => set("title", e.target.value)}
              placeholder="e.g. French Grammar – Group A"
              className={errors.title ? "border-red-500 focus-visible:ring-red-500" : ""}
              autoFocus
            />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>

          {/* Date */}
          <div className="space-y-1.5">
            <Label htmlFor="date">Date <span className="text-red-500">*</span></Label>
            <Input
              id="date"
              type="date"
              value={form.date}
              onChange={e => set("date", e.target.value)}
              className={errors.date ? "border-red-500 focus-visible:ring-red-500" : ""}
            />
            {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
          </div>

          {/* Time row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="startTime">Start Time <span className="text-red-500">*</span></Label>
              <Input
                id="startTime"
                type="time"
                value={form.startTime}
                onChange={e => set("startTime", e.target.value)}
                className={errors.startTime ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.startTime && <p className="text-xs text-red-500">{errors.startTime}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="endTime">End Time <span className="text-red-500">*</span></Label>
              <Input
                id="endTime"
                type="time"
                value={form.endTime}
                onChange={e => set("endTime", e.target.value)}
                className={errors.endTime ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.endTime && <p className="text-xs text-red-500">{errors.endTime}</p>}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color Label</Label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => set("color", opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${opt.value} ${
                    form.color === opt.value ? "ring-2 ring-offset-1 ring-gray-400 scale-105" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="description">Description <span className="text-gray-400 font-normal">(optional)</span></Label>
            <textarea
              id="description"
              value={form.description}
              onChange={e => set("description", e.target.value)}
              placeholder="Add notes about this class..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1" disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : <><CalendarPlus className="h-4 w-4 mr-2" />Add Class</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
