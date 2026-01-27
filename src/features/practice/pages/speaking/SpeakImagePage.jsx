import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function SpeakImagePage() {
  return (
    <ExercisePlaceholder
      exerciseId="H3"
      title="Speak About Image"
      description="Describe an image by speaking"
      icon="🖼️"
      skillType="Speaking"
      features={[
        "Display image prompt",
        "Preparation time",
        "Speech recognition",
        "Vocabulary hints",
        "AI-powered feedback",
      ]}
    />
  );
}
