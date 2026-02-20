import React from "react";
import StepHeader from "../shared/StepHeader";
import StepNavigation from "../shared/StepNavigation";
import LanguageGrid from "../shared/LanguageGrid";
import { LANGUAGES, POPULAR_LANGUAGES } from "../onboardingData";

/**
 * Step 2: Target Language Selection
 * Multi-select (max 2).
 */
const TargetLanguageStep = ({ formData, setFormData, onBack, onContinue }) => {
  const selectedNames = formData.targetLanguages.map((tl) => tl.language);

  const handleLanguageSelect = (newSelected) => {
    // Build targetLanguages array
    const updated = newSelected.map((langName) => ({
      language: langName,
      dialect: null,
    }));
    setFormData((prev) => ({ ...prev, targetLanguages: updated }));
  };

  const isValid = formData.targetLanguages.length >= 1;

  return (
    <div className="space-y-6">
      <StepHeader
        heading="What language do you want to learn?"
        subtext="If you're learning more than one, select your main focus. You can pick up to 2."
      />

      <LanguageGrid
        languages={LANGUAGES}
        popularLanguages={POPULAR_LANGUAGES}
        selected={selectedNames}
        onSelect={handleLanguageSelect}
        maxSelections={2}
      />

      <StepNavigation
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={!isValid}
      />
    </div>
  );
};

export default TargetLanguageStep;
