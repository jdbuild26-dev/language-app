import React, { useState, useEffect, useRef } from "react";
import { useTextToSpeech } from "../../../../hooks/useTextToSpeech";
import FullScreenLayout from "../../../../components/layout/FullScreenLayout";
import { Loader2, Volume2, ArrowRight } from "lucide-react";

export default function DictationPage() {
  const { speak, isSpeaking } = useTextToSpeech();

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [userInput, setUserInput] = useState("");
  const [status, setStatus] = useState("idle"); // idle, success, error
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const inputRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:8000"
          }/api/practice/B6_Fill%20blanks_Typing`
        );
        if (!response.ok) throw new Error("Failed");
        const json = await response.json();

        if (json.data) {
          const transformed = json.data.map((item) => {
            // Handle case where specific parts are missing or in generic columns
            // Detected: SentenceWithBlank, CompleteSentence/Audio, CorrectAnswer
            return {
              id: item["ExerciseID"],
              fullSentence: item["CompleteSentence"] || item["Audio"], // Fallback if column name ambiguous
              displaySentence: item["SentenceWithBlank"],
              answer: item["CorrectAnswer"],
              instruction: item["Instruction_EN"],
            };
          });
          setQuestions(transformed);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (status !== "idle") return;

    const currentQ = questions[currentIndex];

    // Normalize comparison (trim, lowercase, remove punctuation if needed)
    const normalizedInput = userInput
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:]/g, "");
    const normalizedAnswer = currentQ.answer
      .trim()
      .toLowerCase()
      .replace(/[.,!?;:]/g, "");

    if (normalizedInput === normalizedAnswer) {
      setStatus("success");
      setScore((s) => s + 1);
      speak("Correct!", "en-US");
    } else {
      setStatus("error");
      speak(`Incorrect. The answer was ${currentQ.answer}`, "en-US");
    }
  };

  const handleNext = () => {
    setStatus("idle");
    setUserInput("");
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((p) => p + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const playSentence = () => {
    if (questions[currentIndex]) {
      speak(questions[currentIndex].fullSentence, "fr-FR", 0.85); // Slightly slower for dictation
    }
  };

  // Auto-play
  useEffect(() => {
    if (!loading && !isCompleted && questions.length > 0) {
      const t = setTimeout(() => {
        playSentence();
        // Focus input
        if (inputRef.current) inputRef.current.focus();
      }, 800);
      return () => clearTimeout(t);
    }
  }, [currentIndex, loading, isCompleted]);

  if (loading)
    return (
      <FullScreenLayout title="Loading...">
        <Loader2 className="animate-spin" />
      </FullScreenLayout>
    );

  if (isCompleted) {
    return (
      <FullScreenLayout title="Summary" showExitButton>
        <div className="flex flex-col h-full items-center justify-center p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Practice Session Complete</h2>
          <p className="text-xl">
            You got {score} out of {questions.length} correct.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-full"
          >
            Practice Again
          </button>
        </div>
      </FullScreenLayout>
    );
  }

  const currentQ = questions[currentIndex];

  // Render sentence with proper styling for the blank
  // We prefer to replace '___' or similar in valid HTML if we wanted inline input,
  // but for simplicity we'll show the text above and a main input below.

  return (
    <FullScreenLayout
      title={`Dictation ${currentIndex + 1}/${questions.length}`}
      showExitButton
    >
      <div className="flex flex-col h-full max-w-2xl mx-auto p-6 items-center justify-center">
        <button
          onClick={playSentence}
          className={`mb-8 w-20 h-20 rounded-full flex items-center justify-center transition-all 
               ${
                 isSpeaking
                   ? "bg-purple-100 text-purple-600 ring-4 ring-purple-200"
                   : "bg-gray-100 hover:bg-gray-200 text-gray-700"
               }
             `}
        >
          <Volume2 size={32} />
        </button>

        <div className="text-2xl font-medium text-center text-gray-800 dark:text-gray-100 mb-8 leading-relaxed">
          {currentQ.displaySentence.split("___").map((part, i, arr) => (
            <span key={i}>
              {part}
              {i < arr.length - 1 && (
                <span className="inline-block w-24 border-b-2 border-gray-400 mx-2 relative top-1">
                  {status !== "idle" && (
                    <span
                      className={`absolute -top-8 left-0 w-full text-center text-sm font-bold ${
                        status === "success" ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {status === "success" ? userInput : currentQ.answer}
                    </span>
                  )}
                </span>
              )}
            </span>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={status !== "idle"}
            placeholder="Type the missing word..."
            className={`w-full p-4 text-center text-xl rounded-xl border-2 outline-none transition-all
                  ${
                    status === "idle"
                      ? "border-gray-200 focus:border-blue-500"
                      : ""
                  }
                  ${
                    status === "success"
                      ? "border-green-500 bg-green-50 text-green-900"
                      : ""
                  }
                  ${
                    status === "error"
                      ? "border-red-500 bg-red-50 text-red-900"
                      : ""
                  }
               `}
          />

          {status === "idle" ? (
            <button
              type="submit"
              disabled={!userInput.trim()}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              Check
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:opacity-90 flex items-center justify-center gap-2"
            >
              Next <ArrowRight size={20} />
            </button>
          )}
        </form>
      </div>
    </FullScreenLayout>
  );
}
