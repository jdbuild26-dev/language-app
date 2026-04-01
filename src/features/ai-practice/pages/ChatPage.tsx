"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
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

interface Scenario {
  title: string;
  level: string;
  formality: string;
  mode: string;
  aiRole: string;
  userRole: string;
  aiPrompt: string;
  objective?: string | null;
  icon?: string;
}

interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp?: string;
  correction?: string | null;
  autoPlay?: boolean;
}

export default function ChatPage() {
  const params = useParams();
  const topicSlug = params?.topicSlug as string | undefined;
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const [showWarmup, setShowWarmup] = useState(true);
  const [showAnalyze, setShowAnalyze] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);

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

        let scenarioData: Scenario;
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

        setMessages([
          {
            id: "greeting",
            sender: "ai",
            text: greeting.ai_response,
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
  }, [topicSlug]);

  const handleWarmupComplete = () => {
    setShowWarmup(false);
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

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
      timestamp,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSending(true);
    setSendError(null);

    try {
      const history = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
        correction: m.correction ?? null,
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

      setMessages((prev) => {
        const updated = [...prev];
        // Attach correction to the last user message
        for (let i = updated.length - 1; i >= 0; i--) {
          if (updated[i].sender === "user") {
            updated[i] = { ...updated[i], correction: response.correction };
            break;
          }
        }
        return [
          ...updated,
          {
            id: `ai-${Date.now()}`,
            sender: "ai" as const,
            text: response.ai_response,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ];
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setSendError("Failed to get response. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsSending(false);
    }
  };

  const handleEndSession = async () => {
    if (!scenario) return;
    setAnalysisData(null);
    setShowAnalyze(true);

    try {
      const history = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
        correction: m.correction ?? null,
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

  const handleHint = async (): Promise<string> => {
    if (!scenario) return "Je ne sais pas quoi dire...";
    try {
      const history = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
        correction: m.correction ?? null,
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
        mode={(scenario?.mode as any) ?? "chat"}
        scenarioTitle={scenario?.title}
      />

      <ChatHeader scenario={scenario} onEndSession={handleEndSession} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

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

          {sendError && (
            <div className="text-center py-2">
              <p className="text-sm text-red-500">{sendError}</p>
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
