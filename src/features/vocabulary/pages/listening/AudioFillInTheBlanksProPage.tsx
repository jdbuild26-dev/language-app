"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Play, Pause, RotateCcw, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { loadMockCSV } from "@/utils/csvLoader";
import { useSearchParams } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

type BlankItem = { id: number; correct: string };
type Exercise = {
  id: string;
  audioText: string;
  audioText_en: string;
  fillParagraph: string;   // FR passage with [1] __ markers
  blanks: BlankItem[];     // derived from Correct Answer_FR
  level: string;
  instructionEn: string;
  instructionFr: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Parse "answer one + answer two" into ["answer one", "answer two"] */
function parseAnswers(raw: string): string[] {
  if (!raw) return [];
  return raw.split("+").map(s => s.trim()).filter(Boolean);
}

/** Build BlankItem[] from the answers array */
function buildBlanks(answers: string[]): BlankItem[] {
  return answers.map((correct, i) => ({ id: i + 1, correct }));
}

/** Normalise for comparison: lowercase, strip punctuation */
function normalise(s: string) {
  return s.toLowerCase().replace(/[.,!?;:'"«»]/g, "").replace(/\s+/g, " ").trim();
}

/** Split passage like "Today we are making [1] __________." into segments */
type Segment = { type: "text"; text: string } | { type: "blank"; id: number };
function parseSegments(passage: string): Segment[] {
  const segments: Segment[] = [];
  const regex = /\[(\d+)\]\s*_{2,}\s*/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = regex.exec(passage)) !== null) {
    if (m.index > last) segments.push({ type: "text", text: passage.slice(last, m.index) });
    segments.push({ type: "blank", id: parseInt(m[1], 10) });
    last = m.index + m[0].length;
  }
  if (last < passage.length) segments.push({ type: "text", text: passage.slice(last) });
  return segments;
}

// ── Page wrapper ──────────────────────────────────────────────────────────────

export default function AudioFillInTheBlanksProPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
      <AudioFillBlanksContent />
    </Suspense>
  );
}

