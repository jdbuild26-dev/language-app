"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { loadMockCSV } from "@/utils/csvLoader";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  CheckCircle2,
  Headphones,
  Loader2,
  Pause,
  Play,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "true", label: "True" },
  { value: "false", label: "False" },
  { value: "not-given", label: "Not Given" },
];

const TTS_RATE = 0.88;
const WAVE_BARS = [
  13, 28, 17, 22, 12, 34, 18, 24, 14, 30, 16, 20, 11, 26, 15, 32, 17, 21, 13,
  29, 15, 25, 12, 31, 16, 23, 11, 27, 14, 30, 17, 22, 12, 28,
];

type TFQuestion = {
  id: string | number;
  order?: number;
  statement: string;
  answer: string;
  linkedSegmentId: string | number | null;
};

type TFAudioSegment = {
  id: string;
  order?: number;
  title: string;
  text: string;
};

type TFGroup = {
  id: string | number;
  passage: string;
  questions: TFQuestion[];
  audioSegments: TFAudioSegment[];
  timeLimitSeconds: number;
  instructionFr?: string;
  instructionEn?: string;
  localizedInstruction?: string;
};

type AudioClip = {
  uid: string;
  sectionKey: string | number;
  title: string;
  text: string;
  sectionTitle: string;
};

type LegacyRow = {
  id: string | number;
  passage: string;
  statement: string;
  answer: string;
  timeLimitSeconds: number;
  instructionFr?: string;
  instructionEn?: string;
  localizedInstruction?: string;
};

function normalizeAnswerValue(value) {
  const normalized = String(value || "")
    .toLowerCase()
    .trim()
    .replace(/_/g, "-")
    .replace(/\s+/g, "-");

  if (normalized === "notgiven" || normalized === "not-given") {
    return "not-given";
  }
  if (normalized === "true") return "true";
  if (normalized === "false") return "false";
  return "";
}

function toTtsLocale(language) {
  const code = String(language || "fr")
    .toLowerCase()
    .trim();
  const map = {
    ar: "ar-SA",
    de: "de-DE",
    en: "en-US",
    es: "es-ES",
    fr: "fr-FR",
    hi: "hi-IN",
    it: "it-IT",
    ja: "ja-JP",
    ko: "ko-KR",
    nl: "nl-NL",
    pt: "pt-PT",
    ru: "ru-RU",
    tr: "tr-TR",
    zh: "zh-CN",
  };

  return map[code] || `${code}-${code.toUpperCase()}`;
}

function getSortOrder(item, fallbackOrder) {
  const candidates = [
    item?.order,
    item?.sequence,
    item?.position,
    item?.questionOrder,
    item?.question_order,
    item?.audioOrder,
    item?.audio_order,
    item?.id,
  ];

  for (const candidate of candidates) {
    const numeric = Number(candidate);
    if (Number.isFinite(numeric)) {
      return numeric;
    }
  }

  return fallbackOrder;
}

function safeParseArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function sentenceSplit(text = "") {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return [];

  const parts = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (parts.length <= 4) {
    return parts.map((segment, index) => ({
      id: String(index + 1),
      title: `Audio ${index + 1}`,
      text: segment,
    }));
  }

  const targetChunks = Math.min(4, Math.ceil(parts.length / 2));
  const chunkSize = Math.ceil(parts.length / targetChunks);
  const chunks: string[] = [];

  for (let index = 0; index < parts.length; index += chunkSize) {
    chunks.push(parts.slice(index, index + chunkSize).join(" "));
  }

  return chunks.map((segment, index) => ({
    id: String(index + 1),
    title: `Audio ${index + 1}`,
    text: segment,
  }));
}

function normalizeSpeechText(text = "") {
  return String(text)
    .replace(/\s+/g, " ")
    .replace(/[()[\]{}]/g, " ")
    .replace(/[:;]+/g, ". ")
    .replace(/\s*\/\s*/g, ". ")
    .replace(/\s+([,.!?])/g, "$1")
    .trim();
}

function chunkSpeechText(text = "", maxLength = 120) {
  const cleaned = normalizeSpeechText(text);
  if (!cleaned) return [];

  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length <= 1 && cleaned.length <= maxLength) {
    return [cleaned];
  }

  const chunks: string[] = [];
  let currentChunk = "";

  sentences.forEach((sentence) => {
    if (!currentChunk) {
      currentChunk = sentence;
      return;
    }

    const merged = `${currentChunk} ${sentence}`.trim();
    if (merged.length <= maxLength) {
      currentChunk = merged;
      return;
    }

    chunks.push(currentChunk);
    currentChunk = sentence;
  });

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

