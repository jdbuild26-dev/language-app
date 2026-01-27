import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function ReorderPage() {
  return (
    <ExercisePlaceholder
      exerciseId="G8"
      title="Reorder Sentences"
      description="Arrange sentences in the correct order"
      icon="🔀"
      skillType="Reading"
      features={[
        "Display jumbled sentences",
        "Drag-and-drop reordering",
        "Correct order validation",
        "Paragraph-level reordering support",
        "Timer-based challenges",
      ]}
    />
  );
}
