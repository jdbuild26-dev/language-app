import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function ImageMCQPage() {
  return (
    <ExercisePlaceholder
      exerciseId="G4"
      title="Match Image to Description"
      description="Select the description that matches the image"
      icon="🖼️"
      skillType="Reading"
      features={[
        "Display image with question",
        "4-5 description options",
        "Single selection validation",
        "Shuffle options support",
        "Timer-based challenges",
      ]}
    />
  );
}
