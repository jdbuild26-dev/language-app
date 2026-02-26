import { useState, useMemo, useEffect } from "react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { createStudentProfile } from "@/services/userApi";
import { useProfile } from "@/contexts/ProfileContext";
import { LANGUAGES, EXAM_MAP } from "../components/onboarding/onboardingData";

// Step components
import WelcomeNameStep from "../components/onboarding/steps/WelcomeNameStep";
import RoleStep from "../components/onboarding/steps/RoleStep";
import TargetLanguageStep from "../components/onboarding/steps/TargetLanguageStep";
import TranslationLanguageStep from "../components/onboarding/steps/TranslationLanguageStep";
import MainReasonStep from "../components/onboarding/steps/MainReasonStep";
import ExamStep from "../components/onboarding/steps/ExamStep";
import InterestsStep from "../components/onboarding/steps/InterestsStep";
import ReferralStep from "../components/onboarding/steps/ReferralStep";
import PricingStep from "../components/onboarding/steps/PricingStep";
import CompletingStep from "../components/onboarding/steps/CompletingStep";

const STEP_IDS = {
    WELCOME: "welcome",
    ROLE: "role",
    TARGET_LANG: "target_lang",
    TRANSLATION: "translation",
    MAIN_REASON: "main_reason",
    EXAM: "exam",
    INTERESTS: "interests",
    REFERRAL: "referral",
    PRICING: "pricing",
    COMPLETING: "completing",
};

const INITIAL_FORM_DATA = {
    name: "",
    role: "student",
    targetLanguages: [],
    translationLanguage: "",
    mainReason: "",
    examIntents: [],
    interests: [],
    referralSource: "",
    pricingPlan: "",
};

export default function StudentOnboardingPage() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { refreshProfiles, switchProfile } = useProfile();

    const [step, setStep] = useState(STEP_IDS.WELCOME);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [examLangIndex, setExamLangIndex] = useState(0);

    // Pre-fill language from URL if present
    useEffect(() => {
        const langFromUrl = searchParams.get("lang");
        if (langFromUrl) {
            setFormData(prev => ({
                ...prev,
                targetLanguages: [{ language: langFromUrl, dialect: null }]
            }));
        }
    }, [searchParams]);

    const examLanguages = useMemo(() => {
        return formData.targetLanguages
            .map((tl) => tl.language)
            .filter((lang) => {
                const langData = LANGUAGES.find((l) => l.name === lang);
                return langData?.hasExams && EXAM_MAP[lang]?.length > 0;
            });
    }, [formData.targetLanguages]);

    const stepSequence = useMemo(() => {
        const base = [
            STEP_IDS.WELCOME,
            STEP_IDS.ROLE,
            STEP_IDS.TARGET_LANG,
            STEP_IDS.TRANSLATION,
            STEP_IDS.MAIN_REASON,
        ];
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
    const totalVisibleSteps = stepSequence.length - 1;
    const progressPercent =
        step === STEP_IDS.COMPLETING
            ? 100
            : Math.round((currentStepIndex / totalVisibleSteps) * 100);

    const goToNextExamOrContinue = () => {
        if (examLangIndex < examLanguages.length - 1) {
            setExamLangIndex(examLangIndex + 1);
        } else {
            setStep(STEP_IDS.INTERESTS);
            setExamLangIndex(0);
        }
    };

    const goToPrevExamOrBack = () => {
        if (examLangIndex > 0) {
            setExamLangIndex(examLangIndex - 1);
        } else {
            setStep(STEP_IDS.MAIN_REASON);
        }
    };

    const handleAfterReason = () => {
        if (examLanguages.length > 0) {
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
            setStep(STEP_IDS.INTERESTS);
        }
    };

    const handleExamUpdate = (intent) => {
        setFormData((prev) => ({
            ...prev,
            examIntents: prev.examIntents.map((e) =>
                e.language === intent.language ? intent : e,
            ),
        }));
    };

    const submitProfile = async () => {
        if (!user) return;
        setIsSubmitting(true);
        setStep(STEP_IDS.COMPLETING);
        try {
            const profileData = {
                clerkUserId: user.id,
                name: formData.name,
                primaryLanguage: formData.targetLanguages[0]?.language || "",
                targetLanguages: formData.targetLanguages,
                translationLanguage: formData.translationLanguage,
                instructionLanguage: formData.translationLanguage, // Use same for now
                mainReason: formData.mainReason,
                learningGoals: [formData.mainReason], // Use mainReason as first goal
                interests: formData.interests,
                examIntents: formData.examIntents,
                referralSource: formData.referralSource,
                pricingPlan: formData.pricingPlan,
                role: "student",
            };
            const token = await getToken();
            const newProfile = await createStudentProfile(profileData, token);

            // Refresh profiles in context
            await refreshProfiles();

            // Wait a small bit for state to settle then switch to the new profile
            if (newProfile) {
                switchProfile(newProfile);
            }

            setTimeout(() => navigate("/dashboard"), 1500);
        } catch (err) {
            console.error("Submission failed", err);
            setIsSubmitting(false);
            setStep(STEP_IDS.REFERRAL);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] flex flex-col items-center">
            <div className="w-full max-w-4xl px-4 py-8">
                {/* Progress Bar */}
                {step !== STEP_IDS.COMPLETING && (
                    <div className="mb-12">
                        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                        <div className="flex justify-between mt-3 text-xs font-bold uppercase tracking-widest text-slate-500">
                            <span>Step {Math.min(currentStepIndex + 1, totalVisibleSteps)} of {totalVisibleSteps}</span>
                            <span className="text-blue-400">Personalizing Experience</span>
                        </div>
                    </div>
                )}

                <div className="flex-1 flex flex-col justify-center min-h-[60vh]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step === STEP_IDS.EXAM ? `exam_${examLangIndex}` : step}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
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
