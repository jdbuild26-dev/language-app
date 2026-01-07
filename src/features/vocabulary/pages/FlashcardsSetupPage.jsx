import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, ChevronDown, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  fetchAvailableLevels,
  fetchCategoriesByLevel,
  fetchUserProgressStats,
  fetchVocabulary,
} from "@/services/vocabularyApi";
import { useUser, useAuth } from "@clerk/clerk-react";

const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

export default function FlashcardsSetupPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(false);

  // Selection State
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);

  // Dropdown options
  const [practiceMode, setPracticeMode] = useState("All");
  const [cardCount, setCardCount] = useState("20");
  const [frontFace, setFrontFace] = useState("French (Read)");

  // Data State
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableSubCategories, setAvailableSubCategories] = useState([]);
  const [filteredWordCount, setFilteredWordCount] = useState({
    all: 0,
    dontKnow: 0,
    know: 0,
    mastered: 0,
    untested: 0,
  });

  // Fetch Categories when Level changes
  useEffect(() => {
    async function loadCategories() {
      if (selectedLevel === "All") {
        // Fetch all categories from level A1 first as default or fetch all?
        // Current API fetches by level. Let's fetch categories for all levels or implement 'All' logic later.
        // For now, let's just clear categories if 'All' is selected or maybe fetch topics.
        // Re-reading requirements: "Select CEFR level: All / A1..."
        // If All is selected, show all categories?
        // Let's implement specific level logic first as it's cleaner.
        setAvailableCategories([]);
        return;
      }

      setLoading(true);
      try {
        const data = await fetchCategoriesByLevel(selectedLevel);
        if (data && data.categories) {
          setAvailableCategories(data.categories);
        }
      } catch (error) {
        console.error("Failed to load categories", error);
      } finally {
        setLoading(false);
      }
    }

    // Reset downstream selections
    setSelectedCategory(null);
    setSelectedSubCategories([]);

    loadCategories();
  }, [selectedLevel]);

  // Update SubCategories when Category changes
  useEffect(() => {
    if (!selectedCategory) {
      setAvailableSubCategories([]);
      return;
    }

    // Find the selected category object
    const categoryObj = availableCategories.find(
      (c) => c.name === selectedCategory
    );
    if (categoryObj && categoryObj.subcategories) {
      setAvailableSubCategories(categoryObj.subcategories);
      // Default select all subcategories? Or none? Image shows all elected if 'Select Sub-Category' has logic.
      // Logic: "If I select all - then all get ticked". Let's start with empty or logic to select all.
      // Let's default to selecting NONE so user chooses, or ALL for convenience.
      // "This will ALL (option) + The items on the excel..."
      // Let's initialize with empty but show 'All' option.
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

  // Fetch Stats & Total Count
  useEffect(() => {
    async function loadData() {
      // 1. Fetch Total Available Words (for "All" and "Untested")
      // We perform this even if user not logged in, to show available cards count.
      let totalAvailable = 0;
      try {
        const vocabData = await fetchVocabulary({
          level: selectedLevel !== "All" ? selectedLevel : undefined,
          category: selectedCategory || undefined,
          subCategory:
            selectedSubCategories.length > 0
              ? selectedSubCategories
              : undefined,
        });
        if (vocabData && vocabData.count) {
          totalAvailable = vocabData.count;
        }
      } catch (err) {
        console.error("Failed to fetch vocabulary count", err);
      }

      // 2. Fetch User Progress (if logged in)
      if (!user) {
        setFilteredWordCount({
          all: totalAvailable,
          dontKnow: 0,
          know: 0,
          mastered: 0,
          untested: totalAvailable,
        });
        return;
      }

      try {
        const token = await getToken();
        const stats = await fetchUserProgressStats({
          token,
          level: selectedLevel !== "All" ? selectedLevel : undefined,
          category: selectedCategory || undefined,
          subCategory:
            selectedSubCategories.length > 0
              ? selectedSubCategories
              : undefined,
        });

        if (stats) {
          setFilteredWordCount({
            all: totalAvailable,
            dontKnow: stats.unknown,
            know: stats.known,
            mastered: stats.mastered,
            untested: Math.max(0, totalAvailable - stats.total),
          });
        }
      } catch (error) {
        console.error("Failed to load stats", error);
        // Fallback to just showing total available
        setFilteredWordCount({
          all: totalAvailable,
          dontKnow: 0,
          know: 0,
          mastered: 0,
          untested: totalAvailable,
        });
      }
    }
    loadData();
  }, [user, selectedLevel, selectedCategory, selectedSubCategories, getToken]);

  const handleStart = () => {
    // Navigate to game page with Query Params
    const params = new URLSearchParams();
    if (selectedLevel !== "All") params.append("level", selectedLevel);
    if (selectedCategory) params.append("category", selectedCategory);
    selectedSubCategories.forEach((sc) => params.append("sub_category", sc));

    // Other settings
    params.append("mode", practiceMode);
    params.append("count", cardCount);
    params.append("front", frontFace);

    navigate(
      `/vocabulary/lessons/activities/flashcards/game?${params.toString()}`
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
        {/* 1. CEFR Level Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Select CEFR level:
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedLevel("All")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                selectedLevel === "All"
                  ? "bg-sky-500 text-white shadow-md ring-2 ring-sky-200 dark:ring-sky-900"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              )}
            >
              All
            </button>
            {CEFR_LEVELS.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  selectedLevel === level
                    ? "bg-sky-500 text-white shadow-md ring-2 ring-sky-200 dark:ring-sky-900"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Category Selection */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Select Category:
          </h3>
          {loading ? (
            <div className="text-slate-400 italic">Loading categories...</div>
          ) : availableCategories.length === 0 ? (
            <div className="text-slate-400 italic">
              Select a CEFR level to see categories
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
                      : "border-slate-200 dark:border-slate-800 hover:border-sky-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
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

        {/* 3. Sub-Category Selection */}
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
                      : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-sky-400"
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
                          : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-sky-400"
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

        {/* 4. Stats Summary */}
        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-6 border border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">
                All
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {filteredWordCount.all}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-orange-500 mb-1">
                Don't Know
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {filteredWordCount.dontKnow}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-emerald-500 mb-1">
                Know
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {filteredWordCount.know}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-blue-500 mb-1">
                Mastered
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {filteredWordCount.mastered}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-400 mb-1">
                Untested
              </div>
              <div className="text-2xl font-bold text-slate-800 dark:text-white">
                {filteredWordCount.untested}
              </div>
            </div>
          </div>
        </div>

        {/* 5. Settings Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Practice Mode */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Practice:
            </label>
            <div className="relative">
              <select
                value={practiceMode}
                onChange={(e) => setPracticeMode(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="All">All</option>
                <option value="Don't Know">Don't Know</option>
                <option value="Know">Know</option>
                <option value="Mastered">Mastered</option>
                <option value="Untested">Untested</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>

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

          {/* Front Face */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
              Front:
            </label>
            <div className="relative">
              <select
                value={frontFace}
                onChange={(e) => setFrontFace(e.target.value)}
                className="w-full appearance-none bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 py-3 px-4 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="French (Read)">French (Read)</option>
                <option value="French (Listen)">French (Listen)</option>
                <option value="English">English</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Start Button */}
        <div className="pt-4">
          <button
            onClick={handleStart}
            disabled={!selectedCategory && selectedLevel !== "All"}
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
