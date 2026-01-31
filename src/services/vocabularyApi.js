const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://language-api-mine.onrender.com";

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
  { level, wordsPerLesson = 10 } = {},
) {
  const params = new URLSearchParams();
  params.append("words_per_lesson", wordsPerLesson);
  if (level) params.append("level", level);

  const response = await fetch(
    `${API_BASE_URL}/api/vocabulary/lesson/${lessonId}?${params}`,
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
    `${API_BASE_URL}/api/vocabulary/categories-by-level?${params}`,
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

/**
 * Save user progress (batch)
 */
export async function saveUserProgress(progressData, token) {
  const response = await fetch(`${API_BASE_URL}/api/progress/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(progressData),
  });

  if (!response.ok) {
    throw new Error("Failed to save progress");
  }

  return response.json();
}

/**
 * Fetch user progress stats
 */
export async function fetchUserProgressStats({
  userId,
  level,
  category,
  subCategory,
  token,
} = {}) {
  const params = new URLSearchParams();
  // removed user_id param
  if (level) params.append("level", level);
  if (category) params.append("category", category);
  if (subCategory && Array.isArray(subCategory)) {
    subCategory.forEach((sc) => params.append("sub_category", sc));
  } else if (subCategory) {
    params.append("sub_category", subCategory);
  }

  const response = await fetch(`${API_BASE_URL}/api/progress/stats?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch progress stats");
  }

  return response.json();
}

/**
 * Fetch all teachers
 */
export async function fetchTeachers({ limit = 20, skip = 0 } = {}) {
  const response = await fetch(
    `${API_BASE_URL}/api/teachers?limit=${limit}&skip=${skip}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch teachers");
  }

  return response.json();
}

/**
 * Link a student to a teacher (sends request)
 */
export async function linkStudentToTeacher(studentId, teacherId, token) {
  const response = await fetch(`${API_BASE_URL}/api/relationships/link`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ studentId, teacherId }),
  });

  if (!response.ok) {
    throw new Error("Failed to send connection request");
  }

  return response.json();
}

/**
 * Fetch students for a teacher (optional status filter)
 */
export async function fetchTeacherStudents(teacherId, status, token) {
  const params = new URLSearchParams();
  if (status) params.append("status", status);

  const response = await fetch(
    `${API_BASE_URL}/api/relationships/teacher/${teacherId}/students?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch students");
  }

  return response.json();
}

/**
 * Fetch teachers for a student (optional status filter)
 */
export async function fetchStudentTeachers(studentId, status, token) {
  const params = new URLSearchParams();
  if (status) params.append("status", status);

  const response = await fetch(
    `${API_BASE_URL}/api/relationships/student/${studentId}/teachers?${params}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch teachers");
  }

  return response.json();
}

/**
 * Update relationship status (approve/reject)
 */
export async function updateRelationshipStatus(relationshipId, status, token) {
  const response = await fetch(
    `${API_BASE_URL}/api/relationships/${relationshipId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to update relationship status");
  }

  return response.json();
}

/**
 * Delete a relationship (cancel request or remove connection)
 */
export async function deleteRelationship(relationshipId, token) {
  const response = await fetch(
    `${API_BASE_URL}/api/relationships/${relationshipId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete relationship");
  }

  return true;
}

/**
 * Fetch practice questions from a specific sheet
 */
export async function fetchPracticeQuestions(sheetName, limit) {
  const params = new URLSearchParams();
  if (limit) params.append("limit", limit);

  const response = await fetch(
    `${API_BASE_URL}/api/practice/${encodeURIComponent(sheetName)}?${params}`,
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch practice questions for ${sheetName}`);
  }

  return response.json();
}

/**
 * Track user event (SRS)
 */
export async function trackEvent(eventData) {
  console.log("[vocabularyApi] Tracking Event:", eventData);
  // Use /api/event-tracker endpoint which we updated to handle SRS
  const response = await fetch(`${API_BASE_URL}/api/event_tracker`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    throw new Error("Failed to track event");
  }

  return response.json();
}

/**
 * Fetch SRS Learning Queue
 */
export async function fetchLearningQueue({
  userId,
  dailyLimitReviews,
  dailyLimitNew,
  level,
  category,
} = {}) {
  const params = new URLSearchParams();
  if (userId) params.append("user_id", userId);
  if (dailyLimitReviews)
    params.append("daily_limit_reviews", dailyLimitReviews);
  if (dailyLimitNew) params.append("daily_limit_new", dailyLimitNew);
  if (level) params.append("level", level);
  if (category) params.append("category", category);

  console.log(
    `[vocabularyApi] Fetching queue with params: ${params.toString()}`,
  );
  const response = await fetch(
    `${API_BASE_URL}/api/vocabulary/learn?${params}`,
  );

  if (!response.ok) {
    throw new Error("Failed to fetch learning queue");
  }

  return response.json();
}
