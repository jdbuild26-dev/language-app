import { useState, useEffect, useRef, useCallback } from "react";

/**
 * Custom hook for exercise timers.
 * Support both Countdown (timer) and Count Up (stopwatch) modes.
 *
 * @param {Object} options
 * @param {number} options.duration - Duration in seconds (for countdown mode). Default 20.
 * @param {string} options.mode - 'timer' (countdown) or 'stopwatch' (count up). Default 'timer'.
 * @param {function} options.onExpire - Callback when countdown hits 0.
 * @param {boolean} options.isPaused - Pause the timer.
 */
export const useExerciseTimer = ({
  duration = 20,
  mode = "timer",
  onExpire,
  isPaused = false,
}) => {
  const [timeLeft, setTimeLeft] = useState(mode === "timer" ? duration : 0);
  const [isExpired, setIsExpired] = useState(false);

  // Ref to access current state inside interval closure if needed,
  // though dependency array usually handles this.
  // Using ref for onExpire to avoid re-setting interval if callback changes
  const onExpireRef = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (isPaused || isExpired) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (mode === "stopwatch") {
          return prev + 1;
        } else {
          // Timer mode
          if (prev <= 1) {
            clearInterval(interval);
            setIsExpired(true);
            if (onExpireRef.current) {
              onExpireRef.current();
            }
            return 0;
          }
          return prev - 1;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, isExpired, mode]);

  // Reset function
  const resetTimer = useCallback(() => {
    setTimeLeft(mode === "timer" ? duration : 0);
    setIsExpired(false);
  }, [duration, mode]);

  // Format time as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    time: timeLeft,
    timerString: formatTime(timeLeft),
    resetTimer,
    isExpired,
  };
};
