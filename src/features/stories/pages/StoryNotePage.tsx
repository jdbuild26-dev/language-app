"use client";

import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Languages,
  Loader2,
  Pause,
  Play,
  Volume2,
  Settings,
  SkipBack,
  SkipForward,
  X,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchStoryNoteHtml, fetchStorySubtopicNotes, StoryNote } from "@/services/storiesApi";

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

interface StoryLine {
  speaker: string;
  number: string;
  text: string;
  translation: string;
  side: "left" | "right";
}

interface StoryDisplayData {
  title: string;
  translatedTitle: string;
  description: string;
  translatedDescription: string;
  tags: string[];
  lines: StoryLine[];
  monologue: string;
  translatedMonologue: string;
}

const audioSpeeds = [0.75, 1, 1.25, 1.5, 2];

function parseQuizFromHtml(html: string): QuizQuestion[] {
  if (typeof window === "undefined") return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  return Array.from(doc.querySelectorAll(".quiz-card"))
    .map((card, i) => {
      const question = card.querySelector(".quiz-question-content span")?.textContent?.trim() ?? "";
      const options = Array.from(card.querySelectorAll(".quiz-option"))
        .map((opt) => ({
          text: opt.querySelector(".quiz-option-text")?.textContent?.trim() ?? "",
          isCorrect: opt.getAttribute("data-type") === "correct",
        }))
        .filter((opt) => opt.text);
      const explanation = card.querySelector(".feedback-text")?.textContent?.trim() ?? "";
      return { num: i + 1, question, options, explanation };
    })
    .filter((q) => q.question && q.options.length > 0);
}

