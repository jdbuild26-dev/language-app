const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PracticeTopic {
  id: number;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  level: string;
  formality: string;
  icon: string;
  estimatedTime: string;
  messageCount: number;
  aiRole: string;
  userRole: string;
  aiPrompt: string;
}

export interface ChatTopicOptions {
  level?: string;
  formality?: string;
  limit?: number;
}

export interface ChatMessage {
  sender: string;
  text: string;
  correction?: string | null;
}

export interface PracticeScenario {
  level: string;
  formality: string;
  title: string;
  aiPrompt: string;
  aiRole: string;
  userRole: string;
  mode: string;
  objective?: string | null;
  learning_lang?: string;
  known_lang?: string;
}

export interface ChatResponse {
  ai_response: string;
  correction: string | null;
  conversation_history: ChatMessage[];
}

export interface GreetingResponse {
  ai_response: string;
}

export interface FeedbackAnalysis {
  cefr_assessment: string;
  overall_score: number;
  overall_rating: string;
  grammar_score: number;
  vocabulary_score: number;
  fluency_note: string;
  mission_success: boolean | null;
  mission_feedback: string | null;
  parameters: any[];
  feedback_points: any[];
}

export interface FeedbackReport {
  level: string;
  title: string;
  date: string;
  report_markdown: string;
}

export interface DbTopic {
  id: number;
  slug: string;
  topic: string;
  ai_role: string;
  user_role: string;
  instructions: Record<string, string | null>;
  ai_prompts: Record<string, string | null>;
}

export interface TopicLevelData {
  slug: string;
  topic: string;
  ai_role: string;
  user_role: string;
  level: string;
  instruction: string | null;
  ai_prompt: string | null;
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/**
 * Fetch AI practice chat topics with optional filtering.
 */
export async function fetchChatTopics(options: ChatTopicOptions = {}): Promise<{ count: number; topics: PracticeTopic[] }> {
  const { level, formality, limit } = options;
  const params = new URLSearchParams();
  if (level) params.append("level", level);
  if (formality) params.append("formality", formality);
  if (limit) params.append("limit", limit.toString());

  const queryString = params.toString();
  const url = `${API_URL}/api/ai-practice/topics${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch chat topics: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch a specific AI practice topic by slug.
 */
export async function fetchTopicBySlug(topicSlug: string): Promise<PracticeTopic> {
  const url = `${API_URL}/api/ai-practice/topics/${topicSlug}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch topic: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch available CEFR levels for AI practice.
 */
export async function fetchAIPracticeLevels(): Promise<{ levels: string[] }> {
  const url = `${API_URL}/api/ai-practice/levels`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch levels: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Send a message in an AI practice conversation.
 */
export async function sendChatMessage({
  message,
  conversationHistory,
  scenario,
}: {
  message: string;
  conversationHistory: ChatMessage[];
  scenario: PracticeScenario;
}): Promise<ChatResponse> {
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
 */
export async function getInitialGreeting(scenario: PracticeScenario): Promise<GreetingResponse> {
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

/**
 * Translate text using the backend API.
 */
export async function translateText(text: string, targetLang: string = "en"): Promise<{ text: string, translation: string }> {
  // Corrected URL to match ai_practice.py route
  const url = `${API_URL}/api/ai-practice/translate`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, target_lang: targetLang }),
  });

  if (!response.ok) {
    throw new Error(`Translation request failed: ${response.status}`);
  }
  return response.json();
}

/**
 * Get a hint for what to say next in the conversation.
 */
export async function getHint(conversationHistory: ChatMessage[], scenario: PracticeScenario): Promise<{ hint: string }> {
  const url = `${API_URL}/api/ai-practice/hint`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_history: conversationHistory,
      scenario,
    }),
  });

  if (!response.ok) {
    throw new Error(`Hint request failed: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Analyze a completed conversation session.
 */
export async function analyzeSession(conversationHistory: ChatMessage[], scenario: PracticeScenario): Promise<FeedbackAnalysis> {
  const url = `${API_URL}/api/ai-practice/analyze`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_history: conversationHistory,
      scenario,
    }),
  });

  if (!response.ok) {
    throw new Error(`Analysis request failed: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Generate a full CEFR-level-aware feedback report for a completed conversation.
 */
export async function getFeedbackReport(conversationHistory: ChatMessage[], scenario: PracticeScenario): Promise<FeedbackReport> {
  const url = `${API_URL}/api/ai-practice/feedback-report`;

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      conversation_history: conversationHistory,
      scenario,
    }),
  });

  if (!response.ok) {
    throw new Error(`Feedback report request failed: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch all AI practice topics from the database (includes per-level prompts).
 */
export async function fetchDbTopics(): Promise<{ count: number; topics: DbTopic[] }> {
  const response = await fetch(`${API_URL}/api/ai-practice/db/topics`);
  if (!response.ok) throw new Error(`Failed to fetch DB topics: ${response.statusText}`);
  return response.json();
}

/**
 * Fetch a single topic with all level prompts from the database.
 */
export async function fetchDbTopicBySlug(slug: string): Promise<DbTopic> {
  const response = await fetch(`${API_URL}/api/ai-practice/db/topics/${slug}`);
  if (!response.ok) throw new Error(`Failed to fetch DB topic: ${response.statusText}`);
  return response.json();
}

/**
 * Fetch the instruction + AI prompt for a specific topic + CEFR level.
 */
export async function fetchTopicForLevel(slug: string, level: string): Promise<TopicLevelData> {
  const response = await fetch(`${API_URL}/api/ai-practice/db/topics/${slug}/level/${level}`);
  if (!response.ok) throw new Error(`Failed to fetch topic for level: ${response.statusText}`);
  return response.json();
}
