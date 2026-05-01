"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2, AlertCircle, BookOpen, CheckCircle2, XCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchStorySubtopicNotes, fetchStoryNoteHtml, StoryNote } from "@/services/storiesApi";

// ─── Quiz types ───────────────────────────────────────────────────────────────

interface QuizOption {
  text: string;
  isCorrect: boolean;
}

interface QuizQuestion {
  num: number;
  question: string;
  options: QuizOption[];
  explanation: string;
}

// ─── Parse quiz questions out of the raw HTML string ─────────────────────────

function parseQuizFromHtml(html: string): QuizQuestion[] {
  if (typeof window === "undefined") return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const cards = doc.querySelectorAll(".quiz-card");
  const questions: QuizQuestion[] = [];

  cards.forEach((card, i) => {
    const questionEl = card.querySelector(".quiz-question-content span");
    const question = questionEl?.textContent?.trim() ?? "";

    const optionEls = card.querySelectorAll(".quiz-option");
    const options: QuizOption[] = [];
    optionEls.forEach((opt) => {
      const text = opt.querySelector(".quiz-option-text")?.textContent?.trim() ?? "";
      const isCorrect = opt.getAttribute("data-type") === "correct";
      if (text) options.push({ text, isCorrect });
    });

    const explanation = card.querySelector(".feedback-text")?.textContent?.trim() ?? "";

    if (question && options.length > 0) {
      questions.push({ num: i + 1, question, options, explanation });
    }
  });

  return questions;
}

// ─── Strip quiz section + Take Quiz nav button from injected HTML ─────────────

function extractBody(fullHtml: string): string {
  const styleMatch = fullHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const styles = styleMatch ? `<style>${styleMatch[1]}</style>` : "";
  const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : fullHtml;
  const bodyNoScripts = body.replace(/<script[\s\S]*?<\/script>/gi, "");

  // Remove the quiz section and the Take Quiz nav button — both are now React
  const parser = new DOMParser();
  const doc = parser.parseFromString(bodyNoScripts, "text/html");
  doc.querySelector("#quiz")?.remove();
  doc.querySelector(".quiz-section")?.remove();
  // Remove nav-section that contains the Take Quiz button
  doc.querySelectorAll(".nav-section").forEach((el) => {
    if (el.querySelector('[data-section="quiz"]')) el.remove();
  });

  return styles + (doc.body?.innerHTML ?? bodyNoScripts);
}

// ─── React Quiz Component ─────────────────────────────────────────────────────

