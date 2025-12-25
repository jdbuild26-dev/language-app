import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { Volume2 } from "lucide-react";
import BookmarkIcon from "./BookmarkIcon";
import { useSpeechSynthesis } from "../../../../hooks/useSpeechSynthesis";
import {
  addToReview,
  removeFromReview,
  checkIsBookmarked,
} from "../../../../services/reviewCardsApi";

// Placeholder image for words without images
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=500";

export default function FlashCard({ word, showBookmark = true }) {
  const { user } = useUser();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const { speak, isSpeaking, isSupported } = useSpeechSynthesis();
  const imageUrl = word.image || PLACEHOLDER_IMAGE;

  // Check if card is already bookmarked when component mounts or word changes
  useEffect(() => {
    async function checkBookmarkStatus() {
      if (showBookmark && user && word?.id) {
        const bookmarked = await checkIsBookmarked(user.id, word.id);
        setIsBookmarked(bookmarked);
      }
    }
    checkBookmarkStatus();
  }, [showBookmark, user, word?.id]);

  // Reset speaking state when speech ends
  useEffect(() => {
    if (!isSpeaking) {
      setSpeakingId(null);
    }
  }, [isSpeaking]);

  const handleBookmarkToggle = async () => {
    if (!user || isLoading) return;

    setIsLoading(true);
    try {
      if (isBookmarked) {
        await removeFromReview(user.id, word.id);
        setIsBookmarked(false);
      } else {
        await addToReview(user.id, word);
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeak = (text, id) => {
    if (!isSupported) {
      console.warn("Text-to-speech not supported in this browser");
      return;
    }
    setSpeakingId(id);
    speak(text, "fr-FR");
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-gray-100 dark:border-slate-700 w-full max-w-4xl mx-auto overflow-hidden">
      <div className="flex flex-col md:flex-row">
        {/* Left: Image Section */}
        <div className="md:w-5/12 p-6 bg-gray-50 dark:bg-slate-900/50 relative">
          {/* Review Button */}
          <button
            onClick={handleBookmarkToggle}
            disabled={isLoading || !showBookmark}
            className={`absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
              isBookmarked
                ? "bg-purple-600 text-white"
                : "bg-purple-600 text-white hover:bg-purple-700"
            } ${isLoading ? "opacity-50 cursor-not-allowed" : ""} ${
              !showBookmark ? "hidden" : ""
            }`}
          >
            {isBookmarked ? "Reviewing" : "Review"}
          </button>

          {/* Category & Level Tags */}
          <div className="flex gap-2 mt-12 mb-4">
            <span className="px-3 py-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-full text-sm text-gray-700 dark:text-slate-300">
              {word.category || "General"} • {word.level || "A1"}
            </span>
          </div>

          {/* Image */}
          <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-2xl overflow-hidden shadow-md">
            <img
              src={imageUrl}
              alt={word.english}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right: Content Section */}
        <div className="md:w-7/12 p-6 md:p-8 flex flex-col">
          {/* Header: English Word + Bookmark */}
          <div className="flex items-start justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              {word.english}
            </h2>
            {showBookmark && (
              <BookmarkIcon
                className={`w-7 h-7 cursor-pointer transition-colors ${
                  isLoading ? "opacity-50" : ""
                } ${
                  isBookmarked
                    ? "text-purple-600 fill-purple-600"
                    : "text-gray-300 dark:text-slate-500 hover:text-purple-500"
                }`}
                isActive={isBookmarked}
                onClick={handleBookmarkToggle}
              />
            )}
          </div>

          {/* French Forms */}
          <div className="flex flex-wrap gap-4 mb-8">
            {word.forms.map((form, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-3 bg-gray-50 dark:bg-slate-700/50 rounded-xl border border-gray-100 dark:border-slate-600"
              >
                {/* Speaker Icon with TTS */}
                <button
                  onClick={() => handleSpeak(form.word, `form-${idx}`)}
                  disabled={isSpeaking}
                  className={`p-2 rounded-full shadow-sm transition-all ${
                    speakingId === `form-${idx}`
                      ? "bg-purple-100 dark:bg-purple-900/50 animate-pulse"
                      : "bg-white dark:bg-slate-600 hover:bg-gray-100 dark:hover:bg-slate-500"
                  } ${!isSupported ? "opacity-50 cursor-not-allowed" : ""}`}
                  title={
                    isSupported
                      ? "Listen to pronunciation"
                      : "TTS not supported"
                  }
                >
                  <Volume2
                    className={`w-4 h-4 ${
                      speakingId === `form-${idx}`
                        ? "text-purple-600 dark:text-purple-300"
                        : "text-purple-600 dark:text-purple-400"
                    }`}
                  />
                </button>
                <div>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {form.word}
                  </p>
                  <p className={`text-sm font-medium ${form.genderColor}`}>
                    {form.gender}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Example Section */}
          <div className="mt-auto">
            <h3 className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
              Example
            </h3>
            <div className="bg-gray-50 dark:bg-slate-700/30 rounded-xl p-4 border border-gray-100 dark:border-slate-600">
              {/* French Sentence with Speaker */}
              <div className="flex items-start gap-3 mb-2">
                <button
                  onClick={() => handleSpeak(word.exampleTarget, "example")}
                  disabled={isSpeaking}
                  className={`p-2 rounded-full shadow-sm transition-all flex-shrink-0 mt-0.5 ${
                    speakingId === "example"
                      ? "bg-purple-100 dark:bg-purple-900/50 animate-pulse"
                      : "bg-white dark:bg-slate-600 hover:bg-gray-100 dark:hover:bg-slate-500"
                  } ${!isSupported ? "opacity-50 cursor-not-allowed" : ""}`}
                  title={
                    isSupported ? "Listen to sentence" : "TTS not supported"
                  }
                >
                  <Volume2
                    className={`w-4 h-4 ${
                      speakingId === "example"
                        ? "text-purple-600 dark:text-purple-300"
                        : "text-purple-600 dark:text-purple-400"
                    }`}
                  />
                </button>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {word.exampleTarget}
                  </p>
                  {/* Phonetic */}
                  {word.phonetic && (
                    <p className="text-sm text-rose-400 italic mt-1 decoration-wavy underline decoration-rose-300">
                      {word.phonetic}
                    </p>
                  )}
                </div>
              </div>
              {/* English Translation */}
              <p className="text-base text-gray-600 dark:text-slate-300 italic ml-11">
                {word.exampleNative}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
