"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { getMyAssignments } from "@/services/assignmentsApi";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  CheckCircle,
  Clock,
  CircleAlert,
  Loader2,
} from "lucide-react";
import { resolveAssignmentPath } from "@/lib/assignmentSlugUtils";

export default function AssignmentsPage() {
  const router = useRouter();
  const { getToken } = useAuth();
  const [filter, setFilter] = useState("all");
  const [sourceType, setSourceType] = useState("individual"); // "individual" or "class"
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAssignments() {
      try {
        setIsLoading(true);
        const token = await getToken();
        // pass status=null and source=sourceType
        const data = await getMyAssignments(token, null, sourceType);
        setAssignments(data);
      } catch (error) {
        console.error("Failed to fetch assignments:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAssignments();
  }, [getToken, sourceType]);

  const filteredAssignments = assignments.filter((assignment) => {
    if (filter === "all") return true;
    return assignment.status === filter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-50/50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
      case "overdue":
        return "text-red-500 bg-red-50/50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
      case "pending":
        return "text-amber-500 bg-amber-50/50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800";
      default:
        return "text-slate-400 bg-slate-50/50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "overdue":
        return <CircleAlert className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const handleViewTask = (assignment) => {
    const path = resolveAssignmentPath(assignment.slug, assignment.type);

    const params = new URLSearchParams();
    params.set("assignmentId", assignment.id);
    if (assignment.type === "practice") params.set("from", "reading");
    else if (assignment.type === "vocabulary") params.set("from", "vocabulary");

    router.push(`${path}?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue-1" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in text-slate-100">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Assignments
          </h1>
          <p className="text-slate-400 text-sm">
            Track your homework and tasks assigned by your teachers.
          </p>
        </div>

        <div className="flex flex-col items-end gap-3">
          {/* Source Tabs (Individual / Class) */}
          <div className="flex p-1 bg-[#0f172a] rounded-xl border border-slate-800 shadow-xl">
            {[
              { id: "individual", label: "Individual" },
              { id: "class", label: "Class" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSourceType(tab.id)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  sourceType === tab.id
                    ? "bg-slate-700 text-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Filter Tabs */}
          <div className="flex p-1 bg-[#0f172a] rounded-xl border border-slate-800 shadow-xl">
            {["all", "pending", "completed", "overdue"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
                  filter === status
                    ? "bg-brand-blue-1 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredAssignments.length > 0 ? (
          filteredAssignments.map((assignment) => (
            <Card
              key={assignment.id}
              className="bg-[#0f172a] border-slate-800 hover:border-brand-blue-1/50 transition-all duration-300 shadow-lg group overflow-hidden"
            >
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row gap-6 p-6 justify-between items-start md:items-center">
                  <div className="flex gap-5 items-start">
                    <div className="p-4 bg-brand-blue-1/10 text-brand-blue-1 rounded-2xl border border-brand-blue-1/20 group-hover:scale-105 transition-transform duration-300">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg text-white group-hover:text-brand-blue-1 transition-colors">
                        {assignment.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-xs">
                        <span className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-medium">Due:</span>{" "}
                          {assignment.dueDate
                            ? new Date(assignment.dueDate).toLocaleDateString()
                            : "No deadline"}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-800/50 text-slate-400 border border-slate-700 font-bold uppercase tracking-tighter text-[10px]">
                          {assignment.type}:{assignment.slug.replace(/_/g, " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                    <div
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-inner ${getStatusColor(
                        assignment.status,
                      )}`}
                    >
                      {getStatusIcon(assignment.status)}
                      <span>{assignment.status}</span>
                    </div>
                    <Button
                      onClick={() => handleViewTask(assignment)}
                      size="sm"
                      className="ml-auto md:ml-0 bg-brand-blue-1 hover:bg-brand-blue-2 text-white font-bold h-10 px-6 rounded-xl shadow-lg shadow-brand-blue-1/20"
                    >
                      {assignment.status === "completed"
                        ? "Review Task"
                        : "Start Task"}
                    </Button>
                  </div>
                </div>
                {/* Result bar for completed tasks */}
                {assignment.status === "completed" && assignment.result && (
                  <div className="h-1 bg-slate-800 w-full">
                    <div
                      className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                      style={{ width: `${assignment.result.score}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-20 bg-[#0f172a]/50 rounded-3xl border border-dashed border-slate-800 animate-in fade-in zoom-in-95 duration-500">
            <div className="h-20 w-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
              <BookOpen className="w-10 h-10 text-slate-700" />
            </div>
            <h3 className="text-xl font-bold text-white">
              No assignments found
            </h3>
            <p className="text-slate-500 mt-2 max-w-xs mx-auto">
              {filter === "all"
                ? "You're all caught up! No tasks have been assigned to you yet."
                : `You don't have any ${filter} assignments at the moment.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
