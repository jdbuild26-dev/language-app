import React from "react";
import StepHeader from "../shared/StepHeader";
import StepNavigation from "../shared/StepNavigation";
import CheckboxCard from "../shared/CheckboxCard";
import { LEARNING_GOALS, LANGUAGES } from "../onboardingData";

/**
 * Step 6: Learning Goals
 * Multi-select checkbox cards. Shows target language flag at top.
 */
const LearningGoalsStep = ({ formData, setFormData, onBack, onContinue }) => {
  const handleToggle = (goal) => {
    setFormData((prev) => {
      const exists = prev.learningGoals.includes(goal);
      return {
        ...prev,
        learningGoals: exists
          ? prev.learningGoals.filter((g) => g !== goal)
          : [...prev.learningGoals, goal],
      };
    });
  };

  // Get flag of the first target language for display
  const primaryLang = formData.targetLanguages[0]?.language;
  const langData = LANGUAGES.find((l) => l.name === primaryLang);
  const flagIcon = langData?.flag || null;

  return (
    <div className="space-y-6">
      <StepHeader
        flagIcon={flagIcon}
        heading="What are your learning goals?"
        subtext="We'll personalise your learning content so you can pick more than one"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
        {LEARNING_GOALS.map((goal) => (
          <CheckboxCard
            key={goal}
            label={goal}
            checked={formData.learningGoals.includes(goal)}
            onChange={() => handleToggle(goal)}
          />
        ))}
      </div>

      <StepNavigation
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={formData.learningGoals.length === 0}
      />
    </div>
  );
};

export default LearningGoalsStep;
