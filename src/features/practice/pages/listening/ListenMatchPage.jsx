import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function ListenMatchPage() {
  return (
    <ExercisePlaceholder
      exerciseId="E4"
      title="Listen and Match"
      description="Match audio clips to descriptions"
      icon="🔗"
      skillType="Listening"
      features={[
        "Play multiple audio clips",
        "Match audio to text descriptions",
        "Drag-and-drop or click matching",
        "Configurable max replays",
        "Timer-based challenges",
      ]}
    />
  );
}
