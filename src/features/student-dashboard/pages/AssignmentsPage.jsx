import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
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

export default function AssignmentsPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const [filter, setFilter] = useState("all");
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAssignments() {
      try {
        setIsLoading(true);
        const token = await getToken();
        const data = await getMyAssignments(token);
        setAssignments(data);
      } catch (error) {
        console.error("Failed to fetch assignments:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchAssignments();
  }, [getToken]);

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
    const slug = assignment.slug;
    let path = "";

    // 1. Precise Slug to Path Mapping
    const slugMap = {
      // Vocabulary
      "choose_options": "/vocabulary/practice/choose-options",
      "highlight_word": "/vocabulary/practice/highlight-word",
      "odd_one_out": "/vocabulary/practice/odd-one-out",
      "group_words": "/vocabulary/practice/group-words",
      "fill_blank_typed": "/vocabulary/practice/fill-in-blank",
      "correct_spelling": "/vocabulary/practice/correct-spelling",
      "is_french_word": "/vocabulary/practice/is-french-word",
      "spell_word": "/vocabulary/practice/correct-spelling",

      // Grammar
      "four_options": "/grammar/practice/four-options",
      "three_options": "/grammar/practice/three-options",
      "two_options": "/grammar/practice/two-options",
      "fill_blanks_options": "/grammar/practice/fill-blanks-options",
      "grammar_find_error": "/grammar/practice/find-error",
      "grammar_reorder": "/grammar/practice/reorder-words",
      "grammar_transformation": "/grammar/practice/transformation",
      "grammar_combination": "/grammar/practice/combination",
      "grammar_rewrite": "/grammar/practice/rewrite",
      "listen_fill_blanks": "/grammar/practice/fill-blanks",
      "fill_blanks": "/grammar/practice/fill-blanks",

      // Reading Practice
      "match_pairs": "/practice/reading/match-pairs",
      "bubble_selection": "/practice/reading/bubble-selection",
      "highlight_text": "/practice/reading/highlight-text",
      "passage_mcq": "/practice/reading/comprehension",
      "complete_passage_dropdown": "/practice/reading/fill-blanks-passage",
      "sentence_completion": "/practice/reading/sentence-completion",
      "summary_completion": "/practice/reading/summary-completion",
      "true_false": "/practice/reading/true-false",
      "reorder_sentences": "/practice/reading/reorder",
      "match_sentence_ending": "/practice/reading/complete-passage",

      // Listening/Speaking Practice
      "phonetics__what_do_you_hear": "/vocabulary/practice/listening/phonetics",
      "listen_phonetics": "/vocabulary/practice/listening/phonetics",
      "type_what_you_hear": "/practice/listening/type",
      "repeat_word": "/vocabulary/practice/repeat-word",
      "repeat_sentence": "/vocabulary/practice/repeat-sentence",
      "what_do_you_see": "/vocabulary/practice/what-do-you-see",
      "dictation_image": "/vocabulary/practice/dictation-image",
      "speak_topic": "/practice/speaking/topic",
      "speak_image": "/practice/speaking/image",
    };

    // 2. If we have a direct mapping, use it
    if (slugMap[slug]) {
      path = slugMap[slug];
    } else {
      // 3. Fallback logic for unmapped slugs
      const normalizedSlug = slug.replace(/_/g, "-");
      if (assignment.type === "vocabulary") {
        path = `/vocabulary/practice/${normalizedSlug}`;
      } else if (assignment.type === "grammar") {
        // Handle grammar prefixes
        const cleanGrammarSlug = normalizedSlug.replace(/^grammar-/, "");
        path = `/grammar/practice/${cleanGrammarSlug}`;
      } else {
        path = `/practice/reading/${normalizedSlug}`;
      }
    }

    // 4. Append Query Parameters
    const params = new URLSearchParams();
    params.set("assignmentId", assignment.id);

    // Add "from" param as per user request for main practice
    if (assignment.type === "practice") {
      params.set("from", "reading");
    } else if (assignment.type === "vocabulary") {
      params.set("from", "vocabulary");
    }

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

        {/* Filter Tabs */}
        <div className="flex p-1 bg-[#0f172a] rounded-xl border border-slate-800 shadow-xl">
          {["all", "pending", "completed", "overdue"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${filter === status
                ? "bg-brand-blue-1 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                : "text-slate-500 hover:text-slate-300"
                }`}
            >
              {status}
            </button>
          ))}
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
                          {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : "No deadline"}
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
                      {assignment.status === 'completed' ? 'Review Task' : 'Start Task'}
                    </Button>
                  </div>
                </div>
                {/* Result bar for completed tasks */}
                {assignment.status === 'completed' && assignment.result && (
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
