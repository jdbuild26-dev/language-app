import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function SpeakTopicPage() {
  return (
    <ExercisePlaceholder
      exerciseId="H2"
      title="Speak About Topic"
      description="Speak about a given topic"
      icon="💬"
      skillType="Speaking"
      features={[
        "Display topic prompt",
        "Preparation time",
        "Recording timer",
        "AI-powered fluency feedback",
        "Vocabulary suggestions",
      ]}
    />
  );
}
