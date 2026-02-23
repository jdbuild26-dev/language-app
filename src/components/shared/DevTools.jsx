import React, { useState, useEffect } from "react";
import { Database, FileSpreadsheet, Settings } from "lucide-react";

const DevTools = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [useMockCsv, setUseMockCsv] = useState(false);

  useEffect(() => {
    // Check local storage on mount
    const isMock = localStorage.getItem("USE_MOCK_CSV_DATA") === "true";
    setUseMockCsv(isMock);
  }, []);

  const toggleMockCsv = () => {
    const newValue = !useMockCsv;
    setUseMockCsv(newValue);
    localStorage.setItem("USE_MOCK_CSV_DATA", String(newValue));
    // Reload to apply changes across the app
    window.location.reload();
  };

  // Only show in development if you prefer, but we'll show it based on an env var or unconditionally for this task
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 w-64 transition-all duration-200 ease-in-out transform origin-bottom-right">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Dev Tools
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                {useMockCsv ? (
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Database className="w-4 h-4 text-blue-500" />
                )}
                Data Source
              </span>
              <button
                onClick={toggleMockCsv}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                  useMockCsv
                    ? "bg-emerald-500"
                    : "bg-slate-300 dark:bg-slate-600"
                }`}
              >
                <span className="sr-only">Toggle Mock CSV Data</span>
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    useMockCsv ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              {useMockCsv
                ? "Currently using local CSV files for vocabulary practice."
                : "Currently using the backend API for vocabulary practice."}
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-800 hover:bg-slate-700 text-white p-3 rounded-full shadow-lg transition-colors flex items-center justify-center"
          title="Open Dev Tools"
        >
          <Settings className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default DevTools;
