import React from "react";
import { useUser } from "@clerk/clerk-react";
import { Input } from "@/components/ui/input";
import StepHeader from "../shared/StepHeader";
import StepNavigation from "../shared/StepNavigation";

/**
 * Step 1: Welcome + First Name
 * Prefills name from Clerk user data if available.
 */
const WelcomeNameStep = ({ formData, setFormData, onContinue }) => {
  const { user } = useUser();

  // Prefill on first render if name is empty
  React.useEffect(() => {
    if (!formData.name && user) {
      const prefillName = user.firstName || user.fullName || "";
      if (prefillName) {
        setFormData((prev) => ({ ...prev, name: prefillName }));
      }
    }
  }, [user]);

  return (
    <div className="space-y-6">
      <StepHeader
        heading="Welcome! To get started and tailor Langua to your needs, let's answer some quick questions."
        subtext="It'll only take a moment."
      />

      <div className="max-w-sm mx-auto space-y-3">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          What's your first name?
        </label>
        <Input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter your name"
          className="text-center text-lg"
          autoFocus
        />
      </div>

      <StepNavigation
        showBack={false}
        onContinue={onContinue}
        continueDisabled={!formData.name.trim()}
      />
    </div>
  );
};

export default WelcomeNameStep;
