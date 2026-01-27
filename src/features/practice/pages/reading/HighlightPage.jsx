import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function HighlightPage() {
  return (
    <ExercisePlaceholder
      exerciseId="G3"
      title="Highlight the Word"
      description="Find and highlight specific text in a passage"
      icon="🖍️"
      skillType="Reading"
      features={[
        "Display full passage text",
        "Show question about the passage",
        "Allow text highlighting selection",
        "Support character-based validation",
        "Multiple acceptable answers",
      ]}
    />
  );
}
