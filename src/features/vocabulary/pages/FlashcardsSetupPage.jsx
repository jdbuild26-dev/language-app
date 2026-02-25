import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchCategoriesByLevel } from "@/services/vocabularyApi";

export default function FlashcardsSetupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Selection State
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);

  // Dropdown options
  const [cardCount, setCardCount] = useState("20");

  // Data State
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSubCategories, setAvailableSubCategories] = useState([]);

  // Fetch Categories on mount
  useEffect(() => {
    async function loadCategories() {
      setLoading(true);
      try {
        const data = await fetchCategoriesByLevel();
        if (data && data.categories) {
          setAvailableCategories(data.categories);
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  // Update SubCategories when Category changes
  useEffect(() => {
    if (!selectedCategory) {
      setAvailableSubCategories([]);
      return;
    }

    // Find the selected category object
    const categoryObj = availableCategories.find(
      (c) => c.name === selectedCategory,
    );
    if (categoryObj && categoryObj.subcategories) {
      setAvailableSubCategories(categoryObj.subcategories);
      setSelectedSubCategories([]);
    }
  }, [selectedCategory, availableCategories]);

  // Handle SubCategory Toggle
  const toggleSubCategory = (subCat) => {
    if (subCat === "All") {
      if (selectedSubCategories.length === availableSubCategories.length) {
        setSelectedSubCategories([]);
      } else {
        setSelectedSubCategories([...availableSubCategories]);
      }
      return;
    }

    setSelectedSubCategories((prev) => {
      if (prev.includes(subCat)) {
        return prev.filter((s) => s !== subCat);
      } else {
        return [...prev, subCat];
      }
    });
  };

  const handleStart = () => {
    // Navigate to game page with Query Params
    const params = new URLSearchParams();
    if (selectedCategory) params.append("category", selectedCategory);
    selectedSubCategories.forEach((sc) => params.append("sub_category", sc));

    // Other settings
    params.append("count", cardCount);

    navigate(
      `/vocabulary/lessons/activities/flashcards/game?${params.toString()}`,
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/vocabulary/lessons/activities"
          className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Flashcards Setup
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Configure your learning session
          </p>
        </div>
      </div>

      {/* Custom Word List Banner */}
      <div className="bg-red-700 text-white p-4 rounded-lg shadow-sm">
        <p className="font-semibold">
          Custom word list selection coming soon...
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 space-y-10">
        {/* 1. Category Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Select Category:
          </h3>
          {loading ? (
            <div className="text-slate-400 italic">Loading categories...</div>
          ) : availableCategories.length === 0 ? (
            <div className="text-slate-400 italic">
              No categories available.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {availableCategories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all border",
                    selectedCategory === cat.name
                      ? "border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300"
                      : "border-slate-200 dark:border-slate-800 hover:border-sky-300 hover:bg-slate-50 dark:hover:bg-slate-800/50",
                  )}
                >
                  <span className="font-medium truncate">{cat.name}</span>
                  {selectedCategory === cat.name && (
                    <Check className="w-4 h-4 text-sky-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Sub-Category Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Select Sub-Category:
          </h3>
          {!selectedCategory ? (
            <div className="text-slate-400 italic">Select a category first</div>
          ) : availableSubCategories.length === 0 ? (
            <div className="text-slate-400 italic">
              No sub-categories available for this category
            </div>
          ) : (
            <div className="space-y-3">
              {/* Select All Option */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={cn(
                    "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                    selectedSubCategories.length ===
                      availableSubCategories.length &&
                      availableSubCategories.length > 0
                      ? "bg-sky-500 border-sky-500"
                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-sky-400",
                  )}
                >
                  {selectedSubCategories.length ===
                    availableSubCategories.length &&
                    availableSubCategories.length > 0 && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={
                    selectedSubCategories.length ===
                    availableSubCategories.length
                  }
                  onChange={() => toggleSubCategory("All")}
                />
                <span className="text-slate-700 dark:text-slate-300 font-medium">
                  All
                </span>
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
                {availableSubCategories.map((sub) => (
                  <label
                    key={sub}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded border flex items-center justify-center transition-colors",
                        selectedSubCategories.includes(sub)
                          ? "bg-sky-500 border-sky-500"
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-sky-400",
                      )}
                    >
                      {selectedSubCategories.includes(sub) && (
                        <Check className="w-3.5 h-3.5 text-white" />
                      )}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selectedSubCategories.includes(sub)}
                      onChange={() => toggleSubCategory(sub)}
                    />
                    <span className="text-slate-600 dark:text-slate-400">
                      {sub}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Settings Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Number of Cards */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Number of cards:
            </label>
            <div className="relative">
              <select
                value={cardCount}
                onChange={(e) => setCardCount(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="15">15</option>
                <option value="20">20</option>
                <option value="25">25</option>
                <option value="30">30</option>
                <option value="40">40</option>
                <option value="50">50</option>
                <option value="All">All (&lt;15)</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-4">
          <button
            onClick={handleStart}
            disabled={!selectedCategory}
            className="w-full md:w-auto px-12 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-lg shadow-red-200 dark:shadow-red-900/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
