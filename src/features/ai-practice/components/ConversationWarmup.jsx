import { useState, useEffect } from "react";

export default function ConversationWarmup({ onComplete }) {
    const [count, setCount] = useState(3);
    const [showGetReady, setShowGetReady] = useState(true);

    useEffect(() => {
        // Show "Get Ready" for 1.5 seconds, then start countdown
        const initialDelay = setTimeout(() => {
            setShowGetReady(false);
        }, 1500);

        return () => clearTimeout(initialDelay);
    }, []);

    useEffect(() => {
        if (showGetReady) return;

        if (count > 0) {
            const timer = setTimeout(() => {
                setCount(count - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else {
            // Countdown finished
            const endTimer = setTimeout(() => {
                onComplete();
            }, 500); // Small delay on "0" or "Go!"
            return () => clearTimeout(endTimer);
        }
    }, [count, showGetReady, onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
            <div className="text-center animate-in fade-in zoom-in duration-300">
                {showGetReady ? (
                    <div className="space-y-4">
                        <h2 className="text-4xl font-bold text-white">Get Ready to Speak!</h2>
                        <p className="text-xl text-gray-200">
                            The conversation will start in a few seconds...
                        </p>
                    </div>
                ) : (
                    <div className="relative">
                        <div
                            key={count} // Key change triggers animation
                            className="text-9xl font-black text-white animate-in zoom-in-50 duration-300"
                        >
                            {count > 0 ? count : "Go!"}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
