import Papa from "papaparse";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Mapping of CSV file paths to backend practice slugs
const FILE_TO_SLUG = {
  "practice/reading/bubble_selection.csv": "translate_bubbles",
  "practice/reading/match_pairs.csv": "match_pairs",
  "practice/speaking/repeat_sentence.csv": "repeat_sentence",
  "practice/speaking/what_do_you_see.csv": "what_do_you_see",
  "practice/writing/dictation_image.csv": "dictation_image",
  "practice/reading/comprehension.csv": "passage_mcq",
  "practice/reading/fill_blanks_passage.csv": "complete_passage_dropdown",
  "practice/listening/type.csv": "type_what_you_hear",
  "practice/listening/select.csv": "multiple_choice_audio",
  "practice/listening/audio_fill_blanks.csv": "listen_fill_blanks",
  "practice/speaking/topic.csv": "speak_topic",
  "practice/writing/spelling.csv": "correct_spelling",
  "practice/reading/true_false.csv": "true_false",
  "practice/reading/summary_completion.csv": "summary_completion",
  "practice/reading/sentence_completion.csv": "sentence_completion",
  "practice/reading/match_sentence_ending.csv": "match_sentence_ending",
  "practice/reading/reorder.csv": "reorder_sentences",
  "practice/speaking/image.csv": "speak_image",
  // "practice/reading/reading_conversation.csv": "reading_conversation",
  "practice/reading/diagram_labelling.csv": "diagram_mapping",
  "practice/reading/fill_blanks.csv": "fill_blanks",
  "practice/reading/highlight.csv": "highlight_word",
  "practice/reading/highlight_text.csv": "highlight_text",
  "practice/reading/image_labelling.csv": "image_labelling",
  "practice/reading/image_mcq.csv": "image_mcq",
  "practice/reading/match_desc_game.csv": "match_desc_game",
  // "practice/reading/conversation.csv": "reading_conversation",
  // Listening
  "practice/listening/listen_bubble.csv": "listen_bubble",
  "practice/listening/listen_interactive.csv": "listen_interactive",
  "practice/listening/listen_order.csv": "listen_order",
  "practice/listening/listen_passage.csv": "listen_passage",
  "practice/listening/listen_select.csv": "listen_select",
  "practice/listening/listen_type.csv": "listen_type",
  "practice/listening/listening_comprehension.csv": "listening_comprehension",
  "practice/listening/listening_conversation.csv": "listening_conversation",
  // Writing
  "practice/writing/translate_typed.csv": "translate_typed",
  "practice/writing/write_analysis.csv": "write_analysis",
  "practice/writing/write_documents.csv": "write_documents",
  "practice/writing/write_fill_blanks.csv": "write_fill_blanks",
  "practice/writing/write_image.csv": "write_image",
  "practice/writing/write_topic.csv": "write_topic",
  "practice/writing/writing_conversation.csv": "writing_conversation",
  "practice/writing/sentence_completion.csv": "sentence_completion",
  // Speaking
  "practice/speaking/speak_topic.csv": "speak_topic",
  "practice/speaking/speak_image.csv": "speak_image",
  "practice/speaking/speak_interactive.csv": "speak_interactive",
  "practice/speaking/speak_translate.csv": "speak_translate",
  "practice/speaking/repeat_word.csv": "repeat_sentence",
  // Grammar
  "grammar/four_options.csv": "four_options",
  "grammar/three_options.csv": "three_options",
  "grammar/two_options.csv": "two_options",
  "grammar/grammar_find_error.csv": "grammar_find_error",
  "grammar/grammar_reorder.csv": "grammar_reorder",
  "grammar/grammar_transformation.csv": "grammar_transformation",
  "grammar/grammar_combination.csv": "grammar_combination",
  "grammar/grammar_rewrite.csv": "grammar_rewrite",
  "grammar/fill_blanks_options.csv": "fill_blanks_options",
  "grammar/grammar_fill_blanks.csv": "grammar_fill_blanks",
  "grammar/grammar_fill_blanks_question.csv": "grammar_fill_blanks_question",
};

/**
 * Loads data either from the backend API (if mapped) or fallback to local CSV.
 * @param {string} fileName - The name of the CSV file path
 * @param {Object} options - Optional filtering (e.g. level)
 * @returns {Promise<Array>} - A promise that resolves to the data array.
 */
export const loadMockCSV = async (fileName, options = {}) => {
  const slug = FILE_TO_SLUG[fileName];

  if (slug) {
    try {
      const { level } = options;
      const params = new URLSearchParams();
      if (level) params.append("level", level);

      const response = await fetch(
        `${API_URL}/api/practice/${slug}${params.toString() ? `?${params}` : ""}`,
      );
      if (response.ok) {
        const result = await response.json();
        // Backend returns {count, data} for generic, or Array for specialized
        const data = result.data || result;
        if (Array.isArray(data) && data.length > 0) {
          console.log(
            `[DATA_SOURCE] Successfully fetched live data for ${slug} from BACKEND. Count: ${data.length}`,
            data[0],
          );
          return data;
        }
      }
    } catch (e) {
      console.warn(
        `[DATA_SOURCE] Backend fetch failed for ${slug}, falling back to CSV:`,
        e,
      );
    }
  }

  console.log(`[DATA_SOURCE] Fetching from local CSV: ${fileName}`);

  // Fallback to local CSV
  try {
    const response = await fetch(`/mock-data/${fileName}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${fileName}`);
    }
    const csvString = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvString, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          const processedData = results.data.map((row) => {
            const newRow = { ...row };
            for (const key in newRow) {
              const value = newRow[key];
              if (typeof value === "string") {
                if (
                  (value.startsWith("[") && value.endsWith("]")) ||
                  (value.startsWith("{") && value.endsWith("}"))
                ) {
                  try {
                    newRow[key] = JSON.parse(value);
                  } catch (e) {}
                }
              }
            }
            return newRow;
          });
          resolve(processedData);
        },
        error: (error) => reject(error),
      });
    });
  } catch (error) {
    console.error(`Error loading CSV ${fileName}:`, error);
    return [];
  }
};
