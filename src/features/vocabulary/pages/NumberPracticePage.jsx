import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NumberInputControls from "../components/number-practice/NumberInputControls";
import NumberDisplayArea from "../components/number-practice/NumberDisplayArea";
import ConstructedAnswerArea from "../components/number-practice/ConstructedAnswerArea";
import WordBankArea from "../components/number-practice/WordBankArea";
import { numberToFrenchTokens, numberToFrench } from "../utils/numberToFrench";

export default function NumberPracticePage() {
  const navigate = useNavigate();
  const [currentNumber, setCurrentNumber] = useState(null);
  const [constructedAnswer, setConstructedAnswer] = useState([]);

  // Feedback state
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState("");

  const handleWordSelect = (word) => {
    setConstructedAnswer((prev) => [...prev, word]);
  };

  const handleWordRemove = (index) => {
    setConstructedAnswer((prev) => prev.filter((_, i) => i !== index));
    setShowFeedback(false);
  };

  const handleClear = () => {
    setConstructedAnswer([]);
    setShowFeedback(false);
  };

  const checkAnswer = () => {
    if (currentNumber === null || currentNumber === undefined) {
      alert("Please enter or generate a number first.");
      return;
    }

    const correctTokens = numberToFrenchTokens(currentNumber);
    const userTokens = constructedAnswer;

    // Compare token arrays
    const correct =
      correctTokens.length === userTokens.length &&
      correctTokens.every((t, i) => t === userTokens[i]);

    setIsCorrect(correct);
    setCorrectAnswer(numberToFrench(currentNumber));
    setShowFeedback(true);
  };

  const handleNext = () => {
    // Reset and maybe auto-randomize depending on settings
    setConstructedAnswer([]);
    setShowFeedback(false);
    // Optional: setCurrentNumber(generateNewRandomNumber());
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 flex flex-col gap-6">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold dark:text-white">
              Number Practice
            </h1>
          </div>
          <NumberInputControls
            onNumberChange={(num) => {
              setCurrentNumber(num);
              setConstructedAnswer([]);
              setShowFeedback(false);
            }}
          />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          <div className="lg:col-span-2 flex flex-col gap-6 h-full">
            <Card className="p-8 flex flex-col items-center justify-center min-h-[200px] border-2 shadow-sm rounded-2xl bg-white dark:bg-slate-800">
              <NumberDisplayArea number={currentNumber} />
            </Card>

            <Card className="p-6 flex-1 shadow-sm rounded-2xl bg-white dark:bg-slate-800">
              <ConstructedAnswerArea
                selectedWords={constructedAnswer}
                onRemoveWord={handleWordRemove}
                onClear={handleClear}
                onSubmit={checkAnswer}
                feedback={{ show: showFeedback, isCorrect, correctAnswer }}
                onNext={handleNext}
              />
            </Card>
          </div>

          <div className="lg:col-span-1 h-full">
            <Card className="p-6 shadow-sm h-full rounded-2xl bg-slate-100/50 dark:bg-slate-800/50 border-2">
              <WordBankArea
                onWordSelect={(w) => {
                  handleWordSelect(w);
                  setShowFeedback(false);
                }}
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
