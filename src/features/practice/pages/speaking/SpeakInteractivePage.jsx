import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function SpeakInteractivePage() {
  return (
    <ExercisePlaceholder
      exerciseId="H4"
      title="Interactive Speaking"
      description="AI conversation practice"
      icon="🤖"
      skillType="Speaking"
      features={[
        "AI conversation partner",
        "Real-time transcription",
        "Dynamic topic flow",
        "Pronunciation scoring",
        "Fluency feedback",
      ]}
    />
  );
}
