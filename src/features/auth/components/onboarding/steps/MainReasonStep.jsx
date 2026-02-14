import React from "react";
import StepHeader from "../shared/StepHeader";
import StepNavigation from "../shared/StepNavigation";
import IconSelectCard from "../shared/IconSelectCard";
import { MAIN_REASONS } from "../onboardingData";

/**
 * Step 5: Main Reason for Learning
 * Single-select icon cards.
 */
const MainReasonStep = ({ formData, setFormData, onBack, onContinue }) => {
  const handleSelect = (reasonId) => {
    setFormData((prev) => ({ ...prev, mainReason: reasonId }));
  };

  return (
    <div className="space-y-6">
      <StepHeader
        emoji="🧡"
        heading="What's your main reason for learning?"
        subtext="This helps us personalize your experience."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {MAIN_REASONS.map((reason) => (
          <IconSelectCard
            key={reason.id}
            icon={reason.icon}
            label={reason.label}
            selected={formData.mainReason === reason.id}
            onClick={() => handleSelect(reason.id)}
          />
        ))}
      </div>

      <StepNavigation
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={!formData.mainReason}
      />
    </div>
  );
};

export default MainReasonStep;
