import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function WriteFillBlanksPage() {
  return (
    <ExercisePlaceholder
      exerciseId="F3"
      title="Fill in the Blanks"
      description="Type missing words in passages"
      icon="📝"
      skillType="Writing"
      features={[
        "Display passage with blank spaces",
        "Type words to fill blanks",
        "Context clues in passage",
        "Multiple acceptable answers",
        "Timer-based challenges",
      ]}
    />
  );
}
