"use client";

import React, { useState, useEffect, Suspense } from "react";
import { Volume2, RotateCcw, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { loadMockCSV } from "@/utils/csvLoader";
import { useSearchParams } from "next/navigation";

// ── Types ─────────────────────────────────────────────────────────────────────

type BlankDef = { id: number; correct: string; options: string[] };
type Segment = { type: "text"; text: string } | { type: "blank"; id: number };

type QuestionDef = {
  id: number;
  question: string;
  question_en: string;
  correct: string;
  correct_en: string;
};

type Exercise = {
  id: string;
  format: "fill_blanks" | "identify_information";
  audioRecordings: { id: number; label: string; text: string }[];
  // For fill_blanks
  fillParagraph?: string;
  blanks?: BlankDef[];
  segments?: Segment[];
  // For identify_information
  questions?: QuestionDef[];
  
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

/** Split passage like "Today [1] __________ and [2] __________." into segments */
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

function buildExercise(item: any): Exercise | null {
  // Check if it's the new Identify Information format
  if (item.format === 'identify_information' || item.audios_fr) {
    const audiosFr = item.audios_fr || [];
    const questions = item.questions || [];
    
    const audioRecordings = audiosFr.map((text: string, i: number) => ({
      id: i + 1,
      label: `AUDIO ${i + 1}`,
      text: text,
    })).filter((r: any) => r.text);

    return {
      id: item.id || item.ExerciseID || item.external_id,
      format: "identify_information",
      audioRecordings,
      questions,
      level: item.Level || item.level || "A1",
      instructionEn: item.instructionEn || item.Instruction_EN || "Listen and identify if the statements are True, False or Not Given.",
      instructionFr: item.instructionFr || item.Instruction_FR || "Écoutez et identifiez si les affirmations sont Vraies, Fausses ou Non mentionnées.",
    };
  }

  // Fallback to legacy fill_blanks format
  const audioText = item.audioText || item["Audio_FR"] || item.audio_fr || "";
  const fillParagraph = item.passage_fr || item["Fill Paragraph_FR"] || item.passage_en || audioText;

  if (!audioText) return null;

  // ── Path 1: data came from the backend (blanksData already parsed) ──────────
  const blanksDataRaw = item.blanksData || item.eval_blanksData;
  let blanks: BlankDef[] = [];

  if (blanksDataRaw && typeof blanksDataRaw === "object" && Object.keys(blanksDataRaw).length > 0) {
    blanks = Object.entries(blanksDataRaw)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([key, bd]: [string, any]) => ({
        id: parseInt(key, 10),
        correct: bd.correct || "",
        options: Array.isArray(bd.options) ? bd.options : [],
      }))
      .filter(b => b.correct);
  }

  // ── Path 2: raw CSV columns (local CSV fallback) ─────────────────────────────
  if (blanks.length === 0) {
    const correctAnswers = parseAnswers(item["Correct Answer_FR"] || item["Correct Answer_EN"] || "");
    if (correctAnswers.length > 0) {
      const wrongPools: string[][] = [];
      let wi = 1;
      while (item[`Wrong Answer_${wi}_FR`] || item[`Wrong Answer_${wi}_EN`]) {
        const wrongs = parseAnswers(item[`Wrong Answer_${wi}_FR`] || item[`Wrong Answer_${wi}_EN`] || "");
        wrongPools.push(wrongs);
        wi++;
      }

      blanks = correctAnswers.map((correct, i) => {
        const wrongOptions = wrongPools
          .map(pool => pool[i] || pool[0])
          .filter(w => w && w !== correct);
        const options = [correct, ...wrongOptions].sort(() => Math.random() - 0.5);
        return { id: i + 1, correct, options };
      });
    }
  }

  if (blanks.length === 0) return null;

  // Audio recordings: split audioText on sentence boundaries
  const sentences = audioText.split(/(?<=[.!?])\s+/).filter(Boolean);
  const audioRecordings = sentences.map((s: string, i: number) => ({
    id: i + 1,
    label: `AUDIO ${i + 1}`,
    text: s,
  }));

  return {
    id: item.id || item.ExerciseID || item.external_id,
    format: "fill_blanks",
    audioRecordings,
    fillParagraph,
    blanks,
    segments: parseSegments(fillParagraph),
    level: item.Level || item.level || "A1",
    instructionEn: item.instructionEn || item.Instruction_EN || "Listen and select the correct word for each blank",
    instructionFr: item.instructionFr || item.Instruction_FR || "Écoutez et sélectionnez le bon mot pour chaque blanc",
  };
}

// ── Page wrapper ──────────────────────────────────────────────────────────────

export default function AudioFillInTheBlanksDropdownPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>}>
      <AudioDropdownContent />
    </Suspense>
  );
}

