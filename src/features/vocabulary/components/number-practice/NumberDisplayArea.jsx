import React from "react";

export default function NumberDisplayArea({ number }) {
  if (number === null || number === undefined || isNaN(number)) {
    return (
      <div className="text-slate-300 dark:text-slate-600 text-xl font-medium text-center max-w-xs">
        Enter an exact number or press Randomize to begin
      </div>
    );
  }

  // Format with spaces for readability (French style)
  const formattedNumber = number
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");

  return (
    <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-slate-800 dark:text-slate-100 tracking-tighter text-center break-words leading-none">
      {formattedNumber}
    </div>
  );
}
