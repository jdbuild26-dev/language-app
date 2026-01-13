import React, { useState, useEffect } from "react";
import { useTextToSpeech } from "../../../../hooks/useTextToSpeech";
import FullScreenLayout from "../../../../components/layout/FullScreenLayout";
import {
  Loader2,
  Mic,
  Play,
  Pause,
  Check,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function AudioToAudioPage() {
  const { speak, cancel } = useTextToSpeech(); // removed isSpeaking to manage local playing states more granularly if needed, or use single

  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(0);

  // Track which audio is currently playing to show icon state
  // "prompt" | "option-0" | "option-1" ... | null
  const [activeAudioId, setActiveAudioId] = useState(null);

  // Custom speak wrapper to track active state
  const playAudio = (text, id) => {
    cancel();
    setActiveAudioId(id);
    // Use speech synthesis directly with callback to clear state
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.onend = () => setActiveAudioId(null);
    utterance.onerror = () => setActiveAudioId(null);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${
            import.meta.env.VITE_API_URL || "http://localhost:8000"
          }/api/practice/B5_Fill%20blanks_Audio`
        );
        if (!response.ok) throw new Error("Failed to fetch");
        const json = await response.json();

        if (json.data) {
          const transformed = json.data.map((item) => ({
            id: item["ExerciseID"],
            // Fallback to CompleteSentence or Question if Audio is missing
            prompt:
              item["Audio"] ||
              item["CompleteSentence"] ||
              item["Question"] ||
              "No audio found",
            sentence: item["SentenceWithBlank"],
            instruction:
              item["Instruction_EN"] || "Listen and choose the matching word.",
            options: [
              item["Option1"],
              item["Option2"],
              item["Option3"],
              item["Option4"],
            ].filter(Boolean),
            correctIndex:
              parseInt(
                item["CorrectAudioOptionIndex"] || item["CorrectOptionIndex"]
              ) - 1,
          }));
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

  const handleSelect = (idx) => {
    if (selectedOptionIndex !== null) return;

    setSelectedOptionIndex(idx);
    const isCorrect = idx === questions[currentIndex].correctIndex;

    if (isCorrect) {
      setScore((s) => s + 1);
      playAudio("Correct!", "feedback");
    } else {
      playAudio("Incorrect", "feedback");
    }

    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex((p) => p + 1);
        setSelectedOptionIndex(null);
        setActiveAudioId(null);
      } else {
        setIsCompleted(true);
      }
    }, 1500);
  };

  const currentQ = questions[currentIndex];

  // Auto-play prompt
  useEffect(() => {
    if (!loading && !isCompleted && currentQ) {
      const t = setTimeout(() => playAudio(currentQ.prompt, "prompt"), 600);
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
      <FullScreenLayout title="Result" showExitButton>
        <div className="flex flex-col h-full items-center justify-center p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Complete!</h2>
          <p className="text-xl">
            Score: {score} / {questions.length}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-full"
          >
            Again
          </button>
        </div>
      </FullScreenLayout>
    );
  }

  return (
    <FullScreenLayout
      title={`Audio Match ${currentIndex + 1}/${questions.length}`}
      showExitButton
    >
      <div className="flex flex-col h-full max-w-4xl mx-auto p-6 items-center">
        <h2 className="mb-4 text-lg text-gray-600 dark:text-gray-300">
          {currentQ.instruction}
        </h2>

        {/* Sentence Context (if available) */}
        {currentQ.sentence && (
          <h3 className="mb-8 text-2xl font-medium text-center text-gray-800 dark:text-white leading-relaxed">
            {currentQ.sentence}
          </h3>
        )}

        {/* PROMPT */}
        <div className="mb-12">
          <button
            onClick={() => playAudio(currentQ.prompt, "prompt")}
            className={`w-40 h-40 rounded-full flex items-center justify-center border-4 transition-all shadow-xl
                 ${
                   activeAudioId === "prompt"
                     ? "border-blue-500 bg-blue-50 text-blue-600 scale-110"
                     : "border-gray-100 bg-white text-gray-700 hover:scale-105"
                 }`}
          >
            {activeAudioId === "prompt" ? (
              <Mic size={64} className="animate-pulse" />
            ) : (
              <Play size={64} className="ml-2" />
            )}
          </button>
          <p className="mt-4 text-center text-sm font-bold text-gray-400">
            LISTEN
          </p>
        </div>

        {/* OPTIONS */}
        <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
          {currentQ.options.map((optText, idx) => {
            const isSelected = selectedOptionIndex === idx;
            const isCorrect = idx === currentQ.correctIndex;
            const isPlaying = activeAudioId === `option-${idx}`;

            // Determine visual state
            let containerClass =
              "bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700";

            if (selectedOptionIndex !== null) {
              if (isSelected) {
                containerClass = isCorrect
                  ? "bg-green-50 border-green-500"
                  : "bg-red-50 border-red-500";
              } else if (isCorrect) {
                containerClass = "bg-green-50 border-green-500 opacity-80";
              } else {
                containerClass = "opacity-40";
              }
            } else {
              containerClass += " hover:border-blue-300";
            }

            return (
              <div
                key={idx}
                className={`relative p-4 rounded-xl transition-all ${containerClass} flex items-center gap-4`}
              >
                {/* Play Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    playAudio(optText, `option-${idx}`);
                  }}
                  disabled={selectedOptionIndex !== null}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 
                         ${
                           isPlaying
                             ? "bg-blue-600 text-white"
                             : "bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-blue-100"
                         }
                       `}
                >
                  {isPlaying ? (
                    <Mic size={20} />
                  ) : (
                    <Play size={20} className="ml-1" />
                  )}
                </button>

                {/* Select Action Area */}
                <button
                  onClick={() => handleSelect(idx)}
                  disabled={selectedOptionIndex !== null}
                  className="flex-1 h-full text-left font-semibold text-gray-800 dark:text-gray-200 hover:text-blue-600 text-lg flex items-center justify-between"
                >
                  <span>{optText}</span>

                  {selectedOptionIndex !== null && isCorrect && (
                    <CheckCircle2 className="text-green-500" />
                  )}
                  {selectedOptionIndex === idx && !isCorrect && (
                    <XCircle className="text-red-500" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </FullScreenLayout>
  );
}
