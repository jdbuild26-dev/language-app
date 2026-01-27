import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function ListenOrderPage() {
  return (
    <ExercisePlaceholder
      exerciseId="E5"
      title="Listen and Order"
      description="Arrange audio clips in order"
      icon="🔢"
      skillType="Listening"
      features={[
        "Play multiple audio clips",
        "Drag-and-drop to reorder",
        "Sequence validation",
        "Configurable max replays",
        "Timer-based challenges",
      ]}
    />
  );
}
