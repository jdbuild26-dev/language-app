import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function SpellingPage() {
  return (
    <ExercisePlaceholder
      exerciseId="F2"
      title="Fix the Spelling"
      description="Correct spelling mistakes in text"
      icon="🔍"
      skillType="Writing"
      features={[
        "Display text with spelling errors",
        "Click to select misspelled words",
        "Type correct spelling",
        "Multiple errors per passage",
        "Difficulty levels",
      ]}
    />
  );
}
