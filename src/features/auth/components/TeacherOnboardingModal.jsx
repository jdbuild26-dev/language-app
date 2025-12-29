import { useState } from "react";
import { createPortal } from "react-dom";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  LanguageIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  UserGroupIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createTeacherProfile } from "@/services/userApi";

const STEPS = {
  TEACHING_LANG: 1,
  INSTRUCT_LANG: 2,
  EXPERIENCE: 3,
  COMPLETING: 4,
};

export default function TeacherOnboardingModal({ onComplete }) {
  const { user } = useUser();
  const [step, setStep] = useState(STEPS.TEACHING_LANG);
  const [formData, setFormData] = useState({
    teachingLanguages: [],
    instructionLanguage: "",
    experience: {
      years: 0,
      studentsTaught: 0,
      hoursTaught: 0,
    },
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Handlers ---

  const handleNext = () => {
    if (step === STEPS.TEACHING_LANG && formData.teachingLanguages.length > 0)
      setStep(STEPS.INSTRUCT_LANG);
    else if (step === STEPS.INSTRUCT_LANG && formData.instructionLanguage)
      setStep(STEPS.EXPERIENCE);
    else if (step === STEPS.EXPERIENCE) {
      submitProfile(formData);
    }
  };

  const handleBack = () => {
    if (step === STEPS.INSTRUCT_LANG) setStep(STEPS.TEACHING_LANG);
    else if (step === STEPS.EXPERIENCE) setStep(STEPS.INSTRUCT_LANG);
  };

  const submitProfile = async (data) => {
    if (!user) return;
    setIsSubmitting(true);
    setStep(STEPS.COMPLETING);
    try {
      const profileData = {
        clerkUserId: user.id,
        ...data,
      };
      await createTeacherProfile(profileData);
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

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-white dark:bg-body-dark overflow-y-auto">
      <div className="min-h-screen flex flex-col max-w-4xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-brand-blue-1"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-500">
            <span>Step {step > 3 ? 3 : step} of 3</span>
            <span>Setting up your teacher profile</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {/* Step 1: Teaching Languages */}
            {step === STEPS.TEACHING_LANG && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                  Which language(s) do you teach?
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {["French", "German", "Spanish", "English"].map((lang) => (
                    <SelectCard
                      key={lang}
                      title={lang}
                      selected={formData.teachingLanguages.includes(lang)}
                      onClick={() => {
                        const newLangs = formData.teachingLanguages.includes(
                          lang
                        )
                          ? formData.teachingLanguages.filter((l) => l !== lang)
                          : [...formData.teachingLanguages, lang];
                        setFormData({
                          ...formData,
                          teachingLanguages: newLangs,
                        });
                      }}
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
                  {["English", "Hindi", "French", "German", "Spanish"].map(
                    (lang) => (
                      <SelectCard
                        key={lang}
                        title={lang}
                        selected={formData.instructionLanguage === lang}
                        onClick={() =>
                          setFormData({
                            ...formData,
                            instructionLanguage: lang,
                          })
                        }
                        icon={LanguageIcon}
                      />
                    )
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 3: Experience */}
            {step === STEPS.EXPERIENCE && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 max-w-xl mx-auto w-full"
              >
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                  Tell us about your experience
                </h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <BriefcaseIcon className="h-4 w-4" />
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full p-3 rounded-lg border border-gray-200 dark:bg-card-dark dark:border-gray-700"
                      value={formData.experience.years}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          experience: {
                            ...formData.experience,
                            years: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <UserGroupIcon className="h-4 w-4" />
                      Approx. Students Taught
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full p-3 rounded-lg border border-gray-200 dark:bg-card-dark dark:border-gray-700"
                      value={formData.experience.studentsTaught}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          experience: {
                            ...formData.experience,
                            studentsTaught: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <ClockIcon className="h-4 w-4" />
                      Approx. Teaching Hours
                    </label>
                    <input
                      type="number"
                      min="0"
                      className="w-full p-3 rounded-lg border border-gray-200 dark:bg-card-dark dark:border-gray-700"
                      value={formData.experience.hoursTaught}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          experience: {
                            ...formData.experience,
                            hoursTaught: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                    />
                  </div>
                </div>
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
                  Creating your teacher profile...
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
              disabled={step === STEPS.TEACHING_LANG}
              className={`${step === STEPS.TEACHING_LANG ? "invisible" : ""}`}
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={
                (step === STEPS.TEACHING_LANG &&
                  formData.teachingLanguages.length === 0) ||
                (step === STEPS.INSTRUCT_LANG && !formData.instructionLanguage)
              }
              className="bg-brand-blue-1 hover:bg-brand-blue-2"
            >
              {step === STEPS.EXPERIENCE ? "Finish Setup" : "Next Step"}
              {step !== STEPS.EXPERIENCE && (
                <ArrowRightIcon className="h-4 w-4 ml-2" />
              )}
            </Button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
