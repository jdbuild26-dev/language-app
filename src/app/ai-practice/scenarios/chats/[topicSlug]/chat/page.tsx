"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, BarChart2, FileDown, LogOut, CheckCircle2 } from "lucide-react";
import ChatHeader from "@/features/ai-practice/components/chat/ChatHeader";
import ChatInput from "@/features/ai-practice/components/chat/ChatInput";
import MessageBubble from "@/features/ai-practice/components/chat/MessageBubble";
import {
  completeChatV2Session,
  getChatV2Feedback,
  getChatV2Greeting,
  getChatV2Hint,
  getChatV2Session,
  getChatV2Transcript,
  RetryableFeedbackError,
  sendChatV2Message,
  type ChatUsage,
} from "@/services/aiPracticeApi";

interface Scenario {
  title: string;
  titleEn?: string;
  level: string;
  formality: string;
  mode: string;
  aiRole: string;
  userRole: string;
  aiPrompt: string;
  icon?: string;
  learning_lang: string;
  known_lang: string;
  sessionId?: string;
  turnLimit?: number;
  topic?: string;
  learnerInstruction?: string;
  instructionEn?: string;
  remainingTurns?: number;
}
interface Message {
  id: string;
  sender: "ai" | "user";
  text: string;
  timestamp?: string;
  correction?: string | null;
  autoPlay?: boolean;
  usage?: ChatUsage;
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionFromUrl = searchParams?.get("session") || null;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);

  const [showEndModal, setShowEndModal] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [sessionUsage, setSessionUsage] = useState<ChatUsage | null>(null);
  const [remainingTurns, setRemainingTurns] = useState<number | null>(null);
  const [feedbackRetryMessage, setFeedbackRetryMessage] = useState<string | null>(null);
  const [isDownloadingTranscript, setIsDownloadingTranscript] = useState(false);
  const [transcriptDownloadError, setTranscriptDownloadError] = useState<string | null>(null);
  const showUsageDiagnostics = process.env.NEXT_PUBLIC_AI_PRACTICE_SHOW_USAGE === "true";

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const messageFromStored = (message: { sequence: number; sender: "ai" | "user"; text: string; correction?: string | null; created_at?: string | null; usage?: ChatUsage | null }): Message => ({
    id: `stored-${message.sequence}`,
    sender: message.sender,
    text: message.text,
    correction: message.correction,
    timestamp: message.created_at ? new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
    autoPlay: false,
    usage: message.usage || undefined,
  });

  // Restore the persisted V2 session, then create a greeting only when needed.
  useEffect(() => {
    async function init() {
      // React Strict Mode intentionally runs effects twice in local development.
      // Do not consume the session scenario twice and then fall back to a legacy ID.
      if (initializedRef.current) return;
      initializedRef.current = true;
      try {
        setIsInitializing(true);
        setInitError(null);

        let scenarioData: Scenario;
        const stored = sessionStorage.getItem("chatScenario");
        if (stored) {
          scenarioData = JSON.parse(stored);
        } else if (sessionFromUrl) {
          scenarioData = { title: "", level: "A1", formality: "", mode: "chat", aiRole: "", userRole: "", aiPrompt: "", learning_lang: "", known_lang: "", sessionId: sessionFromUrl };
        } else {
          router.replace("/ai-practice/scenarios/chats");
          return;
        }
        const sessionId = scenarioData.sessionId;
        if (!sessionId) throw new Error("No AI Practice session was found.");
        const restored = await getChatV2Session(sessionId);
        scenarioData = { ...scenarioData, title: restored.scenario_title, titleEn: restored.scenario_title_en, topic: restored.topic, level: restored.level, aiRole: restored.ai_role, userRole: restored.user_role, learnerInstruction: restored.scenario, instructionEn: restored.instruction_en, turnLimit: restored.turn_limit, remainingTurns: restored.remaining_turns };
        setScenario(scenarioData);
        setSessionUsage(restored.session_usage);
        setRemainingTurns(restored.remaining_turns);
        setIsCompleted(restored.completed);
        setShowEndModal(restored.completed);
        if (restored.messages.length) {
          setMessages(restored.messages.map(messageFromStored));
        } else {
          const greeting = await getChatV2Greeting(sessionId);
          setSessionUsage(greeting.session_usage || restored.session_usage);
          setMessages([{ id: "greeting", sender: "ai", text: greeting.ai_response, autoPlay: true, usage: greeting.usage }]);
        }
        if (restored.completed) {
          void getChatV2Feedback(sessionId)
            .then((feedback) => setAnalysisData(feedback.analysis))
            .catch(() => setAnalysisData({ analysis_failed: true }));
        }
      } catch (err) {
        console.error("Failed to initialize chat:", err);
        setInitError("Failed to start conversation. Please try again.");
      } finally {
        setIsInitializing(false);
      }
    }

    init();
  }, [router, sessionFromUrl]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isSending || !scenario || isCompleted) return;

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
      if (!scenario.sessionId) throw new Error("Chat session is unavailable.");
      const response = await sendChatV2Message(scenario.sessionId, text);

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
            usage: response.usage,
          },
        ];
      });
      setSessionUsage(response.session_usage);
      setRemainingTurns(response.remaining_turns);
      if (response.completed) {
        setIsCompleted(true);
        setShowEndModal(true);
        handleQuickAnalyze();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setSendError("Failed to get response. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsSending(false);
    }
  };

  const handleEndSession = async () => {
    if (!scenario?.sessionId) return;
    setAnalysisData(null);
    setShowEndModal(true);
    try {
      const completed = await completeChatV2Session(scenario.sessionId);
      setIsCompleted(completed.completed);
      setSessionUsage(completed.session_usage);
      await handleQuickAnalyze();
    } catch {
      setSendError("Could not end this session. Please try again.");
    }
  };

  // Fallback quick-analyze (used as fallback from handleGetFeedback)
  const handleQuickAnalyze = async () => {
    if (!scenario?.sessionId) return;
    setAnalysisData(null);
    setShowEndModal(true);

    try {
      const feedback = await getChatV2Feedback(scenario.sessionId);
      setAnalysisData(feedback.analysis);
    } catch (err) {
      console.error("Failed to analyze session:", err);
      setAnalysisData({
        analysis_failed: true,
      });
    }
  };

  // Full CEFR feedback report → navigates to /ai-practice/report
  const handleGetFeedback = async () => {
    if (!scenario?.sessionId || isLoadingReport) return;
    setIsLoadingReport(true);
    setFeedbackRetryMessage(null);

    try {
      const [feedback, transcript] = await Promise.all([
        getChatV2Feedback(scenario.sessionId),
        getChatV2Transcript(scenario.sessionId),
      ]);
      const report = { ...feedback.report, title: scenario.title, date: new Date().toISOString().slice(0, 10) };

      // Store report + transcript in sessionStorage for the report page
      sessionStorage.setItem(
        "feedbackReport",
        JSON.stringify({
          ...report,
          parameters: feedback.analysis.parameters ?? [],
          overall_score: feedback.analysis.overall_score ?? null,
          messages: transcript.messages.map((m) => ({
            sender: m.sender,
            text: m.text,
            correction: m.correction ?? null,
            timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : undefined,
          })),
        })
      );

      router.push("/ai-practice/report");
    } catch (err) {
      console.error("Failed to get feedback report:", err);
      if (err instanceof RetryableFeedbackError) {
        setFeedbackRetryMessage(err.message);
      } else {
        // Preserve the current fallback for non-timeout failures.
        handleQuickAnalyze();
      }
    } finally {
      setIsLoadingReport(false);
    }
  };

  // Generate a real multi-page PDF instead of relying on the browser print layout.
  const handleDownloadTranscript = async () => {
    if (!scenario?.sessionId || isDownloadingTranscript) return;
    setIsDownloadingTranscript(true);
    setTranscriptDownloadError(null);

    try {
      const [{ jsPDF }, transcript] = await Promise.all([
        import("jspdf"),
        getChatV2Transcript(scenario.sessionId),
      ]);
      const pdf = new jsPDF({ unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 18;
      const contentWidth = pageWidth - margin * 2;
      const bottom = pageHeight - 18;
      let y = margin;

      const addPage = () => {
        pdf.addPage();
        y = margin;
      };
      const ensureSpace = (height: number) => {
        if (y + height > bottom) addPage();
      };
      const writeWrapped = (text: string, options?: { color?: [number, number, number]; style?: "normal" | "bold" | "italic"; size?: number; lineHeight?: number }) => {
        const size = options?.size ?? 10.5;
        const lineHeight = options?.lineHeight ?? 5.2;
        pdf.setFont("helvetica", options?.style ?? "normal");
        pdf.setFontSize(size);
        pdf.setTextColor(...(options?.color ?? [31, 41, 55]));
        const wrapped = pdf.splitTextToSize(text, contentWidth) as string[];
        for (const line of wrapped) {
          ensureSpace(lineHeight);
          pdf.text(line, margin, y);
          y += lineHeight;
        }
      };

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(19);
      pdf.setTextColor(15, 23, 42);
      pdf.text("Conversation Transcript", margin, y);
      y += 8;
      writeWrapped(
        `${scenario.title || "AI Practice Session"} | ${scenario.level || ""} | ${new Date().toLocaleDateString()}`,
        { color: [100, 116, 139], size: 9.5, lineHeight: 4.8 },
      );
      y += 3;
      pdf.setDrawColor(203, 213, 225);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 8;

      transcript.messages.forEach((message) => {
        const sender = message.sender === "ai" ? "AI conversation partner" : "You";
        const time = message.created_at
          ? ` - ${new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
          : "";
        ensureSpace(14);
        writeWrapped(`${sender}${time}`, { color: [2, 132, 199], style: "bold", size: 9.5, lineHeight: 4.8 });
        writeWrapped(message.text, { size: 10.5, lineHeight: 5.4 });
        if (message.sender === "user" && message.correction) {
          y += 1;
          writeWrapped(`Correction: ${message.correction}`, { color: [180, 83, 9], style: "italic", size: 9.5, lineHeight: 5 });
        }
        y += 5;
      });

      const pageCount = pdf.getNumberOfPages();
      for (let page = 1; page <= pageCount; page += 1) {
        pdf.setPage(page);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 9, { align: "right" });
      }

      const safeTitle = (scenario.title || "conversation")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase();
      pdf.save(`${safeTitle || "conversation"}-transcript.pdf`);
    } catch (error) {
      console.error("Failed to download transcript:", error);
      setTranscriptDownloadError("The transcript could not be downloaded. Please try again.");
    } finally {
      setIsDownloadingTranscript(false);
    }
  };

  // End without feedback
  const handleEndWithoutFeedback = () => {
    router.push("/ai-practice");
  };

  const handleHint = async (): Promise<string> => {
    if (!scenario?.sessionId) return "Hint unavailable.";
    try {
      const response = await getChatV2Hint(scenario.sessionId);
      return response.hint;
    } catch {
      return "Hint unavailable. Please try again.";
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
      {/* ── End Session confirmation ── */}
      {showEndConfirm && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col gap-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                <LogOut className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">End session?</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                Are you sure you want to end this session? You'll get your feedback report.
              </p>
            </div>
            <div className="flex gap-3">
              {feedbackRetryMessage && <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-100">{feedbackRetryMessage}</div>}
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
              >
                Keep chatting
              </button>
              <button
                onClick={() => { setShowEndConfirm(false); handleEndSession(); }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm transition-colors"
              >
                End session
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Header, transcript, and composer form one aligned conversation panel. */}
        <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-gray-50 dark:bg-slate-950" aria-label={isCompleted ? "Completed conversation" : "Conversation"}>
          <ChatHeader scenario={scenario} remainingTurns={remainingTurns} isCompleted={isCompleted} onEndSession={() => setShowEndConfirm(true)} />

          {showUsageDiagnostics && scenario?.sessionId && sessionUsage && (
            <div className="border-b border-violet-200 bg-violet-50 px-4 py-2 text-xs text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-200">
              <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-4 gap-y-1">
                <span className="font-semibold">Testing usage</span>
                {remainingTurns !== null && <span>{remainingTurns} learner turn{remainingTurns === 1 ? "" : "s"} remaining</span>}
                <span>Session: {sessionUsage.total_tokens.toLocaleString()} tokens</span>
                <span>Estimated: ${sessionUsage.estimated_cost_usd.toFixed(5)}</span>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="border-b border-emerald-200 bg-emerald-50 px-4 py-2.5 text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-200">
              <div className="mx-auto flex max-w-5xl items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Conversation complete — you can still review, translate and listen to every message.
              </div>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
            <div className="mx-auto max-w-5xl" role="log" aria-live="polite">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {isSending && (
                <div className="mb-4 flex justify-start">
                  <div className="rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3 dark:bg-slate-800">
                    <div className="flex items-center gap-1">
                      {[0, 150, 300].map((delay) => (
                        <div key={delay} className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: `${delay}ms` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {sendError && <div className="py-2 text-center"><p className="text-sm text-red-500">{sendError}</p></div>}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {!isCompleted && <ChatInput onSend={handleSendMessage} onHint={handleHint} disabled={isSending} />}
        </section>

        {/* Feedback sits beside the transcript on desktop and above it on smaller screens. */}
        {showEndModal && (
          <aside className="order-first flex max-h-[48vh] shrink-0 flex-col border-b border-slate-200 bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.4)] dark:border-slate-700 dark:bg-slate-900 lg:order-last lg:max-h-none lg:w-96 lg:border-b-0 lg:border-l" aria-label="Session feedback">
            <div className="shrink-0 border-b border-slate-100 px-5 py-4 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-sky-600 dark:text-sky-400">Conversation complete</p>
              <h2 className="mt-1 text-lg font-bold tracking-[-0.01em] text-slate-950 dark:text-white">Your feedback</h2>
              {scenario?.title && <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{scenario.title}</p>}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
              {!analysisData ? (
                <div className="flex flex-col items-center justify-center gap-3 py-10" role="status">
                  <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Analysing your session...</p>
                </div>
              ) : analysisData.analysis_failed ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
                  <AlertCircle className="h-8 w-8 text-amber-500" />
                  <p className="text-sm text-slate-600 dark:text-slate-300">The analysis could not be generated.</p>
                  <button type="button" onClick={handleQuickAnalyze} className="rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition-transform duration-150 hover:bg-sky-700 active:scale-[0.97]">
                    Retry analysis
                  </button>
                </div>
              ) : (
                <AnalyticsContent analysisData={analysisData} />
              )}
            </div>

            <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 bg-slate-50/80 px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
              {feedbackRetryMessage && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">{feedbackRetryMessage}</p>}
              {transcriptDownloadError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200">{transcriptDownloadError}</p>}
              <button onClick={handleGetFeedback} disabled={isLoadingReport} className="flex w-full items-center gap-3 rounded-xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-sky-700 active:scale-[0.98] disabled:opacity-60">
                {isLoadingReport ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <BarChart2 className="h-4 w-4 shrink-0" />}
                {isLoadingReport ? "Generating report..." : feedbackRetryMessage ? "Retry feedback" : "View full feedback report"}
              </button>
              <button onClick={handleDownloadTranscript} disabled={isDownloadingTranscript} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-[background-color,transform] duration-150 hover:bg-slate-50 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
                {isDownloadingTranscript ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <FileDown className="h-4 w-4 shrink-0" />}
                {isDownloadingTranscript ? "Preparing transcript..." : "Download transcript (PDF)"}
              </button>
              <button onClick={handleEndWithoutFeedback} className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100">
                <LogOut className="h-4 w-4 shrink-0" />
                Return to practice
              </button>
            </div>
          </aside>
        )}
      </div>

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
      <div className="grid grid-cols-1 gap-2">
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