function StoryQuiz({ questions }: { questions: QuizQuestion[] }) {
  const [answers, setAnswers] = useState<Record<number, number>>({}); // qNum → optionIndex
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.num] !== undefined);
  const score = submitted
    ? questions.filter((q) => questions[q.num - 1]?.options[answers[q.num]]?.isCorrect).length
    : 0;

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-500">
        <BookOpen className="w-10 h-10 mb-3 opacity-40" />
        <p className="font-medium">No quiz questions available for this story.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">Quiz</h2>

      <div className="flex flex-col gap-5">
        {questions.map((q) => {
          const chosen = answers[q.num];
          const isAnswered = chosen !== undefined;

          return (
            <div
              key={q.num}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm"
            >
              {/* Question */}
              <div className="flex items-start gap-3 mb-4">
                <span className="shrink-0 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs font-bold px-2 py-1 rounded-md">
                  Q{q.num}
                </span>
                <p className="text-slate-800 dark:text-slate-100 font-semibold leading-snug">{q.question}</p>
              </div>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {q.options.map((opt, idx) => {
                  const isSelected = chosen === idx;
                  const showResult = submitted && isAnswered;
                  const isCorrectOpt = opt.isCorrect;

                  let cls =
                    "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all text-sm font-medium ";

                  if (showResult) {
                    if (isCorrectOpt) {
                      cls += "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300";
                    } else if (isSelected && !isCorrectOpt) {
                      cls += "border-red-400 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400";
                    } else {
                      cls += "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 opacity-60";
                    }
                  } else if (isSelected) {
                    cls += "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300";
                  } else {
                    cls += "border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={submitted}
                      onClick={() => !submitted && setAnswers((prev) => ({ ...prev, [q.num]: idx }))}
                      className={cls}
                    >
                      {/* Radio circle */}
                      <span
                        className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected
                            ? "border-current bg-current"
                            : "border-current opacity-40"
                        }`}
                      >
                        {isSelected && <span className="w-2 h-2 rounded-full bg-white" />}
                      </span>
                      {opt.text}
                      {showResult && isCorrectOpt && (
                        <CheckCircle2 className="ml-auto w-4 h-4 shrink-0 text-emerald-500" />
                      )}
                      {showResult && isSelected && !isCorrectOpt && (
                        <XCircle className="ml-auto w-4 h-4 shrink-0 text-red-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation after submit */}
              {submitted && q.explanation && (
                <div className="mt-3 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/40 rounded-lg px-3 py-2 border border-slate-100 dark:border-slate-700">
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Submit / Score */}
      <div className="mt-6 flex flex-col items-center gap-3">
        {!submitted ? (
          <button
            disabled={!allAnswered}
            onClick={() => setSubmitted(true)}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-base transition-colors"
          >
            Submit Answers
          </button>
        ) : (
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              {score} / {questions.length}
            </p>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {score === questions.length
                ? "Perfect score! 🎉"
                : score >= questions.length / 2
                ? "Good job! Keep practising."
                : "Keep going — you'll get there!"}
            </p>
            <button
              onClick={() => { setAnswers({}); setSubmitted(false); }}
              className="mt-4 px-6 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StoryNotePage() {
  const params = useParams<{ subtopicId: string }>();
  const subtopicId = params?.subtopicId;
  const router = useRouter();
  const { knownLang } = useLanguage();

  const [notes, setNotes] = useState<StoryNote[]>([]);
  const [activeNote, setActiveNote] = useState<StoryNote | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [activeTab, setActiveTab] = useState<"story" | "quiz">("story");
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingHtml, setLoadingHtml] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Ref so loadNotes doesn't re-run when LanguageContext hydrates from localStorage
  const knownLangRef = useRef(knownLang);
  useEffect(() => { knownLangRef.current = knownLang; }, [knownLang]);

  const loadNotes = useCallback(async () => {
    if (!subtopicId) return;
    setLoadingNotes(true);
    setError(null);
    try {
      let data = await fetchStorySubtopicNotes(Number(subtopicId), knownLangRef.current);
      if (data.length === 0) data = await fetchStorySubtopicNotes(Number(subtopicId));
      setNotes(data);
      setActiveNote((prev) => prev ?? data[0] ?? null);
    } catch (e: any) {
      setError(e.message ?? "Failed to load story");
    } finally {
      setLoadingNotes(false);
    }
  }, [subtopicId]);

  const activeNoteId = activeNote?.id ?? null;

  const loadHtml = useCallback(async (noteId: number) => {
    setLoadingHtml(true);
    setHtml(null);
    setQuizQuestions([]);
    setActiveTab("story");
    try {
      const content = await fetchStoryNoteHtml(noteId);
      const parsed = parseQuizFromHtml(content);
      setQuizQuestions(parsed);
      setHtml(content);
    } catch (e: any) {
      setError(e.message ?? "Failed to load story content");
    } finally {
      setLoadingHtml(false);
    }
  }, []);

  useEffect(() => { loadNotes(); }, [loadNotes]);
  useEffect(() => { if (activeNoteId) loadHtml(activeNoteId); }, [activeNoteId, loadHtml]);

  // Wire up story interactivity (translation, audio) after HTML is injected
  useEffect(() => {
    if (!html || !contentRef.current) return;
    if (cleanupRef.current) cleanupRef.current();

    const root = contentRef.current;
    const abortCtrl = new AbortController();
    const sig = { signal: abortCtrl.signal };

    // ── Resolve French TTS voice (async on Chrome) ──────────────────────────
    // Setting lang alone is unreliable — the browser may fall back to the
    // default voice if voices haven't loaded yet. We resolve the best French
    // voice once and reuse it for all utterances in this page.
    let frenchVoice: SpeechSynthesisVoice | null = null;
    const resolveFrenchVoice = () => {
      const voices = window.speechSynthesis?.getVoices() ?? [];
      frenchVoice =
        voices.find((v) => v.lang === "fr-FR") ??
        voices.find((v) => v.lang === "fr-CA") ??
        voices.find((v) => v.lang.startsWith("fr")) ??
        null;
    };
    if (window.speechSynthesis) {
      resolveFrenchVoice();
      // Chrome fires onvoiceschanged when the list is ready
      window.speechSynthesis.onvoiceschanged = resolveFrenchVoice;
    }

    /** Create a French utterance with the best available voice. */
    const makeFrenchUtt = (text: string): SpeechSynthesisUtterance => {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "fr-FR";
      if (frenchVoice) utt.voice = frenchVoice;
      return utt;
    };

    // ── Hero translate ──────────────────────────────────────────────────────
    const heroBtn = root.querySelector<HTMLButtonElement>("#heroTranslateBtn");
    const titleGroup = root.querySelector<HTMLElement>(".hero-title-group");
    const descGroup = root.querySelector<HTMLElement>(".hero-description-group");
    const titleEl = root.querySelector<HTMLElement>(".hero-title");
    const descEl = root.querySelector<HTMLElement>(".hero-description");

    if (heroBtn && titleGroup && titleEl) {
      let heroShowing = false;
      const langs = ["fr", "en", "es", "de"];
      const currentTitle = titleEl.textContent?.trim() ?? "";
      const detectedPrimary = langs.find((l) => titleGroup.dataset[l]?.trim() === currentTitle) ?? "fr";
      const transLang = detectedPrimary === "en" ? "fr" : "en";
      heroBtn.addEventListener("click", () => {
        heroShowing = !heroShowing;
        if (titleEl && titleGroup)
          titleEl.textContent = heroShowing
            ? (titleGroup.dataset[transLang] ?? titleEl.textContent)
            : (titleGroup.dataset[detectedPrimary] ?? titleEl.textContent);
        if (descEl && descGroup)
          descEl.textContent = heroShowing
            ? (descGroup.dataset[transLang] ?? descEl.textContent)
            : (descGroup.dataset[detectedPrimary] ?? descEl.textContent);
      }, sig);
    }

    // ── Monologue translate ─────────────────────────────────────────────────
    const paraBtn = root.querySelector<HTMLButtonElement>("#paraTranslateBtn");
    const translationPara = root.querySelector<HTMLElement>("#translationParagraph");
    if (paraBtn && translationPara) {
      let paraShowing = false;
      paraBtn.addEventListener("click", () => {
        paraShowing = !paraShowing;
        translationPara.style.display = paraShowing ? "block" : "none";
      }, sig);
    }

    // ── Monologue audio ─────────────────────────────────────────────────────
    const monoPlayBtn = root.querySelector<HTMLButtonElement>("#monoPlayBtn");
    const primaryPara = root.querySelector<HTMLElement>("#primaryParagraph");
    if (monoPlayBtn && primaryPara) {
      let monoPlaying = false;
      monoPlayBtn.addEventListener("click", () => {
        if (!window.speechSynthesis) return;
        if (monoPlaying) {
          window.speechSynthesis.cancel();
          monoPlaying = false;
          monoPlayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px"><path d="M8 5v14l11-7z"/></svg>';
        } else {
          const utt = makeFrenchUtt(primaryPara.textContent ?? "");
          utt.onend = () => {
            monoPlaying = false;
            monoPlayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px"><path d="M8 5v14l11-7z"/></svg>';
          };
          window.speechSynthesis.speak(utt);
          monoPlaying = true;
          monoPlayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        }
      }, sig);
    }

    // ── Per-bubble translate ────────────────────────────────────────────────
    root.querySelectorAll<HTMLButtonElement>(".msg-translate-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const group = btn.closest(".msg-bubble-inner")?.querySelector<HTMLElement>(".msg-text-group");
        const tr = group?.querySelector<HTMLElement>(".msg-translation");
        if (tr) tr.style.display = tr.style.display === "block" ? "none" : "block";
      }, sig);
    });

    // ── Translate All ───────────────────────────────────────────────────────
    const translateAllBtn = root.querySelector<HTMLButtonElement>("#convTranslateAllBtn");
    if (translateAllBtn) {
      let allShowing = false;
      translateAllBtn.addEventListener("click", () => {
        allShowing = !allShowing;
        root.querySelectorAll<HTMLElement>(".msg-translation").forEach((el) => {
          el.style.display = allShowing ? "block" : "none";
        });
      }, sig);
    }

    // ── Dialogue audio sidebar ──────────────────────────────────────────────
    const playBtn = root.querySelector<HTMLButtonElement>("#sidebarPlayBtn");
    const rewindBtn = root.querySelector<HTMLButtonElement>("#sidebarRewindBtn");
    const forwardBtn = root.querySelector<HTMLButtonElement>("#sidebarForwardBtn");
    const speedLabel = root.querySelector<HTMLElement>("#sidebarSpeedLabel");
    const progressFill = root.querySelector<HTMLElement>("#sidebarProgressFill");
    const msgRows = Array.from(root.querySelectorAll<HTMLElement>(".msg-row"));
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    let speedIdx = 1, currentIdx = 0, playing = false;

    function updateProgress() {
      if (progressFill && msgRows.length > 0)
        progressFill.style.height = `${((currentIdx + 1) / msgRows.length) * 100}%`;
    }
    function highlight(idx: number) {
      msgRows.forEach((r, i) => r.classList.toggle("msg-playing", i === idx));
    }
    function speak(idx: number) {
      if (!window.speechSynthesis || idx < 0 || idx >= msgRows.length) return;
      window.speechSynthesis.cancel();
      const textEl = msgRows[idx].querySelector<HTMLElement>(".msg-text");
      if (!textEl) return;
      const utt = makeFrenchUtt(textEl.textContent ?? "");
      utt.rate = speeds[speedIdx];
      utt.onend = () => {
        if (playing && idx + 1 < msgRows.length) {
          currentIdx = idx + 1; highlight(currentIdx); updateProgress(); speak(currentIdx);
        } else {
          playing = false;
          currentIdx = 0;
          highlight(-1);
          if (playBtn) playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px"><path d="M8 5v14l11-7z"/></svg>';
        }
      };
      window.speechSynthesis.speak(utt);
      highlight(idx); updateProgress();
    }

    if (playBtn) {
      playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px"><path d="M8 5v14l11-7z"/></svg>';
      playBtn.addEventListener("click", () => {
        playing = !playing;
        playBtn.innerHTML = playing
          ? '<svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px"><path d="M8 5v14l11-7z"/></svg>';
        if (playing) speak(currentIdx); else window.speechSynthesis?.cancel();
      }, sig);
    }
    if (rewindBtn) {
      rewindBtn.addEventListener("click", () => {
        if (currentIdx > 0) { currentIdx--; highlight(currentIdx); updateProgress(); if (playing) speak(currentIdx); }
      }, sig);
    }
    if (forwardBtn) {
      forwardBtn.addEventListener("click", () => {
        if (currentIdx < msgRows.length - 1) { currentIdx++; highlight(currentIdx); updateProgress(); if (playing) speak(currentIdx); }
      }, sig);
    }
    if (speedLabel) {
      speedLabel.addEventListener("click", () => {
        speedIdx = (speedIdx + 1) % speeds.length;
        speedLabel.textContent = `${speeds[speedIdx]}x`;
      }, sig);
    }

    cleanupRef.current = () => { abortCtrl.abort(); window.speechSynthesis?.cancel(); if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null; };
    return () => { abortCtrl.abort(); window.speechSynthesis?.cancel(); if (window.speechSynthesis) window.speechSynthesis.onvoiceschanged = null; };
  }, [html]);

  const isLoading = loadingNotes || loadingHtml;

  return (
    <div className="flex flex-col bg-[#f9f5f0] dark:bg-slate-950" style={{ height: "100dvh" }}>
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => router.push("/stories")}
          className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Stories
        </button>

        {notes.length > 1 && (
          <div className="flex gap-1 ml-4 overflow-x-auto">
            {notes.map((n, idx) => {
              const label = n.title ? (n.title.length > 22 ? n.title.slice(0, 20) + "…" : n.title) : `Part ${idx + 1}`;
              return (
                <button
                  key={n.id}
                  onClick={() => setActiveNote(n)}
                  title={n.title ?? undefined}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    activeNote?.id === n.id
                      ? "bg-slate-800 dark:bg-white text-white dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {activeNote?.title && (
          <span className="ml-auto text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-xs">
            {activeNote.title}
          </span>
        )}
      </div>

      {/* Story / Quiz tab bar — only shown when content is loaded */}
      {!isLoading && html && (
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
          <button
            onClick={() => setActiveTab("story")}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "story"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            Story
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === "quiz"
                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            Take Quiz
            {quizQuestions.length > 0 && (
              <span className="ml-2 text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded-full">
                {quizQuestions.length}
              </span>
            )}
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {isLoading && (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        )}

        {!isLoading && error && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl mx-4 mt-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isLoading && !error && notes.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No content available for this chapter yet.</p>
          </div>
        )}

        {!isLoading && !error && html && (
          <>
            {/* Story content — always mounted, hidden when quiz tab is active */}
            <div
              ref={contentRef}
              className="bg-white dark:bg-slate-900"
              style={{ display: activeTab === "story" ? "block" : "none" }}
              dangerouslySetInnerHTML={{ __html: extractBody(html) }}
            />

            {/* Quiz — pure React, never wiped by HTML re-renders */}
            {activeTab === "quiz" && (
              <div className="bg-[#f9f5f0] dark:bg-slate-950 min-h-full">
                <StoryQuiz questions={quizQuestions} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
