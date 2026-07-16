const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GrammarSubtopic {
  id: number;
  slug: string;
  name_en: string;
  name_fr?: string;
  name_de?: string;
  name_es?: string;
  order_index: number;
  notes_count: number;
}

export interface GrammarTopic {
  id: number;
  slug: string;
  name_en: string;
  name_fr?: string;
  name_de?: string;
  name_es?: string;
  learning_lang: string;
  level_code: string;
  order_index: number;
  subtopics: GrammarSubtopic[];
}

export interface GrammarNote {
  id: number;
  concept_id: string;
  known_lang: string;
  learning_lang: string;
  title: string | null;
  description: string | null;
  order_index: number;
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Fetch grammar topics (with nested subtopics) for a language + level.
 */
export async function fetchGrammarTopics(
  learningLang: string,
  levelCode: string
): Promise<GrammarTopic[]> {
  const params = new URLSearchParams({ learning_lang: learningLang, level_code: levelCode });
  const res = await fetch(`${API_BASE_URL}/api/grammar/topics?${params}`);
  if (!res.ok) throw new Error("Failed to fetch grammar topics");
  const data = await res.json();
  return data.topics ?? [];
}

/**
 * Fetch notes for a specific subtopic, optionally filtered by known_lang.
 */
export async function fetchSubtopicNotes(
  subtopicId: number,
  knownLang?: string
): Promise<GrammarNote[]> {
  const params = knownLang ? `?known_lang=${knownLang}` : "";
  const res = await fetch(
    `${API_BASE_URL}/api/grammar/subtopics/${subtopicId}/notes${params}`
  );
  if (!res.ok) throw new Error("Failed to fetch subtopic notes");
  const data = await res.json();
  return data.notes ?? [];
}

/**
 * Returns the URL to fetch the rendered HTML for a note.
 * Used in an <iframe> or fetched directly.
 */
export function getGrammarNoteHtmlUrl(noteId: number, cacheKey?: string | number): string {
  const url = new URL(`${API_BASE_URL}/api/admin/grammar/notes/${noteId}/html`);
  if (cacheKey !== undefined) {
    url.searchParams.set("v", String(cacheKey));
  }
  return url.toString();
}

/**
 * Fetch the raw HTML content of a grammar note (for inline rendering).
 */
export async function fetchGrammarNoteHtml(noteId: number): Promise<string> {
  const res = await fetch(getGrammarNoteHtmlUrl(noteId, Date.now()), {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch grammar note HTML");
  return res.text();
}

// ─── AI Grammar Check (unchanged) ────────────────────────────────────────────

export async function checkGrammar(text: string, description = "") {
  const response = await fetch(`${API_BASE_URL}/api/grammar/check`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, description }),
  });
  if (!response.ok) throw new Error("Failed to check grammar");
  return response.json();
}
