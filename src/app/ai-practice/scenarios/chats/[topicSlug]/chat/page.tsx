"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader2, AlertCircle, BarChart2, FileDown, LogOut, X } from "lucide-react";
import ChatHeader from "@/features/ai-practice/components/chat/ChatHeader";
import ChatInput from "@/features/ai-practice/components/chat/ChatInput";
import MessageBubble from "@/features/ai-practice/components/chat/MessageBubble";
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
            autoPlay: true,
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
            autoPlay: true,
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
      .then((data) => { setAnalysisData(data); })
      .catch((err) => {
        console.error("Failed to analyze session:", err);
        setAnalysisData({
          cefr_assessment: scenario.level || "A1",
          overall_score: 0,
          overall_rating: "Very Weak",
          grammar_score: 0,
          vocabulary_score: 0,
          fluency_note: "Analysis failed. Please try again.",
          parameters: [],
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
        overall_score: 0,
        overall_rating: "Very Weak",
        grammar_score: 0,
        vocabulary_score: 0,
        fluency_note: "Analysis failed. Please try again.",
        parameters: [],
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
                <AnalyticsContent analysisData={analysisData} />
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
        disabled={isSending}
      />

      {/* Hidden transcript print container */}
      <div id="transcript-print-container" className="hidden" aria-hidden="true" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// AnalyticsContent — parameter bars with click-to-reveal ⓘ tooltip
// ---------------------------------------------------------------------------
function ParameterRow({ param }: { param: any }) {
  const [open, setOpen] = useState(false);
  const barColor = param.score >= 75 ? "bg-emerald-500" : param.score >= 60 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <span className="font-semibold text-sm text-gray-800 dark:text-slate-100 flex-1 leading-tight">
          {param.name}
        </span>
        <div className="relative shrink-0">
          <button
            onClick={() => setOpen((v) => !v)}
            className={`rounded-full transition-colors ${open ? "text-sky-500" : "text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"}`}
            aria-label="More info"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 16v-4M12 8h.01" />
            </svg>
          </button>
          {open && (
            <div className="absolute right-7 top-1/2 -translate-y-1/2 z-20 w-56 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded-xl px-3 py-2.5 shadow-2xl border border-slate-600">
              {/* Arrow pointing right toward the button */}
              <span className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[6px] border-l-slate-800 dark:border-l-slate-700" />
              {param.tooltip}
            </div>
          )}
        </div>
      </div>
      <div className="flex-1 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${param.score}%` }}
        />
      </div>
    </div>
  );
}

function AnalyticsContent({ analysisData }: { analysisData: any }) {
  const scoreColor = (s: number) =>
    s >= 75 ? "text-emerald-500" : s >= 60 ? "text-amber-500" : "text-red-500";

  const overallScore = analysisData.overall_score
    ?? (analysisData.parameters?.length > 0
      ? Math.round(
          analysisData.parameters.reduce((sum: number, p: any) => sum + (p.score * (p.weight ?? (1 / analysisData.parameters.length))), 0)
        )
      : Math.round(((analysisData.grammar_score ?? 0) + (analysisData.vocabulary_score ?? 0)) / 2));

  const overallRating = analysisData.overall_rating || (
    overallScore >= 90 ? "Excellent" :
    overallScore >= 75 ? "Good" :
    overallScore >= 60 ? "Fair" :
    overallScore >= 40 ? "Weak" : "Very Weak"
  );

  // Use all 10 parameters from backend; fall back to grammar+vocab only if truly absent
  const rawParams = Array.isArray(analysisData.parameters) ? analysisData.parameters : [];
  const parameters: any[] = rawParams.length > 0
    ? rawParams
    : [
        { name: "Grammar control", tooltip: "How well the learner managed sentence formation and grammar.", score: analysisData.grammar_score ?? 0 },
        { name: "Vocabulary control", tooltip: "How well the learner used appropriate vocabulary for the situation.", score: analysisData.vocabulary_score ?? 0 },
      ];

  return (
    <div className="space-y-4">
      {/* CEFR + Overall + Rating */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl text-center">
          <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">CEFR Level</div>
          <div className="text-2xl font-bold text-sky-500">{analysisData.cefr_assessment}</div>
        </div>
        <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl text-center">
          <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">Overall</div>
          <div className={`text-2xl font-bold ${scoreColor(overallScore)}`}>
            {overallScore}%
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-xl text-center">
          <div className="text-xs text-gray-500 dark:text-slate-400 mb-1">Rating</div>
          <div className={`text-sm font-bold ${scoreColor(overallScore)}`}>
            {overallRating}
          </div>
        </div>
      </div>

      {/* Parameter bars */}
      <div className="space-y-3">
        {parameters.map((p: any, i: number) => (
          <ParameterRow key={i} param={p} />
        ))}
      </div>
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
