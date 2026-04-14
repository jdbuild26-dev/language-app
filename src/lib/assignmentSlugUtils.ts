/**
 * Canonical slug map: maps every possible exerciseSlug (from any entry point)
 * to its route path for navigation.
 *
 * Slugs come from:
 *  - exercise list pages (activity.id / exercise.id) — kebab-case or short ids
 *  - practice/page.tsx (activity.typeSlug) — underscore_case DB slugs
 *  - CarouselCard (path extracted from `to` prop)
 */

export type ExerciseType = "vocabulary" | "grammar" | "practice";

// ─── Vocabulary ───────────────────────────────────────────────────────────────
const VOCAB_SLUG_MAP: Record<string, string> = {
  // from PracticeContent activity.id (kebab-case)
  "read-select":        "/vocabulary/practice/choose-options",
  "highlight-word":     "/vocabulary/practice/highlight-word",
  "odd-one-out":        "/vocabulary/practice/odd-one-out",
  "group-words":        "/vocabulary/practice/group-words",
  "fill-blank":         "/vocabulary/practice/fill-in-blank",
  "correct-spelling":   "/vocabulary/practice/correct-spelling",
  "dictation-image":    "/vocabulary/practice/dictation-image",
  "is-french-word":     "/vocabulary/practice/is-french-word",
  "repeat-word":        "/vocabulary/practice/repeat-word",
  "repeat-sentence":    "/vocabulary/practice/repeat-sentence",
  "what-do-you-see":    "/vocabulary/practice/what-do-you-see",
  "phonetics":          "/vocabulary/practice/listening/phonetics",
  "multi-select":       "/vocabulary/practice/listening/multi-select",
  "audio-match-2":      "/vocabulary/practice/listening/audio-to-audio",
  "audio-fill-blank":   "/vocabulary/practice/listening/fill-in-blank",
  "dictation":          "/vocabulary/practice/listening/dictation",
  "listen-fill-blanks": "/vocabulary/practice/listening/fill-blanks",

  // from DB / underscore slugs
  "choose_options":     "/vocabulary/practice/choose-options",
  "highlight_word":     "/vocabulary/practice/highlight-word",
  "odd_one_out":        "/vocabulary/practice/odd-one-out",
  "group_words":        "/vocabulary/practice/group-words",
  "fill_blank_typed":   "/vocabulary/practice/fill-in-blank",
  "correct_spelling":   "/vocabulary/practice/correct-spelling",
  "is_french_word":     "/vocabulary/practice/is-french-word",
  "spell_word":         "/vocabulary/practice/correct-spelling",
  "repeat_word":        "/vocabulary/practice/repeat-word",
  "repeat_sentence":    "/vocabulary/practice/repeat-sentence",
  "what_do_you_see":    "/vocabulary/practice/what-do-you-see",
  "dictation_image":    "/vocabulary/practice/dictation-image",
  "audio_to_audio":     "/vocabulary/practice/listening/audio-to-audio",
  "listen_phonetics":   "/vocabulary/practice/listening/phonetics",
  "phonetics__what_do_you_hear": "/vocabulary/practice/listening/phonetics",
};

// ─── Grammar ──────────────────────────────────────────────────────────────────
const GRAMMAR_SLUG_MAP: Record<string, string> = {
  // from GrammarPracticePage exercise.id (kebab-case)
  "fill-blanks-options":  "/grammar/practice/fill-blanks-options",
  "four-options":         "/grammar/practice/four-options",
  "two-options":          "/grammar/practice/two-options",
  "three-options":        "/grammar/practice/three-options",
  "fill-blanks":          "/grammar/practice/fill-blanks",
  "fill-blanks-question": "/grammar/practice/fill-blanks-question",
  "reorder-words":        "/grammar/practice/reorder-words",
  "transformation":       "/grammar/practice/transformation",
  "rewrite":              "/grammar/practice/rewrite",
  "combination":          "/grammar/practice/combination",
  "find-error":           "/grammar/practice/find-error",
  "ai-check":             "/grammar/practice/ai-check",

  // from DB / underscore slugs
  "four_options":           "/grammar/practice/four-options",
  "three_options":          "/grammar/practice/three-options",
  "two_options":            "/grammar/practice/two-options",
  "fill_blanks_options":    "/grammar/practice/fill-blanks-options",
  "grammar_find_error":     "/grammar/practice/find-error",
  "grammar_reorder":        "/grammar/practice/reorder-words",
  "grammar_transformation": "/grammar/practice/transformation",
  "grammar_combination":    "/grammar/practice/combination",
  "grammar_rewrite":        "/grammar/practice/rewrite",
  "listen_fill_blanks":     "/grammar/practice/fill-blanks",
  "fill_blanks":            "/grammar/practice/fill-blanks",
};

