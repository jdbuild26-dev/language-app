import { useState, useCallback } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://language-api-mine.onrender.com";

/**
 * Fetch all grammar notes
 */
export async function fetchGrammarNotes() {
  const response = await fetch(`${API_BASE_URL}/api/grammar/notes`);
  if (!response.ok) {
    throw new Error("Failed to fetch grammar notes");
  }
  return response.json();
}

/**
 * Fetch a specific grammar note by ID
 */
export async function fetchGrammarNoteContent(noteId) {
  const response = await fetch(`${API_BASE_URL}/api/grammar/notes/${noteId}`);
  if (!response.ok) {
    throw new Error("Failed to fetch grammar note content");
  }
  return response.json();
}

/**
 * Custom hook to manage grammar notes state
 */
export function useGrammarNotes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGrammarNotes();
      setNotes(data.notes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { notes, loading, error, getNotes };
  return { notes, loading, error, getNotes };
}

/**
 * Custom hook to manage grammar note content
 */
export function useGrammarNoteContent() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getNoteContent = useCallback(async (noteId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGrammarNoteContent(noteId);
      setContent(data.content || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { content, loading, error, getNoteContent };
}

/**
 * Check grammar of a text using AI
 * @param {string} text - The text to check
 * @param {string} description - Optional context or instruction
 * @returns {Promise<Object>} - The grammar check result
 */
export async function checkGrammar(text, description = "") {
  const response = await fetch(`${API_BASE_URL}/api/grammar/check`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text, description }),
  });

  if (!response.ok) {
    throw new Error("Failed to check grammar");
  }

  return response.json();
}
