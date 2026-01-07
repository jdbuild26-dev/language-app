import { useState, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  LanguageIcon,
  AcademicCapIcon,
  BeakerIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createStudentProfile, getPlacementTest } from "@/services/userApi";

const STEPS = {
  TARGET_LANG: 1,
  INSTRUCT_LANG: 2,
  PURPOSE: 3,
  EXAM: 4,
  LEVEL_STRATEGY: 5,
  LEVEL_SELECT: 6,
  PLACEMENT_TEST: 7,
  COMPLETING: 8,
};

export default function StudentOnboardingModal({ onComplete }) {
  const { user } = useUser();
  const { getToken } = useAuth();
  const [step, setStep] = useState(STEPS.TARGET_LANG);
  const [formData, setFormData] = useState({
    targetLanguage: "",
    instructionLanguage: "",
    purpose: [],
    examIntent: { hasExam: false, examType: null },
    level: "",
    levelSource: "", // "beginner", "manual", "test"
  });

  // Placement Test State
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Handlers ---

  const handleNext = () => {
    // Logic for next step routing
    if (step === STEPS.TARGET_LANG && formData.targetLanguage)
      setStep(STEPS.INSTRUCT_LANG);
    else if (step === STEPS.INSTRUCT_LANG && formData.instructionLanguage)
      setStep(STEPS.PURPOSE);
    else if (step === STEPS.PURPOSE && formData.purpose.length > 0)
      setStep(STEPS.EXAM);
    else if (step === STEPS.EXAM) setStep(STEPS.LEVEL_STRATEGY);
    else if (step === STEPS.LEVEL_STRATEGY) {
      if (formData.levelSource === "beginner") {
        // Auto-set A1 and skip to finish
        setFormData((prev) => ({ ...prev, level: "A1" }));
        submitProfile({ ...formData, level: "A1", levelSource: "beginner" });
      } else if (formData.levelSource === "manual") {
        setStep(STEPS.LEVEL_SELECT);
      } else if (formData.levelSource === "test") {
        loadPlacementTest();
        setStep(STEPS.PLACEMENT_TEST);
      }
    } else if (step === STEPS.LEVEL_SELECT && formData.level) {
      submitProfile(formData);
    }
  };

  const handleBack = () => {
    if (step === STEPS.INSTRUCT_LANG) setStep(STEPS.TARGET_LANG);
    else if (step === STEPS.PURPOSE) setStep(STEPS.INSTRUCT_LANG);
    else if (step === STEPS.EXAM) setStep(STEPS.PURPOSE);
    else if (step === STEPS.LEVEL_STRATEGY) setStep(STEPS.EXAM);
    else if (step === STEPS.LEVEL_SELECT) setStep(STEPS.LEVEL_STRATEGY);
    else if (step === STEPS.PLACEMENT_TEST) setStep(STEPS.LEVEL_STRATEGY);
  };

  const loadPlacementTest = async () => {
    try {
      const data = await getPlacementTest(formData.targetLanguage);
      setQuizQuestions(data.questions);
    } catch (err) {
      console.error("Failed to load test", err);
      // Fallback or error state
    }
  };

  const calculatePlacementLevel = () => {
    let score = 0;
    quizQuestions.forEach((q) => {
      if (quizAnswers[q.id] === q.correctAnswer) score++;
    });

    // Simple logic for MVP
    // 0-3: A1, 4-6: A2, 7-8: B1, 9-10: B2
    if (score <= 3) return "A1";
    if (score <= 6) return "A2";
    if (score <= 8) return "B1";
    return "B2";
  };

  const submitPlacementTest = () => {
    const calculatedLevel = calculatePlacementLevel();
    const finalData = {
      ...formData,
      level: calculatedLevel,
      levelSource: "test",
    };
    submitProfile(finalData);
  };

  const submitProfile = async (data) => {
    if (!user) return;
    setIsSubmitting(true);
    setStep(STEPS.COMPLETING);
    try {
      const profileData = {
        clerkUserId: user.id,
        name: user.fullName || user.firstName,
        ...data,
      };
      const token = await getToken();
      await createStudentProfile(profileData, token);
      // Wait a bit for effect
      setTimeout(() => {
        onComplete();
      }, 1500);
    } catch (err) {
      console.error("Submission failed", err);
      setIsSubmitting(false);
      // Handle error (maybe show toast)
    }
  };

  // --- Step Rendering Helpers ---

  const SelectCard = ({
    selected,
    onClick,
    title,
    icon: Icon,
    description,
  }) => (
    <Card
      onClick={onClick}
      className={`cursor-pointer p-6 transition-all border-2 hover:border-brand-blue-1/50 ${
        selected
          ? "border-brand-blue-1 bg-brand-blue-3/10"
          : "border-transparent bg-gray-50 dark:bg-card-dark"
      }`}
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <Icon
            className={`h-8 w-8 ${
              selected ? "text-brand-blue-1" : "text-gray-400"
            }`}
          />
        )}
        <div>
          <h3
            className={`font-semibold text-lg ${
              selected
                ? "text-brand-blue-1"
                : "text-gray-900 dark:text-gray-100"
            }`}
          >
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-500">{description}</p>
          )}
        </div>
        {selected && (
          <CheckCircleIcon className="h-6 w-6 text-brand-blue-1 ml-auto" />
        )}
      </div>
    </Card>
  );

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-body-dark overflow-y-auto">
      <div className="min-h-screen flex flex-col max-w-4xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand-blue-1"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 8) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>Step {step > 6 ? 6 : step} of 6</span>
            <span>Setting up your profile</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* Step 1: Target Language */}
            {step === STEPS.TARGET_LANG && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                  Which language do you want to learn?
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {["French", "German", "Spanish"].map((lang) => (
                    <SelectCard
                      key={lang}
                      title={lang}
                      selected={formData.targetLanguage === lang}
                      onClick={() =>
                        setFormData({ ...formData, targetLanguage: lang })
                      }
                      icon={LanguageIcon}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Instruction Language */}
            {step === STEPS.INSTRUCT_LANG && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                  Preferred language of instruction?
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {["English", "Hindi"].map((lang) => (
                    <SelectCard
                      key={lang}
                      title={lang}
                      selected={formData.instructionLanguage === lang}
                      onClick={() =>
                        setFormData({ ...formData, instructionLanguage: lang })
                      }
                      icon={LanguageIcon}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 3: Purpose */}
            {step === STEPS.PURPOSE && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                  Why are you learning this language?
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {["Travel", "Work", "Exam", "Hobby"].map((purpose) => (
                    <SelectCard
                      key={purpose}
                      title={purpose}
                      selected={formData.purpose.includes(purpose)}
                      onClick={() => {
                        const newPurpose = formData.purpose.includes(purpose)
                          ? formData.purpose.filter((p) => p !== purpose)
                          : [...formData.purpose, purpose];
                        setFormData({ ...formData, purpose: newPurpose });
                      }}
                      icon={RocketLaunchIcon}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 4: Exam Intent */}
            {step === STEPS.EXAM && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 max-w-xl mx-auto w-full"
              >
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                  Are you preparing for an exam?
                </h2>
                <div className="space-y-4">
                  <SelectCard
                    title="No, just learning"
                    selected={!formData.examIntent.hasExam}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        examIntent: { hasExam: false, examType: null },
                      })
                    }
                  />
                  <SelectCard
                    title="Yes, I have an exam goal"
                    selected={formData.examIntent.hasExam}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        examIntent: { ...formData.examIntent, hasExam: true },
                      })
                    }
                  />

                  {formData.examIntent.hasExam && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                    >
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Which exam?
                      </label>
                      <select
                        className="w-full p-3 rounded-lg border border-gray-200 dark:bg-card-dark dark:border-gray-700"
                        value={formData.examIntent.examType || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            examIntent: {
                              ...formData.examIntent,
                              examType: e.target.value,
                            },
                          })
                        }
                      >
                        <option value="">Select Exam</option>
                        <option value="DELF">DELF (French)</option>
                        <option value="DALF">DALF (French)</option>
                        <option value="TEF">TEF (French)</option>
                        <option value="Goethe">Goethe (German)</option>
                        <option value="DELE">DELE (Spanish)</option>
                      </select>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 5: Level Strategy */}
            {step === STEPS.LEVEL_STRATEGY && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                  What's your current level?
                </h2>
                <div className="grid gap-4">
                  <SelectCard
                    title="I am a complete beginner"
                    description="Start from scratch (A1)"
                    selected={formData.levelSource === "beginner"}
                    onClick={() =>
                      setFormData({ ...formData, levelSource: "beginner" })
                    }
                    icon={AcademicCapIcon}
                  />
                  <SelectCard
                    title="I know my level"
                    description="I'll choose manually"
                    selected={formData.levelSource === "manual"}
                    onClick={() =>
                      setFormData({ ...formData, levelSource: "manual" })
                    }
                    icon={CheckCircleIcon}
                  />
                  <SelectCard
                    title="Test my level"
                    description="Take a quick 5-minute quiz"
                    selected={formData.levelSource === "test"}
                    onClick={() =>
                      setFormData({ ...formData, levelSource: "test" })
                    }
                    icon={BeakerIcon}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 6: Manual Level Select */}
            {step === STEPS.LEVEL_SELECT && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                  Select your proficiency level
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {["A1", "A2", "B1", "B2", "C1", "C2"].map((lvl) => (
                    <SelectCard
                      key={lvl}
                      title={lvl}
                      selected={formData.level === lvl}
                      onClick={() => setFormData({ ...formData, level: lvl })}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 7: Placement Test */}
            {step === STEPS.PLACEMENT_TEST && (
              <motion.div
                key="step7"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 max-w-2xl mx-auto"
              >
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                  Placement Test ({formData.targetLanguage})
                </h2>

                {quizQuestions.length === 0 ? (
                  <div className="text-center p-8">Loading test...</div>
                ) : (
                  <div className="space-y-8">
                    {quizQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="bg-gray-50 dark:bg-card-dark p-6 rounded-xl"
                      >
                        <p className="font-semibold mb-4 text-lg">
                          {idx + 1}. {q.question}
                        </p>
                        <div className="space-y-2">
                          {q.options.map((opt) => (
                            <label
                              key={opt}
                              className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                quizAnswers[q.id] === opt
                                  ? "border-brand-blue-1 bg-brand-blue-3/10"
                                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                value={opt}
                                checked={quizAnswers[q.id] === opt}
                                onChange={() =>
                                  setQuizAnswers({
                                    ...quizAnswers,
                                    [q.id]: opt,
                                  })
                                }
                                className="mr-3 text-brand-blue-1 focus:ring-brand-blue-1"
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Completing State */}
            {step === STEPS.COMPLETING && (
              <motion.div
                key="completing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-brand-blue-1 mb-4"></div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Setting up your learning path...
                </h2>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Footer */}
        {step !== STEPS.COMPLETING && (
          <div className="mt-8 flex justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={step === STEPS.TARGET_LANG}
              className={`${step === STEPS.TARGET_LANG ? "invisible" : ""}`}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>

            {step === STEPS.PLACEMENT_TEST ? (
              <Button
                onClick={submitPlacementTest}
                disabled={
                  Object.keys(quizAnswers).length < quizQuestions.length
                }
                className="bg-brand-blue-1 hover:bg-brand-blue-2"
              >
                Submit Test
                <CheckCircleIcon className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={
                  (step === STEPS.TARGET_LANG && !formData.targetLanguage) ||
                  (step === STEPS.INSTRUCT_LANG &&
                    !formData.instructionLanguage) ||
                  (step === STEPS.PURPOSE && formData.purpose.length === 0) ||
                  (step === STEPS.LEVEL_STRATEGY && !formData.levelSource) ||
                  (step === STEPS.LEVEL_SELECT && !formData.level)
                }
                className="bg-brand-blue-1 hover:bg-brand-blue-2"
              >
                {step === STEPS.LEVEL_SELECT ||
                (step === STEPS.LEVEL_STRATEGY &&
                  formData.levelSource === "beginner")
                  ? "Finish Setup"
                  : "Next Step"}
                {step !== STEPS.LEVEL_SELECT &&
                  !(
                    step === STEPS.LEVEL_STRATEGY &&
                    formData.levelSource === "beginner"
                  ) && <ArrowRightIcon className="h-4 w-4 ml-2" />}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
