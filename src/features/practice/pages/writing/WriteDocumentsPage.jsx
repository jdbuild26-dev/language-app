import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function WriteDocumentsPage() {
  return (
    <ExercisePlaceholder
      exerciseId="F6"
      title="Write Documents"
      description="Write formal documents like letters and emails"
      icon="📧"
      skillType="Writing"
      features={[
        "Document templates (letter, email, essay)",
        "Formatting guidelines",
        "Register-appropriate vocabulary",
        "AI-powered structure feedback",
        "Sample responses",
      ]}
    />
  );
}
