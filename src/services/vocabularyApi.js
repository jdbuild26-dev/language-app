const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Fetch vocabulary with optional filtering
 */
export async function fetchVocabulary({
  level,
  category,
  subCategory,
  limit,
} = {}) {
  const params = new URLSearchParams();
  if (level) params.append("level", level);
  if (category) params.append("category", category);
  if (limit) params.append("limit", limit);
  // Handle subCategory array
  if (subCategory && Array.isArray(subCategory)) {
    subCategory.forEach((sc) => params.append("sub_category", sc));
  } else if (subCategory) {
    params.append("sub_category", subCategory);
  }

  const url = `${API_BASE_URL}/api/vocabulary${
    params.toString() ? "?" + params : ""
  }`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failed to fetch vocabulary");
  }

  return response.json();
}

/**
 * Fetch words for a specific lesson, optionally filtered by CEFR level
 */
export async function fetchLessonWords(
  lessonId,
  { level, wordsPerLesson = 10 } = {}
) {
  const params = new URLSearchParams();
  params.append("words_per_lesson", wordsPerLesson);
  if (level) params.append("level", level);

  const response = await fetch(
    `${API_BASE_URL}/api/vocabulary/lesson/${lessonId}?${params}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch lesson");
  }

  return response.json();
}

/**
 * Fetch available CEFR levels
 */
export async function fetchAvailableLevels() {
  const response = await fetch(`${API_BASE_URL}/api/vocabulary/levels`);

  if (!response.ok) {
    throw new Error("Failed to fetch levels");
  }

  return response.json();
}

/**
 * Fetch available categories
 */
export async function fetchAvailableCategories() {
  const response = await fetch(`${API_BASE_URL}/api/vocabulary/categories`);

  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }

  return response.json();
}

/**
 * Fetch categories grouped by CEFR level with word counts
 */
export async function fetchCategoriesByLevel(level) {
  const params = new URLSearchParams();
  if (level) params.append("level", level);

  const response = await fetch(
    `${API_BASE_URL}/api/vocabulary/categories-by-level?${params}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch categories by level");
  }

  return response.json();
}

/**
 * Fetch all topics with word counts (across all levels)
 */
export async function fetchAllTopics() {
  const response = await fetch(`${API_BASE_URL}/api/vocabulary/topics`);

  if (!response.ok) {
    throw new Error("Failed to fetch topics");
  }

  return response.json();
}

/**
 * Check if API is healthy
 */
export async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.ok;
  } catch {
    return false;
  }
}
