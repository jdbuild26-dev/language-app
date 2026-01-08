import { useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const fetchGrammarNotes = async () => {
  try {
    const response = await fetch(`${API_URL}/api/grammar/notes`);
    if (!response.ok) {
      throw new Error("Failed to fetch grammar notes");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching grammar notes:", error);
    throw error;
  }
};

export const fetchGrammarNoteContent = async (noteId) => {
  try {
    const response = await fetch(`${API_URL}/api/grammar/notes/${noteId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch grammar note content");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching grammar note content:", error);
    throw error;
  }
};

export const useGrammarNotes = () => {
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
};

export const useGrammarNoteContent = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getNoteContent = useCallback(async (noteId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchGrammarNoteContent(noteId);
      setContent(data.content);
      return data.content;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { content, loading, error, getNoteContent };
};
