import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function TrueFalsePage() {
  return (
    <ExercisePlaceholder
      exerciseId="G9"
      title="True/False/Not Given"
      description="Determine if statements are true, false, or not given"
      icon="✅"
      skillType="Reading"
      features={[
        "Display passage text",
        "Show statement to evaluate",
        "3-4 options (True/False/Not Given)",
        "Single selection validation",
        "Timer-based challenges",
      ]}
    />
  );
}
