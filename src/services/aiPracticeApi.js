const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Fetch AI practice chat topics with optional filtering.
 * @param {Object} options - Filter options
 * @param {string} [options.level] - CEFR level (A1, A2, B1, B2, C1, C2)
 * @param {string} [options.formality] - Conversation style (casual, formal)
 * @param {number} [options.limit] - Maximum number of topics
 * @returns {Promise<{count: number, topics: Array}>}
 */
export async function fetchChatTopics({ level, formality, limit } = {}) {
  const params = new URLSearchParams();
  if (level) params.append("level", level);
  if (formality) params.append("formality", formality);
  if (limit) params.append("limit", limit.toString());

  const queryString = params.toString();
  const url = `${API_URL}/api/ai-practice/topics${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch chat topics: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch a specific AI practice topic by slug.
 * @param {string} topicSlug - The topic slug
 * @returns {Promise<Object>} Topic details including AI prompt
 */
export async function fetchTopicBySlug(topicSlug) {
  const url = `${API_URL}/api/ai-practice/topics/${topicSlug}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch topic: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch available CEFR levels for AI practice.
 * @returns {Promise<{levels: string[]}>}
 */
export async function fetchAIPracticeLevels() {
  const url = `${API_URL}/api/ai-practice/levels`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch levels: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Send a message in an AI practice conversation.
 * @param {Object} params - Chat parameters
 * @param {string} params.message - User's message in French
 * @param {Array} params.conversationHistory - Previous messages
 * @param {Object} params.scenario - Scenario metadata
 * @returns {Promise<{ai_response: string, correction: string|null, conversation_history: Array}>}
 */
export async function sendChatMessage({
  message,
  conversationHistory,
  scenario,
}) {
  const url = `${API_URL}/api/ai-practice/chat`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      conversation_history: conversationHistory,
      scenario,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Get initial AI greeting for a new conversation.
 * @param {Object} scenario - Scenario metadata
 * @returns {Promise<{ai_response: string}>}
 */
export async function getInitialGreeting(scenario) {
  const url = `${API_URL}/api/ai-practice/chat/greeting`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scenario }),
  });

  if (!response.ok) {
    throw new Error(`Greeting request failed: ${response.statusText}`);
  }
  return response.json();
}
