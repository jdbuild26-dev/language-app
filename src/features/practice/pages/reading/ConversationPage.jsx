import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function ConversationPage() {
  return (
    <ExercisePlaceholder
      exerciseId="G10"
      title="Running Conversation"
      description="Follow a conversation and choose responses"
      icon="💬"
      skillType="Reading"
      features={[
        "Display conversation history",
        "Show current conversation context",
        "4 response options",
        "Progress based on selection",
        "No additional AI features",
      ]}
    />
  );
}
