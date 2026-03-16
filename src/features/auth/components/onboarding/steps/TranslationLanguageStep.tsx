import React from "react";
import StepHeader from "@/features/auth/components/onboarding/shared/StepHeader";
import StepNavigation from "@/features/auth/components/onboarding/shared/StepNavigation";
import LanguageGrid from "@/features/auth/components/onboarding/shared/LanguageGrid";
import {
  TRANSLATION_LANGUAGES,
  POPULAR_TRANSLATION_LANGUAGES,
} from "@/features/auth/components/onboarding/onboardingData";

/**
 * Step 3: Translation Language Selection
 * Single-select, includes regional variants (e.g., "English (American)").
 */
const TranslationLanguageStep = ({
  formData,
  setFormData,
  onBack,
  onContinue,
}) => {
  const selected = formData.translationLanguage
    ? [formData.translationLanguage]
    : [];

  const handleSelect = (newSelected) => {
    setFormData((prev) => ({
      ...prev,
      translationLanguage: newSelected[0] || "",
    }));
  };

  return (
    <div className="space-y-6">
      <StepHeader
        heading="What language should we show translations in?"
        subtext="Typically your native language."
      />

      <LanguageGrid
        languages={TRANSLATION_LANGUAGES}
        popularLanguages={POPULAR_TRANSLATION_LANGUAGES}
        selected={selected}
        onSelect={handleSelect}
        maxSelections={1}
      />

      <StepNavigation
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={!formData.translationLanguage}
      />
    </div>
  );
};

export default TranslationLanguageStep;