function getSectionAudioText(section: {
  passage?: string;
  audioSegments?: Array<{ text?: string }>;
}) {
  const passage = String(section?.passage || "").trim();
  if (passage) return passage;

  return (section?.audioSegments || [])
    .map((segment) => segment?.text || "")
    .filter(Boolean)
    .join(" ")
    .trim();
}

function normalizeGroupedQuestion(raw: Record<string, unknown>, index: number): TFGroup | null {
  const questions = safeParseArray(raw.questions)
    .map((question, questionIndex): TFQuestion | null => {
      const source = question as Record<string, unknown>;
      const statement =
        String(
          source.statement ||
            source.question ||
            source.prompt ||
            source.text ||
            "",
        ) ||
        "";
      const answer = normalizeAnswerValue(
        source.answer ||
          source.eval_answer ||
          source.correctAnswer ||
          source.correct_answer,
      );

      if (!statement || !OPTIONS.some((option) => option.value === answer)) {
        return null;
      }

      return {
        id: (source.id as string | number | undefined) || questionIndex + 1,
        order: getSortOrder(source, questionIndex + 1),
        statement,
        answer,
        linkedSegmentId:
          (source.audioSegmentId as string | number | undefined) ||
          (source.audio_segment_id as string | number | undefined) ||
          (source.segmentId as string | number | undefined) ||
          (source.segment_id as string | number | undefined) ||
          (source.audioId as string | number | undefined) ||
          (source.audio_id as string | number | undefined) ||
          null,
      };
    })
    .filter((item): item is TFQuestion => Boolean(item))
    .sort((a, b) => Number(a.order) - Number(b.order));

  if (questions.length === 0) return null;

  const passage = String(raw?.passage || raw?.text || "");
  const rawSegments = safeParseArray(raw?.audioSegments)
    .map((segment, segmentIndex): TFAudioSegment | null => {
      const source = segment as Record<string, unknown>;
      const text = String(source?.text || source?.audioText || "");
      if (!text) return null;

      return {
        id: String(source?.id || segmentIndex + 1),
        order: getSortOrder(source, segmentIndex + 1),
        title: String(source?.title || `Audio ${segmentIndex + 1}`),
        text,
      };
    })
    .filter((item): item is TFAudioSegment => Boolean(item))
    .sort((a, b) => Number(a.order) - Number(b.order));

  return {
    id:
      (typeof raw?.id === "string" || typeof raw?.id === "number"
        ? raw.id
        : undefined) || `grouped-${index + 1}`,
    passage,
    questions,
    audioSegments:
      rawSegments.length > 0
        ? rawSegments
        : sentenceSplit(String(passage || "")),
    timeLimitSeconds: Number(raw?.timeLimitSeconds) || 90,
    instructionFr:
      typeof raw?.instructionFr === "string" ? raw.instructionFr : undefined,
    instructionEn:
      typeof raw?.instructionEn === "string" ? raw.instructionEn : undefined,
    localizedInstruction:
      typeof raw?.localizedInstruction === "string"
        ? raw.localizedInstruction
        : undefined,
  };
}