function parseStoryDisplayData(html: string, activeNote: StoryNote | null): StoryDisplayData {
  const fallbackTitle = activeNote?.title ?? "Story";
  if (typeof window === "undefined") {
    return { title: fallbackTitle, translatedTitle: "", description: "", translatedDescription: "", tags: [], lines: [], monologue: "", translatedMonologue: "" };
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const titleGroup = doc.querySelector<HTMLElement>(".hero-title-group");
  const descriptionGroup = doc.querySelector<HTMLElement>(".hero-description-group");
  const title = doc.querySelector(".hero-title")?.textContent?.trim() || fallbackTitle;
  const description = doc.querySelector(".hero-description")?.textContent?.trim() || activeNote?.title || "";
  const translatedTitle = titleGroup?.dataset.en || "";
  const translatedDescription = descriptionGroup?.dataset.en || "";
  const tags = Array.from(doc.querySelectorAll(".meta-badge"))
    .map((tag) => tag.textContent?.trim() ?? "")
    .filter(Boolean)
    .slice(0, 4);

  const lines = Array.from(doc.querySelectorAll(".msg-row")).map((row, index) => ({
    speaker: row.querySelector(".msg-label span")?.textContent?.trim() || (index % 2 === 0 ? "Speaker A" : "Speaker B"),
    number: row.querySelector(".msg-label .badge")?.textContent?.trim() || String(index + 1),
    text: row.querySelector(".msg-text")?.textContent?.trim() || "",
    translation: row.querySelector(".msg-translation")?.textContent?.trim() || "",
    side: index % 2 === 0 ? "left" : "right",
  }));

  const monologue = doc.querySelector("#primaryParagraph")?.textContent?.trim() || "";
  const translatedMonologue = doc.querySelector("#translationParagraph")?.textContent?.trim() || "";
  return { title, translatedTitle, description, translatedDescription, tags, lines, monologue, translatedMonologue };
}

function StoryOverviewPanel({
  story,
  notes,
  activeNote,
  setActiveNote,
  activeTab,
  setActiveTab,
  darkMode,
  isPlaying,
  speed,
  onPlayPause,
  onPrevious,
  onNext,
  onSpeed,
}: {
  story: StoryDisplayData;
  notes: StoryNote[];
  activeNote: StoryNote | null;
  setActiveNote: (note: StoryNote) => void;
  activeTab: "story" | "quiz";
  setActiveTab: (tab: "story" | "quiz") => void;
  darkMode: boolean;
  isPlaying: boolean;
  speed: number;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSpeed: () => void;
}) {
  return (
    <aside className={`w-full shrink-0 border-r lg:w-[340px] ${darkMode ? "border-[#32353a] bg-[#1d2025]" : "border-[#e9e5df] bg-[#fbf9f6]"}`}>
      <div className="sticky top-[76px] flex max-h-[calc(100vh-76px)] flex-col px-6 py-5">
        <nav className="mb-5 flex items-center gap-7 border-b border-[#e9e5df] pb-3 text-base font-bold text-[#252c3a]">
          <button onClick={() => setActiveTab("story")} className={`pb-2 ${activeTab === "story" ? "border-b-2 border-[#54643b] text-[#54643b]" : ""}`}>
            Conversation
          </button>
          <button onClick={() => setActiveTab("quiz")} className={`pb-2 ${activeTab === "quiz" ? "border-b-2 border-[#54643b] text-[#54643b]" : ""}`}>
            Quiz
          </button>
        </nav>

        <div className="relative mb-6 overflow-hidden rounded-xl">
          <img src="/images/kitchen.jpg" alt="" className="h-56 w-full object-cover" />
          <div className="absolute bottom-3 right-3 rounded-md bg-[#54643b] p-2 text-white shadow-md">
            <BookOpen className="h-5 w-5" />
          </div>
        </div>

        <div className="mb-5 flex flex-wrap gap-2">
          {(story.tags.length ? story.tags : ["Daily Life", "Present Tense", "A1"]).map((tag) => (
            <span key={tag} className="rounded-full bg-[#f0f2ec] px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-[#54643b]">{tag}</span>
          ))}
        </div>

        <h2 className={`mb-3 font-serif text-3xl font-bold leading-tight ${darkMode ? "text-[#e1e2e9]" : "text-[#1b1c1b]"}`}>{story.title}</h2>
        <p className={`mb-6 text-sm font-semibold leading-6 ${darkMode ? "text-[#c6c6ca]" : "text-[#586170]"}`}>{story.description}</p>

        <div className={`shrink-0 rounded-2xl p-4 shadow-sm ${darkMode ? "bg-[#272a2f]" : "bg-white"}`}>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[#54643b]">
              <button onClick={onPrevious}><SkipBack className="h-4 w-4" /></button>
              <button onClick={onPlayPause}>{isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-current" />}</button>
              <button onClick={onNext}><SkipForward className="h-4 w-4" /></button>
            </div>
            <button onClick={onSpeed} className="text-xs font-bold text-[#54643b]">{speed}x</button>
            <Settings className="h-4 w-4 text-[#7f8874]" />
          </div>
          <div className="h-1.5 rounded-full bg-[#e6e5e1]">
            <div className="h-1.5 w-1/3 rounded-full bg-[#54643b]" />
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-bold text-[#8a9085]">
            <span>0:45</span><span>2:50</span>
          </div>
        </div>

        {notes.length > 1 && (
          <div className={`mt-6 rounded-2xl border p-4 ${darkMode ? "border-[#45474a] bg-[#272a2f]" : "border-[#e4e2e0] bg-white"}`}>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#87986a]">Parts</p>
            <div className="space-y-2">
              {notes.map((note, index) => (
                <button key={note.id} onClick={() => setActiveNote(note)} className={`w-full rounded-xl px-4 py-3 text-left text-sm font-bold transition ${activeNote?.id === note.id ? "bg-[#54643b] text-white" : darkMode ? "bg-[#1d2025] text-[#c6c6ca]" : "bg-[#f5f0ea] text-[#45483e]"}`}>
                  {note.title || `Part ${index + 1}`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function StoryReadingView({
  story,
  darkMode,
  activeAudioIndex,
  shownTranslations,
  setShownTranslations,
  onTranslateAll,
  onSpeakLine,
}: {
  story: StoryDisplayData;
  darkMode: boolean;
  activeAudioIndex: number | null;
  shownTranslations: Record<number, boolean>;
  setShownTranslations: Dispatch<SetStateAction<Record<number, boolean>>>;
  onTranslateAll: () => void;
  onSpeakLine: (index: number, text: string) => void;
}) {
  const [showHeroTranslation, setShowHeroTranslation] = useState(false);
  const [expandedLine, setExpandedLine] = useState<number | null>(null);
  const hasDialogue = story.lines.some((line) => line.text);

  useEffect(() => {
    if (activeAudioIndex !== null) setExpandedLine(activeAudioIndex);
  }, [activeAudioIndex]);

  return (
    <main className={`min-h-full flex-1 px-6 py-6 md:px-8 lg:px-10 ${darkMode ? "bg-[#101418] text-[#e1e2e9]" : "bg-white text-[#1b1c1b]"}`}>
      <div className="mx-auto max-w-6xl">
        <section className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-[#54643b]">Conversation <span className="ml-1 inline-block h-2 w-2 rounded-full bg-[#54643b]" /></h1>
          <button onClick={onTranslateAll} className="inline-flex items-center gap-2 rounded-full border border-[#c6c8ba] bg-white px-5 py-2.5 text-sm font-bold text-[#54643b]"><Languages className="h-4 w-4" /> Translate All</button>
        </section>

        {hasDialogue ? (
          <section>
            <div className="space-y-8">
              {story.lines.map((line, index) => (
                <article key={`${line.speaker}-${index}`} className={`flex ${line.side === "right" ? "justify-end" : "justify-start"}`}>
                  <div className="w-full max-w-[450px]">
                    <button onClick={() => setExpandedLine((value) => value === index ? null : index)} className={`w-full rounded-xl border px-4 py-3 text-left shadow-[0_10px_26px_rgba(120,113,108,0.07)] transition ${expandedLine === index ? "scale-[1.01] border-[#54643b] ring-4 ring-[#54643b]/10" : ""} ${darkMode ? "border-[#45474a] bg-[#272a2f]" : "border-[#eceae7] bg-white"}`}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-xs font-extrabold text-[#54643b]">{line.speaker}</span>
                        <span className="flex items-center gap-2 text-[#c9c8c5]">
                          <span onClick={(event) => { event.stopPropagation(); onSpeakLine(index, line.text); }} className="inline-flex h-5 w-5 cursor-pointer items-center justify-center" aria-label="Play line audio">
                            <Volume2 className="h-3.5 w-3.5" />
                          </span>
                          <span onClick={(event) => { event.stopPropagation(); setShownTranslations((prev) => ({ ...prev, [index]: !prev[index] })); }} className="inline-flex h-5 w-5 cursor-pointer items-center justify-center" aria-label="Translate line">
                            <Languages className="h-3.5 w-3.5" />
                          </span>
                        </span>
                      </div>
                      <p className="font-serif text-lg leading-7 text-[#1b1c1b]">{line.text}</p>
                      {line.translation && shownTranslations[index] && <p className="mt-3 border-t border-[#ece9e5] pt-3 text-base italic text-[#54643b]">{line.translation}</p>}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h1 className="text-lg font-semibold text-[#54643b]">Monologue <span className="ml-1 inline-block h-2 w-2 rounded-full bg-[#54643b]" /></h1>
              {story.translatedMonologue && (
                <button onClick={() => setShowHeroTranslation((value) => !value)} className="inline-flex items-center gap-2 rounded-full border border-[#c6c8ba] bg-white px-5 py-2.5 text-sm font-bold text-[#54643b]"><Languages className="h-4 w-4" /> Translate</button>
              )}
            </div>
            <article className={`max-w-[760px] rounded-xl border px-6 py-5 font-serif text-xl leading-9 shadow-[0_10px_24px_rgba(120,113,108,0.06)] ${darkMode ? "border-[#45474a] bg-[#272a2f]" : "border-[#f0eeeb] bg-white"}`}>
              {(showHeroTranslation && story.translatedMonologue ? story.translatedMonologue : story.monologue) || "Story content is not available yet."}
            </article>
          </section>
        )}
      </div>
    </main>
  );
}

function StoryQuizView({ questions, darkMode }: { questions: QuizQuestion[]; darkMode: boolean }) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [translatedQuestions, setTranslatedQuestions] = useState<Record<number, boolean>>({});
  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.num] !== undefined);

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setTranslatedQuestions({});
  }, [questions]);

  return (
    <main className={`min-h-full flex-1 px-6 py-6 md:px-8 lg:px-10 ${darkMode ? "bg-[#101418] text-[#e1e2e9]" : "bg-white text-[#1b1c1b]"}`}>
      <div className="mx-auto max-w-6xl">
        <section className="mb-6 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-[#54643b]">Questions <span className="ml-1 inline-block h-2 w-2 rounded-full bg-[#54643b]" /></h1>
          <button onClick={() => setTranslatedQuestions(Object.fromEntries(questions.map((q) => [q.num, !translatedQuestions[q.num]])))} className="inline-flex items-center gap-2 rounded-full border border-[#c6c8ba] bg-white px-5 py-2.5 text-sm font-bold text-[#54643b]"><Languages className="h-4 w-4" /> Translate</button>
        </section>
        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-[#e4e2e0] bg-white py-16 text-[#76786d]">
            <BookOpen className="mb-4 h-10 w-10 opacity-50" />
            <p className="font-bold">No quiz questions available for this story.</p>
          </div>
        ) : (
          <div className="space-y-7">
            {questions.map((q) => (
              <section key={q.num} className={`rounded-xl border p-6 ${darkMode ? "border-[#45474a] bg-[#1d2025]" : "border-[#f0eeeb] bg-[#fbf9f6]"}`}>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <span className="mb-4 inline-flex rounded-full bg-[#f0eefb] px-5 py-2 text-sm font-bold text-[#5143ff]">Q{q.num}</span>
                    <h2 className="text-2xl font-bold leading-tight">{q.question}</h2>
                    {translatedQuestions[q.num] && <p className="mt-2 text-base italic text-[#76786d]">{q.explanation || "Translation is not available for this question."}</p>}
                  </div>
                  <button onClick={() => setTranslatedQuestions((prev) => ({ ...prev, [q.num]: !prev[q.num] }))} className="rounded-full border border-[#7c74ff] p-2 text-[#5143ff]" aria-label="Translate question"><Languages className="h-4 w-4" /></button>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {q.options.map((option, idx) => {
                    const selected = answers[q.num] === idx;
                    const isCorrect = option.isCorrect;
                    const showCorrect = submitted && isCorrect;
                    const showWrong = submitted && selected && !isCorrect;
                    return (
                      <button key={idx} disabled={submitted} onClick={() => setAnswers((prev) => ({ ...prev, [q.num]: idx }))} className={`flex min-h-24 items-center gap-5 rounded-2xl border p-6 text-left text-lg transition ${showCorrect ? "border-[#54643b] bg-[#edf3e4] font-bold text-[#1b1c1b]" : showWrong ? "border-red-300 bg-red-50 text-red-700" : selected ? "border-[#54643b] bg-[#edf3e4] font-bold text-[#1b1c1b]" : darkMode ? "border-[#45474a] bg-[#1d2025]" : "border-[#e4e2e0] bg-white hover:border-[#87986a]"}`}>
                        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${showCorrect || selected ? "border-[#54643b] bg-[#54643b] text-white ring-4 ring-[#d7e9b5]" : "border-[#c6c8ba]"}`}>
                          {showCorrect && <CheckCircle2 className="h-4 w-4" />}
                        </span>
                        {option.text}
                      </button>
                    );
                  })}
                </div>
                {submitted && (
                  <div className={`mt-5 rounded-xl border p-5 text-base leading-7 ${darkMode ? "border-[#45474a] bg-[#101418] text-[#c6c6ca]" : "border-red-200 bg-red-50 text-red-700"}`}>
                    <p className="mb-2 text-xl font-bold">{q.options[answers[q.num]]?.isCorrect ? "Correct" : "Incorrect"}</p>
                    <p className="font-semibold">Correct answer: {q.options.find((option) => option.isCorrect)?.text || "Not available"}</p>
                    {q.explanation && <p className="mt-2 italic">{q.explanation}</p>}
                  </div>
                )}
              </section>
            ))}
            <div className="flex flex-col items-center justify-between gap-5 border-t border-[#e4e2e0] pt-6 md:flex-row">
              <div className="flex items-center gap-2">{questions.map((q) => <span key={q.num} className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${answers[q.num] !== undefined ? "bg-[#54643b] text-white" : "bg-[#efedec] text-[#76786d]"}`}>{q.num}</span>)}</div>
              <div className="flex gap-4">
                <button onClick={() => { setAnswers({}); setSubmitted(false); }} className="rounded-xl border border-[#e4e2e0] bg-white px-8 py-4 font-bold text-[#45483e]">Reset</button>
                <button disabled={!allAnswered || submitted} onClick={() => setSubmitted(true)} className="inline-flex items-center gap-3 rounded-xl bg-[#54643b] px-8 py-4 font-bold text-white disabled:opacity-50">Submit Answers <ArrowRight className="h-5 w-5" /></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

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
  const darkMode = false;
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingHtml, setLoadingHtml] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioIndex, setAudioIndex] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [shownTranslations, setShownTranslations] = useState<Record<number, boolean>>({});

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

  const loadHtml = useCallback(async (noteId: number) => {
    setLoadingHtml(true);
    setHtml(null);
    setQuizQuestions([]);
    setActiveTab("story");
    try {
      const content = await fetchStoryNoteHtml(noteId);
      setQuizQuestions(parseQuizFromHtml(content));
      setHtml(content);
    } catch (e: any) {
      setError(e.message ?? "Failed to load story content");
    } finally {
      setLoadingHtml(false);
    }
  }, []);

  useEffect(() => { loadNotes(); }, [loadNotes]);
  useEffect(() => { if (activeNote?.id) loadHtml(activeNote.id); }, [activeNote?.id, loadHtml]);

  const isLoading = loadingNotes || loadingHtml;
  const storyData = html ? parseStoryDisplayData(html, activeNote) : null;
  const audioLines = storyData?.lines.filter((line) => line.text) ?? [];
  const audioText = audioLines.length > 0 ? audioLines[audioIndex]?.text : storyData?.monologue;
  const currentSpeed = audioSpeeds[speedIndex];
  const allTranslationsShown = storyData && storyData.lines.length > 0 && storyData.lines.every((_, index) => shownTranslations[index]);

  const speakAudio = useCallback((text: string | undefined) => {
    if (!text || typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.rate = currentSpeed;
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }, [currentSpeed]);

  const handlePlayPause = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }
    speakAudio(audioText);
  }, [audioText, isPlaying, speakAudio]);

  const handleAudioStep = useCallback((direction: -1 | 1) => {
    if (audioLines.length === 0) {
      speakAudio(storyData?.monologue);
      return;
    }
    const nextIndex = Math.min(Math.max(audioIndex + direction, 0), audioLines.length - 1);
    setAudioIndex(nextIndex);
    speakAudio(audioLines[nextIndex]?.text);
  }, [audioIndex, audioLines, speakAudio, storyData?.monologue]);

  const handleSpeakLine = useCallback((index: number, text: string) => {
    setAudioIndex(index);
    speakAudio(text);
  }, [speakAudio]);

  useEffect(() => {
    setAudioIndex(0);
    setIsPlaying(false);
    setShownTranslations({});
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, [activeNote?.id]);

  useEffect(() => () => {
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
  }, []);

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#101418] text-[#e1e2e9]" : "bg-[#fbf9f7] text-[#1b1c1b]"}`}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@400;600;700;800&display=swap');
        .font-serif { font-family: 'Playfair Display', Georgia, serif; }
      `}</style>

      {isLoading && (
        <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-[#87986a]" /></div>
      )}

      {!isLoading && error && (
        <div className="mx-auto mt-10 flex max-w-3xl items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-600">
          <AlertCircle className="h-5 w-5 shrink-0" /><span>{error}</span>
        </div>
      )}

      {!isLoading && !error && notes.length === 0 && (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-[#76786d]">
          <BookOpen className="mb-4 h-10 w-10 opacity-50" />
          <p className="font-bold">No content available for this chapter yet.</p>
        </div>
      )}

      {!isLoading && !error && storyData && (
        <div className="relative min-h-screen">
          <header className={`sticky top-0 z-10 flex h-[76px] flex-col border-b ${darkMode ? "border-[#32353a] bg-[#101418]" : "border-[#e9e5df] bg-white"}`}>
            <div className="relative flex flex-1 items-center px-6">
              <div className="flex w-12 shrink-0 items-center">
                <img src="/favicon.svg" alt="" className="h-7 w-7" />
              </div>
              <div className="pointer-events-none absolute inset-x-24 flex items-center justify-center">
                <h1 className="pointer-events-auto max-w-[48vw] truncate text-center font-serif text-4xl font-bold text-[#54643b]">{storyData.title}</h1>
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-3">
                <button onClick={() => router.push("/stories")} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700" title="Exit">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="h-[3px] w-full bg-slate-200">
              <div className="h-full w-1/5 bg-[#2f73ff]" />
            </div>
          </header>
          <div className="flex min-h-[calc(100vh-76px)] flex-col lg:flex-row">
            <StoryOverviewPanel
              story={storyData}
              notes={notes}
              activeNote={activeNote}
              setActiveNote={setActiveNote}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              darkMode={darkMode}
              isPlaying={isPlaying}
              speed={currentSpeed}
              onPlayPause={handlePlayPause}
              onPrevious={() => handleAudioStep(-1)}
              onNext={() => handleAudioStep(1)}
              onSpeed={() => setSpeedIndex((index) => (index + 1) % audioSpeeds.length)}
            />
            {activeTab === "story" ? (
              <StoryReadingView story={storyData} darkMode={darkMode} activeAudioIndex={audioLines.length > 0 && isPlaying ? audioIndex : null} shownTranslations={shownTranslations} setShownTranslations={setShownTranslations} onTranslateAll={() => setShownTranslations(Object.fromEntries(storyData.lines.map((_, index) => [index, !allTranslationsShown])))} onSpeakLine={handleSpeakLine} />
            ) : (
              <StoryQuizView questions={quizQuestions} darkMode={darkMode} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
