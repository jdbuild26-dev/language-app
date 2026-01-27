import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function ListenInteractivePage() {
  return (
    <ExercisePlaceholder
      exerciseId="E7"
      title="Interactive Listening"
      description="Follow an audio conversation and respond"
      icon="💬"
      skillType="Listening"
      features={[
        "Multi-turn audio conversation",
        "Select responses to continue",
        "Dynamic conversation flow",
        "Context-aware questions",
        "Progress tracking",
      ]}
    />
  );
}
