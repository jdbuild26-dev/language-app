/**
 * Progress Tracking API Service
 * Handles saving/retrieving learned cards for user progress
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Save progress - batch save learned cards
 */
export async function saveProgress(userId, langCode, level, category, cards, token) {
  const response = await fetch(`${API_BASE_URL}/api/progress/save`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      userId,
      langCode,
      level: level.toUpperCase(),
      category,
      cards: cards.map((card) => ({
        cardId: card.id,
        cardData: {
          english: card.english,
          forms: card.forms,
          exampleTarget: card.exampleTarget,
          exampleNative: card.exampleNative,
          phonetic: card.phonetic,
          level: card.level,
          category: card.category,
          subCategory: card.subCategory || "",
          image: card.image || "",
        },
      })),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save progress");
  }

  return response.json();
}

/**
 * Get lesson progress for resume
 */
export async function getLessonProgress(token, langCode, level, category) {
  const params = new URLSearchParams();
  params.append("langCode", langCode);
  params.append("level", level.toUpperCase());
  params.append("category", category);

  const response = await fetch(
    `${API_BASE_URL}/api/progress/lesson?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get lesson progress");
  }

  return response.json();
}

/**
 * Get all learned cards for wordlist (paginated)
 */
export async function getWordlist(token, langCode, { limit = 50, cursor = null } = {}) {
  const params = new URLSearchParams();
  params.append("langCode", langCode);
  params.append("limit", limit);
  if (cursor) params.append("cursor", cursor);

  const response = await fetch(
    `${API_BASE_URL}/api/progress/wordlist?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get wordlist");
  }

  return response.json();
}

/**
 * Reset progress for a specific lesson
 */
export async function resetLessonProgress(token, langCode, level, category) {
  const params = new URLSearchParams();
  params.append("langCode", langCode);
  params.append("level", level.toUpperCase());
  params.append("category", category);

  const response = await fetch(
    `${API_BASE_URL}/api/progress/lesson?${params.toString()}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to reset progress");
  }

  return response.json();
}

/**
 * Remove a single learned card
 */
export async function deleteLearnedCard(token, cardId) {
  const params = new URLSearchParams();
  params.append("card_id", cardId);

  const response = await fetch(
    `${API_BASE_URL}/api/progress/card?${params.toString()}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to delete card");
  }

  return response.json();
}

/**
 * Get total learned cards count
 */
export async function getTotalLearnedCount(token, langCode) {
  const params = new URLSearchParams();
  if (langCode) params.append("langCode", langCode);
  const response = await fetch(`${API_BASE_URL}/api/progress/count?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    return 0;
  }

  const data = await response.json();
  return data.count;
}
