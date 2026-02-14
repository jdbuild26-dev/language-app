import React from "react";
import { Button } from "@/components/ui/button";

/**
 * StepNavigation — standardized Back / Continue footer for every step.
 */
const StepNavigation = ({
  onBack,
  onContinue,
  continueDisabled = false,
  continueLabel = "Continue",
  showBack = true,
}) => {
  return (
    <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
      {showBack ? (
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ‹ Back
        </Button>
      ) : (
        <div /> /* spacer */
      )}
      <Button onClick={onContinue} disabled={continueDisabled} className="px-8">
        {continueLabel} ›
      </Button>
    </div>
  );
};

export default StepNavigation;
