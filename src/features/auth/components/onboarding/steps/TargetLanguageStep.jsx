import React from "react";
import StepHeader from "../shared/StepHeader";
import StepNavigation from "../shared/StepNavigation";
import LanguageGrid from "../shared/LanguageGrid";
import DialectPicker from "../shared/DialectPicker";
import { LANGUAGES, POPULAR_LANGUAGES } from "../onboardingData";

/**
 * Step 2: Target Language Selection
 * Multi-select (max 2), with dialect picker for languages that have dialects.
 */
const TargetLanguageStep = ({ formData, setFormData, onBack, onContinue }) => {
  const selectedNames = formData.targetLanguages.map((tl) => tl.language);

  const handleLanguageSelect = (newSelected) => {
    // Build targetLanguages array, preserving existing dialect selections
    const updated = newSelected.map((langName) => {
      const existing = formData.targetLanguages.find(
        (tl) => tl.language === langName,
      );
      return existing || { language: langName, dialect: null };
    });
    setFormData((prev) => ({ ...prev, targetLanguages: updated }));
  };

  const handleDialectSelect = (language, dialect) => {
    setFormData((prev) => ({
      ...prev,
      targetLanguages: prev.targetLanguages.map((tl) =>
        tl.language === language ? { ...tl, dialect } : tl,
      ),
    }));
  };

  // Find languages with dialects that are currently selected
  const selectedWithDialects = formData.targetLanguages
    .map((tl) => {
      const langData = LANGUAGES.find((l) => l.name === tl.language);
      return langData && langData.dialects && langData.dialects.length > 0
        ? { ...tl, dialects: langData.dialects }
        : null;
    })
    .filter(Boolean);

  const isValid =
    formData.targetLanguages.length >= 1 &&
    // If any selected language has dialects, ensure a dialect is picked
    selectedWithDialects.every((tl) => {
      const match = formData.targetLanguages.find(
        (t) => t.language === tl.language,
      );
      return match && match.dialect;
    });

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

      {/* Dialect pickers for selected languages that have them */}
      {selectedWithDialects.map((tl) => (
        <DialectPicker
          key={tl.language}
          language={tl.language}
          dialects={tl.dialects}
          selected={
            formData.targetLanguages.find((t) => t.language === tl.language)
              ?.dialect || null
          }
          onSelect={(dialect) => handleDialectSelect(tl.language, dialect)}
        />
      ))}

      <StepNavigation
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={!isValid}
      />
    </div>
  );
};

export default TargetLanguageStep;
