"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardCheck,
  User,
  Clock,
  Calendar,
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Timer,
} from "lucide-react";

interface AssignmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: any;
}

const STATUS_STYLES = {
  completed: { badge: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle2 },
  overdue:   { badge: "bg-red-500/10 text-red-400 border-red-500/20",   icon: CircleAlert },
  pending:   { badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Timer },
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-slate-800 last:border-0">
      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 shrink-0 pt-0.5">
        {label}
      </span>
      <span className="text-sm text-slate-200 text-right">{value}</span>
    </div>
  );
}

export function AssignmentDetailsModal({
  isOpen,
  onClose,
  assignment,
}: AssignmentDetailsModalProps) {
  if (!assignment) return null;

  const statusStyle = STATUS_STYLES[assignment.status] ?? STATUS_STYLES.pending;
  const StatusIcon = statusStyle.icon;

  const score = assignment.result?.score ?? null;
  const completedAt = assignment.result?.completedAt
    ? new Date(assignment.result.completedAt).toLocaleString()
    : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] bg-[#020617] text-white border-slate-800 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-black">
            <div className="p-2 bg-brand-blue-1/20 rounded-lg">
              <ClipboardCheck className="h-5 w-5 text-brand-blue-1" />
            </div>
            Assignment Details
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          {/* Title + status hero */}
          <div className="flex items-start justify-between gap-3 mb-4 p-4 bg-slate-900 rounded-xl border border-slate-800">
            <div>
              <p className="font-bold text-white text-base leading-tight">{assignment.title}</p>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                {assignment.type} · {assignment.slug?.replace(/_/g, " ")}
              </p>
            </div>
            <Badge className={`shrink-0 flex items-center gap-1 font-black px-2.5 py-1 pointer-events-none ${statusStyle.badge}`}>
              <StatusIcon className="h-3 w-3" />
              {assignment.status.toUpperCase()}
            </Badge>
          </div>

          {/* Details rows */}
          <div className="px-1">
            <Row
              label="Student"
              value={
                <span className="flex flex-col items-end gap-0.5">
                  {assignment.studentName && (
                    <span className="text-white font-semibold">{assignment.studentName}</span>
                  )}
                  <span className="flex items-center gap-1.5 text-slate-400 font-mono text-xs">
                    <User className="h-3 w-3 text-slate-500" />
                    {assignment.studentId}
                  </span>
                </span>
              }
            />
            <Row
              label="Assigned"
              value={
                <span className="flex items-center gap-1.5 justify-end">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  {new Date(assignment.assignedAt).toLocaleDateString()}
                </span>
              }
            />
            <Row
              label="Due Date"
              value={
                <span className="flex items-center gap-1.5 justify-end">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  {assignment.dueDate
                    ? new Date(assignment.dueDate).toLocaleDateString()
                    : "No deadline"}
                </span>
              }
            />
            <Row
              label="Exercise"
              value={
                <span className="flex items-center gap-1.5 justify-end">
                  <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                  {assignment.slug?.replace(/_/g, " ")}
                </span>
              }
            />

            {/* Score — only when completed */}
            {assignment.status === "completed" && (
              <>
                <Row
                  label="Score"
                  value={
                    <span className={`text-lg font-black ${score >= 70 ? "text-green-400" : score >= 40 ? "text-amber-400" : "text-red-400"}`}>
                      {score !== null ? `${score}%` : "—"}
                    </span>
                  }
                />
                {/* Score bar */}
                {score !== null && (
                  <div className="mt-1 mb-3 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${score >= 70 ? "bg-green-500" : score >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                )}
                {completedAt && (
                  <Row
                    label="Completed"
                    value={completedAt}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
