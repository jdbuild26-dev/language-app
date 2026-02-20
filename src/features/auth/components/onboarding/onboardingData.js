/**
 * Hardcoded data constants for the student onboarding flow v2.
 * All lists, options, and mappings used across onboarding steps.
 */

// ─── Languages ─────────────────────────────────────────────

export const LANGUAGES = [
  {
    name: "English",
    flag: "🇬🇧",
    hasExams: true,
    dialects: [],
  },
  { name: "French", flag: "🇫🇷", hasExams: true, dialects: [] },
  { name: "German", flag: "🇩🇪", hasExams: true, dialects: [] },
];

export const POPULAR_LANGUAGES = ["English", "French", "German"];

// ─── Translation-specific languages (includes regional variants) ───

export const TRANSLATION_LANGUAGES = [
  { name: "English (American)", flag: "🇺🇸" },
  { name: "English (British)", flag: "🇬🇧" },
  { name: "French", flag: "🇫🇷" },
  { name: "German", flag: "🇩🇪" },
];

export const POPULAR_TRANSLATION_LANGUAGES = [
  "English (American)",
  "English (British)",
  "French",
  "German",
];

// ─── Exams per language ────────────────────────────────────

export const EXAM_MAP = {
  French: ["DELF (French)", "DALF (French)", "TCF (French)"],
  German: ["Goethe-Zertifikat (German)"],
  Spanish: ["DELE (Spanish)"],
  English: ["IELTS", "TOEFL", "Cambridge (FCE/CAE/CPE)"],
  Japanese: ["JLPT (Japanese)"],
};

// ─── Step 5 — Main Reason for Learning ─────────────────────

export const MAIN_REASONS = [
  { id: "travel", label: "Travel", icon: "✈️" },
  { id: "work", label: "Work / Career", icon: "💼" },
  { id: "exams", label: "Exams / Study", icon: "📚" },
  { id: "fun", label: "Fun / Personal Interest", icon: "😊" },
  { id: "living_abroad", label: "Living abroad / integration", icon: "🏡" },
  { id: "family", label: "Family / Friends", icon: "❤️" },
  { id: "other", label: "Other", icon: "❓" },
];

// ─── Step 6 — Learning Goals ───────────────────────────────

export const LEARNING_GOALS = [
  "I'm moving abroad or travelling",
  "I want to have fun & keep my brain sharp",
  "I want to connect with friends & family",
  "I'm learning for another reason",
  "I'm learning for work or school",
];

// ─── Step 8 — Interests ────────────────────────────────────

export const INTERESTS = [
  "Animals & Pets 🐾",
  "Art 🎨",
  "Books & Literature 📚",
  "Business & Entrepreneurship 💼",
  "Cinema & Movies 🎬",
  "Economics 📈",
  "Education 🎓",
  "Food & Dining 🍽",
  "Football ⚽",
  "Gardening 🌱",
  "Geography 🌍",
  "Geopolitics 🌐",
  "Health & Wellness 💪",
  "History 🏛",
  "Music 🎵",
  "Philosophy 🤔",
  "Politics 🏛",
  "Psychology 🧠",
  "Science 🔬",
  "Sports & Fitness 🏅",
  "Technology 💻",
  "Travel ✈️",
];

// ─── Step 9 — Referral Sources ─────────────────────────────

export const REFERRAL_SOURCES = [
  { id: "teacher", label: "Teacher / Youtuber", icon: "👩‍🏫" },
  { id: "family", label: "Family / Friends", icon: "👨‍👩‍👧" },
  { id: "social", label: "Social Media", icon: "📱" },
  { id: "google", label: "Google Search", icon: "🔍" },
  { id: "other", label: "Other", icon: "💡" },
  { id: "ai", label: "Suggestion from AI", icon: "🤖" },
  { id: "youtube_ad", label: "YouTube Ad", icon: "▶️" },
];