function normalizeLegacyRows(rows: Record<string, unknown>[]): TFGroup[] {
  const validRows = rows
    .map((row, index): LegacyRow | null => {
      const statement = String(row?.statement || row?.question || row?.prompt || "");
      const answer = normalizeAnswerValue(
        row?.answer ||
          row?.eval_answer ||
          row?.correctAnswer ||
          row?.correct_answer,
      );

      if (!statement || !OPTIONS.some((option) => option.value === answer)) {
        return null;
      }

      return {
        id:
          (typeof row?.id === "string" || typeof row?.id === "number"
            ? row.id
            : undefined) || `legacy-${index + 1}`,
        passage: String(row?.passage || ""),
        statement,
        answer,
        timeLimitSeconds: Number(row?.timeLimitSeconds) || 45,
        instructionFr:
          typeof row?.instructionFr === "string" ? row.instructionFr : undefined,
        instructionEn:
          typeof row?.instructionEn === "string" ? row.instructionEn : undefined,
        localizedInstruction:
          typeof row?.localizedInstruction === "string"
            ? row.localizedInstruction
            : undefined,
      };
    })
    .filter((item): item is LegacyRow => item !== null);

  if (validRows.length === 0) return [];

  const groupedByPassage = new Map<string, TFGroup>();

  validRows.forEach((row) => {
    const key = row.passage || `no-passage-${row.id}`;
    if (!groupedByPassage.has(key)) {
      groupedByPassage.set(key, {
        id: `legacy-group-${groupedByPassage.size + 1}`,
        passage: row.passage,
        questions: [],
        audioSegments: [],
        timeLimitSeconds: row.timeLimitSeconds,
        instructionFr: row.instructionFr,
        instructionEn: row.instructionEn,
        localizedInstruction: row.localizedInstruction,
      });
    }

    const target = groupedByPassage.get(key);
    if (!target) return;
    target.questions.push({
      id: target.questions.length + 1,
      statement: row.statement,
      answer: row.answer,
      linkedSegmentId: null,
    });
    target.timeLimitSeconds = Math.max(
      Number(target.timeLimitSeconds) || 0,
      Number(row.timeLimitSeconds) || 0,
    );
  });

  const naturalGroups = Array.from(groupedByPassage.values()).map((group, index) => ({
    ...group,
    id: group.id || `legacy-group-${index + 1}`,
    audioSegments: sentenceSplit(group.passage),
    timeLimitSeconds: Number(group.timeLimitSeconds) || 90,
  }));

  if (naturalGroups.some((group) => group.questions.length > 1)) {
    return naturalGroups;
  }

  const batchSize = 5;
  const chunkedGroups: TFGroup[] = [];

  for (let index = 0; index < validRows.length; index += batchSize) {
    const chunk = validRows.slice(index, index + batchSize);
    const passageFromChunk = chunk.find((row) => row.passage)?.passage || "";
    const fallbackCombinedPassage =
      passageFromChunk ||
      chunk
        .map((row) => row.passage)
        .filter(Boolean)
        .join(" ");

    chunkedGroups.push({
      id: `legacy-chunk-${chunkedGroups.length + 1}`,
      passage: fallbackCombinedPassage,
      questions: chunk.map((row, questionIndex) => ({
        id: questionIndex + 1,
        statement: row.statement,
        answer: row.answer,
        linkedSegmentId: null,
      })),
      audioSegments: sentenceSplit(fallbackCombinedPassage),
      timeLimitSeconds: Math.max(
        ...chunk.map((row) => Number(row.timeLimitSeconds) || 0),
        90,
      ),
      instructionFr: chunk.find((row) => row.instructionFr)?.instructionFr,
      instructionEn: chunk.find((row) => row.instructionEn)?.instructionEn,
      localizedInstruction: chunk.find((row) => row.localizedInstruction)
        ?.localizedInstruction,
    });
  }

  return chunkedGroups;
}

function normalizeTrueFalseData(rawRows: Record<string, unknown>[]): TFGroup[] {
  const groupedRows = rawRows
    .map((row, index) => normalizeGroupedQuestion(row, index))
    .filter((row): row is TFGroup => row !== null);

  if (groupedRows.length > 0) {
    return groupedRows;
  }

  return normalizeLegacyRows(rawRows);
}

function getSectionTitle(index, total) {
  return total > 1 ? `Passage ${index + 1}` : "Passage";
}

