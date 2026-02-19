import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardCheck,
  CheckCircle,
  Clock,
  CircleAlert,
  Loader2,
  Calendar,
  User,
  Plus
} from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { getTeacherAssignments } from "@/services/assignmentsApi";
import { useNavigate } from "react-router-dom";

export default function TeacherAssignmentsPage() {
  const [filter, setFilter] = useState("all");
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { getToken } = useAuth();
  const navigate = useNavigate();

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
        <Button
          onClick={() => navigate("/teacher-dashboard/students")}
          className="bg-brand-blue-1 hover:bg-brand-blue-2 text-white font-bold h-12 px-6 rounded-xl shadow-lg shadow-brand-blue-1/20 transition-all active:scale-95"
        >
          <Plus className="w-5 h-5 mr-2" /> Assign New Task
        </Button>
      </div>

      <div className="flex p-1 bg-[#0f172a] rounded-xl border border-slate-800 w-fit">
        {["all", "active", "completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-6 py-2 text-sm font-bold rounded-lg capitalize transition-all ${filter === tab
                ? "bg-brand-blue-1 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                : "text-slate-500 hover:text-slate-300"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

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
                          <span className="font-medium text-slate-300">{assign.studentId}</span>
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
    </div>
  );
}
