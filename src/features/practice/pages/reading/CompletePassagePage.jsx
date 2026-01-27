import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function CompletePassagePage() {
  return (
    <ExercisePlaceholder
      exerciseId="G7"
      title="Complete the Passage"
      description="Fill in missing sentences in a passage"
      icon="📄"
      skillType="Reading"
      features={[
        "Passage with sentence blanks",
        "4 sentence options per blank",
        "Select sentences to fill blanks",
        "Correct sentence placement validation",
        "Shuffle sentence options",
      ]}
    />
  );
}
