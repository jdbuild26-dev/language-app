import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Construction, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Reusable placeholder component for exercises that are coming soon
 */
export default function ExercisePlaceholder({
  exerciseId,
  title,
  description,
  icon,
  skillType = "Reading",
  features = [],
}) {
  const navigate = useNavigate();

  const defaultFeatures = [
    "Timer-based challenges",
    "CEFR level progression (A1-C2)",
    "Progress tracking",
    "Audio/TTS support",
  ];

  const displayFeatures = features.length > 0 ? features : defaultFeatures;

  const skillColors = {
    Reading: "from-blue-500 to-indigo-600",
    Listening: "from-purple-500 to-pink-600",
    Writing: "from-emerald-500 to-teal-600",
    Speaking: "from-orange-500 to-red-600",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-700/50">
        <Button
          variant="ghost"
          onClick={() => navigate("/practice")}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Practice
        </Button>
        <span className="text-slate-500 text-sm font-mono">{exerciseId}</span>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-lg w-full text-center space-y-8">
          {/* Icon */}
          <div
            className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br ${skillColors[skillType] || skillColors.Reading} shadow-lg shadow-blue-500/20`}
          >
            <span className="text-5xl">{icon}</span>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Construction className="w-5 h-5 text-amber-500" />
              <span className="text-amber-500 font-semibold uppercase text-sm tracking-wider">
                Coming Soon
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">{title}</h1>
            <p className="text-slate-400 text-lg">{description}</p>
          </div>

          {/* Skill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800 border border-slate-700">
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span className="text-slate-300 font-medium">{skillType}</span>
          </div>

          {/* Planned Features */}
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 text-left">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Planned Features
            </h3>
            <ul className="space-y-3">
              {displayFeatures.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-center gap-3 text-slate-300"
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <Button
            onClick={() => navigate("/practice")}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-6 text-lg font-semibold rounded-xl shadow-lg shadow-blue-500/25"
          >
            Explore Other Exercises
          </Button>
        </div>
      </div>
    </div>
  );
}
