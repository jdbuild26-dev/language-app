import React from "react";
import { motion } from "framer-motion";
import StepHeader from "../shared/StepHeader";
import StepNavigation from "../shared/StepNavigation";

const PRICING_PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0/mo",
    features: ["Personalized path", "Basic exercises"],
    color: "from-gray-400 to-gray-500",
    shadow: "shadow-gray-400/20",
    border: "border-gray-400",
    textHover: "text-gray-500",
    bgHover:
      "hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-600 dark:hover:text-gray-300",
  },
  {
    id: "plus",
    name: "Plus",
    price: "$9.99/mo",
    features: ["Personalized path", "Basic exercises", "Progress tracking"],
    color: "from-blue-400 to-blue-600",
    shadow: "shadow-blue-500/20",
    border: "border-blue-500",
    textHover: "text-blue-500",
    bgHover:
      "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400",
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19.99/mo",
    features: [
      "Everything in Plus",
      "Speaking practice",
      "Tutor feedback",
      "AI Conversations",
    ],
    color: "from-purple-500 to-indigo-600",
    shadow: "shadow-purple-500/30",
    border: "border-purple-500",
    isPopular: true,
    textHover: "text-purple-500",
    bgHover:
      "hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400",
  },
  {
    id: "max",
    name: "Max",
    price: "$29.99/mo",
    features: [
      "Everything in Pro",
      "Unlimited 1-on-1 tutoring",
      "Certification exam prep",
    ],
    color: "from-amber-400 to-orange-500",
    shadow: "shadow-orange-500/20",
    border: "border-orange-500",
    textHover: "text-orange-500",
    bgHover:
      "hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400",
  },
];

const PricingStep = ({ formData, setFormData, onBack, onContinue }) => {
  const handleSelect = (planId) => {
    setFormData((prev) => ({ ...prev, pricingPlan: planId }));
  };

  return (
    <div className="space-y-8">
      <StepHeader
        heading="Choose your learning journey"
        subtext="Select the plan that fits your goals. Upgrade or cancel anytime."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {PRICING_PLANS.map((plan) => {
          const isSelected = formData.pricingPlan === plan.id;

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(plan.id)}
              className={`relative cursor-pointer rounded-2xl transition-all duration-300
                ${
                  isSelected
                    ? `border-2 bg-gradient-to-br shadow-2xl ${plan.shadow} ${plan.border}`
                    : `border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark shadow-md hover:shadow-xl`
                }
              `}
              style={{
                // Subtle glowing border effect for selected state
                padding: "1px",
                background: isSelected ? undefined : "",
              }}
            >
              {isSelected && (
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${plan.color} opacity-20`}
                />
              )}

              <div
                className={`
                relative h-full rounded-2xl p-6 flex flex-col justify-between z-10
                ${isSelected ? "bg-white dark:bg-[#1a1c23]" : "bg-transparent"}
              `}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full shadow-lg whitespace-nowrap">
                    MOST POPULAR
                  </div>
                )}

                <div>
                  <h3
                    className={`text-2xl font-black mb-2 transition-colors ${isSelected ? plan.textHover : "text-gray-900 dark:text-white"}`}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline mb-6">
                    <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                  </div>

                  <div className="space-y-4">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start">
                        <svg
                          className={`w-5 h-5 mr-3 flex-shrink-0 mt-0.5 ${isSelected ? plan.textHover : "text-gray-400 dark:text-gray-500"}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        <span className="text-gray-600 dark:text-gray-300 text-sm leading-tight font-medium">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div
                  className={`
                  mt-8 w-full py-3 rounded-xl text-center font-bold transition-all
                  ${
                    isSelected
                      ? `bg-gradient-to-r ${plan.color} text-white shadow-md`
                      : `bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 ${plan.bgHover}`
                  }
                `}
                >
                  {isSelected ? "Selected" : "Select Plan"}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="pt-4">
        <StepNavigation
          onBack={onBack}
          onContinue={onContinue}
          continueDisabled={!formData.pricingPlan}
          continueLabel="Next"
        />
      </div>
    </div>
  );
};

export default PricingStep;
