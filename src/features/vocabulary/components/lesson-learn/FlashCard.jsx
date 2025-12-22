import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { SpeakerWaveIcon } from "@heroicons/react/24/outline";
import BookmarkIcon from "./BookmarkIcon";
import {
  addToReview,
  removeFromReview,
  checkIsBookmarked,
} from "../../../../services/reviewCardsApi";

// Placeholder image for words without images
const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=500";

export default function FlashCard({ word }) {
  const { user } = useUser();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const imageUrl = word.image || PLACEHOLDER_IMAGE;

  // Check if card is already bookmarked when component mounts or word changes
  useEffect(() => {
    async function checkBookmarkStatus() {
      if (user && word?.id) {
        const bookmarked = await checkIsBookmarked(user.id, word.id);
        setIsBookmarked(bookmarked);
      }
    }
    checkBookmarkStatus();
  }, [user, word?.id]);

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

  return (
    <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-700 w-full max-w-5xl mx-auto relative overflow-hidden">
      {/* "New" Badge - Triangle style approximated */}
      <div
        className="absolute top-0 left-0 w-20 h-20 bg-gray-200 dark:bg-slate-700 flex items-end justify-center pb-2 pr-2"
        style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
      >
        <span className="text-base font-bold text-gray-900 dark:text-white absolute top-3 left-3">
          New
        </span>
      </div>

      {/* Bookmark */}
      <div className="absolute top-6 right-6 z-10">
        <BookmarkIcon
          className={`w-6 h-6 ${isLoading ? "opacity-50" : ""} ${
            isBookmarked
              ? "text-yellow-500"
              : "text-gray-400 dark:text-slate-500 hover:text-sky-500"
          }`}
          isActive={isBookmarked}
          onClick={handleBookmarkToggle}
        />
      </div>

      <div className="flex flex-col md:flex-row h-full">
        {/* Left: Image */}
        <div className="md:w-5/12 p-8 flex items-center justify-center">
          <div className="relative w-full aspect-square max-w-[280px]">
            <img
              src={imageUrl}
              alt={word.english}
              className="w-full h-full object-contain drop-shadow-xl"
            />
          </div>
        </div>

        {/* Right: Content */}
        <div className="md:w-7/12 p-8 md:pr-12 flex flex-col pt-12">
          {/* Words Grid */}
          <div className="flex gap-12 mb-8">
            {/* English Column */}
            <div className="flex flex-col gap-4 min-w-[120px]">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                English
              </h3>
              <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                <p className="text-xl text-gray-700 dark:text-slate-200">
                  {word.english}
                </p>
              </div>
            </div>

            {/* Target Column */}
            <div className="flex flex-col gap-4 flex-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase">
                French
              </h3>
              <div className="border-t border-gray-200 dark:border-slate-700 pt-4 grid grid-cols-2 gap-4">
                {word.forms.map((form, idx) => (
                  <div key={idx}>
                    <div className="flex items-center gap-2 mb-1">
                      <button>
                        <SpeakerWaveIcon className="w-4 h-4 text-gray-400" />
                      </button>
                      <span className="text-xl font-medium text-gray-900 dark:text-white">
                        {form.word}
                      </span>
                    </div>
                    <p className={`text-sm font-medium ${form.genderColor}`}>
                      {form.gender.split(" ")[0]}
                      <span className="ml-1 text-base">
                        {form.gender.split(" ")[1]}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Example Sentence */}
          <div className="border-t border-gray-100 dark:border-slate-700 pt-8 mt-auto mb-12">
            <div className="flex items-start gap-4 mb-4">
              <button className="bg-gray-100 dark:bg-slate-700 p-2 rounded-full hover:bg-sky-50 dark:hover:bg-sky-900/30 transition-colors">
                <SpeakerWaveIcon className="w-5 h-5 text-gray-600 dark:text-slate-300" />
              </button>
              <div>
                <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  {word.exampleTarget}
                </p>
                <p className="text-sm text-gray-400 dark:text-slate-500 font-mono mb-4">
                  {word.phonetic}
                </p>
                <p className="text-base text-gray-600 dark:text-slate-300 italic">
                  {word.exampleNative}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Level Badge - Dynamic */}
      <div
        className="absolute bottom-0 right-0 w-20 h-20 bg-gray-200 dark:bg-slate-700 flex items-end justify-end p-4"
        style={{ clipPath: "polygon(100% 0, 0 100%, 100% 100%)" }}
      >
        <span className="text-xl font-bold text-gray-900 dark:text-white mr-1 mb-1">
          {word.level || "A1"}
        </span>
      </div>
    </div>
  );
}
