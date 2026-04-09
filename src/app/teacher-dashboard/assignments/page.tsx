"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardCheck,
  Clock,
  Loader2,
  User,
  Plus,
  ChevronDown,
  Users,
} from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { getTeacherAssignments } from "@/services/assignmentsApi";
import { AssignTaskModal } from "@/features/teacher-dashboard/components/AssignTaskModal";
import { AssignClassModal } from "@/features/teacher-dashboard/components/AssignClassModal";
import { AssignmentDetailsModal } from "@/features/teacher-dashboard/components/AssignmentDetailsModal";
import { useTeacherStudents } from "@/hooks/useTeacherStudents";

export default function TeacherAssignmentsPage() {
  const [filter, setFilter] = useState("all");
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showStudentPicker, setShowStudentPicker] = useState(false);
  const [assignModal, setAssignModal] = useState<{
    isOpen: boolean;
    studentId: string | null;
    studentName: string;
  }>({ isOpen: false, studentId: null, studentName: "" });
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [detailsAssignment, setDetailsAssignment] = useState<any>(null);

  const { getToken } = useAuth();
  const { data: students } = useTeacherStudents("active");

  useEffect(() => {
    async function fetchAssignments() {
      try {
        setIsLoading(true);
        const token = await getToken();
        const data = await getTeacherAssignments(token);
        setAssignments(data);
      } catch (error) {
        console.error("Failed to fetch teacher assignments:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAssignments();
  }, [getToken]);

  const filteredAssignments = assignments.filter((a) => {
    if (filter === "all") return true;
    if (filter === "active") return a.status === "pending" || a.status === "overdue";
    return a.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "overdue": return "bg-red-500/10 text-red-500 border-red-500/20";
      default: return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    }
  };

  const openAssignForStudent = (student: any) => {
    setShowStudentPicker(false);
    setAssignModal({
      isOpen: true,
      studentId: student.studentId,
      studentName: student.name || "Student",
    });
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue-1" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Assignments
          </h1>
          <p className="text-slate-400 mt-1">
            Track and monitor the progress of tasks you've assigned to students.
          </p>
        </div>

        {/* Assign New Task — student picker dropdown */}
        <div className="relative">
          <Button
            onClick={() => setShowStudentPicker((v) => !v)}
            className="bg-brand-blue-1 hover:bg-brand-blue-2 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-brand-blue-1/20 transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Assign New Task
            <ChevronDown className={`w-4 h-4 transition-transform ${showStudentPicker ? "rotate-180" : ""}`} />
          </Button>

          {showStudentPicker && (
            <div className="absolute right-0 top-14 z-50 w-64 bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
              {/* By Class */}
              <div className="px-4 pt-3 pb-1">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Assign to a class
                </p>
                <button
                  onClick={() => { setShowStudentPicker(false); setClassModalOpen(true); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="h-8 w-8 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center shrink-0">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Whole Class</p>
                    <p className="text-xs text-slate-500">All students at once</p>
                  </div>
                </button>
              </div>

              <div className="mx-4 my-1 border-t border-slate-800" />

              {/* By Student */}
              <div className="px-4 pb-1">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Assign to a student
                </p>
              </div>
              {!students?.length ? (
                <p className="text-sm text-slate-400 px-4 pb-4">No active students found.</p>
              ) : (
                <ul className="max-h-52 overflow-y-auto pb-2">
                  {students.map((s: any) => (
                    <li key={s.studentId}>
                      <button
                        onClick={() => openAssignForStudent(s)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-800 transition-colors text-left"
                      >
                        <div className="h-8 w-8 rounded-full bg-brand-blue-1/10 text-brand-blue-1 flex items-center justify-center font-bold text-sm shrink-0">
                          {(s.name || "S").charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{s.name || "Student"}</p>
                          <p className="text-xs text-slate-500 font-mono">{s.studentId}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex p-1 bg-[#0f172a] rounded-xl border border-slate-800 w-fit">
        {["all", "active", "completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-2 text-sm font-bold rounded-lg capitalize transition-all ${
              filter === tab
                ? "bg-brand-blue-1 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Assignments list */}
      <div className="grid gap-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assign) => (
            <Card
              key={assign.id}
              className="bg-[#0f172a] border-slate-800 hover:border-brand-blue-1/50 transition-all duration-300 shadow-xl overflow-hidden group"
            >
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex gap-4 items-start">
                    <div className="p-3 bg-brand-blue-1/10 rounded-2xl text-brand-blue-1 border border-brand-blue-1/20 group-hover:scale-110 transition-transform">
                      <ClipboardCheck className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-white group-hover:text-brand-blue-1 transition-colors">
                        {assign.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-xs">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-medium text-slate-300">
                            {assign.studentName && (
                              <span className="text-white">{assign.studentName} · </span>
                            )}
                            {assign.studentId}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>Due: {assign.dueDate ? new Date(assign.dueDate).toLocaleDateString() : "No deadline"}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800/50 text-slate-400 border border-slate-700 font-bold uppercase tracking-tighter text-[10px]">
                          {assign.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Status</p>
                      <Badge className={`mt-1 font-black px-3 py-0.5 pointer-events-none ${getStatusColor(assign.status)}`}>
                        {assign.status.toUpperCase()}
                      </Badge>
                    </div>
                    {assign.status === "completed" && (
                      <div className="text-right">
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Score</p>
                        <p className="text-xl font-black text-green-500">{assign.result?.score}%</p>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDetailsAssignment(assign)}
                      className="ml-auto md:ml-0 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-800">
            <div className="h-16 w-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-800">
              <ClipboardCheck className="h-8 w-8 text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-white">No assignments found</h3>
            <p className="text-slate-500 mt-2">Try changing your filters or create a new assignment.</p>
          </div>
        )}
      </div>

      {/* Click-outside to close student picker */}
      {showStudentPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowStudentPicker(false)}
        />
      )}

      <AssignTaskModal
        isOpen={assignModal.isOpen}
        onClose={() => setAssignModal({ ...assignModal, isOpen: false })}
        studentId={assignModal.studentId}
        studentName={assignModal.studentName}
      />

      <AssignClassModal
        isOpen={classModalOpen}
        onClose={() => setClassModalOpen(false)}
      />

      <AssignmentDetailsModal
        isOpen={!!detailsAssignment}
        onClose={() => setDetailsAssignment(null)}
        assignment={detailsAssignment}
      />
    </div>
  );
}
