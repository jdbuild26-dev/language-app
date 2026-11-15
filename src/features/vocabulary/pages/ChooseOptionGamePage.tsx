"use client";

import React, { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { fetchPracticeQuestions } from "@/services/vocabularyApi";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import PracticeOptions from "@/components/ui/PracticeOptions";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { useTranslateText } from "@/hooks/useTranslateText";
import { useLanguage } from "@/contexts/LanguageContext";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { cn } from "@/lib/utils";
import { choiceSentence } from "@/features/vocabulary/lib/choiceSentence";
import { selectChoice } from "@/features/vocabulary/lib/choiceSelection";
import { translateText } from "@/services/aiPracticeApi";

type ChoiceOption = { text: string; en?: string };
type RawChoiceRow = Record<string, unknown>;
type ChoiceQuestion = {
  id: string;
  question: string;
  completeSentence: string;
  completeSentenceEnglish: string;
  correctAnswer: string;
  correctAnswers: string[];
  options: ChoiceOption[];
  questionType: string;
  instructionFr: string;
  instructionEn: string;
  localizedInstruction: string;
  image?: string;
};

function choiceAnswers(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map(answer => answer.trim()).filter(Boolean);
  if (typeof value !== "string") return [];
  const text = value.trim();
  if (text.startsWith("[")) {
    try { return choiceAnswers(JSON.parse(text)); } catch { return []; }
  }
  return text.split("|").map(answer => answer.trim()).filter(Boolean);
}

export default function ChooseOptionGamePage() {
  const router = useRouter();
  const { speak } = useTextToSpeech();
  const { learningLang, knownLang } = useLanguage();
  const [questions, setQuestions] = useState<ChoiceQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<ChoiceOption[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [translatedOptions, setTranslatedOptions] = useState<Record<number, boolean>>({});
  const [translationCache, setTranslationCache] = useState<Record<number, string>>({});
  const [translationErrors, setTranslationErrors] = useState<Record<number, string>>({});
  const [translationLoading, setTranslationLoading] = useState<Record<number, boolean>>({});
  const pendingTranslations = useRef(new Map<number, AbortController>());
  const translationGeneration = useRef(0);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    const loadGameData = async () => {
      try {
        setLoading(true);
        console.log(
          `[ChooseOption] 📡 Fetching data from backend (slug: choose_options)...`,
        );
        const response = await fetchPracticeQuestions("choose_options", {
          learningLang,
          knownLang,
        });
        const practiceData = (response.data || []) as RawChoiceRow[];
        console.log(
          `[ChooseOption] ✅ Loaded ${practiceData.length} questions`,
          { sample: practiceData[0] },
        );

        if (!practiceData || practiceData.length === 0) {
          throw new Error("No practice questions found.");
        }

        // Shuffle and pick a subset
        const gameQuestionsRaw = shuffleArray(practiceData).slice(0, 10);
        let storedRows: RawChoiceRow[] = [];
        if (learningLang.toLowerCase() === "fr" && knownLang.toLowerCase() === "en" && gameQuestionsRaw.some(item => {
          const content = (item.content || item) as RawChoiceRow;
          return [1, 2, 3, 4].some(index => content[`Option${index}`] && !(content[`Option${index}_EN`] || item[`Option${index}_EN`]));
        })) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);
          try {
            const stored = await fetch("/mock-data/csv/choose_options.csv", { signal: controller.signal });
            if (stored.ok) storedRows = Papa.parse<RawChoiceRow>(await stored.text(), { header: true, skipEmptyLines: true }).data;
          } catch {
            // Keep the API exercise usable when the stored reference cannot be loaded.
          } finally { clearTimeout(timeout); }
        }

        const generatedQuestions = gameQuestionsRaw.map((item): ChoiceQuestion | null => {
          const content = item.content && typeof item.content === "object" && !Array.isArray(item.content)
            ? item.content as RawChoiceRow : item;
          const evaluation = item.evaluation && typeof item.evaluation === "object" && !Array.isArray(item.evaluation)
            ? item.evaluation as RawChoiceRow : {};
          const options = [
            { text: String(content.Option1 || ""), en: String(content.Option1_EN || item.Option1_EN || "") },
            { text: String(content.Option2 || ""), en: String(content.Option2_EN || item.Option2_EN || "") },
            { text: String(content.Option3 || ""), en: String(content.Option3_EN || item.Option3_EN || "") },
            { text: String(content.Option4 || ""), en: String(content.Option4_EN || item.Option4_EN || "") },
          ].filter((o) => o.text);
          const sourceQuestion = String(content.Question || content.question || content.Sentence || "");
          const storedRow = storedRows.find(row => String(row.Question || row.question || "") === sourceQuestion &&
            options.every(option => [1, 2, 3, 4].some(index => row[`Option${index}`] === option.text)));
          if (storedRow) options.forEach(option => {
            const index = [1, 2, 3, 4].find(index => storedRow[`Option${index}`] === option.text);
            if (!option.en && index) option.en = String(storedRow[`Option${index}_EN`] || "");
          });

          const shuffledOptions = shuffleArray(options);

          const answerValue = content.CorrectAnswers || item.CorrectAnswers || content.CorrectAnswer || item.CorrectAnswer ||
            content.correctAnswer || item.correctAnswer || content.eval_CorrectAnswer || item.eval_CorrectAnswer ||
            content.eval_correctAnswer || item.eval_correctAnswer || evaluation.CorrectAnswer || evaluation.correctAnswer ||
            content.Answer || item.Answer;
          const correctAnswers = choiceAnswers(answerValue);
          if (!correctAnswers.length) {
            const answerIndex = Number(content.CorrectOptionIndex || item.CorrectOptionIndex || evaluation.CorrectOptionIndex);
            if (Number.isInteger(answerIndex) && answerIndex >= 1 && answerIndex <= options.length) {
              correctAnswers.push(options[answerIndex - 1].text);
            }
          }
          if (!correctAnswers.length || correctAnswers.some(answer => !options.some(option => option.text === answer))) return null;
          const question = String(content.Question || content.question || content.Sentence || item.Question || item.question || item.Sentence || "");
          let blankIndex = 0;
          const completeSentence = String(content["Complete sentence"] || content.CompleteSentence ||
            content.completeSentence || item["Complete sentence"] || item.CompleteSentence || item.completeSentence ||
            question.replace(/_{2,}/g, () => correctAnswers[blankIndex++] || correctAnswers[0] || ""));
          return {
            id: String(item.ExerciseID || item.external_id || Math.random().toString()),
            question,
            completeSentence,
            completeSentenceEnglish: String(content["Complete sentence_EN"] || content.CompleteSentence_EN || content.completeSentenceEnglish || item["Complete sentence_EN"] || item.CompleteSentence_EN || item.completeSentenceEnglish || ""),
            correctAnswer: correctAnswers.join(" • "),
            correctAnswers,
            options: shuffledOptions,
            questionType: String(
              content.TypeName || content.QuestionType || item.TypeName || item.QuestionType || "Choose from Options",
            ),
            instructionFr: String(
              item.Instruction_FR || item.instruction_fr || item.instructionFr ||
              "Complétez la phrase avec le mot correct",
            ),
            instructionEn: String(
              item.Instruction_EN || item.instruction_en || item.instructionEn ||
              "Complete the sentence with the correct word",
            ),
            localizedInstruction: String(
              item.localizedInstruction || item.Instruction_EN || item.instruction_en ||
              "Complete the sentence with the correct word",
            ),
            image: String(content.ImageURL || content.imageUrl || item.ImageURL || item.imageUrl || ""),
          };
        }).filter((question): question is ChoiceQuestion => question !== null);

        setQuestions(generatedQuestions);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load game data:", err);
        setError("Failed to load questions. Please check data source.");
        setLoading(false);
      }
    };

    loadGameData();
  }, [learningLang, knownLang]);

  const currentQuestion = questions[currentIndex];
  const answerTranslation = useTranslateText(
    currentQuestion?.completeSentence || "",
    learningLang.toLowerCase(),
    knownLang.toLowerCase() === "en" ? currentQuestion?.completeSentenceEnglish : undefined,
    knownLang.toLowerCase(),
  );
  const { timerString, resetTimer } = useExerciseTimer({
    duration: 20,
    mode: "timer",
    onExpire: () => {
      // Auto-submit when time expires
      if (!isGameOver && !showFeedback) {
        if (selectedOptions.length !== currentQuestion?.correctAnswers.length) {
          setIsCorrect(false);
          setFeedbackMessage("Time's up!");
          setTranslatedOptions({});
          setShowFeedback(true);
        } else {
          handleSubmit();
        }
      }
    },
    isPaused: loading || isGameOver || showFeedback,
  });

  // Reset timer on next question
  useEffect(() => {
    resetTimer();
  }, [currentIndex, resetTimer]);

  useEffect(() => {
    const pending = pendingTranslations.current;
    return () => {
      translationGeneration.current += 1;
      pending.forEach((controller) => controller.abort());
      pending.clear();
    };
  }, []);

  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  const handleOptionClick = (option: ChoiceOption) => {
    if (showFeedback) return;
    speak(option.text, "fr-FR");
    setSelectedOptions((current) => selectChoice(current, option, currentQuestion.correctAnswers.length));
  };

  const toggleOptionTranslation = async (index: number) => {
    if (!showFeedback) return;
    if (translatedOptions[index]) {
      setTranslatedOptions((previous) => ({ ...previous, [index]: false }));
      return;
    }
    const option = currentQuestion.options[index];
    if (option.en || translationCache[index]) {
      setTranslatedOptions((previous) => ({ ...previous, [index]: true }));
      return;
    }
    if (pendingTranslations.current.has(index)) return;
    const generation = translationGeneration.current;
    const controller = new AbortController();
    pendingTranslations.current.set(index, controller);
    const timeout = setTimeout(() => controller.abort(), 12000);
    setTranslationLoading((previous) => ({ ...previous, [index]: true }));
    setTranslationErrors((previous) => ({ ...previous, [index]: "" }));
    try {
      const result = await translateText(option.text, knownLang.toLowerCase(), controller.signal);
      if (generation !== translationGeneration.current) return;
      const translation = result.translation?.trim();
      if (!translation) throw new Error("Translation unavailable");
      setTranslationCache((previous) => ({ ...previous, [index]: translation }));
      setTranslatedOptions((previous) => ({ ...previous, [index]: true }));
    } catch {
      if (generation === translationGeneration.current) {
        setTranslationErrors((previous) => ({ ...previous, [index]: "Translation unavailable. Try again." }));
      }
    } finally {
      clearTimeout(timeout);
      if (pendingTranslations.current.get(index) === controller) pendingTranslations.current.delete(index);
      if (generation === translationGeneration.current) {
        setTranslationLoading((previous) => ({ ...previous, [index]: false }));
      }
    }
  };

  const handleSubmit = () => {
    if (selectedOptions.length !== currentQuestion.correctAnswers.length || showFeedback) return;

    const correct = selectedOptions.every((option, index) => option.text === currentQuestion.correctAnswers[index]);
    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setTranslatedOptions({});
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    translationGeneration.current += 1;
    pendingTranslations.current.forEach((controller) => controller.abort());
    pendingTranslations.current.clear();
    answerTranslation.reset();
    setTranslatedOptions({});
    setTranslationCache({});
    setTranslationErrors({});
    setTranslationLoading({});
    setShowFeedback(false);
    setSelectedOptions([]);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!error && questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <h2 className="text-xl font-bold mb-2 text-slate-800 dark:text-slate-100">
          No questions found
        </h2>
        <Link href="/vocabulary/practice">
          <Button variant="outline">Back to Practice</Button>
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Link href="/vocabulary/practice">
          <Button variant="outline">Back to Practice</Button>
        </Link>
      </div>
    );
  }

  const selectedOptionIndices = currentQuestion.options
    .map((option, index) => selectedOptions.some((selected) => selected.text === option.text) ? index : -1)
    .filter((index) => index >= 0);
  const correctOptionIndices = currentQuestion.options
    .map((option, index) => currentQuestion.correctAnswers.includes(option.text) ? index : -1)
    .filter((index) => index >= 0);
  const sentence = choiceSentence(currentQuestion.question, currentQuestion.correctAnswers, currentQuestion.options);

  return (
    <>
      <PracticeGameLayout
        questionType={currentQuestion?.questionType}
        instructionFr={currentQuestion?.instructionFr}
        instructionEn={currentQuestion?.instructionEn}
        localizedInstruction={currentQuestion?.localizedInstruction}
        progress={progress}
        isGameOver={isGameOver}
        score={score}
        totalQuestions={questions.length}
        onExit={() => router.push("/vocabulary/practice")}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={selectedOptions.length === currentQuestion.correctAnswers.length || showFeedback}
        submitLabel={
          showFeedback
            ? currentIndex + 1 === questions.length
              ? "FINISH"
              : "CONTINUE"
            : "CHECK"
        }
        timerValue={timerString}
        showFeedback={showFeedback}
        isCorrect={isCorrect}
        feedbackMessage={feedbackMessage}
        compactFeedback
        preserveFooterHeightOnFeedback
      >
        <div className="flex w-full flex-1 flex-col items-center justify-start gap-6 px-4 pb-6 pt-8 sm:gap-8 sm:pt-10">
          <div className="flex w-full flex-col items-center justify-center">
            <div className="w-full max-w-6xl px-4 py-2">
              <h2 className="practice-type-question-heading text-center text-gray-800 dark:text-gray-100">
                {(() => {
                  if (sentence.hints.length) {
                    return sentence.parts
                      .map((part, i, arr) => (
                        <React.Fragment key={i}>
                          {part}
                          {i < arr.length - 1 && (
                            <span className={cn(
                              "mx-1 inline-block min-w-24 rounded-lg border px-3 py-0.5 align-middle",
                              showFeedback
                                ? selectedOptions[i]?.text === currentQuestion.correctAnswers[i]
                                  ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                                  : "border-red-500 bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                                : "border-slate-300 bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-100",
                            )}>{selectedOptions[i]?.text || <span className="font-normal text-slate-400 dark:text-slate-500">{sentence.hints[i] || "\u00a0"}</span>}</span>
                          )}
                        </React.Fragment>
                      ));
                  }

                  return currentQuestion.question;
                })()}
              </h2>
            </div>
            <div aria-hidden={!showFeedback} className={cn("mt-3 flex min-h-10 max-w-6xl items-center justify-center gap-2 text-center", !showFeedback && "invisible")}>
              <p className="practice-type-content font-medium text-emerald-700 dark:text-emerald-300">
                {answerTranslation.displayText}
              </p>
              <TranslateButton
                aria-label={answerTranslation.showTranslation ? "Show original correct sentence" : "Translate correct sentence"}
                aria-pressed={answerTranslation.showTranslation}
                title={answerTranslation.showTranslation ? "Show original sentence" : "Translate correct sentence"}
                isLoading={answerTranslation.isTranslating}
                disabled={!showFeedback}
                onClick={() => { if (showFeedback) void answerTranslation.toggle(); }}
              />
            </div>
            {showFeedback && answerTranslation.error && <p role="status" className="mt-1 text-sm text-slate-500">{answerTranslation.error}</p>}
          </div>

          <div className="w-full max-w-5xl" role="group" aria-label="Answer options">
            <PracticeOptions
              options={currentQuestion.options.map((option) => option.text)}
              selectedIndices={selectedOptionIndices}
              correctIndices={correctOptionIndices}
              showFeedback={showFeedback}
              onSelect={(index) => handleOptionClick(currentQuestion.options[index])}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
              itemClassName="min-h-20 pr-14"
              showCheckIcon
              renderLabel={(text, index) => (
                <>
                  <span>{text}</span>
                  {showFeedback && translatedOptions[index] && (currentQuestion.options[index].en || translationCache[index]) && (
                    <span className="mt-1 text-sm font-normal">
                      {currentQuestion.options[index].en || translationCache[index]}
                    </span>
                  )}
                  {showFeedback && translationErrors[index] && <span role="status" className="mt-1 text-sm font-normal">{translationErrors[index]}</span>}
                </>
              )}
              renderAction={(_, index) => showFeedback && (
                <TranslateButton
                  iconVariant="option"
                  aria-label={translatedOptions[index] ? `Hide translation for ${currentQuestion.options[index].text}` : `Translate ${currentQuestion.options[index].text}`}
                  aria-pressed={Boolean(translatedOptions[index])}
                  isLoading={Boolean(translationLoading[index])}
                  onClick={() => { void toggleOptionTranslation(index); }}
                />
              )}
            />
          </div>
        </div>
      </PracticeGameLayout>
    </>
  );
}
