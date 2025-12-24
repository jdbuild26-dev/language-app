/**
 * Review Cards API Service
 * Handles all API calls for bookmark/review functionality
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Add a vocabulary card to user's review list
 */
export async function addToReview(userId, cardData) {
  const response = await fetch(`${API_BASE_URL}/api/review-cards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      cardId: cardData.id,
      cardData: {
        english: cardData.english,
        forms: cardData.forms,
        exampleTarget: cardData.exampleTarget,
        exampleNative: cardData.exampleNative,
        phonetic: cardData.phonetic,
        level: cardData.level,
        category: cardData.category,
        subCategory: cardData.subCategory || "",
        image: cardData.image || "",
      },
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to add card to review");
  }

  return response.json();
}

/**
 * Remove a card from user's review list
 */
export async function removeFromReview(userId, cardId) {
  const response = await fetch(
    `${API_BASE_URL}/api/review-cards/${cardId}?user_id=${userId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to remove card from review");
  }

  return response.json();
}

/**
 * Fetch user's review cards with pagination
 */
export async function fetchReviewCards(
  userId,
  { limit = 20, cursor = null, status = null } = {}
) {
  const params = new URLSearchParams();
  params.append("user_id", userId);
  params.append("limit", limit);
  if (cursor) params.append("cursor", cursor);
  if (status) params.append("status", status);

  const response = await fetch(
    `${API_BASE_URL}/api/review-cards?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch review cards");
  }

  return response.json();
}

/**
 * Check if a specific card is bookmarked by the user
 */
export async function checkIsBookmarked(userId, cardId) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/review-cards/check/${cardId}?user_id=${userId}`
    );

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.isBookmarked;
  } catch {
    return false;
  }
}

/**
 * Get count of user's review cards
 */
export async function getReviewCount(userId, status = null) {
  const params = new URLSearchParams();
  params.append("user_id", userId);
  if (status) params.append("status", status);

  const response = await fetch(
    `${API_BASE_URL}/api/review-cards/count?${params.toString()}`
  );

  if (!response.ok) {
    return 0;
  }

  const data = await response.json();
  return data.count;
}

/**
 * Update the review status of a card
 */
export async function updateReviewStatus(userId, cardId, status) {
  const response = await fetch(
    `${API_BASE_URL}/api/review-cards/${cardId}/status?user_id=${userId}&status=${status}`,
    {
      method: "PATCH",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update review status");
  }

  return response.json();
}

/**
 * Bulk add all cards from a category to user's review list
 */
export async function bulkAddToReview(userId, level, category, cards) {
  const response = await fetch(`${API_BASE_URL}/api/review-cards/bulk`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      level,
      category,
      cards: cards.map((card) => ({
        id: card.id || "", // Unique ID from vocabulary source
        english: card.english,
        forms: card.forms,
        exampleTarget: card.exampleTarget,
        exampleNative: card.exampleNative,
        phonetic: card.phonetic,
        level: card.level,
        category: card.category,
        subCategory: card.subCategory || "",
        image: card.image || "",
      })),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to bulk add cards to review");
  }

  return response.json();
}

/**
 * Bulk remove all cards from a category from user's review list
 */
export async function bulkRemoveFromReview(userId, level, category) {
  const params = new URLSearchParams();
  params.append("user_id", userId);
  params.append("level", level);
  params.append("category", category);

  const response = await fetch(
    `${API_BASE_URL}/api/review-cards/bulk?${params.toString()}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to bulk remove cards from review");
  }

  return response.json();
}

/**
 * Check if a category is bookmarked (has any cards in review)
 */
export async function checkCategoryBookmarked(userId, level, category) {
  const params = new URLSearchParams();
  params.append("user_id", userId);
  params.append("level", level);
  params.append("category", category);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/review-cards/check-category?${params.toString()}`
    );

    if (!response.ok) {
      return { isBookmarked: false, bookmarkedCount: 0 };
    }

    return response.json();
  } catch {
    return { isBookmarked: false, bookmarkedCount: 0 };
  }
}
