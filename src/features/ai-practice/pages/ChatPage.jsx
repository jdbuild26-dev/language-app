import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import ChatHeader from "../components/chat/ChatHeader";
import ChatInput from "../components/chat/ChatInput";
import MessageBubble from "../components/chat/MessageBubble";
import {
  fetchTopicBySlug,
  sendChatMessage,
  getInitialGreeting,
} from "../../../services/aiPracticeApi";

export default function ChatPage() {
  const { topicSlug } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // State
  const [scenario, setScenario] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch scenario and initial greeting on mount
  useEffect(() => {
    async function initializeChat() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch scenario details
        const scenarioData = await fetchTopicBySlug(topicSlug);
        setScenario(scenarioData);

        // Get initial AI greeting
        const greetingResponse = await getInitialGreeting({
          level: scenarioData.level,
          formality: scenarioData.formality,
          title: scenarioData.title,
          aiPrompt: scenarioData.aiPrompt,
          aiRole: scenarioData.aiRole,
          userRole: scenarioData.userRole,
        });

        // Add initial greeting to messages
        setMessages([
          {
            id: 1,
            sender: "ai",
            text: greetingResponse.ai_response,
            timestamp: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
        ]);
      } catch (err) {
        console.error("Failed to initialize chat:", err);
        setError("Failed to start conversation. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    if (topicSlug) {
      initializeChat();
    }
  }, [topicSlug]);

  const handleSendMessage = async (messageText) => {
    if (!messageText.trim() || isSending || !scenario) return;

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Optimistically add user message
    const userMessage = {
      id: messages.length + 1,
      sender: "user",
      text: messageText,
      timestamp,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);
    setError(null);

    try {
      // Build conversation history for API
      const conversationHistory = messages.map((msg) => ({
        sender: msg.sender,
        text: msg.text,
        correction: msg.correction || null,
      }));

      // Send message to AI
      const response = await sendChatMessage({
        message: messageText,
        conversationHistory,
        scenario: {
          level: scenario.level,
          formality: scenario.formality,
          title: scenario.title,
          aiPrompt: scenario.aiPrompt,
          aiRole: scenario.aiRole,
          userRole: scenario.userRole,
        },
      });

      // Add AI response to messages
      // Update user message with correction and add AI response
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessageIndex = newMessages.length - 1;

        // Update functionality: attach correction to the user's message
        if (
          lastMessageIndex >= 0 &&
          newMessages[lastMessageIndex].sender === "user"
        ) {
          newMessages[lastMessageIndex] = {
            ...newMessages[lastMessageIndex],
            correction: response.correction,
          };
        }

        const aiMessage = {
          id: messages.length + 2,
          sender: "ai",
          text: response.ai_response,
          // Correction is now attached to the user message
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        return [...newMessages, aiMessage];
      });
    } catch (err) {
      console.error("Failed to send message:", err);
      setError("Failed to get response. Please try again.");
      // Remove the optimistically added user message on error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsSending(false);
    }
  };

  const handleHint = () => {
    // TODO: Will be implemented in Iteration 5
    console.log("Hint requested");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 top-[64px] z-40 flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-sky-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-slate-400">
            Starting conversation...
          </p>
        </div>
      </div>
    );
  }

  // Error state (no scenario loaded)
  if (error && !scenario) {
    return (
      <div className="fixed inset-0 top-[64px] z-40 flex items-center justify-center bg-gray-50 dark:bg-slate-950">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 top-[64px] z-40 flex flex-col bg-gray-50 dark:bg-slate-950">
      {/* Fixed Header */}
      <ChatHeader scenario={scenario} />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}

          {/* Typing indicator when AI is responding */}
          {isSending && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 dark:bg-slate-800 rounded-2xl px-4 py-3 rounded-tl-sm">
                <div className="flex items-center gap-1">
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  />
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="text-center py-2">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Fixed Input */}
      <ChatInput
        onSend={handleSendMessage}
        onHint={handleHint}
        disabled={isSending}
      />
    </div>
  );
}
