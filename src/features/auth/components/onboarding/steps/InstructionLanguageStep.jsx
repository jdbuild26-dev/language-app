import React from "react";
import StepHeader from "../shared/StepHeader";
import StepNavigation from "../shared/StepNavigation";
import LanguageGrid from "../shared/LanguageGrid";
import { LANGUAGES, POPULAR_LANGUAGES } from "../onboardingData";

/**
 * Step 4: Instruction Language Selection
 * Single-select from the same language grid.
 */
const InstructionLanguageStep = ({
  formData,
  setFormData,
  onBack,
  onContinue,
}) => {
  const selected = formData.instructionLanguage
    ? [formData.instructionLanguage]
    : [];

  const handleSelect = (newSelected) => {
    setFormData((prev) => ({
      ...prev,
      instructionLanguage: newSelected[0] || "",
    }));
  };

  return (
    <div className="space-y-6">
      <StepHeader
        heading="Preferred language of instruction?"
        subtext="This is the language we'll use to teach you."
      />

      <LanguageGrid
        languages={LANGUAGES}
        popularLanguages={POPULAR_LANGUAGES}
        selected={selected}
        onSelect={handleSelect}
        maxSelections={1}
      />

      <StepNavigation
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={!formData.instructionLanguage}
      />
    </div>
  );
};

export default InstructionLanguageStep;
