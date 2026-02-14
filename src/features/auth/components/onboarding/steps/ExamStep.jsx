import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import StepHeader from "../shared/StepHeader";
import StepNavigation from "../shared/StepNavigation";
import { EXAM_MAP } from "../onboardingData";

/**
 * Step 7: Exam Preparation (Conditional)
 * Shows per-language exam intent. May be called multiple times for multi-language.
 *
 * Props:
 *  - language: string — which language this exam step is for
 *  - examIntent: { language, hasExam, examType } — current intent for this language
 *  - onUpdate: (intent) => void — update the exam intent
 *  - onBack / onContinue: navigation
 */
const ExamStep = ({ language, examIntent, onUpdate, onBack, onContinue }) => {
  const exams = EXAM_MAP[language] || [];
  const hasExam = examIntent?.hasExam || false;
  const examType = examIntent?.examType || "";

  const handleNoExam = () => {
    onUpdate({ language, hasExam: false, examType: null });
  };

  const handleYesExam = () => {
    onUpdate({
      language,
      hasExam: true,
      examType: examType || exams[0] || null,
    });
  };

  const handleExamTypeChange = (e) => {
    onUpdate({ language, hasExam: true, examType: e.target.value });
  };

  const isValid = !hasExam || (hasExam && examType);

  return (
    <div className="space-y-6">
      <StepHeader heading={`Are you preparing for a ${language} exam?`} />

      <div className="max-w-md mx-auto space-y-3">
        {/* No exam */}
        <Card
          onClick={handleNoExam}
          className={`cursor-pointer p-5 transition-all border-2 hover:border-brand-blue-1/50 ${
            !hasExam
              ? "border-brand-blue-1 bg-brand-blue-3/10"
              : "border-transparent bg-gray-50 dark:bg-card-dark"
          }`}
        >
          <div className="flex items-center gap-3">
            {!hasExam && (
              <CheckCircleIcon className="h-5 w-5 text-brand-blue-1 flex-shrink-0" />
            )}
            <span
              className={`font-medium ${
                !hasExam
                  ? "text-brand-blue-1"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              No, just learning
            </span>
          </div>
        </Card>

        {/* Yes exam */}
        <Card
          onClick={handleYesExam}
          className={`cursor-pointer p-5 transition-all border-2 hover:border-brand-blue-1/50 ${
            hasExam
              ? "border-brand-blue-1 bg-brand-blue-3/10"
              : "border-transparent bg-gray-50 dark:bg-card-dark"
          }`}
        >
          <div className="flex items-center gap-3">
            {hasExam && (
              <CheckCircleIcon className="h-5 w-5 text-brand-blue-1 flex-shrink-0" />
            )}
            <span
              className={`font-medium ${
                hasExam
                  ? "text-brand-blue-1"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              Yes, I have an exam goal
            </span>
          </div>
        </Card>

        {/* Exam type dropdown */}
        {hasExam && exams.length > 0 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Which exam?
            </label>
            <select
              value={examType}
              onChange={handleExamTypeChange}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-blue-1 focus:border-transparent"
            >
              {exams.map((exam) => (
                <option key={exam} value={exam}>
                  {exam}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <StepNavigation
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={!isValid}
      />
    </div>
  );
};

export default ExamStep;
