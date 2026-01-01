import React from "react";
import {
  AcademicCapIcon,
  BriefcaseIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function RoleSelectionModal({ onSelect }) {
  const RoleCard = ({ role, title, icon: Icon, description, onClick }) => (
    <Card
      onClick={onClick}
      className="cursor-pointer p-8 transition-all border-2 border-transparent hover:border-brand-blue-1/50 hover:bg-brand-blue-3/5 group bg-gray-50 dark:bg-card-dark"
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="p-4 rounded-full bg-white dark:bg-gray-800 shadow-sm group-hover:scale-110 transition-transform">
          <Icon className="h-12 w-12 text-brand-blue-1" />
        </div>
        <div>
          <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-gray-100">
            {title}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-body-dark overflow-y-auto">
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl w-full space-y-12"
        >
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Welcome! How will you use the app?
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Choose your primary role to get started. You can add the other
              role later.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            <RoleCard
              role="student"
              title="I am a Student"
              description="I want to learn languages, take lessons, and practice with AI."
              icon={AcademicCapIcon}
              onClick={() => onSelect("student")}
            />
            <RoleCard
              role="teacher"
              title="I am a Teacher"
              description="I want to manage students, assign tasks, and track progress."
              icon={BriefcaseIcon}
              onClick={() => onSelect("teacher")}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
