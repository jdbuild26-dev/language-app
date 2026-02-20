import React from "react";
import { motion } from "framer-motion";
import StepHeader from "../shared/StepHeader";
import StepNavigation from "../shared/StepNavigation";

const ROLE_OPTIONS = [
  { id: "student", label: "Student", icon: "👨‍🎓" },
  { id: "teacher", label: "Teacher", icon: "👩‍🏫" },
];

const RoleStep = ({ formData, setFormData, onBack, onContinue }) => {
  const handleSelect = (roleId) => {
    setFormData((prev) => ({ ...prev, role: roleId }));
  };

  return (
    <div className="space-y-6">
      <StepHeader
        heading={`Hi ${formData.name || "there"}, what brings you here?`}
        subtext="Are you signing up as a student or a teacher?"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
        {ROLE_OPTIONS.map((option) => {
          const isSelected = formData.role === option.id;
          return (
            <motion.button
              key={option.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(option.id)}
              className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 transition-all duration-200 ${
                isSelected
                  ? "border-brand-blue-1 bg-brand-blue-1/5 shadow-brand-blue-1/20 shadow-lg"
                  : "border-gray-200 dark:border-gray-700 hover:border-brand-blue-1/50 bg-white dark:bg-card-dark"
              }`}
            >
              <span className="text-5xl mb-4">{option.icon}</span>
              <span
                className={`text-xl font-medium ${
                  isSelected
                    ? "text-brand-blue-1"
                    : "text-gray-700 dark:text-gray-200"
                }`}
              >
                {option.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <StepNavigation
        onBack={onBack}
        onContinue={onContinue}
        continueDisabled={!formData.role}
      />
    </div>
  );
};

export default RoleStep;
