"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, AlertCircle, BarChart2, FileDown, LogOut, X } from "lucide-react";
import ChatHeader from "@/features/ai-practice/components/chat/ChatHeader";
import ChatInput from "@/features/ai-practice/components/chat/ChatInput";
import MessageBubble from "@/features/ai-practice/components/chat/MessageBubble";
import ConversationWarmup from "@/features/ai-practice/components/ConversationWarmup";
import {
  fetchTopicBySlug,
  sendChatMessage,
  getInitialGreeting,
  analyzeSession,
  getHint,
  getFeedbackReport,
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
  const [showEndModal, setShowEndModal] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);

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
          try {
            const topic = await fetchTopicBySlug(topicSlug);
            scenarioData = {
              title: topic.title,
              level: topic.level || "A1",
              formality: topic.formality || "casual",
              mode: "chat",
              aiRole: topic.aiRole || "Conversation Partner",
              userRole: topic.userRole || "Learner",
              aiPrompt: topic.aiPrompt || "",
              objective: null,
              icon: topic.icon,
            };
          } catch {
            router.replace("/ai-practice/scenarios/chats");
            return;
          }
        } else {
          throw new Error("No scenario provided");
        }

        setScenario(scenarioData);

        let greetingText = "Bonjour ! Comment puis-je vous aider ?";
        try {
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
          greetingText = greeting.ai_response;
        } catch (greetErr) {
          console.warn("Greeting fetch failed, using fallback:", greetErr);
        }

        setMessages([
          {
            id: "greeting",
            sender: "ai",
            text: greetingText,
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

  // "End Session" button → show modal with analytics + action buttons
  const handleEndSession = () => {
    if (!scenario) return;
    setAnalysisData(null);
    setShowEndModal(true);

    // Kick off analysis immediately in the background
    const history = messages.map((m) => ({
      sender: m.sender,
      text: m.text,
      correction: m.correction ?? null,
    }));

    analyzeSession(history, {
      level: scenario.level,
      formality: scenario.formality,
      title: scenario.title,
      aiPrompt: scenario.aiPrompt,
      aiRole: scenario.aiRole,
      userRole: scenario.userRole,
      mode: scenario.mode || "chat",
      objective: scenario.objective,
    })
      .then(setAnalysisData)
      .catch(() => {
        setAnalysisData({
          cefr_assessment: scenario.level || "A1",
          grammar_score: 0,
          vocabulary_score: 0,
          fluency_note: "Analysis failed. Please try again.",
          feedback_points: [],
        });
      });
  };

  // Fallback quick-analyze (used as fallback from handleGetFeedback)
  const handleQuickAnalyze = async () => {
    if (!scenario) return;
    setAnalysisData(null);
    setShowEndModal(true);

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

  // Full CEFR feedback report → navigates to /ai-practice/report
  const handleGetFeedback = async () => {
    if (!scenario || isLoadingReport) return;
    setIsLoadingReport(true);

    try {
      const history = messages.map((m) => ({
        sender: m.sender,
        text: m.text,
        correction: m.correction ?? null,
      }));

      const report = await getFeedbackReport(history, {
        level: scenario.level,
        formality: scenario.formality,
        title: scenario.title,
        aiPrompt: scenario.aiPrompt,
        aiRole: scenario.aiRole,
        userRole: scenario.userRole,
        mode: scenario.mode || "chat",
        objective: scenario.objective,
      });

      // Store report + transcript in sessionStorage for the report page
      sessionStorage.setItem(
        "feedbackReport",
        JSON.stringify({
          ...report,
          messages: messages.map((m) => ({
            sender: m.sender,
            text: m.text,
            correction: m.correction ?? null,
            timestamp: m.timestamp,
          })),
        })
      );

      router.push("/ai-practice/report");
    } catch (err) {
      console.error("Failed to get feedback report:", err);
      // Fallback: show quick analyze modal
      handleQuickAnalyze();
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Download transcript as PDF via window.print()
  const handleDownloadTranscript = () => {
    const printContainer = document.getElementById("transcript-print-container");
    if (!printContainer) return;

    const lines = messages
      .map((m) => {
        const sender = m.sender === "ai" ? "AI" : "You";
        const time = m.timestamp ? ` (${m.timestamp})` : "";
        let html = `<div class="msg-block">
          <div class="msg-sender">${sender}${time}</div>
          <div class="msg-text">${escapeHtml(m.text)}</div>`;
        if (m.sender === "user" && m.correction) {
          html += `<div class="msg-correction">✓ Correction: ${escapeHtml(m.correction)}</div>`;
        }
        html += `</div>`;
        return html;
      })
      .join("");

    printContainer.innerHTML = `
      <div class="transcript-header">
        <h1>Conversation Transcript</h1>
        <p>${scenario?.title ?? "AI Practice Session"} · ${scenario?.level ?? ""} · ${new Date().toLocaleDateString()}</p>
      </div>
      <div class="transcript-body">${lines}</div>
    `;

    window.print();
  };

  // End without feedback
  const handleEndWithoutFeedback = () => {
    router.push("/ai-practice");
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
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-sky-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">Starting conversation...</p>
        </div>
      </div>
    );
  }

  if (initError && !scenario) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-700 dark:text-slate-300 font-semibold mb-2">
            Couldn't start the conversation
          </p>
          <p className="text-red-600 dark:text-red-400 text-sm mb-6">{initError}</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors font-medium"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-gray-50 dark:bg-slate-950">
      {showWarmup && <ConversationWarmup onComplete={handleWarmupComplete} />}

      {/* End Session modal — analytics + action buttons */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden">

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">End Session</h2>
                {scenario?.title && (
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{scenario.title}</p>
                )}
              </div>
              <button
                onClick={() => setShowEndModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Analytics section */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {!analysisData ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-gray-500 dark:text-slate-400">Analysing your session...</p>
                </div>
              ) : (
                <>
                  {/* CEFR + scores */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl text-center">
                      <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">CEFR Level</div>
                      <div className="text-2xl font-bold text-sky-500">{analysisData.cefr_assessment}</div>
                    </div>
                    {/* Grammar */}
                    <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-gray-500 dark:text-slate-400">Grammar</span>
                        <span className={`text-lg font-bold ${analysisData.grammar_score >= 80 ? "text-emerald-600 dark:text-emerald-400" : analysisData.grammar_score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-500"}`}>
                          {analysisData.grammar_score}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${analysisData.grammar_score >= 80 ? "bg-emerald-500" : analysisData.grammar_score >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${analysisData.grammar_score}%` }}
                        />
                      </div>
                    </div>
                    {/* Vocabulary */}
                    <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs text-gray-500 dark:text-slate-400">Vocabulary</span>
                        <span className={`text-lg font-bold ${analysisData.vocabulary_score >= 80 ? "text-emerald-600 dark:text-emerald-400" : analysisData.vocabulary_score >= 60 ? "text-amber-600 dark:text-amber-400" : "text-red-500"}`}>
                          {analysisData.vocabulary_score}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${analysisData.vocabulary_score >= 80 ? "bg-emerald-500" : analysisData.vocabulary_score >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${analysisData.vocabulary_score}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Fluency note */}
                  <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-xl p-3 flex items-start gap-2">
                    <span className="text-sky-500 mt-0.5">★</span>
                    <div>
                      <div className="text-xs font-semibold text-sky-600 dark:text-sky-400 mb-0.5">Fluency Assessment</div>
                      <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{analysisData.fluency_note}</p>
                    </div>
                  </div>

                  {/* Feedback points */}
                  {analysisData.feedback_points?.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 dark:text-slate-400 text-sm">
                      ✓ No major errors detected. Great job!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide">Detailed Feedback</div>
                      {analysisData.feedback_points?.map((point: any, i: number) => (
                        <div key={i} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden text-sm">
                          <div className="px-3 py-2 bg-red-50/60 dark:bg-red-900/10 border-b border-red-100 dark:border-red-900/20">
                            <span className="text-xs font-semibold text-red-500 uppercase tracking-wide">Mistake </span>
                            <span className="text-gray-700 dark:text-gray-300 line-through decoration-red-400/60">{point.error}</span>
                          </div>
                          <div className="px-3 py-2">
                            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">Correction </span>
                            <span className="text-gray-900 dark:text-white">{point.correction}</span>
                            {point.explanation && (
                              <p className="text-xs text-gray-500 dark:text-slate-400 italic mt-0.5">{point.explanation}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-800 flex flex-col gap-2 shrink-0">
              <button
                onClick={handleGetFeedback}
                disabled={isLoadingReport}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm transition-colors disabled:opacity-60"
              >
                <BarChart2 className="w-4 h-4 shrink-0" />
                {isLoadingReport ? "Generating report..." : "Get my feedback report"}
              </button>
              <button
                onClick={() => { setShowEndModal(false); handleDownloadTranscript(); }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-medium text-sm transition-colors"
              >
                <FileDown className="w-4 h-4 shrink-0" />
                Download transcript (PDF)
              </button>
              <button
                onClick={() => { setShowEndModal(false); handleEndWithoutFeedback(); }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-800 text-white font-medium text-sm transition-colors"
              >
                <LogOut className="w-4 h-4 shrink-0" />
                End without feedback
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Hidden transcript print container */}
      <div id="transcript-print-container" className="hidden" aria-hidden="true" />
    </div>
  );
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
