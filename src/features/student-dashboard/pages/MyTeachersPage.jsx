import { useState, useEffect } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useProfile } from "@/contexts/ProfileContext";
import { fetchStudentTeachers, fetchStudentClasses } from "@/services/vocabularyApi";
import { getMyAssignments } from "@/services/assignmentsApi";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    AcademicCapIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    BookOpenIcon,
    ClockIcon
} from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MyTeachersPage() {
    const { getToken } = useAuth();
    const { activeProfile } = useProfile();
    const navigate = useNavigate();
    const [teachers, setTeachers] = useState([]);
    const [classesByTeacher, setClassesByTeacher] = useState({});
    const [assignmentsByClass, setAssignmentsByClass] = useState({});
    const [expandedTeacher, setExpandedTeacher] = useState(null);
    const [expandedClass, setExpandedClass] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            if (!activeProfile) return;
            try {
                setIsLoading(true);
                const token = await getToken();
                // 1. Fetch teachers for the current student profile
                const teacherData = await fetchStudentTeachers(activeProfile.profileId, "active", token);
                setTeachers(teacherData);

                // 2. Fetch classes for the student
                const classData = await fetchStudentClasses(activeProfile.profileId, token);

                // Group classes by teacher ID (clerkUserId or teacherId)
                const grouped = {};
                for (const cls of classData) {
                    const tId = cls.teacherClerkId;
                    if (!grouped[tId]) grouped[tId] = [];
                    grouped[tId].push(cls);
                }
                setClassesByTeacher(grouped);
            } catch (error) {
                console.error("Failed to fetch teachers/classes:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, [activeProfile, getToken]);

    const toggleTeacher = (teacherClerkId) => {
        setExpandedTeacher(expandedTeacher === teacherClerkId ? null : teacherClerkId);
    };

    const toggleClass = async (classId) => {
        if (expandedClass === classId) {
            setExpandedClass(null);
            return;
        }

        setExpandedClass(classId);

        // Fetch assignments for this class if not already loaded
        if (!assignmentsByClass[classId]) {
            try {
                const token = await getToken();
                const assignments = await getMyAssignments(token, null, null, classId);
                setAssignmentsByClass(prev => ({ ...prev, [classId]: assignments }));
            } catch (error) {
                console.error("Failed to fetch class assignments:", error);
            }
        }
    };

    const handleStartAssignment = (assignment) => {
        // Reusing logic from AssignmentsPage or navigating to assignments with filter
        // For now, let's navigate to the specific exercise
        const slugMap = {
            choose_options: "/vocabulary/practice/choose-options",
            highlight_word: "/vocabulary/practice/highlight-word",
            odd_one_out: "/vocabulary/practice/odd-one-out",
            group_words: "/vocabulary/practice/group-words",
            fill_blank_typed: "/vocabulary/practice/fill-in-blank",
            correct_spelling: "/vocabulary/practice/correct-spelling",
            is_french_word: "/vocabulary/practice/is-french-word",
            four_options: "/grammar/practice/four-options",
            three_options: "/grammar/practice/three-options",
            two_options: "/grammar/practice/two-options",
            fill_blanks_options: "/grammar/practice/fill-blanks-options",
        };

        let path = slugMap[assignment.slug] || `/practice/reading/${assignment.slug.replace(/_/g, "-")}`;
        const params = new URLSearchParams();
        params.set("assignmentId", assignment.id);
        navigate(`${path}?${params.toString()}`);
    };

    if (isLoading) {
        return (
            <div className="h-96 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-brand-blue-1" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-white tracking-tight">My Teachers</h1>
                <p className="text-slate-400 text-sm">View your connected teachers, classes, and assignments.</p>
            </div>

            {teachers.length === 0 ? (
                <Card className="bg-[#0f172a] border-slate-800 border-dashed py-12">
                    <CardContent className="text-center">
                        <AcademicCapIcon className="h-12 w-12 text-slate-700 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white">No teachers connected</h3>
                        <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                            Connect with a teacher using their ID or search via the Friends section to see your classes here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {teachers.map((teacher) => (
                        <div key={teacher.clerkUserId} className="bg-[#0f172a] rounded-2xl border border-slate-800 overflow-hidden transition-all duration-300">
                            {/* Teacher Header */}
                            <button
                                onClick={() => toggleTeacher(teacher.clerkUserId)}
                                className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-brand-blue-1/20 flex items-center justify-center border border-brand-blue-1/30">
                                        <AcademicCapIcon className="h-6 w-6 text-brand-blue-1" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-white text-lg">{teacher.name || "Teacher"}</h3>
                                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">ID: {teacher.teacherId}</p>
                                    </div>
                                </div>
                                {expandedTeacher === teacher.clerkUserId ? (
                                    <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                                ) : (
                                    <ChevronRightIcon className="h-5 w-5 text-slate-400" />
                                )}
                            </button>

                            {/* Teacher Classes */}
                            {expandedTeacher === teacher.clerkUserId && (
                                <div className="p-4 pt-0 space-y-3 bg-slate-900/30 border-t border-slate-800">
                                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mt-4">Enrolled Classes</h4>

                                    {classesByTeacher[teacher.clerkUserId]?.length > 0 ? (
                                        <div className="grid gap-3">
                                            {classesByTeacher[teacher.clerkUserId].map((cls) => (
                                                <div key={cls.id} className="rounded-xl border border-slate-700 bg-slate-800/40 overflow-hidden">
                                                    <button
                                                        onClick={() => toggleClass(cls.id)}
                                                        className="w-full flex items-center justify-between p-3 hover:bg-slate-700/40 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <BookOpenIcon className="h-5 w-5 text-brand-blue-1" />
                                                            <span className="font-bold text-white text-sm">{cls.name}</span>
                                                        </div>
                                                        {expandedClass === cls.id ? (
                                                            <ChevronDownIcon className="h-4 w-4 text-slate-500" />
                                                        ) : (
                                                            <ChevronRightIcon className="h-4 w-4 text-slate-500" />
                                                        )}
                                                    </button>

                                                    {/* Class Assignments */}
                                                    {expandedClass === cls.id && (
                                                        <div className="p-3 pt-1 space-y-2 bg-slate-900/50 border-t border-slate-700/50">
                                                            {assignmentsByClass[cls.id]?.length > 0 ? (
                                                                assignmentsByClass[cls.id].map((assign) => (
                                                                    <div key={assign.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/30">
                                                                        <div className="space-y-1">
                                                                            <p className="text-sm font-bold text-white">{assign.title}</p>
                                                                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                                                                                <ClockIcon className="h-3 w-3" />
                                                                                <span>DUE: {assign.dueDate ? new Date(assign.dueDate).toLocaleDateString() : 'NO DEADLINE'}</span>
                                                                                <span className={`px-2 py-0.5 rounded-full border ${assign.status === 'completed' ? 'text-green-500 border-green-500/30 bg-green-500/10' : 'text-amber-500 border-amber-500/30 bg-amber-500/10'
                                                                                    }`}>
                                                                                    {assign.status.toUpperCase()}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="h-8 text-[10px] font-black uppercase text-brand-blue-1 hover:text-white"
                                                                            onClick={() => handleStartAssignment(assign)}
                                                                        >
                                                                            {assign.status === 'completed' ? 'Review' : 'Start'}
                                                                        </Button>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <p className="text-xs text-slate-500 text-center py-4">No assignments for this class yet.</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500 bg-slate-800/20 rounded-xl p-4 text-center border border-dashed border-slate-700">
                                            You are not enrolled in any specific classes with this teacher yet.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
