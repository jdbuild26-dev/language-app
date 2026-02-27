import React, { useState, useEffect } from "react";
import {
  UserGroupIcon,
  CalendarIcon,
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useProfile } from "@/contexts/ProfileContext";
import { useAuth } from "@clerk/clerk-react";
import { updateTeacherProfile } from "@/services/userApi";
import questionnaireData from "../../auth/constants/teacherQuestionnaire.json";
import toast from "react-hot-toast";

const QUESTIONS_PER_PAGE = 5;

export default function OverviewPage() {
  const { activeProfile, refreshProfiles } = useProfile();
  const { getToken } = useAuth();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [responses, setResponses] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeProfile?.questionnaireResponses) {
      setResponses(activeProfile.questionnaireResponses);
    }
  }, [activeProfile]);

  const questions = questionnaireData.questions;
  const totalPages = Math.ceil(questions.length / QUESTIONS_PER_PAGE);
  const currentQuestions = questions.slice(
    currentPage * QUESTIONS_PER_PAGE,
    (currentPage + 1) * QUESTIONS_PER_PAGE
  );

  const completedQuestionsCount = Object.keys(responses).filter(k => !!responses[k]).length;
  const isQuestionnaireComplete = completedQuestionsCount >= questions.length;

  const handleInputChange = (id, value) => {
    setResponses(prev => ({ ...prev, [id]: value }));
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const token = await getToken();
      await updateTeacherProfile({ questionnaireResponses: responses }, token, activeProfile.language);
      await refreshProfiles();
      toast.success("Questionnaire saved successfully!");
      if (isQuestionnaireComplete) {
        setShowQuestionnaire(false);
      }
    } catch (error) {
      console.error("Failed to update questionnaire:", error);
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (q) => {
    const value = responses[q.id];
    const cn = (...classes) => classes.filter(Boolean).join(" ");

    switch (q.type) {
      case "text":
      case "email":
      case "number":
        return (
          <Input
            type={q.type}
            value={value || ""}
            onChange={(e) => handleInputChange(q.id, e.target.value)}
            placeholder="Type your answer here..."
            className="bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
          />
        );
      case "long_text":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => handleInputChange(q.id, e.target.value)}
            placeholder="Share your thoughts..."
            className="bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 min-h-[100px]"
          />
        );
      case "multiple_choice":
        return (
          <RadioGroup
            value={value}
            onValueChange={(val) => handleInputChange(q.id, val)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2"
          >
            {q.options.map((opt) => (
              <div key={opt} className="flex items-center space-x-2 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg border border-gray-200 dark:border-slate-700">
                <RadioGroupItem value={opt} id={`q${q.id}-${opt}`} />
                <Label htmlFor={`q${q.id}-${opt}`} className="cursor-pointer flex-1">
                  {opt}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );
      case "boolean":
        return (
          <RadioGroup
            value={value?.toString()}
            onValueChange={(val) => handleInputChange(q.id, val === "true")}
            className="flex gap-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`q${q.id}-yes`} />
              <Label htmlFor={`q${q.id}-yes`} className="cursor-pointer">Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`q${q.id}-no`} />
              <Label htmlFor={`q${q.id}-no`} className="cursor-pointer">No</Label>
            </div>
          </RadioGroup>
        );
      case "scale":
        return (
          <div className="flex justify-between items-center gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                onClick={() => handleInputChange(q.id, num)}
                className={cn(
                  "flex-1 py-2 rounded-lg border font-bold transition-all",
                  value === num
                    ? "bg-blue-600 border-blue-500 text-white shadow-md"
                    : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-400 hover:border-blue-400"
                )}
              >
                {num}
              </button>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-primary-dark">
          Dashboard Overview
        </h1>
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800">
          <CheckCircleIcon className="h-5 w-5 text-blue-500" />
          <span className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
            Teacher Profile: Active
          </span>
        </div>
      </div>

      {/* Profile Completion Alert */}
      {!isQuestionnaireComplete && !showQuestionnaire && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-xl">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Complete Your Application</h2>
              <p className="text-blue-100 max-w-lg">
                Your profile is active, but we need a bit more information to verify your account and match you with the right students.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <div className="flex-1 max-w-[200px] h-2 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                    style={{ width: `${(completedQuestionsCount / questions.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest">{Math.round((completedQuestionsCount / questions.length) * 100)}% Done</span>
              </div>
            </div>
            <Button
              onClick={() => setShowQuestionnaire(true)}
              className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8 h-12 rounded-xl shadow-lg transition-transform active:scale-95"
            >
              Finish Application
            </Button>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>
      )}

      {/* Questionnaire Section */}
      {showQuestionnaire && (
        <Card className="border-2 border-blue-500/20 shadow-2xl overflow-hidden transition-all animate-in fade-in slide-in-from-top-4 duration-500">
          <CardHeader className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-100 dark:border-slate-800 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Application Questionnaire</CardTitle>
              <p className="text-sm text-gray-500">Step {currentPage + 1} of {totalPages}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowQuestionnaire(false)} className="text-gray-400">
              Close
            </Button>
          </CardHeader>
          <CardContent className="p-8 space-y-10">
            {currentQuestions.map((q) => (
              <div key={q.id} className="space-y-4">
                <Label className="text-base font-bold text-gray-700 dark:text-slate-200">
                  {q.id}. {q.question}
                </Label>
                {renderQuestion(q)}
              </div>
            ))}
          </CardContent>
          <CardFooter className="bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-800 flex justify-between p-6">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
            >
              Previous
            </Button>
            <div className="flex gap-4">
              <Button variant="ghost" onClick={handleSubmit} disabled={isSubmitting}>
                Save Progress
              </Button>
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-10"
              >
                {currentPage === totalPages - 1 ? "Finish & Save" : "Next Step"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Students
            </CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:scale-110 transition-transform">
              <UserGroupIcon className="h-4 w-4 text-brand-blue-1" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-green-500"></span>
              +2 from last week
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Classes
            </CardTitle>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg group-hover:scale-110 transition-transform">
              <CalendarIcon className="h-4 w-4 text-brand-purple-1" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-gray-400 mt-1">2 scheduled today</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow group">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Reviews
            </CardTitle>
            <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg group-hover:scale-110 transition-transform">
              <ClipboardDocumentCheckIcon className="h-4 w-4 text-brand-yellow-1" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-gray-400 mt-1">Practice submissions</p>
          </CardContent>
        </Card>
      </div>

      {/* Info Card */}
      {!showQuestionnaire && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">Recent Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="bg-gray-100 dark:bg-slate-800 p-4 rounded-full mb-4">
                  <ExclamationCircleIcon className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No new student inquiries at the moment.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Booking Availability</span>
                <span className="text-green-500 font-bold">Online</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Profile Quality Score</span>
                <span className="text-yellow-500 font-bold">{isQuestionnaireComplete ? "High" : "Low"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
