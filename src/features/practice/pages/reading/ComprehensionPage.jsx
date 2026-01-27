import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function ComprehensionPage() {
  return (
    <ExercisePlaceholder
      exerciseId="G5"
      title="Reading Comprehension"
      description="Read a passage and answer questions"
      icon="📖"
      skillType="Reading"
      features={[
        "Full passage display",
        "4-5 questions per passage",
        "Multiple choice options",
        "Question focus categories (Literal, Inference, Vocabulary)",
        "Timer per question",
      ]}
    />
  );
}
