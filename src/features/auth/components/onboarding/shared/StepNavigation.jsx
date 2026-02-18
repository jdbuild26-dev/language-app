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
  isLoading = false,
}) => {
  return (
    <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
      {showBack ? (
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isLoading}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ‹ Back
        </Button>
      ) : (
        <div /> /* spacer */
      )}
      <Button
        onClick={onContinue}
        disabled={continueDisabled || isLoading}
        className="px-8 flex items-center gap-2"
      >
        {isLoading && (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )}
        {continueLabel} {!isLoading && "›"}
      </Button>
    </div>
  );
};

export default StepNavigation;
