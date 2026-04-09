import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AssignButton from "@/components/shared/AssignButton";
import { normalizeSlug } from "@/lib/assignmentSlugUtils";

export default function CarouselCard({
  title,
  subtitle,
  image,
  to,
  className = "",
  assignable = false,
  exerciseType = "vocabulary",
  exerciseSlug,
}) {
  const CardContent = (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow dark:bg-slate-800 border border-gray-100 dark:border-slate-700 h-full w-[280px] shrink-0 ${className}`}
    >
      <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-slate-700">
        {image ? (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-400 dark:text-slate-500">
            <span className="text-4xl">📷</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          {subtitle && (
            <div className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-slate-400">
              <span className="inline-block h-2 w-2 rounded-full bg-gray-300 dark:bg-slate-600"></span>
              {subtitle}
            </div>
          )}
          <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
            {title}
          </h3>
        </div>

        <div className="mt-4 flex items-center justify-end text-sky-500 transition-colors group-hover:text-sky-600 dark:text-sky-400 dark:group-hover:text-sky-300">
          <ArrowRight className="h-5 w-5 transform transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </div>
  );

  // Derive a clean slug: prefer explicit exerciseSlug, then normalize from path/title
  const resolvedSlug = exerciseSlug ?? normalizeSlug(to || title);

  return (
    <div className="relative group h-full">
      {assignable && (
        <AssignButton
          exerciseType={exerciseType}
          exerciseSlug={resolvedSlug}
          exerciseTitle={title}
          className="top-3 right-3"
        />
      )}
      {to ? (
        <Link href={to} className="block h-full">
          {CardContent}
        </Link>
      ) : (
        CardContent
      )}
    </div>
  );
}
