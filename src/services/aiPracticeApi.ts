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

export interface ChatUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  estimated_cost_usd: number;
}

export interface ChatV2Topic { exercise_id: string; topic: string; ai_role: string; user_role: string; turn_limit: number; levels: string[]; }
export interface ChatV2Session { session_id: string; exercise_id: string; topic: string; scenario_title: string; level: string; ai_role: string; user_role: string; scenario: string; instruction_en: string; turn_limit: number; remaining_turns: number; }
export interface ChatV2MessageResponse extends ChatResponse {
  remaining_turns: number;
  completed: boolean;
  usage: ChatUsage;
  session_usage: ChatUsage;
}

export interface ChatV2StoredMessage {
  sender: "ai" | "user";
  text: string;
  correction?: string | null;
  sequence: number;
  created_at?: string | null;
  usage?: ChatUsage | null;
}

export interface ChatV2Feedback {
  analysis: FeedbackAnalysis;
  report: FeedbackReport;
}

export class RetryableFeedbackError extends Error {
  retryable = true;
}

export interface ChatV2SessionDetails extends ChatV2Session {
  completed: boolean;
  session_usage: ChatUsage;
  messages: ChatV2StoredMessage[];
  feedback?: ChatV2Feedback | null;
}

export interface GreetingResponse {
  ai_response: string;
  usage?: ChatUsage;
  session_usage?: ChatUsage;
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

export async function fetchChatV2Topics(language: string): Promise<{ count: number; topics: ChatV2Topic[] }> {
  const response = await fetch(`${API_URL}/api/ai-practice/v2/catalog?language=${encodeURIComponent(language.toUpperCase())}`);
  if (!response.ok) throw new Error(`Failed to fetch Chat v2 topics: ${response.statusText}`);
  return response.json();
}

export async function startChatV2Session(exerciseId: string, level: string, learningLanguage: string): Promise<ChatV2Session> {
  const response = await fetch(`${API_URL}/api/ai-practice/v2/sessions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ exercise_id: exerciseId, level, learning_language: learningLanguage }) });
  if (!response.ok) throw new Error(`Failed to start Chat v2: ${response.statusText}`);
  return response.json();
}

export async function getChatV2Greeting(sessionId: string): Promise<GreetingResponse> {
  const response = await fetch(`${API_URL}/api/ai-practice/v2/sessions/${sessionId}/greeting`, { method: "POST" });
  if (!response.ok) throw new Error(`Failed to start Chat v2 greeting: ${response.statusText}`);
  return response.json();
}

export async function sendChatV2Message(sessionId: string, message: string): Promise<ChatV2MessageResponse> {
  const response = await fetch(`${API_URL}/api/ai-practice/v2/sessions/${sessionId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
  if (!response.ok) throw new Error(`Chat v2 request failed: ${response.statusText}`);
  return response.json();
}

export async function getChatV2Session(sessionId: string): Promise<ChatV2SessionDetails> {
  const response = await fetch(`${API_URL}/api/ai-practice/v2/sessions/${sessionId}`);
  if (!response.ok) throw new Error(`Failed to restore Chat session: ${response.statusText}`);
  return response.json();
}

export async function completeChatV2Session(sessionId: string): Promise<{ completed: boolean; session_usage: ChatUsage }> {
  const response = await fetch(`${API_URL}/api/ai-practice/v2/sessions/${sessionId}/complete`, { method: "POST" });
  if (!response.ok) throw new Error(`Failed to complete Chat session: ${response.statusText}`);
  return response.json();
}

export async function getChatV2Hint(sessionId: string): Promise<{ hint: string }> {
  const response = await fetch(`${API_URL}/api/ai-practice/v2/sessions/${sessionId}/hint`, { method: "POST" });
  if (!response.ok) throw new Error(`Failed to generate Chat hint: ${response.statusText}`);
  return response.json();
}

export async function getChatV2Feedback(sessionId: string): Promise<ChatV2Feedback> {
  const response = await fetch(`${API_URL}/api/ai-practice/v2/sessions/${sessionId}/feedback`, { method: "POST" });
  if (!response.ok) {
    const detail = await response.json().catch(() => null) as { detail?: { retryable?: boolean; message?: string } | string } | null;
    if (typeof detail?.detail === "object" && detail.detail?.retryable) {
      throw new RetryableFeedbackError(detail.detail.message || "Feedback is taking longer than expected. Please try again.");
    }
    throw new Error(typeof detail?.detail === "string" ? detail.detail : `Failed to generate Chat feedback: ${response.statusText}`);
  }
  return response.json();
}

export async function getChatV2Transcript(sessionId: string): Promise<{ session_id: string; completed: boolean; messages: ChatV2StoredMessage[] }> {
  const response = await fetch(`${API_URL}/api/ai-practice/v2/sessions/${sessionId}/transcript`);
  if (!response.ok) throw new Error(`Failed to load Chat transcript: ${response.statusText}`);
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
