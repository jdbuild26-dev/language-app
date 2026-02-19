const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://language-api-mine.onrender.com";

/**
 * Fetch vocabulary with optional filtering
 */
const CSV_TRANSFORMERS = {
  group_words: (row) => ({
    external_id: row.ExerciseID || `GW_${Math.random()}`,
    instruction_en: row.Instruction_EN || "Group the related words",
    instruction_fr: row.Instruction_FR || "Groupez les mots liés",
    theme: row.Theme,
    correctGroup: (row.CorrectGroup || "").split("|"),
    otherWords: (row.OtherWords || "").split("|"),
    explanation: row.Explanation,
    config: { targetCount: (row.CorrectGroup || "").split("|").length },
  }),
  vocab_typing_blanks: (row) => {
    const parts = (row.DisplayParts || "").split("|");
    return {
      external_id: row.ExerciseID,
      instruction_en: row.Instruction_EN,
      instruction_fr: row.Instruction_FR,
      content: {
        fullText: row.FullText,
        displayParts: parts.filter((_, i) => i % 2 === 0),
        blanks: (row.Blanks || "").split("|"),
        hints: row.Hints ? row.Hints.split("|") : [],
      },
      evaluation: { correctAnswer: (row.Blanks || "").split("|") },
      config: { TimeLimitSeconds: parseInt(row.TimeLimitSeconds || "60") },
    };
  },
  is_french_word: (row) => ({
    external_id: row.ExerciseID,
    instruction_en: row.Instruction_EN,
    instruction_fr: row.Instruction_FR,
    content: {
      word: row.Question,
      isFrench: row.CorrectAnswer?.toLowerCase() === "yes",
      correctAnswer: row.CorrectAnswer,
    },
    evaluation: { correctAnswer: row.CorrectAnswer?.toLowerCase() === "yes" },
  }),
  b5_fill_blanks_audio: (row) => ({
    external_id: row.ExerciseID,
    instruction_en: row.Instruction_EN,
    instruction_fr: row.Instruction_FR,
    content: {
      CompleteSentence: row.CompleteSentence,
      SentenceWithBlank: row.SentenceWithBlank,
      Audio: row.CompleteSentence,
      Option1: row.Option1,
      Option2: row.Option2,
      Option3: row.Option3,
      Option4: row.Option4,
      CorrectAnswer: row.CorrectAnswer,
    },
    evaluation: { correctAnswer: row.CorrectAnswer },
  }),
};

export async function fetchVocabulary({
  level,
  category,
  subCategory,
  limit,
  learningLang,
  knownLang,
} = {}) {
  const params = new URLSearchParams();
  if (level) params.append("level", level);
  if (category) params.append("category", category);
  if (limit) params.append("limit", limit);
  if (learningLang) params.append("learning_lang", learningLang);
  if (knownLang) params.append("known_lang", knownLang);
  // Handle subCategory array
  if (subCategory && Array.isArray(subCategory)) {
    subCategory.forEach((sc) => params.append("sub_category", sc));
  } else if (subCategory) {
    params.append("sub_category", subCategory);
  }

  const url = `${API_BASE_URL}/api/vocabulary${params.toString() ? "?" + params : ""
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
  { level, wordsPerLesson = 10, learningLang, knownLang } = {},
) {
  const params = new URLSearchParams();
  params.append("words_per_lesson", wordsPerLesson);
  if (level) params.append("level", level);
  if (learningLang) params.append("learning_lang", learningLang);
  if (knownLang) params.append("known_lang", knownLang);

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
 * Fetch practice questions from a specific sheet or slug
 */
export async function fetchPracticeQuestions(sheetName, { limit, learningLang, knownLang } = {}) {
  const params = new URLSearchParams();
  if (limit) params.append("limit", limit);
  if (learningLang) params.append("learning_lang", learningLang);
  if (knownLang) params.append("known_lang", knownLang);

  const response = await fetch(
    `${API_BASE_URL}/api/practice/${encodeURIComponent(sheetName)}?${params}`,
  );

  if (response.status === 404) {
    // Normalizing slug to match file naming convention (e.g., 'B5_Fill blanks_Audio' -> 'b5_fill_blanks_audio')
    const normalizedSheetName = sheetName.toLowerCase().replace(/ /g, "_");
    const transformer = CSV_TRANSFORMERS[normalizedSheetName];
    if (transformer) {
      console.warn(
        `[vocabularyApi] API 404 for ${sheetName}, falling back to CSV: ${normalizedSheetName}.csv`,
      );
      try {
        const Papa = await import("papaparse");
        const csvResponse = await fetch(
          `/mock-data/csv/${normalizedSheetName}.csv`,
        );
        if (!csvResponse.ok) {
          throw new Error(
            `Failed to fetch fallback CSV: ${normalizedSheetName}.csv`,
          );
        }
        const csvText = await csvResponse.text();

        return new Promise((resolve, reject) => {
          Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              try {
                const transformedData = results.data.map(transformer);
                resolve({ data: transformedData });
              } catch (err) {
                reject(err);
              }
            },
            error: (err) => reject(err),
          });
        });
      } catch (err) {
        console.error(`[vocabularyApi] Fallback failed for ${sheetName}:`, err);
        throw new Error(`Failed to fetch practice questions for ${sheetName}`);
      }
    }
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch practice questions for ${sheetName}`);
  }

  return response.json();
}

