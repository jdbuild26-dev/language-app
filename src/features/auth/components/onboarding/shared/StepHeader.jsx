import React from "react";

/**
 * StepHeader — heading + optional subtext for each onboarding step.
 */
const StepHeader = ({ emoji, heading, subtext, flagIcon }) => {
  return (
    <div className="text-center mb-8">
      {flagIcon && <div className="text-5xl mb-3">{flagIcon}</div>}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
        {emoji && <span className="mr-2">{emoji}</span>}
        {heading}
      </h2>
      {subtext && (
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-sm max-w-md mx-auto">
          {subtext}
        </p>
      )}
    </div>
  );
};

export default StepHeader;
