import React from "react";
import { motion } from "framer-motion";

/**
 * Step 10: Completing / Loading
 * Spinner animation while the profile is being submitted.
 */
const CompletingStep = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 space-y-6">
      {/* Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 border-4 border-brand-blue-1 border-t-transparent rounded-full"
      />

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-lg font-medium text-gray-600 dark:text-gray-300"
      >
        Setting up your learning path…
      </motion.p>
    </div>
  );
};

export default CompletingStep;
