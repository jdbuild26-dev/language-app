import { useState } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

const SPEED_OPTIONS = ["0.5x", "0.7x", "0.8x", "1x"];

export default function AudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState("1x");
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // TODO: Actual audio playback logic will be added later
  };

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    setShowSpeedMenu(false);
    // TODO: Actual speed change logic will be added later
  };

  return (
    <div className="flex items-center gap-1">
      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-sky-500" />
        ) : (
          <Play className="w-4 h-4 text-gray-500 dark:text-slate-400" />
        )}
      </button>

      {/* Speed Selector */}
      <div className="relative">
        <button
          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          title="Playback speed"
        >
          <Volume2 className="w-3.5 h-3.5" />
          {speed}
        </button>

        {/* Speed Menu Dropdown */}
        {showSpeedMenu && (
          <div className="absolute bottom-full left-0 mb-1 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 py-1 min-w-[60px] z-20">
            {SPEED_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => handleSpeedChange(option)}
                className={`w-full px-3 py-1.5 text-xs text-left hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors ${
                  speed === option
                    ? "text-sky-500 font-semibold"
                    : "text-gray-600 dark:text-slate-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
