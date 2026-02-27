import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function NumberInputControls({ onNumberChange }) {
  const [mode, setMode] = useState("random"); // 'random' or 'exact'
  const [exactVal, setExactVal] = useState("");
  const [fromVal, setFromVal] = useState("");
  const [toVal, setToVal] = useState("");

  const sanitizeInput = (val) => {
    // Only digits, remove commas/dots/alphabets
    let sanitized = val.replace(/[^0-9]/g, "");
    if (sanitized !== "") {
      // restrict to max 99999999
      const num = parseInt(sanitized, 10);
      if (num > 99999999) sanitized = "99999999";
    }
    return sanitized;
  };

  const handleExactChange = (e) => {
    const val = sanitizeInput(e.target.value);
    setExactVal(val);
    if (val !== "") {
      onNumberChange(parseInt(val, 10));
    } else {
      onNumberChange(null);
    }
  };

  const handleRandomize = () => {
    let min = parseInt(fromVal, 10);
    let max = parseInt(toVal, 10);

    // Default values if empty
    if (isNaN(min)) min = 0;
    if (isNaN(max)) max = 9999;

    if (min > max) {
      const temp = min;
      min = max;
      max = temp;
    }

    // Generate random number
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    onNumberChange(randomNum);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-2 sm:p-3 rounded-2xl sm:rounded-full border-2 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row gap-3 sm:gap-4 items-center w-full md:w-auto">
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl sm:rounded-full w-full sm:w-auto overflow-hidden">
        <button
          onClick={() => setMode("random")}
          className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-bold rounded-lg sm:rounded-full transition-all duration-200 ${mode === "random" ? "bg-white dark:bg-slate-800 shadow-sm text-sky-600 dark:text-sky-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
        >
          Range
        </button>
        <button
          onClick={() => setMode("exact")}
          className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-bold rounded-lg sm:rounded-full transition-all duration-200 ${mode === "exact" ? "bg-white dark:bg-slate-800 shadow-sm text-sky-600 dark:text-sky-400" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"}`}
        >
          Exact
        </button>
      </div>

      {mode === "random" ? (
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 hidden sm:inline">
              From
            </span>
            <Input
              value={fromVal}
              onChange={(e) => setFromVal(sanitizeInput(e.target.value))}
              placeholder="0"
              className="w-full sm:w-20 md:w-24 h-9 font-mono text-center border-slate-200 focus-visible:ring-sky-500"
              maxLength={8}
            />
          </div>
          <div className="flex items-center gap-2 flex-1 sm:flex-none">
            <span className="text-sm font-bold text-slate-400 dark:text-slate-500 hidden sm:inline">
              To
            </span>
            <Input
              value={toVal}
              onChange={(e) => setToVal(sanitizeInput(e.target.value))}
              placeholder="9999"
              className="w-full sm:w-20 md:w-24 h-9 font-mono text-center border-slate-200 focus-visible:ring-sky-500"
              maxLength={8}
            />
          </div>
          <Button
            onClick={handleRandomize}
            className="h-9 w-full sm:w-auto bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl sm:rounded-full px-6 shadow-sm hover:shadow active:scale-95 transition-all"
          >
            Randomize
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-sm font-bold text-slate-400 dark:text-slate-500 hidden sm:inline">
            Number
          </span>
          <Input
            value={exactVal}
            onChange={handleExactChange}
            placeholder="Type exact number..."
            className="w-full sm:w-48 h-9 font-mono border-slate-200 focus-visible:ring-sky-500"
            maxLength={8}
          />
        </div>
      )}
    </div>
  );
}