function AudioFillBlanksContent() {
  const handleExit = usePracticeExit();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;
  const { speak, isSpeaking, pause, resume, isPaused, cancel } = useTextToSpeech();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [hasStarted, setHasStarted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inputs, setInputs] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await loadMockCSV("practice/listening/audio_fill_blanks.csv", { tag });
        const mapped = (Array.isArray(data) ? data : []).map((item: any) => {
          const answers = parseAnswers(item["Correct Answer_FR"] || item.correctAnswer || item.CorrectAnswer || "");
          const fillParagraph = item["Fill Paragraph_FR"] || item.fillParagraph || item.passage_fr || "";
          return {
            id: item.id || item.ExerciseID,
            audioText: item["Audio_FR"] || item.audioText || item.audio_fr || "",
            audioText_en: item["Audio_EN"] || item.audioText_en || "",
            fillParagraph,
            blanks: buildBlanks(answers),
            level: item.Level || item.level || "A1",
            instructionEn: item.instructionEn || item.Instruction_EN || "Listen and fill in the blanks",
            instructionFr: item.instructionFr || item.Instruction_FR || "Écoutez et complétez les blancs",
          } as Exercise;
        }).filter(e => e.audioText && e.blanks.length > 0);
        setExercises(mapped);
      } catch (e) {
        console.error("Error loading audio fill blanks:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tag]);

  const ex = exercises[currentIndex];
  const segments = ex ? parseSegments(ex.fillParagraph) : [];
  const allAnswered = ex ? ex.blanks.every(b => inputs[b.id]?.trim()) : false;

  // Reset per exercise
  useEffect(() => {
    setHasStarted(false);
    setIsPlaying(false);
    setInputs({});
    setSubmitted(false);
    setScore(0);
    cancel();
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track play state
  useEffect(() => {
    if (hasStarted && !isSpeaking && !isPaused) setIsPlaying(false);
  }, [isSpeaking, hasStarted, isPaused]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePlay = () => {
    if (!ex) return;
    if (isSpeaking) {
      if (isPaused) { resume(); setIsPlaying(true); }
      else { pause(); setIsPlaying(false); }
    } else {
      setHasStarted(true);
      setIsPlaying(true);
      speak(ex.audioText, "fr-FR", 0.85);
    }
  };

  const handleRewind = () => {
    if (!ex) return;
    cancel();
    setHasStarted(true);
    setIsPlaying(true);
    speak(ex.audioText, "fr-FR", 0.85);
  };

  const handleSubmit = () => {
    if (!ex || submitted) return;
    let correct = 0;
    ex.blanks.forEach(b => {
      if (normalise(inputs[b.id] || "") === normalise(b.correct)) correct++;
    });
    setScore(correct);
    setTotalScore(prev => prev + correct);
    setSubmitted(true);
  };

  const handleContinue = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // ── Loading / empty ────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    </div>
  );

  if (!ex) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
      <p className="text-xl text-slate-500">No exercises available.</p>
      <button onClick={handleExit} className="mt-4 px-4 py-2 border rounded hover:bg-slate-100">Back</button>
    </div>
  );

  const progress = exercises.length > 0 ? ((currentIndex + 1) / exercises.length) * 100 : 0;
  const allCorrect = submitted && score === ex.blanks.length;

  return (
    <PracticeGameLayout
      questionTypeFr="Remplir les blancs"
      questionTypeEn="Audio Fill in the Blanks"
      instructionFr={ex.instructionFr}
      instructionEn={ex.instructionEn}
      progress={progress}
      isGameOver={isCompleted}
      score={totalScore}
      totalQuestions={exercises.length * (ex.blanks.length || 1)}
      currentQuestionIndex={currentIndex}
      questionCounterValue={currentIndex + 1}
      onExit={handleExit}
      onNext={submitted ? handleContinue : handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={submitted || (hasStarted && allAnswered)}
      showSubmitButton={true}
      submitLabel={submitted ? (currentIndex + 1 === exercises.length ? "FINISH" : "CONTINUE") : "Submit Answer"}
      showFeedback={submitted}
      isCorrect={allCorrect}
      feedbackTone={submitted ? (allCorrect ? "success" : "error") : "neutral"}
      feedbackMessage={submitted ? (allCorrect ? "All correct!" : `${score} out of ${ex.blanks.length} correct.`) : ""}
      timerValue=""
    >
      <div className="flex flex-col items-center w-full max-w-4xl mx-auto px-4 space-y-6 pb-8">

        {/* ── Audio Player ── */}
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md w-full -mx-4 px-4 py-4 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm">
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-100 dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 flex items-center gap-5 shadow-inner relative overflow-hidden">
              {isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                  <div className="flex gap-1 h-full items-center w-full justify-center">
                    {[...Array(20)].map((_, i) => (
                      <div key={i} className="w-2 bg-blue-500 rounded-full animate-pulse"
                        style={{ height: `${Math.random() * 60 + 20}%`, animationDuration: `${Math.random() * 0.5 + 0.5}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3 z-10">
                <button onClick={handlePlay}
                  className={cn("w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-lg hover:scale-105 active:scale-95",
                    isPlaying ? "bg-amber-500 text-white" : "bg-blue-600 text-white")}>
                  {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 ml-0.5 fill-current" />}
                </button>
                {hasStarted && (
                  <button onClick={handleRewind} title="Restart audio"
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-blue-600 hover:scale-105 transition-all shadow-sm">
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="flex-1 z-10">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {isPlaying ? "Playing audio…" : isPaused ? "Paused" : hasStarted ? "Audio complete — fill in the blanks below" : "Tap play to start"}
                </p>
                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                  {isPlaying && <div className="h-full bg-blue-500 w-full animate-progress" />}
                  {!isPlaying && hasStarted && <div className="h-full bg-blue-500 w-full" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Fill-in-the-blanks passage ── */}
        {hasStarted && segments.length > 0 && (
          <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Complete the passage</p>
            <div className="text-lg leading-loose text-slate-700 dark:text-slate-200 flex flex-wrap items-baseline gap-x-1">
              {segments.map((seg, i) => {
                if (seg.type === "text") return <span key={i}>{seg.text}</span>;
                const blank = ex.blanks.find(b => b.id === seg.id);
                if (!blank) return null;
                const val = inputs[seg.id] || "";
                const isCorrect = submitted && normalise(val) === normalise(blank.correct);
                const isWrong = submitted && val.trim() && !isCorrect;
                return (
                  <span key={i} className="inline-flex flex-col items-center mx-1">
                    <input
                      type="text"
                      value={val}
                      onChange={e => !submitted && setInputs(prev => ({ ...prev, [seg.id]: e.target.value }))}
                      disabled={submitted}
                      placeholder={`[${seg.id}]`}
                      className={cn(
                        "border-b-2 bg-transparent px-2 py-0.5 min-w-[120px] text-center font-semibold focus:outline-none transition-colors",
                        !submitted && "border-slate-300 dark:border-slate-600 text-blue-600 focus:border-blue-500",
                        isCorrect && "border-emerald-500 text-emerald-600",
                        isWrong && "border-red-500 text-red-600",
                        !val && !submitted && "text-slate-400",
                      )}
                    />
                    {/* Show correct answer below wrong input after submit */}
                    {isWrong && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                        ✓ {blank.correct}
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Score summary after submit ── */}
        {submitted && (
          <div className={cn(
            "w-full rounded-2xl border p-5 flex items-center gap-4",
            allCorrect
              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
              : "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800"
          )}>
            {allCorrect
              ? <CheckCircle2 className="w-8 h-8 text-emerald-500 shrink-0" />
              : <XCircle className="w-8 h-8 text-amber-500 shrink-0" />}
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-100">
                {allCorrect ? "Perfect!" : `${score} / ${ex.blanks.length} correct`}
              </p>
              {/* Show all correct answers */}
              <div className="mt-2 space-y-1">
                {ex.blanks.map(b => {
                  const userVal = inputs[b.id] || "";
                  const correct = normalise(userVal) === normalise(b.correct);
                  return (
                    <p key={b.id} className="text-sm flex items-center gap-2">
                      <span className={cn("font-semibold w-5 text-center", correct ? "text-emerald-600" : "text-red-500")}>
                        [{b.id}]
                      </span>
                      {correct
                        ? <span className="text-emerald-600">✓ {b.correct}</span>
                        : <span className="text-slate-600 dark:text-slate-300">
                            <span className="line-through text-red-400 mr-2">{userVal || "—"}</span>
                            <span className="text-emerald-600 font-medium">✓ {b.correct}</span>
                          </span>
                      }
                    </p>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Unlock hint ── */}
        {!hasStarted && (
          <div className="text-center p-8 bg-blue-50 dark:bg-blue-950/20 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-800">
            <p className="text-blue-600 dark:text-blue-400 font-medium flex items-center justify-center gap-2">
              <Play className="w-4 h-4" /> Click play to start the audio and unlock the blanks
            </p>
          </div>
        )}
      </div>
    </PracticeGameLayout>
  );
}
