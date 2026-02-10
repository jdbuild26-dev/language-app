import React, { useState, useEffect, useRef } from "react";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { Loader2, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchPracticeQuestions } from "../../../services/vocabularyApi";
import { cn } from "@/lib/utils";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import { getFeedbackMessage } from "@/utils/feedbackMessages";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";

export default function CorrectSpellingGamePage() {
  const navigate = useNavigate();
  const { speak, isSpeaking } = useTextToSpeech();
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [score, setScore] = useState(0);

  // Timer Hook
  const currentQuestion = questions[currentIndex];
  const timerDuration = parseInt(currentQuestion?.timeLimit) || 60;
  
  // Input ref for auto-focus
  const inputRef = useRef(null);

  // Load questions on mount
  useEffect(() => {
    loadQuestions();
  }, []);

  const { timerString, resetTimer } = useExerciseTimer({
    duration: timerDuration,
    mode: "timer",
    onExpire: () => {
      if (!isCompleted && !showFeedback) {
        // Time's up logic
        setIsCorrect(false);
        setFeedbackMessage("Time's up!");
        setShowFeedback(true);
      }
    },
    isPaused: loading || isCompleted || showFeedback,
  });

  // Clean string helper
  const cleanString = (str) => {
    if (!str) return "";
    return str
      .trim()
      .replace(/\u200B/g, "") // Remove zero-width space
      .normalize("NFC"); // Normalize unicode
  };

  // Reset logic
  useEffect(() => {
    if (questions.length > 0 && !isCompleted) {
      resetTimer();
      setUserAnswer("");
      
      // Auto-play audio when new question loads
      // Optional: uncomment if auto-play is desired
      // if (currentQuestion?.correctAnswer) {
      //   speak(currentQuestion.correctAnswer, "fr-FR");
      // }

      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 100);
    }
  }, [currentIndex, questions, isCompleted, resetTimer]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetchPracticeQuestions(
        "C2_Writing_Correct spelling",
      );
      if (response && response.data && response.data.length > 0) {
        const normalized = response.data.map((item) => ({
          id: item.ExerciseID || Math.random(),
          // We keep misspelledWord in data but won't show it
          misspelledWord:
            item.MisspelledWord ||
            item["Misspelled Word"] ||
            item.Misspelled ||
            item.Incorrect ||
            item.IncorrectWord_FR ||
            item["Incorrect Word"] ||
            "Error",
          correctAnswer:
            item.CorrectAnswer_FR ||
            item["Correct Answer"] ||
            item.Answer ||
            item.Correct ||
            item["Correct Word"] ||
            "",
          instructionFr: item.Instruction_FR || "Corrigez l'orthographe",
          instructionEn: item.Instruction_EN || "Fix the spelling error",
          timeLimit: item.TimeLimitSeconds || item["Time Limit"] || 60,
          wordMeaningEn:
            item["Word Meaning_EN"] ||
            item["Word Meaning"] ||
            item.Meaning ||
            item.Translation ||
            "",
        }));
        setQuestions(normalized);
      } else {
        console.error("API returned empty data");
        setQuestions([]);
      }
    } catch (err) {
      console.error("Failed to load practice questions:", err);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayAudio = () => {
    if (currentQuestion?.correctAnswer) {
      speak(currentQuestion.correctAnswer, "fr-FR");
    }
  };

  const handleSubmit = () => {
    if (showFeedback) return;

    const cleanedUserAnswer = cleanString(userAnswer);
    const cleanedRightAnswer = cleanString(currentQuestion?.correctAnswer);

    const correct = cleanedUserAnswer.toLowerCase() === cleanedRightAnswer.toLowerCase();

    setIsCorrect(correct);
    setFeedbackMessage(getFeedbackMessage(correct));
    setShowFeedback(true);

    if (correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    setShowFeedback(false);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  // Progress
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900">
        <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
      </div>
    );
  }

  return (
    <>
      <PracticeGameLayout
        questionType="Correct the spelling"
        instructionFr={
          currentQuestion?.instructionFr || "Corrigez l'orthographe"
        }
        instructionEn={currentQuestion?.instructionEn || "Correct the spelling"}
        progress={progress}
        isGameOver={isCompleted}
        score={score}
        totalQuestions={questions.length}
        onExit={() => navigate("/vocabulary/practice")}
        onNext={showFeedback ? handleContinue : handleSubmit}
        onRestart={() => window.location.reload()}
        isSubmitEnabled={
          (userAnswer.trim().length > 0 && !showFeedback) || showFeedback
        }
        showSubmitButton={true}
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
        correctAnswer={!isCorrect ? currentQuestion.correctAnswer : null}
        feedbackMessage={feedbackMessage}
      >
        <div className="flex flex-col items-center justify-center w-full max-w-4xl gap-8">
          {/* Hint / Context - Optional, kept from previous version if meaningful */}
          {(currentQuestion?.meaning ||
            currentQuestion?.wordMeaningEn) && (
            <div className="bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 px-4 py-2 rounded-lg text-sm font-medium">
              {currentQuestion.meaning || currentQuestion.wordMeaningEn || ""}
            </div>
          )}

          {/* Audio Button - Central Element */}
          <div className="flex justify-center my-4">
             <button
              onClick={handlePlayAudio}
              disabled={isSpeaking}
               className={cn(
                "flex items-center gap-3 px-8 py-6 rounded-3xl transition-all shadow-lg active:scale-95 group",
                isSpeaking
                  ? "bg-sky-100 text-sky-600 ring-4 ring-sky-200"
                  : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-2 border-slate-200 dark:border-slate-700 hover:border-sky-400 hover:text-sky-600 dark:hover:text-sky-400"
              )}
            >
              <Volume2 className={cn("w-8 h-8", isSpeaking && "animate-pulse text-sky-600")} />
              <span className="text-2xl font-medium">
                 {/*  We are NOT showing the word here as per request "Remove red crossed out lines". 
                      But usually audio button doesn't have text. 
                      The user request image showed "independant" next to speaker but crossed out "indepedent" above it.
                      Wait, the request says "Remove the red crossed out lines".
                      The image shows "independant" (the correct one presumably) next to the speaker.
                      Let's check the code I wrote. 
                      
                      In my previous edit attempt (which failed), I put `currentQuestion?.correctAnswer` inside the button.
                      " <span className="text-2xl font-medium">{currentQuestion?.correctAnswer}</span> "
                      
                      If I show the correct answer, that defeats the purpose of "Correct the spelling" if the user just has to copy it.
                      HOWEVER, the user image shows:
                      "Say - d h d r t h a i s" -> "They need to write the correct spelling - siddharth"
                      "Speaker button there before and after people press submit - at all times"
                      
                      AND the user image shows "independant" next to the speaker icon.
                      BUT the task says "Correct the spelling".
                      
                      If I show the correct answer, it's just a typing test, not spelling correction.
                      
                      Let's re-read the handwritten note in the image.
                      "So this is basically we put the wrong spelling. Say - d h d r t h a i s. They need to write the correct spelling - siddharth"
                      
                      Wait, "Say - [wrong spelling]"? 
                      No, "Say - [audio of correct word]".
                      
                      The image labels:
                      "Speaker button there before and after people press submit - at all times" pointing to a speaker icon next to the word "independant".
                      Above "independant" is "independent" crossed out with red lines.
                      The command says "remove the red crossed out lines from the ui".
                      
                      So we are left with: Speaker Icon + "independant" (which looks like the correct word?).
                      
                      If "independant" is the correct French word for "independent" (English).
                      Yes, "indépendant" is French.
                      
                      If the text "independant" is shown, the user just copies it?
                      
                      Maybe the user wants the WRONG spelling to be shown but NOT crossed out?
                      "remove the red crossed out lines from the ui"
                      
                      If I remove the red lines, I am left with the text that was crossed out.
                      BUT the prompt also says "this is for correct the spelling... remove the red crossed out lines".
                      
                      Let's look at the other note:
                      "Replace it with a type in box - that way you don't have the headache of selecting the number of boxes..."
                      
                      If I look at the "So this is basically we put the wrong spelling" note.
                      It implies the user sees the wrong spelling?
                      
                      BUT the red crossed out thing IS the wrong spelling usually.
                      
                      If I remove the crossed out lines... do I remove the text too?
                      
                      In the image:
                      "independent" (English spelling?) is crossed out.
                      "independant" (French spelling) is shown next to speaker.
                      
                      If the goal is "Correct the spelling", usually you see a wrong word and type the right one.
                      OR you hear a word and type it (Dictation).
                      
                      The user says "Correct the spelling".
                      The user says "remove the red crossed out lines".
                      
                      If I remove the crossed out text entirely, the user has NO visual cue of the word, only Audio.
                      This makes it a Dictation exercise.
                      
                      Is that what they want?
                      "Speaker button there... at all times"
                      
                      If I show the MISSPELLED word without cross-out, it might be confusing if it looks like the prompt.
                      
                      Let's assume the user wants to hide the "wrong" version that was previously shown crossed out.
                      And maybe show the "misspelled" version as the prompt?
                      
                      The current code showed:
                      `{currentQuestion?.misspelledWord}`
                      
                      The user says "remove the red crossed out lines from the ui".
                      In the current UI (before my changes), was there a red crossed out line?
                      
                      Let's check `CorrectSpellingGamePage.jsx` original content.
                      It had:
                      ```jsx
                      {/* Misspelled Word */}
                      <div className="mb-12 text-center">
                        <span className="text-3xl md:text-4xl font-medium text-slate-600 dark:text-slate-300 tracking-wide">
                          {currentQuestion?.misspelledWord}
                        </span>
                      </div>
                      ```
                      It just displayed the misspelled word. It didn't have "red crossed out lines" in the code I saw. Use of `line-through` style?
                      No `line-through` class in the original code.
                      
                      Maybe the user is referring to a *design mockup* image they attached, and the "current" app doesn't even have that yet, or I am misinterpreting the "current" state.
                      
                      Actually, the user IS showing a screenshot of the *current* app or a mockup?
                      The screenshot looks like a mockup/slide.
                      
                      The user request: "remove the red crossed out lines from the ui".
                      This implies the red crossed out lines are *undesired*.
                      
                      If I look at my Implementation Plan which was APPROVED:
                      "Remove standard misspelledWord display."
                      "Users will rely entirely on the audio pronunciation to know what word to spell."
                      
                      So I should NOT show the text.
                      
                      BUT, in the code below, I have:
                      ```jsx
                      <span className="text-2xl font-medium">
                         {currentQuestion?.correctAnswer}
                      </span>
                      ```
                      If I show `correctAnswer`, I am giving away the answer!
                      
                      I must NOT show the `correctAnswer` text inside the button unless it's intended to be a "Listen and Repeat" or "Dictation where text is hidden".
                      
                      If I hide the text...
                      The button should just be "Listen".
                      
                      Let's look at the Mockup again.
                      The mockup shows "independant" (text) next to the speaker.
                      "independant" IS the correct French spelling.
                      
                      If the user sees the correct spelling, they just type it.
                      This makes it "Copy the word" or "Type what you see".
                      
                      Maybe the user WANTS "Type what you see/hear" practice?
                      
                      However, the activity is called "Correct the spelling".
                      
                      If I put `misspelledWord` next to the speaker?
                      Then the user hears the Right word, sees the Wrong word, and types the Right word.
                      This makes sense for "Correct the spelling".
                      
                      In my Implementation Plan (Approved):
                      "Remove the display of misspelledWord."
                      
                      So I should hide the text entirely?
                      
                      If I hide `misspelledWord` AND `correctAnswer` text, the user has ONLY Audio.
                      This is "Dictation".
                      
                      The user explicitly approved the plan:
                      "This change will remove the visual display of the misspelled word. Users will rely entirely on the audio pronunciation to know what word to spell."
                      
                      So I will STICK to that plan.
                      
                      BUT, in the code snippet I prepared for `write_to_file` (which I am about to run), I had:
                      `<span className="text-2xl font-medium">{currentQuestion?.correctAnswer}</span>`
                      
                      I should REMOVE this span. Providing the answer matches the "Dictation" model but displaying it defeats the purpose of "testing".
                      
                      Wait, if I display the answer, it's not a test.
                      
                      I will REMOVE the text span from the button. It will just be a large speaker icon.
                      
                      Also, I should ensure the `instructions` make sense.
                      "Tap the speaker to hear the word, then type it correctly below."
                      
                      This seems safe and correct based on the approved plan (Dictation style).
                      
                  */}
                 Listen
              </span>
            </button>
          </div>

          {/* Instructions for user */}
          <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-md">
            Tap the speaker to hear the word, then type it correctly below.
          </p>

          {/* Single Input Box */}
          <div className="w-full max-w-md">
            <Input
              ref={inputRef}
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type the missing word..."
              disabled={showFeedback}
              className={cn(
                "text-center text-xl p-6 h-16 rounded-xl border-2 transition-all shadow-sm",
                "focus:ring-4 focus:ring-sky-500/20 focus:border-sky-500",
                showFeedback && isCorrect && "border-green-500 bg-green-50 text-green-900",
                showFeedback && !isCorrect && "border-red-500 bg-red-50 text-red-900"
              )}
              onKeyDown={(e) => {
                if (e.key === "Enter" && userAnswer.trim().length > 0 && !showFeedback) {
                  handleSubmit();
                }
              }}
              autoComplete="off"
              autoCorrect="off"
            />
          </div>
        </div>
      </PracticeGameLayout>
    </>
  );
}
