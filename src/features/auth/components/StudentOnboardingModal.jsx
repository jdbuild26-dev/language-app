import { useState, useMemo } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { createStudentProfile } from "@/services/userApi";
import { LANGUAGES, EXAM_MAP } from "./onboarding/onboardingData";

// Step components
import WelcomeNameStep from "./onboarding/steps/WelcomeNameStep";
import RoleStep from "./onboarding/steps/RoleStep";
import TargetLanguageStep from "./onboarding/steps/TargetLanguageStep";
import TranslationLanguageStep from "./onboarding/steps/TranslationLanguageStep";
import MainReasonStep from "./onboarding/steps/MainReasonStep";
import ExamStep from "./onboarding/steps/ExamStep";
import InterestsStep from "./onboarding/steps/InterestsStep";
import ReferralStep from "./onboarding/steps/ReferralStep";
import PricingStep from "./onboarding/steps/PricingStep";
import CompletingStep from "./onboarding/steps/CompletingStep";

/**
 * Step IDs — fixed IDs for the core steps.
 * Exam steps (7a, 7b, …) are dynamically inserted.
 */
const STEP_IDS = {
  WELCOME: "welcome", // Step 1
  ROLE: "role", // Step 2
  TARGET_LANG: "target_lang", // Step 3
  TRANSLATION: "translation", // Step 4
  MAIN_REASON: "main_reason", // Step 5
  EXAM: "exam", // Step 6 (dynamic per-language)
  INTERESTS: "interests", // Step 7
  REFERRAL: "referral", // Step 8
  PRICING: "pricing", // Step 9
  COMPLETING: "completing", // Step 10
};

const INITIAL_FORM_DATA = {
  name: "",
  role: "", // "student" or "teacher"
  targetLanguages: [], // [{ language: string, dialect: string|null }]
  translationLanguage: "",
  mainReason: "",
  examIntents: [], // [{ language, hasExam, examType }]
  interests: [],
  referralSource: "",
  pricingPlan: "",
};