function AudioDropdownContent() {
  const handleExit = usePracticeExit();
  const searchParams = useSearchParams();
  const tag = searchParams?.get("tag") ?? undefined;
  const { speak, isSpeaking } = useTextToSpeech();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const [playingId, setPlayingId] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try identity_info first as it's the new standard
        const data = await loadMockCSV("practice/listening/identity_info.csv", { tag });
        const mapped = (Array.isArray(data) ? data : [])
          .map((item: any) => buildExercise(item))
          .filter(Boolean) as Exercise[];
        
        if (mapped.length > 0) {
          setExercises(mapped);
        } else {
          // Fallback to legacy
          const legacyData = await loadMockCSV("practice/listening/audio_fill_blanks.csv", { tag });
          const legacyMapped = (Array.isArray(legacyData) ? legacyData : [])
            .map((item: any) => buildExercise(item))
            .filter(Boolean) as Exercise[];
          setExercises(legacyMapped);
        }
      } catch (e) {
        console.error("Error loading audio dropdown data:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tag]);

  const ex = exercises[currentIndex];

  // Reset per exercise
  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setPlayingId(null);
  }, [currentIndex]);

  useEffect(() => {
    if (!isSpeaking) setPlayingId(null);
  }, [isSpeaking]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const playRecording = (id: number, text: string, rate = 0.9) => {
    setPlayingId(id);
    speak(text, "fr-FR", rate);
  };

  const handleAnswerChange = (blankId: number, value: string) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [blankId]: value }));
  };

  const handleSubmit = () => {
    if (!ex || submitted) return;
    let correct = 0;
    
    if (ex.format === "identify_information" && ex.questions) {
      ex.questions.forEach(q => {
        if ((answers[q.id] || "").trim().toLowerCase() === q.correct.trim().toLowerCase()) correct++;
      });
    } else if (ex.format === "fill_blanks" && ex.blanks) {
      ex.blanks.forEach(b => {
        if ((answers[b.id] || "").trim().toLowerCase() === b.correct.trim().toLowerCase()) correct++;
      });
    }
    
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 gap-4">
      <p className="text-slate-500 text-lg">No exercises available for this format yet.</p>
      <button onClick={handleExit} className="px-4 py-2 border rounded hover:bg-slate-100 dark:hover:bg-slate-800">Back</button>
    </div>
  );

  const totalPossible = ex.format === "identify_information" ? (ex.questions?.length || 0) : (ex.blanks?.length || 0);
  const allAnswered = Array.from({ length: totalPossible }).every((_, i) => answers[i + 1] !== undefined && answers[i + 1] !== "");
  const progress = exercises.length > 0 ? ((currentIndex + 1) / exercises.length) * 100 : 0;
  const allCorrect = submitted && score === totalPossible;

  return (
    <PracticeGameLayout
      questionTypeFr="Vrai, Faux ou Non mentionné ?"
      questionTypeEn="True, False or Not Given?"
      instructionFr={ex.instructionFr}
      instructionEn={ex.instructionEn}
      progress={progress}
      isGameOver={isCompleted}
      score={totalScore}
      totalQuestions={exercises.length * totalPossible}
      currentQuestionIndex={currentIndex}
      questionCounterValue={currentIndex + 1}
      onExit={handleExit}
      onNext={submitted ? handleContinue : handleSubmit}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={submitted || allAnswered}
      showSubmitButton={true}
      submitLabel={submitted ? (currentIndex + 1 === exercises.length ? "FINISH" : "CONTINUE") : "CHECK"}
      showFeedback={false}
      timerValue=""
    >
      <div className="flex flex-col flex-1 min-h-0 w-full p-3 sm:p-4 md:p-5 gap-4">

        {submitted && (
          <div className={cn(
            "rounded-xl border p-4 flex items-center gap-3 animate-in fade-in",
            allCorrect
              ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700"
              : "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700"
          )}>
            {allCorrect
              ? <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
              : <XCircle className="w-6 h-6 text-amber-500 shrink-0" />}
            <p className="font-semibold text-slate-800 dark:text-slate-100">
              {allCorrect ? "Perfect!" : `${score} / ${totalPossible} correct`}
              {!allCorrect && <span className="font-normal text-slate-500 dark:text-slate-400 ml-2 text-sm">— correct answers shown below</span>}
            </p>
          </div>
        )}

        <div className="flex flex-col flex-1 min-h-0 gap-4 md:grid md:grid-cols-2 md:gap-5 md:overflow-hidden md:h-full">

          {/* LEFT: Audio recordings */}
          <div className="w-full md:min-h-0 rounded-xl border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 p-4 flex flex-col overflow-hidden">
            <h3 className="text-xs tracking-widest font-semibold text-slate-400 mb-4 uppercase">Audio Recordings</h3>
            <div className="space-y-3 flex-1 min-h-0 overflow-y-auto pr-1">
              {ex.audioRecordings.map(rec => {
                const isThisPlaying = isSpeaking && playingId === rec.id;
                return (
                  <div key={rec.id} className="rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs tracking-[0.2em] font-semibold text-blue-600">{rec.label}</p>
                      <div className="flex items-center gap-2 shrink-0">
                        <button type="button" onClick={() => playRecording(rec.id, rec.text, 0.9)}
                          className={cn("w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center transition-colors",
                            isThisPlaying ? "text-blue-600 border-blue-400" : "text-slate-400 hover:text-slate-600")}>
                          <Volume2 className={cn("w-4 h-4", isThisPlaying && "animate-pulse")} />
                        </button>
                        <button type="button" onClick={() => playRecording(rec.id, rec.text, 0.7)}
                          className="w-9 h-9 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
                          title="Play slower">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Content (Questions or Passage) */}
          <div className="w-full md:min-h-0 rounded-xl border border-slate-200 bg-white dark:bg-slate-950 dark:border-slate-800 p-4 flex flex-col overflow-hidden">
            <h3 className="text-xs tracking-widest font-semibold text-slate-400 mb-4 uppercase">
              {ex.format === "identify_information" ? "Questions" : "Complete the Passage"}
            </h3>
            <div className="flex-1 min-h-0 overflow-y-auto pr-1">
              
              {ex.format === "identify_information" ? (
                /* Identify Information UI: List of questions with T/F/NG options */
                <div className="space-y-6">
                  {ex.questions?.map((q, i) => {
                    const currentVal = answers[q.id] || "";
                    const isCorrect = submitted && currentVal.trim().toLowerCase() === q.correct.trim().toLowerCase();
                    const isWrong = submitted && currentVal && !isCorrect;
                    
                    const options = ["Vrai", "Faux", "Non mentionné"];
                    const optionsEn = ["True", "False", "Not Given"];

                    return (
                      <div key={q.id} className="flex flex-col gap-3">
                        <div className="flex gap-3 items-start">
                          <span className="font-bold text-blue-600">[{q.id}]</span>
                          <p className="text-base md:text-lg font-medium text-slate-700 dark:text-slate-200">{q.question}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 ml-8">
                          {options.map((opt, idx) => {
                            const isSelected = currentVal === opt;
                            const isThisCorrect = submitted && opt.trim().toLowerCase() === q.correct.trim().toLowerCase();
                            const isThisWrong = submitted && isSelected && !isThisCorrect;

                            return (
                              <label key={opt} className={cn(
                                "flex items-center gap-2 cursor-pointer transition-colors p-2 rounded-lg border",
                                !submitted && "hover:bg-slate-50 dark:hover:bg-slate-900 border-slate-200 dark:border-slate-800",
                                !submitted && isSelected && "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800",
                                isThisCorrect && "bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/20",
                                isThisWrong && "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20"
                              )}>
                                <input
                                  type="radio"
                                  name={`question-${q.id}`}
                                  value={opt}
                                  checked={isSelected}
                                  onChange={() => handleAnswerChange(q.id, opt)}
                                  disabled={submitted}
                                  className="sr-only"
                                />
                                <div className={cn(
                                  "w-5 h-5 rounded-full border flex items-center justify-center",
                                  isSelected ? "border-blue-500" : "border-slate-300",
                                  isThisCorrect && "border-emerald-500",
                                  isThisWrong && "border-red-500"
                                )}>
                                  {isSelected && <div className={cn("w-2.5 h-2.5 rounded-full", isThisCorrect ? "bg-emerald-500" : isThisWrong ? "bg-red-500" : "bg-blue-500")} />}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold">{opt}</span>
                                  <span className="text-[10px] uppercase tracking-tighter opacity-50">{optionsEn[idx]}</span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                        {isWrong && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium ml-8 mt-1">
                            Correct answer: <span className="font-bold">{q.correct}</span>
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Legacy Fill Paragraph UI */
                <>
                  <p className="text-base md:text-lg leading-loose text-slate-700 dark:text-slate-200 flex flex-wrap items-baseline gap-x-1">
                    {ex.segments?.map((seg, i) => {
                      if (seg.type === "text") return <span key={i}>{seg.text}</span>;
                      const blank = ex.blanks?.find(b => b.id === seg.id);
                      if (!blank) return null;
                      const val = answers[seg.id] || "";
                      const isCorrect = submitted && val.trim().toLowerCase() === blank.correct.trim().toLowerCase();
                      const isWrong = submitted && val && !isCorrect;
                      return (
                        <span key={i} className="inline-flex flex-col items-center mx-1 align-baseline">
                          <select
                            value={val}
                            onChange={e => handleAnswerChange(seg.id, e.target.value)}
                            disabled={submitted}
                            className={cn(
                              "border-b-2 bg-transparent px-2 py-0.5 text-base font-semibold focus:outline-none transition-colors cursor-pointer",
                              !submitted && "border-slate-300 dark:border-slate-600 text-blue-600 focus:border-blue-500",
                              isCorrect && "border-emerald-500 text-emerald-600",
                              isWrong && "border-red-500 text-red-600",
                              !val && "text-slate-400 border-slate-300",
                            )}
                          >
                            <option value="">— select —</option>
                            {blank.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                          {isWrong && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">✓ {blank.correct}</span>
                          )}
                        </span>
                      );
                    })}
                  </p>

                  {submitted && (
                    <div className="mt-6 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-4">
                      {ex.blanks?.map(b => {
                        const val = answers[b.id] || "";
                        const correct = val.trim().toLowerCase() === b.correct.trim().toLowerCase();
                        return (
                          <p key={b.id} className="text-sm flex items-center gap-2">
                            <span className={cn("font-bold w-5 text-center", correct ? "text-emerald-600" : "text-red-500")}>[{b.id}]</span>
                            {correct
                              ? <span className="text-emerald-600">✓ {b.correct}</span>
                              : <><span className="line-through text-red-400 mr-1">{val || "—"}</span><span className="text-emerald-600 font-medium">✓ {b.correct}</span></>
                            }
                          </p>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </PracticeGameLayout>
  );
}
