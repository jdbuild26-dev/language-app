import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function WriteImagePage() {
  return (
    <ExercisePlaceholder
      exerciseId="F5"
      title="Write About Image"
      description="Describe an image in writing"
      icon="🖼️"
      skillType="Writing"
      features={[
        "Display image prompt",
        "Text area for description",
        "Vocabulary hints",
        "AI-powered feedback",
        "Word count requirements",
      ]}
    />
  );
}
