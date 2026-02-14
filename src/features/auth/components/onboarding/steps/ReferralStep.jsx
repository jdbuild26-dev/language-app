import React from "react";
import StepHeader from "../shared/StepHeader";
import StepNavigation from "../shared/StepNavigation";
import IconSelectCard from "../shared/IconSelectCard";
import { REFERRAL_SOURCES } from "../onboardingData";

/**
 * Step 9: Referral Source
 * Single-select icon cards. Final step before submission.
 */
const ReferralStep = ({ formData, setFormData, onBack, onComplete }) => {
  const handleSelect = (sourceId) => {
    setFormData((prev) => ({ ...prev, referralSource: sourceId }));
  };

  return (
    <div className="space-y-6">
      <StepHeader
        heading="How did you find out about us?"
        subtext="Your answer to this last Q will help us grow – thank you."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {REFERRAL_SOURCES.map((source) => (
          <IconSelectCard
            key={source.id}
            icon={source.icon}
            label={source.label}
            selected={formData.referralSource === source.id}
            onClick={() => handleSelect(source.id)}
          />
        ))}
      </div>

      <StepNavigation
        onBack={onBack}
        onContinue={onComplete}
        continueDisabled={!formData.referralSource}
        continueLabel="✓ Complete Setup"
      />
    </div>
  );
};

export default ReferralStep;