/**
 * Fetch specialized Match Pairs data
 */
export async function fetchMatchPairsData(level) {
  const url = `${API_BASE_URL}/api/practice/match-pairs${level ? `?level=${level}` : ""}`;
  const response = await fetch(url);

  if (response.status === 404) {
    console.warn(
      `[vocabularyApi] API 404 for match-pairs, falling back to CSV: match_pairs.csv`,
    );
    try {
      const Papa = await import("papaparse");
      const csvResponse = await fetch(`/mock-data/csv/match_pairs.csv`);
      if (!csvResponse.ok) {
        throw new Error(`Failed to fetch fallback CSV: match_pairs.csv`);
      }
      const csvText = await csvResponse.text();

      return new Promise((resolve, reject) => {
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            try {
              // Transform CSV data to expected format
              const transformedData = results.data
                .map((row) => ({
                  id: Math.random().toString(36).substr(2, 9),
                  french: row["Word - French"],
                  english: row["English word"],
                  image: row["Image"]
                    ? `/mock-data/images/${row["Image"]}`
                    : null,
                  instructionFr: "Associez les paires",
                  instructionEn: "Match the pairs",
                  level: row["Level"],
                }))
                // Filter by level if requested and level column exists
                .filter(
                  (item) => !level || !item.level || item.level === level,
                );

              resolve(transformedData);
            } catch (err) {
              reject(err);
            }
          },
          error: (err) => reject(err),
        });
      });
    } catch (err) {
      console.error(`[vocabularyApi] Fallback failed for match-pairs:`, err);
      throw new Error("Failed to fetch match pairs");
    }
  }

  if (!response.ok) throw new Error("Failed to fetch match pairs");
  return response.json();
}

/**
 * Fetch specialized Repeat Sentence data
 */
export async function fetchRepeatSentenceData(level) {
  const url = `${API_BASE_URL}/api/practice/repeat-sentence${level ? `?level=${level}` : ""}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch repeat sentence");
  return response.json();
}

/**
 * Fetch specialized What Do You See data
 */
export async function fetchWhatDoYouSeeData() {
  const response = await fetch(`${API_BASE_URL}/api/practice/what-do-you-see`);
  if (!response.ok) throw new Error("Failed to fetch what do you see");
  return response.json();
}

/**
 * Fetch specialized Dictation Image data
 */
export async function fetchDictationImageData() {
  const response = await fetch(`${API_BASE_URL}/api/practice/dictation-image`);
  if (!response.ok) throw new Error("Failed to fetch dictation image");
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
  learningLang,
  knownLang,
} = {}) {
  const params = new URLSearchParams();
  if (userId) params.append("user_id", userId);
  if (dailyLimitReviews)
    params.append("daily_limit_reviews", dailyLimitReviews);
  if (dailyLimitNew) params.append("daily_limit_new", dailyLimitNew);
  if (level) params.append("level", level);
  if (category) params.append("category", category);
  if (learningLang) params.append("learning_lang", learningLang);
  if (knownLang) params.append("known_lang", knownLang);

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

/**
 * Fetch specialized Complete Passage data
 */
export async function fetchCompletePassageData({ learningLang, knownLang } = {}) {
  const params = new URLSearchParams();
  if (learningLang) params.append("learning_lang", learningLang);
  if (knownLang) params.append("known_lang", knownLang);

  const response = await fetch(
    `${API_BASE_URL}/api/practice/complete_passage_dropdown?${params}`,
  );
  if (!response.ok) throw new Error("Failed to fetch complete passage data");
  const result = await response.json();
  return result.data || result;
}

/**
 * Fetch specialized Summary Completion data
 */
export async function fetchSummaryCompletionData({ learningLang, knownLang } = {}) {
  const params = new URLSearchParams();
  if (learningLang) params.append("learning_lang", learningLang);
  if (knownLang) params.append("known_lang", knownLang);

  const response = await fetch(
    `${API_BASE_URL}/api/practice/summary_completion?${params}`,
  );
  if (!response.ok) throw new Error("Failed to fetch summary completion data");
  const result = await response.json();
  return result.data || result;
}

/**
 * Fetch specialized Writing Documents data
 */
export async function fetchWritingDocuments(level) {
  const url = `${API_BASE_URL}/api/practice/write_documents${level ? `?level=${level}` : ""}`;
  console.log(`[vocabularyApi] Fetching writing documents from: ${url}`);
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch writing documents");
  const result = await response.json();
  return result.data || result;
}

/**
 * Fetch specialized Writing Analysis data
 */
export async function fetchWriteAnalysisData() {
  const response = await fetch(`${API_BASE_URL}/api/practice/write_analysis`);
  if (!response.ok) throw new Error("Failed to fetch writing analysis data");
  const result = await response.json();
  return result.data || result;
}
