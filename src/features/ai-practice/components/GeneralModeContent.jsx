
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, ArrowRight } from "lucide-react";

export default function GeneralModeContent() {
    const navigate = useNavigate();
    const [topic, setTopic] = useState("");
    const [level, setLevel] = useState("A2"); // Default level

    const handleStartChat = (e) => {
        e.preventDefault();
        if (!topic.trim()) return;

        const scenario = {
            title: topic,
            level: level,
            formality: "casual",
            mode: "general",
            aiRole: "Conversation Partner",
            userRole: "Learner",
            aiPrompt: `Discussion about: ${topic}`,
            objective: "Have a natural conversation.",
            icon: "💬"
        };

        // Navigate to chat with scenario state
        navigate(`/ai-practice/scenarios/chats/general-custom/chat`, {
            state: { scenario }
        });
    };

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    General Practice
                </h2>
                <p className="text-gray-600 dark:text-slate-400 max-w-md mx-auto">
                    Talk about anything you want! Choose a topic and practice your French
                    freely.
                </p>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                <form onSubmit={handleStartChat} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            What would you like to talk about today?
                        </label>
                        <input
                            type="text"
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="e.g., Travelling, Cooking, My weekend..."
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all dark:text-white"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Your Level
                        </label>
                        <div className="flex gap-2">
                            {["A1", "A2", "B1", "B2", "C1", "C2"].map((l) => (
                                <button
                                    key={l}
                                    type="button"
                                    onClick={() => setLevel(l)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${level === l
                                            ? "bg-indigo-600 text-white shadow-md"
                                            : "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-slate-700"
                                        }`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!topic.trim()}
                        className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                    >
                        Start Conversation
                        <ArrowRight className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
