import { loadMockCSV } from "@/utils/csvLoader";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Reverse map: slug → CSV fallback path
const SLUG_TO_CSV: Record<string, string> = {
  translate_bubbles: "practice/reading/translate_bubbles.csv",
  listen_select: "practice/listening/listen_select.csv",
  repeat_sentence: "practice/speaking/repeat_sentence.csv",
  "repeat-sentence": "practice/speaking/repeat_sentence.csv",
  speak_image: "practice/speaking/speak_image.csv",
  speak_topic: "practice/speaking/speak_topic.csv",
  speak_interactive: "practice/speaking/speak_interactive.csv",
  speaking_conversation: "practice/speaking/speaking_conversation.csv",
  speak_translate: "practice/speaking/speak_translate.csv",
  listen_bubble: "practice/listening/listen_bubble.csv",
  listen_fill_blanks: "practice/listening/listen_fill_blanks.csv",
  listen_interactive: "practice/listening/listen_interactive.csv",
  listen_order: "practice/listening/listen_order.csv",
  listen_passage: "practice/listening/listen_passage.csv",
  listen_type: "practice/listening/listen_type.csv",
  listening_comprehension: "practice/listening/listening_comprehension.csv",
  listening_conversation: "practice/listening/listening_conversation.csv",
  passage_mcq: "practice/reading/comprehension.csv",
  complete_passage_dropdown: "practice/reading/complete_passage_dropdown.csv",
  diagram_mapping: "practice/reading/diagram_mapping.csv",
  fill_blanks: "practice/reading/fill_blanks.csv",
  highlight_text: "practice/reading/highlight_text.csv",
  image_labelling: "practice/reading/image_labelling.csv",  image_mcq: "practice/reading/image_mcq.csv",
  match_desc_game: "practice/reading/match_desc_game.csv",
  match_desc_to_image: "practice/reading/match_desc_game.csv",
  reorder_sentences: "practice/reading/reorder_sentences.csv",
  writing_conversation: "practice/writing/writing_conversation.csv",
  translate_typed: "practice/writing/translate_typed.csv",
  write_translate: "practice/writing/translate_typed.csv",
  correct_spelling: "practice/writing/spelling.csv",
  write_fill_blanks: "practice/writing/write_fill_blanks.csv",
  write_topic: "practice/writing/write_topic.csv",
  write_image: "practice/writing/write_image.csv",
  write_documents: "practice/writing/write_documents.csv",
  write_interactive: "practice/writing/write_interactive.csv",
  writing_conversation: "practice/writing/writing_conversation.csv",
  write_analysis: "practice/writing/write_analysis.csv",
  summarise_audio: "practice/writing/summarise_audio.csv",
  speak_translate: "practice/speaking/speak_translate.csv",
  speak_topic: "practice/speaking/speak_topic.csv",
  speak_image: "practice/speaking/speak_image.csv",
  speak_interactive: "practice/speaking/speak_interactive.csv",
  speaking_conversation: "practice/speaking/speaking_conversation.csv",
};

/**
 * Standardized fetcher for practice exercise data from the backend.
 * Falls back to local mock CSV when the backend is unavailable.
 */
export async function fetchPracticeData(
  slug: string,
  options: Record<string, string | number | undefined> = {},
) {
  const { level, limit, tag, learningLang, knownLang } = options;
  const params = new URLSearchParams();
  if (level) params.append("level", String(level));
  if (limit) params.append("limit", limit.toString());
  if (tag) params.append("tag", String(tag));
  if (learningLang) params.append("learning_lang", String(learningLang));
  if (knownLang) params.append("known_lang", String(knownLang));

  const queryString = params.toString();
  const url = `${API_URL}/api/practice/${slug}${queryString ? `?${queryString}` : ""}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const result = await response.json();
    const data = result.data || result;
    if (Array.isArray(data) && data.length > 0) return data;
    throw new Error("Empty response from backend");
  } catch (error) {
    console.warn(`[practiceFetcher] Backend unavailable for "${slug}", falling back to CSV:`, error);

    const csvPath = SLUG_TO_CSV[slug];
    if (csvPath) {
      return loadMockCSV(csvPath, options);
    }

    console.error(`[practiceFetcher] No CSV fallback defined for slug: "${slug}"`);
    return [];
  }
}

export async function fetchRepeatSentenceData(level: string) {
  return fetchPracticeData("repeat-sentence", { level });
}

export async function fetchWhatDoYouSeeData() {
  return fetchPracticeData("what-do-you-see");
}

export async function fetchDictationImageData() {
  return fetchPracticeData("dictation-image");
}

export async function fetchMatchPairsData() {
  return fetchPracticeData("match-pairs");
}
