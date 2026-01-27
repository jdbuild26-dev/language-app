import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function ListenPassagePage() {
  return (
    <ExercisePlaceholder
      exerciseId="E6"
      title="Passage Questions"
      description="Listen to a passage and answer questions"
      icon="📖"
      skillType="Listening"
      features={[
        "Play full passage audio",
        "Multiple comprehension questions",
        "MCQ format answers",
        "Configurable max replays",
        "Timer per question",
      ]}
    />
  );
}