// ─── Practice (Reading / Listening / Writing / Speaking) ─────────────────────
const PRACTICE_SLUG_MAP: Record<string, string> = {
  // Reading
  "translate_bubbles":         "/practice/reading/bubble-selection",
  "highlight_text":            "/practice/reading/highlight-text",
  "diagram_mapping":           "/practice/reading/diagram-labelling",
  "image_mcq":                 "/practice/reading/image-mcq",
  "match_desc_to_image":       "/practice/reading/match-desc-to-image",
  "image_labelling":           "/practice/reading/image-labelling",
  "passage_mcq":               "/practice/reading/comprehension",
  "complete_passage_dropdown": "/practice/reading/fill-blanks-passage",
  "fill_blanks_passage":       "/practice/reading/fill-blanks-passage",
  "fill_blanks":               "/practice/reading/fill-blanks-passage",
  "reorder_sentences":         "/practice/reading/reorder",
  "reorder_sentence":          "/practice/reading/reorder",
  "conversation_dialogue":     "/practice/reading/conversation",
  "sentence_completion":       "/practice/reading/sentence-completion",
  "match_sentence_ending":     "/practice/reading/complete-passage",
  "bubble_selection":          "/practice/reading/bubble-selection",

  // Listening
  "listen_select":               "/practice/listening/select",
  "type_what_you_hear":          "/practice/listening/type",
  "listen_fill_blanks_dropdown": "/practice/listening/audio-fill-blanks-dropdown",
  "listen_bubble":               "/practice/listening/bubble",
  "listen_order":                "/practice/listening/order",
  "listen_passage":              "/practice/listening/passage",
  "listen_interactive":          "/practice/listening/interactive",
  "listening_comprehension":     "/practice/listening/comprehension",
  "listening_conversation":      "/practice/listening/conversation",

  // Writing
  "translate_typed":           "/practice/fill-in-blank",
  "write_fill_blanks":         "/practice/fill-in-blank",
  "write_topic":               "/practice/writing",
  "write_image":               "/practice/writing",
  "write_documents":           "/practice/writing",
  "write_form":                "/practice/writing",
  "write_interactive":         "/practice/writing",
  "write_analysis":            "/practice/writing",
  "sentence_completion_write": "/practice/reading/sentence-completion",

  // Speaking
  "speak_translate":   "/practice/speaking/translate",
  "speak_topic":       "/practice/speaking/topic",
  "speak_image":       "/practice/speaking/image",
  "speak_interactive": "/practice/speaking/interactive",
};

/**
 * Resolve a slug + type to a navigation path.
 * Cross-checks all maps so a wrong stored type still resolves correctly.
 */
export function resolveAssignmentPath(slug: string, type: ExerciseType): string {
  if (slug.startsWith("/")) return slug;

  // Check type-specific map first
  if (type === "vocabulary" && VOCAB_SLUG_MAP[slug]) return VOCAB_SLUG_MAP[slug];
  if (type === "grammar"    && GRAMMAR_SLUG_MAP[slug]) return GRAMMAR_SLUG_MAP[slug];
  if (type === "practice"   && PRACTICE_SLUG_MAP[slug]) return PRACTICE_SLUG_MAP[slug];

  // Cross-check all maps (handles wrong stored type)
  if (VOCAB_SLUG_MAP[slug])    return VOCAB_SLUG_MAP[slug];
  if (GRAMMAR_SLUG_MAP[slug])  return GRAMMAR_SLUG_MAP[slug];
  if (PRACTICE_SLUG_MAP[slug]) return PRACTICE_SLUG_MAP[slug];

  // Fallback: normalize and build from type
  const normalized = slug.replace(/_/g, "-");
  if (type === "vocabulary") return `/vocabulary/practice/${normalized}`;
  if (type === "grammar") return `/grammar/practice/${normalized.replace(/^grammar-/, "")}`;
  return `/practice/reading/${normalized}`;
}

/**
 * Normalize a slug from an exercise page before storing in DB.
 * Converts kebab-case UI ids to canonical underscore DB slugs.
 */
const KEBAB_TO_DB: Record<string, string> = {
  // Vocabulary
  "read-select":        "choose_options",
  "highlight-word":     "highlight_word",
  "odd-one-out":        "odd_one_out",
  "group-words":        "group_words",
  "fill-blank":         "fill_blank_typed",
  "correct-spelling":   "correct_spelling",
  "dictation-image":    "dictation_image",
  "is-french-word":     "is_french_word",
  "repeat-word":        "repeat_word",
  "repeat-sentence":    "repeat_sentence",
  "what-do-you-see":    "what_do_you_see",
  "phonetics":          "listen_phonetics",
  "multi-select":       "listen_select",
  "audio-match-2":      "audio_to_audio",
  "audio-fill-blank":   "listen_fill_blanks",
  "dictation":          "dictation_image",
  "listen-fill-blanks": "listen_fill_blanks",

  // Grammar
  "fill-blanks-options":  "fill_blanks_options",
  "four-options":         "four_options",
  "two-options":          "two_options",
  "three-options":        "three_options",
  "fill-blanks":          "fill_blanks",
  "fill-blanks-question": "fill_blanks_options",
  "reorder-words":        "grammar_reorder",
  "transformation":       "grammar_transformation",
  "rewrite":              "grammar_rewrite",
  "combination":          "grammar_combination",
  "find-error":           "grammar_find_error",
};

export function normalizeSlug(slug: string): string {
  if (slug.startsWith("/")) {
    const parts = slug.replace(/\/$/, "").split("/");
    const last = parts[parts.length - 1];
    return KEBAB_TO_DB[last] ?? last.replace(/-/g, "_");
  }
  return KEBAB_TO_DB[slug] ?? slug;
}
