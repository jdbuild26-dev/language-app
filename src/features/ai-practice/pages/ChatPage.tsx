"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import ChatHeader from "@/features/ai-practice/components/chat/ChatHeader";
import ChatInput from "@/features/ai-practice/components/chat/ChatInput";
import MessageBubble from "@/features/ai-practice/components/chat/MessageBubble";
import ConversationWarmup from "@/features/ai-practice/components/ConversationWarmup";
import AnalyzeModal from "@/features/ai-practice/components/AnalyzeModal";
import {
  fetchTopicBySlug,
  sendChatMessage,
  getInitialGreeting,
  analyzeSession,
  getHint,
} from "@/services/aiPracticeApi";

export default function ChatPage() {
  const { topicSlug } = useParams();
  const router = useRouter();
  const messagesEndRef = useRef(null);

  // Scenario & UI state
  const [scenario, setScenario] = useState(null);
  const [initError, setInitError] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const [showWarmup, setShowWarmup] = useState(true);
  const [showAnalyze, setShowAnalyze] = useState(false);
  const [analysisData, setAnalysisData] = useState(null);

  // useChat manages messages, input, loading, and optimistic appending
  const {
    messages,
    setMessages,
    input,
    setInput,
    isLoading: isSending,
    error: chatError,
    append,
  } = useChat({
    // We handle sending manually via our own backend, so no api route needed.
    // Set a no-op api to prevent the default fetch.
    api: "/api/noop",
    // Disable automatic submission — we call append() ourselves.
    onError: (err) => console.error("useChat error:", err),
  });

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load scenario + initial greeting
  useEffect(() => {
    async function init() {
      try {
        setIsInitializing(true);
        setInitError(null);

        let scenarioData;
        const stored = sessionStorage.getItem("chatScenario");
        if (stored) {
          scenarioData = JSON.parse(stored);
          sessionStorage.removeItem("chatScenario");
        } else if (topicSlug) {
          scenarioData = await fetchTopicBySlug(topicSlug);
        } else {
          throw new Error("No scenario provided");
        }

        setScenario(scenarioData);

        const greeting = await getInitialGreeting({
          level: scenarioData.level,
          formality: scenarioData.formality,
          title: scenarioData.title,
          aiPrompt: scenarioData.aiPrompt,
          aiRole: scenarioData.aiRole,
          userRole: scenarioData.userRole,
          mode: scenarioData.mode || "chat",
          objective: scenarioData.objective,
        });

        // Seed useChat with the AI greeting as the first message
        setMessages([
          {
            id: "greeting",
            role: "assistant",
            content: greeting.ai_response,
            // Custom fields stored in the message for rendering
            autoPlay: false,
          },
        ]);
      } catch (err) {
        console.error("Failed to initialize chat:", err);
        setInitError("Failed to start conversation. Please try again.");
      } finally {
        setIsInitializing(false);
      }
    }

    init();
  }, [topicSlug, setMessages]);

  const handleWarmupComplete = () => {
    setShowWarmup(false);
    // Trigger audio autoplay on the greeting after warmup
    setMessages((prev) =>
      prev.map((m, i) => (i === 0 ? { ...m, autoPlay: true } : m))
    );
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isSending || !scenario) return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Optimistically append user message via useChat
    append({ role: "user", content: text, id: `user-${Date.now()}` } as any);
    setInput("");

    try {
      // Build history from current messages (before the new user msg)
      const history = messages.map((m) => ({
        sender: m.role === "assistant" ? "ai" : "user",
        text: m.content,
        correction: (m as any).correction ?? null,
      }));

      const response = await sendChatMessage({
        message: text,
        conversationHistory: history,
        scenario: {
          level: scenario.level,
          formality: scenario.formality,
          title: scenario.title,
          aiPrompt: scenario.aiPrompt,
          aiRole: scenario.aiRole,
          userRole: scenario.userRole,
          mode: scenario.mode || "chat",
          objective: scenario.objective,
        },
      });

      // Attach correction to the last user message, then append AI reply
      setMessages((prev) => {
        const updated = [...prev];
        // Find the last user message and attach correction
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].role === "user") {
            updated[i] = { ...updated[i], correction: response.correction } as any;
            break;
          }
        }
        return [
          ...updated,
          {
            id: `ai-${Date.now()}`,
            role: "assistant",
            content: response.ai_response,
            timestamp,
          } as any,
        ];
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      // Roll back the optimistic user message
      setMessages((prev) => prev.slice(0, -1));
    }
  };

  const handleEndSession = async () => {
    if (!scenario) return;
    setAnalysisData(null);
    setShowAnalyze(true);

    try {
      const history = messages.map((m) => ({
        sender: m.role === "assistant" ? "ai" : "user",
        text: m.content,
        correction: (m as any).correction ?? null,
      }));

      const analysis = await analyzeSession(history, {
        level: scenario.level,
        formality: scenario.formality,
        title: scenario.title,
        aiPrompt: scenario.aiPrompt,
        aiRole: scenario.aiRole,
        userRole: scenario.userRole,
        mode: scenario.mode || "chat",
        objective: scenario.objective,
      });

      setAnalysisData(analysis);
    } catch (err) {
      console.error("Failed to analyze session:", err);
      setAnalysisData({
        cefr_assessment: scenario.level || "A1",
        grammar_score: 0,
        vocabulary_score: 0,
        fluency_note: "Analysis failed. Please try again.",
        feedback_points: [],
      });
    }
  };

  const handleHint = async () => {
    if (!scenario) return null;
    try {
      const history = messages.map((m) => ({
        sender: m.role === "assistant" ? "ai" : "user",
        text: m.content,
        correction: (m as any).correction ?? null,
      }));
      const response = await getHint(history, {
        level: scenario.level,
        formality: scenario.formality,
        title: scenario.title,
        aiPrompt: scenario.aiPrompt,
        aiRole: scenario.aiRole,
        userRole: scenario.userRole,
        mode: scenario.mode || "chat",
        objective: scenario.objective,
      });
      return response.hint;
    } catch {
      return "Je ne sais pas quoi dire...";
    }
  };

  if (isInitializing) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-sky-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Starting conversation...</p>
        </div>
      </div>
    );
  }

  if (initError && !scenario) {
    return (
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{initError}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-gray-50 dark:bg-slate-950">
      {showWarmup && <ConversationWarmup onComplete={handleWarmupComplete} />}

      <AnalyzeModal
        isOpen={showAnalyze}
        onClose={() => router.push("/ai-practice")}
        analysisData={analysisData}
      />

      <ChatHeader scenario={scenario} onEndSession={handleEndSession} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={{
                id: message.id,
                sender: message.role === "assistant" ? "ai" : "user",
                text: message.content,
                correction: (message as any).correction,
                autoPlay: (message as any).autoPlay,
                timestamp: (message as any).timestamp,
              }}
            />
          ))}

          {/* Typing indicator */}
          {isSending && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl px-4 py-3 rounded-tl-sm">
                <div className="flex items-center gap-1">
                  {[0, 150, 300].map((delay) => (
                    <div
                      key={delay}
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {chatError && (
            <div className="text-center py-2">
              <p className="text-sm text-red-500">Failed to get response. Please try again.</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput
        onSend={handleSendMessage}
        onHint={handleHint}
        disabled={isSending || showWarmup}
      />
    </div>
  );
}
