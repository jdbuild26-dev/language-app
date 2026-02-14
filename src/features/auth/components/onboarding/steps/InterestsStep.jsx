import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/solid";
import StepHeader from "../shared/StepHeader";
import StepNavigation from "../shared/StepNavigation";
import InterestBubble from "../shared/InterestBubble";
import { INTERESTS } from "../onboardingData";

/**
 * Step 8: Interests
 * Bubble/pill tags with custom add + validation (≥ 3).
 */
const InterestsStep = ({ formData, setFormData, onBack, onContinue }) => {
  const [customInput, setCustomInput] = useState("");

  const handleToggle = (interest) => {
    setFormData((prev) => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists
          ? prev.interests.filter((i) => i !== interest)
          : [...prev.interests, interest],
      };
    });
  };

  const handleAddCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !formData.interests.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        interests: [...prev.interests, trimmed],
      }));
      setCustomInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustom();
    }
  };

  // Merge default interests with any custom ones the user added
  const allInterests = [
    ...INTERESTS,
    ...formData.interests.filter((i) => !INTERESTS.includes(i)),
  ];

  return (
    <div className="space-y-6">
      <StepHeader
        heading="What are your interests?"
        subtext="Select at least 3 topics you enjoy discussing."
      />

      <div className="flex flex-wrap gap-3 justify-center">
        {allInterests.map((interest) => (
          <InterestBubble
            key={interest}
            label={interest}
            selected={formData.interests.includes(interest)}
            onClick={() => handleToggle(interest)}
          />
        ))}
      </div>

      {/* Custom interest input */}
      <div className="flex items-center gap-2 max-w-sm mx-auto">
        <Input
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Interest not listed? Add it here."
          className="text-sm"
        />
        <Button
          size="icon"
          variant="outline"
          onClick={handleAddCustom}
          disabled={!customInput.trim()}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-center text-xs text-gray-400">
        {formData.interests.length} of 3 minimum selected
      </p>

      <StepNavigation
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={formData.interests.length < 3}
      />
    </div>
  );
};

export default InterestsStep;