export default function TrueFalsePage() {
  const handleExit = usePracticeExit();
  const { learningLang, knownLang } = useLanguage();
  const { speak, cancel, pause, resume, isSpeaking, isPaused } =
    useTextToSpeech();

  const [groups, setGroups] = useState<TFGroup[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [checkedAnswers, setCheckedAnswers] = useState<Record<string, { selected: string | null; isCorrect: boolean }> | null>(null);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAudio, setActiveAudio] = useState<AudioClip | null>(null);
  const activeAudioIdRef = useRef<string | null>(null);
  const ttsLocale = useMemo(() => toTtsLocale(learningLang), [learningLang]);

  useEffect(() => {
    activeAudioIdRef.current = activeAudio?.uid || null;
  }, [activeAudio]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await loadMockCSV("practice/reading/true_false.csv", {
          learningLang,
          knownLang,
        });
        setGroups(
          normalizeTrueFalseData(
            Array.isArray(data) ? (data as Record<string, unknown>[]) : [],
          ),
        );
      } catch (error) {
        console.error("Error loading true/false data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [learningLang, knownLang]);

  const sections = useMemo(() => {
    let questionOffset = 0;

    return groups.map((group, groupIndex) => {
      const groupKey = group?.id || `group-${groupIndex + 1}`;
      const audioSegments = (group?.audioSegments || []).map(
        (segment, segmentIndex) => ({
          ...segment,
          uid: `${groupKey}-seg-${segment?.id || segmentIndex + 1}`,
        }),
      );

      const questions = (group?.questions || []).map(
        (question, questionIndex) => {
          const linkedSegment =
            question?.linkedSegmentId != null
              ? audioSegments.find(
                  (segment) =>
                    String(segment.id) === String(question.linkedSegmentId),
                ) || null
              : null;

          return {
            ...question,
            uid: `${groupKey}-q-${question?.id || questionIndex + 1}`,
            globalIndex: questionOffset + questionIndex + 1,
            linkedSegment,
          };
        },
      );

      questionOffset += questions.length;

      return {
        ...group,
        groupKey,
        questions,
        audioSegments,
        sectionAudioText: getSectionAudioText({
          passage: group?.passage,
          audioSegments,
        }),
      };
    });
  }, [groups]);

  const allQuestions = useMemo(
    () => sections.flatMap((section) => section.questions),
    [sections],
  );

  const totalQuestionCount = allQuestions.length;
  const answeredCount = Object.keys(selectedAnswers).length;

  const timerDuration = useMemo(() => {
    const total = sections.reduce(
      (sum, section) => sum + (Number(section?.timeLimitSeconds) || 0),
      0,
    );
    return Math.max(total, 90);
  }, [sections]);

  const stopAudio = useCallback(() => {
    cancel();
    activeAudioIdRef.current = null;
    setActiveAudio(null);
  }, [cancel]);

  const finalizeBatch = useCallback(
    (answersMap: Record<string, string>) => {
      let correct = 0;
      const resultMap: Record<string, { selected: string | null; isCorrect: boolean }> = {};

      allQuestions.forEach((question) => {
        const chosen = answersMap[question.uid] || null;
        const isCorrect = chosen === question.answer;
        resultMap[question.uid] = {
          selected: chosen,
          isCorrect,
        };
        if (isCorrect) {
          correct += 1;
        }
      });

      setCheckedAnswers(resultMap);
      setScore(correct);
      stopAudio();
    },
    [allQuestions, stopAudio],
  );

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    isPaused:
      isLoading || isCompleted || !!checkedAnswers || totalQuestionCount === 0,
    onExpire: () => {
      if (!checkedAnswers && totalQuestionCount > 0) {
        finalizeBatch(selectedAnswers);
      }
    },
  });

  useEffect(() => {
    setSelectedAnswers({});
    setCheckedAnswers(null);
    setScore(0);
    setIsCompleted(false);
    stopAudio();
    resetTimer();
  }, [groups, resetTimer, stopAudio]);

  useEffect(() => stopAudio, [stopAudio]);

  const isSpeechSupported =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    typeof window.SpeechSynthesisUtterance !== "undefined";

  const allAnswered =
    totalQuestionCount > 0 &&
    allQuestions.every((question) => Boolean(selectedAnswers[question.uid]));

  const handleSelect = (questionId: string, value: string) => {
    if (checkedAnswers) return;
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const playAudioClip = useCallback(
    (clip: AudioClip) => {
      if (!clip?.text || !isSpeechSupported) return;

      const speechText = normalizeSpeechText(clip.text);
      if (!speechText) return;

      if (isSpeaking && activeAudioIdRef.current === clip.uid) {
        pause();
        return;
      }

      if (isPaused && activeAudioIdRef.current === clip.uid) {
        resume();
        return;
      }

      activeAudioIdRef.current = clip.uid;
      setActiveAudio((prev) =>
        prev?.uid === clip.uid ? prev : { ...clip, text: speechText },
      );

      speak(speechText, ttsLocale, TTS_RATE, {
        pitch: 1.02,
        volume: 1,
        preferredVoiceKeywords: ["google", "microsoft", "natural", "neural"],
        avoidVoiceKeywords: ["compact", "eloquence", "espeak", "festival"],
        onStart: () => {
          activeAudioIdRef.current = clip.uid;
          setActiveAudio({ ...clip, text: speechText });
        },
        onEnd: () => {
          if (activeAudioIdRef.current === clip.uid) {
            activeAudioIdRef.current = null;
            setActiveAudio(null);
          }
        },
        onError: () => {
          if (activeAudioIdRef.current === clip.uid) {
            activeAudioIdRef.current = null;
            setActiveAudio(null);
          }
        },
      });
    },
    [isPaused, isSpeaking, isSpeechSupported, pause, resume, speak, ttsLocale],
  );

  const handlePrimaryAction = () => {
    if (totalQuestionCount === 0) return;

    if (!checkedAnswers) {
      if (!allAnswered) return;
      finalizeBatch(selectedAnswers);
      return;
    }

    setIsCompleted(true);
  };

  const audioClips = sections.flatMap((section, sectionIndex) => {
    const clips =
      section.audioSegments.length > 0
        ? section.audioSegments.map((segment, segmentIndex) => ({
            uid: segment.uid,
            sectionKey: section.groupKey,
            title: segment.title || `Audio ${segmentIndex + 1}`,
            text: segment.text,
            sectionTitle: getSectionTitle(sectionIndex, sections.length),
          }))
        : [
            {
              uid: `${section.groupKey}-full`,
              sectionKey: section.groupKey,
              title:
                sections.length > 1
                  ? `${getSectionTitle(sectionIndex, sections.length)} Audio`
                  : "Audio 1",
              text: section.sectionAudioText,
              sectionTitle: getSectionTitle(sectionIndex, sections.length),
            },
          ];

    return clips.flatMap((clip) => {
      const chunks = chunkSpeechText(clip.text);

      if (chunks.length <= 1) {
        return clip.text ? [{ ...clip, text: chunks[0] || clip.text }] : [];
      }

      return chunks.map((chunk, chunkIndex) => ({
        ...clip,
        uid: `${clip.uid}-part-${chunkIndex + 1}`,
        title: `${clip.title} ${chunkIndex + 1}/${chunks.length}`,
        text: chunk,
      }));
    });
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <p className="text-xl text-slate-600 dark:text-slate-400">
          No questions available.
        </p>
        <Button onClick={() => handleExit()} variant="outline" className="mt-4">
          Back
        </Button>
      </div>
    );
  }

  const progress = isCompleted
    ? 100
    : totalQuestionCount > 0
      ? (answeredCount / totalQuestionCount) * 100
      : 0;
  const questionCounterValue = totalQuestionCount
    ? Math.min(totalQuestionCount, Math.max(answeredCount, 1))
    : 1;

  return (
    <PracticeGameLayout
      questionType="Identify Information"
      questionTypeFr="Identifier l'information"
      questionTypeEn="Identify Information"
      localizedInstruction={sections[0]?.localizedInstruction}
      instructionFr={
        sections[0]?.instructionFr ||
        "L'affirmation est-elle vraie, fausse, ou non mentionnée?"
      }
      instructionEn={
        sections[0]?.instructionEn ||
        "Is the statement true, false, or not mentioned?"
      }
      progress={progress}
      isGameOver={isCompleted}
      score={score}
      totalQuestions={totalQuestionCount || 1}
      currentQuestionIndex={0}
      questionCounterValue={questionCounterValue}
      feedbackTone="neutral"
      onExit={handleExit}
      onNext={handlePrimaryAction}
      onRestart={() => window.location.reload()}
      isSubmitEnabled={checkedAnswers ? true : allAnswered}
      showSubmitButton={true}
      submitLabel={checkedAnswers ? "Finish" : "Check"}
      timerValue={timerString}
      showFeedback={false}
    >
      <div className="mx-auto flex w-full flex-1 flex-col px-4 pb-[108px] pt-3 lg:px-6">
        <div className="grid flex-1 grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,0.96fr)]">
          <section className="rounded-[18px] border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900">
            <div className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                {checkedAnswers ? (
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                    Audio Recordings
                  </p>
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full text-blue-500 dark:text-blue-300">
                    <Headphones className="h-4 w-4" />
                  </span>
                )}
              </div>

              {!isSpeechSupported && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-300">
                  TTS unavailable on this device.
                </div>
              )}

              <div className="space-y-2">
                {checkedAnswers
                  ? audioClips.map((clip) => (
                      <article
                        key={clip.uid}
                        className="rounded-[14px] border border-slate-200 bg-white px-4 py-3 text-left dark:border-slate-700 dark:bg-slate-950"
                      >
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                          {clip.title}
                        </p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-800 dark:text-slate-100">
                          {clip.text}
                        </p>
                      </article>
                    ))
                  : audioClips.map((clip, clipIndex) => {
                      const isCurrent = activeAudio?.uid === clip.uid;

                      return (
                        <button
                          key={clip.uid}
                          type="button"
                          onClick={() => playAudioClip(clip)}
                          disabled={!isSpeechSupported}
                          className={cn(
                            "flex w-full items-center gap-4 rounded-[14px] border px-4 py-4 text-left transition-all duration-200",
                            isCurrent
                              ? "border-blue-200 bg-blue-50/70"
                              : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:hover:border-slate-600",
                            !isSpeechSupported && "cursor-not-allowed opacity-50",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
                              isCurrent
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300",
                            )}
                          >
                            {isCurrent && isSpeaking ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4 fill-current" />
                            )}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                              {clip.title}
                            </p>
                            <div className="mt-2 flex h-8 items-end gap-[3px]">
                              {WAVE_BARS.map((height, index) => (
                                <span
                                  key={`${clip.uid}-wave-${index}`}
                                  className={cn(
                                    "block w-[3px] rounded-full transition-colors duration-200",
                                    isCurrent
                                      ? "bg-blue-600"
                                      : "bg-slate-300 dark:bg-slate-600",
                                  )}
                                  style={{
                                    height: `${Math.max(
                                      7,
                                      height -
                                        ((clipIndex % 3) * 3 + (index % 2)),
                                    )}px`,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        </button>
                      );
                    })}
              </div>
            </div>
          </section>

          <section className="rounded-[18px] border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:border-slate-700 dark:bg-slate-900">
            <div className="space-y-2">
              {allQuestions.map((question) => {
                const checked = checkedAnswers?.[question.uid];
                const chosen =
                  checked?.selected ?? selectedAnswers[question.uid] ?? null;
                const showState = Boolean(checkedAnswers);
                const isCorrect = Boolean(checked?.isCorrect);

                return (
                  <article
                    key={question.uid}
                    className={cn(
                      "rounded-[14px] border px-4 py-4 transition-colors",
                      showState
                        ? isCorrect
                          ? "border-emerald-200 bg-emerald-50/70 dark:border-emerald-800 dark:bg-emerald-950/20"
                          : "border-red-200 bg-red-50/70 dark:border-red-800 dark:bg-red-950/20"
                        : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold leading-6 text-slate-800 dark:text-slate-100">
                          <span className="mr-1.5 text-sky-500">
                            {question.globalIndex}.
                          </span>
                          {question.statement}
                        </p>

                        {question.linkedSegment ? (
                          <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">
                            {question.linkedSegment.title}
                          </p>
                        ) : null}
                      </div>

                      {showState &&
                        (isCorrect ? (
                          <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <XCircle className="mt-0.5 h-4.5 w-4.5 shrink-0 text-red-600 dark:text-red-400" />
                        ))}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                      {OPTIONS.map((option) => {
                        const isSelected = chosen === option.value;
                        const isCorrectOption =
                          option.value === question.answer;
                        const isWrongSelected =
                          showState && isSelected && !isCorrectOption;
                        const isRightAfterCheck = showState && isCorrectOption;

                        return (
                          <label
                            key={`${question.uid}-${option.value}`}
                            className={cn(
                              "inline-flex items-center gap-2 text-sm transition-colors",
                              !showState
                                ? "cursor-pointer text-slate-600 dark:text-slate-300"
                                : isRightAfterCheck
                                  ? "cursor-default text-emerald-700 dark:text-emerald-300"
                                  : isWrongSelected
                                    ? "cursor-default text-red-700 dark:text-red-300"
                                    : "cursor-default text-slate-400 dark:text-slate-500",
                            )}
                          >
                            <input
                              type="radio"
                              name={`tf-${question.uid}`}
                              value={option.value}
                              checked={isSelected}
                              onChange={() =>
                                handleSelect(question.uid, option.value)
                              }
                              disabled={showState}
                              className="h-3.5 w-3.5 border-slate-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span>{option.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </PracticeGameLayout>
  );
}
