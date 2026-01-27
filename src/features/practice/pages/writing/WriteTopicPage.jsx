import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function WriteTopicPage() {
  return (
    <ExercisePlaceholder
      exerciseId="F4"
      title="Write About Topic"
      description="Write an essay on a given topic"
      icon="📄"
      skillType="Writing"
      features={[
        "Display topic prompt",
        "Rich text editor",
        "Word count tracking",
        "AI-powered feedback",
        "Vocabulary suggestions",
      ]}
    />
  );
}
