import { useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_URL;

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

export const useStoryContent = () => {
  const [content, setContent] = useState(null);
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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { content, loading, error, getStoryContent };
};
