/**
 * Hardcoded data constants for the student onboarding flow v2.
 * All lists, options, and mappings used across onboarding steps.
 */

// ─── Languages ─────────────────────────────────────────────

export const LANGUAGES = [
  { name: "Arabic", flag: "🇦🇪", hasExams: false, dialects: [] },
  {
    name: "Chinese",
    flag: "🇨🇳",
    hasExams: false,
    dialects: ["Simplified Chinese", "Traditional Chinese"],
  },
  { name: "Croatian", flag: "🇭🇷", hasExams: false, dialects: [] },
  { name: "Czech", flag: "🇨🇿", hasExams: false, dialects: [] },
  { name: "Danish", flag: "🇩🇰", hasExams: false, dialects: [] },
  { name: "Dutch", flag: "🇳🇱", hasExams: false, dialects: [] },
  {
    name: "English",
    flag: "🇬🇧",
    hasExams: true,
    dialects: ["American English", "British English"],
  },
  { name: "Finnish", flag: "🇫🇮", hasExams: false, dialects: [] },
  { name: "French", flag: "🇫🇷", hasExams: true, dialects: [] },
  { name: "German", flag: "🇩🇪", hasExams: true, dialects: [] },
  { name: "Greek", flag: "🇬🇷", hasExams: false, dialects: [] },
  { name: "Hindi", flag: "🇮🇳", hasExams: false, dialects: [] },
  { name: "Hungarian", flag: "🇭🇺", hasExams: false, dialects: [] },
  { name: "Indonesian", flag: "🇮🇩", hasExams: false, dialects: [] },
  { name: "Italian", flag: "🇮🇹", hasExams: false, dialects: [] },
  { name: "Japanese", flag: "🇯🇵", hasExams: true, dialects: [] },
  { name: "Korean", flag: "🇰🇷", hasExams: false, dialects: [] },
  { name: "Norwegian", flag: "🇳🇴", hasExams: false, dialects: [] },
  { name: "Polish", flag: "🇵🇱", hasExams: false, dialects: [] },
  {
    name: "Portuguese",
    flag: "🇵🇹",
    hasExams: false,
    dialects: ["Brazilian Portuguese", "European Portuguese"],
  },
  { name: "Romanian", flag: "🇷🇴", hasExams: false, dialects: [] },
  { name: "Russian", flag: "🇷🇺", hasExams: false, dialects: [] },
  {
    name: "Spanish",
    flag: "🇪🇸",
    hasExams: true,
    dialects: ["Latin American Spanish", "Castilian Spanish (Spain)"],
  },
  { name: "Swedish", flag: "🇸🇪", hasExams: false, dialects: [] },
  { name: "Thai", flag: "🇹🇭", hasExams: false, dialects: [] },
  { name: "Turkish", flag: "🇹🇷", hasExams: false, dialects: [] },
  { name: "Ukrainian", flag: "🇺🇦", hasExams: false, dialects: [] },
  { name: "Vietnamese", flag: "🇻🇳", hasExams: false, dialects: [] },
];

export const POPULAR_LANGUAGES = [
  "Spanish",
  "English",
  "French",
  "German",
  "Italian",
];

// ─── Translation-specific languages (includes regional variants) ───

export const TRANSLATION_LANGUAGES = [
  { name: "Arabic", flag: "🇦🇪" },
  { name: "Chinese (Simplified)", flag: "🇨🇳" },
  { name: "Chinese (Traditional)", flag: "🇹🇼" },
  { name: "Croatian", flag: "🇭🇷" },
  { name: "Czech", flag: "🇨🇿" },
  { name: "Danish", flag: "🇩🇰" },
  { name: "Dutch", flag: "🇳🇱" },
  { name: "English (American)", flag: "🇺🇸" },
  { name: "English (British)", flag: "🇬🇧" },
  { name: "Finnish", flag: "🇫🇮" },
  { name: "French", flag: "🇫🇷" },
  { name: "German", flag: "🇩🇪" },
  { name: "Greek", flag: "🇬🇷" },
  { name: "Hindi", flag: "🇮🇳" },
  { name: "Hungarian", flag: "🇭🇺" },
  { name: "Indonesian", flag: "🇮🇩" },
  { name: "Italian", flag: "🇮🇹" },
  { name: "Japanese", flag: "🇯🇵" },
  { name: "Korean", flag: "🇰🇷" },
  { name: "Norwegian", flag: "🇳🇴" },
  { name: "Polish", flag: "🇵🇱" },
  { name: "Portuguese (Brazilian)", flag: "🇧🇷" },
  { name: "Portuguese (European)", flag: "🇵🇹" },
  { name: "Romanian", flag: "🇷🇴" },
  { name: "Russian", flag: "🇷🇺" },
  { name: "Spanish (European)", flag: "🇪🇸" },
  { name: "Spanish (Latin American)", flag: "🇲🇽" },
  { name: "Swedish", flag: "🇸🇪" },
  { name: "Thai", flag: "🇹🇭" },
  { name: "Turkish", flag: "🇹🇷" },
  { name: "Ukrainian", flag: "🇺🇦" },
  { name: "Vietnamese", flag: "🇻🇳" },
];

export const POPULAR_TRANSLATION_LANGUAGES = [
  "English (American)",
  "English (British)",
  "Spanish (European)",
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