export default function StudentOnboardingModal({ onComplete }) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [step, setStep] = useState(STEP_IDS.WELCOME);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For multi-language exam flow: which exam-language are we on?
  const [examLangIndex, setExamLangIndex] = useState(0);

  // ─── Derived: which target languages have exams ───
  const examLanguages = useMemo(() => {
    return formData.targetLanguages
      .map((tl) => tl.language)
      .filter((lang) => {
        const langData = LANGUAGES.find((l) => l.name === lang);
        return langData?.hasExams && EXAM_MAP[lang]?.length > 0;
      });
  }, [formData.targetLanguages]);

  // ─── Build dynamic step list for progress bar ───
  const stepSequence = useMemo(() => {
    const base = [
      STEP_IDS.WELCOME,
      STEP_IDS.ROLE,
      STEP_IDS.TARGET_LANG,
      STEP_IDS.TRANSLATION,
      STEP_IDS.MAIN_REASON,
    ];
    // Insert one exam step per exam-eligible language
    examLanguages.forEach((_, i) => base.push(`exam_${i}`));
    base.push(
      STEP_IDS.INTERESTS,
      STEP_IDS.REFERRAL,
      STEP_IDS.PRICING,
      STEP_IDS.COMPLETING,
    );
    return base;
  }, [examLanguages]);

  const currentStepIndex = stepSequence.indexOf(
    step.startsWith("exam") ? `exam_${examLangIndex}` : step,
  );
  const totalVisibleSteps = stepSequence.length - 1; // exclude COMPLETING
  const progressPercent =
    step === STEP_IDS.COMPLETING
      ? 100
      : Math.round((currentStepIndex / totalVisibleSteps) * 100);

  // ─── Navigation helpers ───

  const goToNextExamOrContinue = () => {
    if (examLangIndex < examLanguages.length - 1) {
      // More exam languages remaining
      setExamLangIndex(examLangIndex + 1);
      // step stays as EXAM (re-render with next lang)
    } else {
      // All exam languages done → interests
      setStep(STEP_IDS.INTERESTS);
      setExamLangIndex(0);
    }
  };

  const goToPrevExamOrBack = () => {
    if (examLangIndex > 0) {
      setExamLangIndex(examLangIndex - 1);
    } else {
      // Back before first exam → main reason
      setStep(STEP_IDS.MAIN_REASON);
    }
  };

  const handleAfterReason = () => {
    if (examLanguages.length > 0) {
      // Initialize exam intents for each exam language
      setFormData((prev) => ({
        ...prev,
        examIntents: examLanguages.map((lang) => {
          const existing = prev.examIntents.find((e) => e.language === lang);
          return existing || { language: lang, hasExam: false, examType: null };
        }),
      }));
      setExamLangIndex(0);
      setStep(STEP_IDS.EXAM);
    } else {
      // No exam-eligible languages → skip to interests
      setStep(STEP_IDS.INTERESTS);
    }
  };

  // ─── Exam intent updater ───
  const handleExamUpdate = (intent) => {
    setFormData((prev) => ({
      ...prev,
      examIntents: prev.examIntents.map((e) =>
        e.language === intent.language ? intent : e,
      ),
    }));
  };

  // ─── Submit ───
  const submitProfile = async () => {
    if (!user) return;
    setIsSubmitting(true);
    setStep(STEP_IDS.COMPLETING);
    try {
      const profileData = {
        clerkUserId: user.id,
        name: formData.name,
        targetLanguages: formData.targetLanguages,
        // Legacy fields for backward compatibility with current backend
        targetLanguage: formData.targetLanguages[0]?.language || "",
        purpose: [],
        examIntent: formData.examIntents[0] || {
          language: "",
          hasExam: false,
          examType: null,
        },

        translationLanguage: formData.translationLanguage,
        instructionLanguage: "",
        mainReason: formData.mainReason,
        learningGoals: [],
        examIntents: formData.examIntents,
        interests: formData.interests,
        referralSource: formData.referralSource,
        pricingPlan: formData.pricingPlan,
        level: "A1",
        levelSource: "beginner",
        role: formData.role,
      };
      const token = await getToken();
      await createStudentProfile(profileData, token);
      setTimeout(() => onComplete(), 1500);
    } catch (err) {
      console.error("Submission failed", err);
      setIsSubmitting(false);
      setStep(STEP_IDS.REFERRAL); // return to last step on error
    }
  };

  // ─── Render ───
  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-body-dark overflow-y-auto">
      <div className="min-h-screen flex flex-col max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        {step !== STEP_IDS.COMPLETING && (
          <div className="mb-8">
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-brand-blue-1"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>
                Step {Math.min(currentStepIndex + 1, totalVisibleSteps)} of{" "}
                {totalVisibleSteps}
              </span>
              <span>Setting up your profile</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={step === STEP_IDS.EXAM ? `exam_${examLangIndex}` : step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {step === STEP_IDS.WELCOME && (
                <WelcomeNameStep
                  formData={formData}
                  setFormData={setFormData}
                  onContinue={() => setStep(STEP_IDS.ROLE)}
                />
              )}

              {step === STEP_IDS.ROLE && (
                <RoleStep
                  formData={formData}
                  setFormData={setFormData}
                  onBack={() => setStep(STEP_IDS.WELCOME)}
                  onContinue={() => setStep(STEP_IDS.TARGET_LANG)}
                />
              )}

              {step === STEP_IDS.TARGET_LANG && (
                <TargetLanguageStep
                  formData={formData}
                  setFormData={setFormData}
                  onBack={() => setStep(STEP_IDS.ROLE)}
                  onContinue={() => setStep(STEP_IDS.TRANSLATION)}
                />
              )}

              {step === STEP_IDS.TRANSLATION && (
                <TranslationLanguageStep
                  formData={formData}
                  setFormData={setFormData}
                  onBack={() => setStep(STEP_IDS.TARGET_LANG)}
                  onContinue={() => setStep(STEP_IDS.MAIN_REASON)}
                />
              )}

              {step === STEP_IDS.MAIN_REASON && (
                <MainReasonStep
                  formData={formData}
                  setFormData={setFormData}
                  onBack={() => setStep(STEP_IDS.TRANSLATION)}
                  onContinue={handleAfterReason}
                />
              )}

              {step === STEP_IDS.EXAM && examLanguages.length > 0 && (
                <ExamStep
                  language={examLanguages[examLangIndex]}
                  examIntent={formData.examIntents.find(
                    (e) => e.language === examLanguages[examLangIndex],
                  )}
                  onUpdate={handleExamUpdate}
                  onBack={goToPrevExamOrBack}
                  onContinue={goToNextExamOrContinue}
                />
              )}

              {step === STEP_IDS.INTERESTS && (
                <InterestsStep
                  formData={formData}
                  setFormData={setFormData}
                  onBack={() => {
                    if (examLanguages.length > 0) {
                      setExamLangIndex(examLanguages.length - 1);
                      setStep(STEP_IDS.EXAM);
                    } else {
                      setStep(STEP_IDS.MAIN_REASON);
                    }
                  }}
                  onContinue={() => setStep(STEP_IDS.REFERRAL)}
                />
              )}

              {step === STEP_IDS.REFERRAL && (
                <ReferralStep
                  formData={formData}
                  setFormData={setFormData}
                  onBack={() => setStep(STEP_IDS.INTERESTS)}
                  onComplete={() => setStep(STEP_IDS.PRICING)}
                />
              )}

              {step === STEP_IDS.PRICING && (
                <PricingStep
                  formData={formData}
                  setFormData={setFormData}
                  onBack={() => setStep(STEP_IDS.REFERRAL)}
                  onContinue={submitProfile}
                />
              )}

              {step === STEP_IDS.COMPLETING && <CompletingStep />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
