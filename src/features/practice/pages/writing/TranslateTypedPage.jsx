import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function TranslateTypedPage() {
  return (
    <ExercisePlaceholder
      exerciseId="F1"
      title="Translate the Sentence"
      description="Type translations of sentences"
      icon="✍️"
      skillType="Writing"
      features={[
        "Display source sentence with audio",
        "Text input for translation",
        "Multiple acceptable answers",
        "Character-level accuracy checking",
        "Timer-based challenges",
      ]}
    />
  );
}
