import { useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL;

// Hook to fetch stories list from Google Drive
export const useStoriesList = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getStories = useCallback(async (folderId = null) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = folderId ? `?folder_id=${folderId}` : "";
      const response = await fetch(`${API_URL}/api/stories${queryParams}`);
      if (!response.ok) {
        throw new Error("Failed to fetch stories");
      }
      const data = await response.json();
      setStories(data.stories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stories, loading, error, getStories };
};

// Hook to fetch story content
export const useStoryContent = () => {
  const [content, setContent] = useState(null);
  const [metadata, setMetadata] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getStoryContent = useCallback(async (storyId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/stories/${storyId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch story content");
      }
      const data = await response.json();
      setContent(data.content);
      setMetadata(data.metadata);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { content, metadata, loading, error, getStoryContent };
};

// Hook to fetch all stories metadata
export const useStoriesMetadata = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getStoriesMetadata = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/stories/metadata`);
      if (!response.ok) {
        throw new Error("Failed to fetch stories metadata");
      }
      const data = await response.json();
      setStories(data.stories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stories, loading, error, getStoriesMetadata };
};

// Hook to fetch available CEFR levels
export const useStoriesLevels = () => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLevels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/stories/levels`);
      if (!response.ok) {
        throw new Error("Failed to fetch levels");
      }
      const data = await response.json();
      setLevels(data.levels || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { levels, loading, error, getLevels };
};

// Hook to fetch available themes
export const useStoriesThemes = () => {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getThemes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/stories/themes`);
      if (!response.ok) {
        throw new Error("Failed to fetch themes");
      }
      const data = await response.json();
      setThemes(data.themes || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { themes, loading, error, getThemes };
};

// Hook to fetch available grammar topics
export const useStoriesGrammarTopics = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getTopics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/stories/grammar-topics`);
      if (!response.ok) {
        throw new Error("Failed to fetch grammar topics");
      }
      const data = await response.json();
      setTopics(data.topics || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { topics, loading, error, getTopics };
};

// Hook to fetch stories by level
export const useStoriesByLevel = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getStoriesByLevel = useCallback(async (level) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/stories/by-level/${level}`);
      if (!response.ok) {
        throw new Error("Failed to fetch stories");
      }
      const data = await response.json();
      setStories(data.stories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stories, loading, error, getStoriesByLevel };
};

// Hook to fetch stories by theme
export const useStoriesByTheme = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getStoriesByTheme = useCallback(async (theme) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/stories/by-theme/${theme}`);
      if (!response.ok) {
        throw new Error("Failed to fetch stories");
      }
      const data = await response.json();
      setStories(data.stories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stories, loading, error, getStoriesByTheme };
};

// Hook to fetch stories by grammar topic
export const useStoriesByGrammar = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getStoriesByGrammar = useCallback(async (topic) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${API_URL}/api/stories/by-grammar/${topic}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch stories");
      }
      const data = await response.json();
      setStories(data.stories || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { stories, loading, error, getStoriesByGrammar };
};
