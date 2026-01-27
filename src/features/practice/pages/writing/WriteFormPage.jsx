import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function WriteFormPage() {
  return (
    <ExercisePlaceholder
      exerciseId="F7"
      title="Fill the Form"
      description="Complete form fields correctly"
      icon="📋"
      skillType="Writing"
      features={[
        "Display blank form",
        "Multiple field types",
        "Contextual instructions",
        "Field validation",
        "Timer-based challenges",
      ]}
    />
  );
}
