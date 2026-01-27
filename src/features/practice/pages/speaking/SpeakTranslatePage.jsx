import ExercisePlaceholder from "../../components/shared/ExercisePlaceholder";

export default function SpeakTranslatePage() {
  return (
    <ExercisePlaceholder
      exerciseId="H1"
      title="Translate by Speaking"
      description="Speak the translation of a sentence"
      icon="🎤"
      skillType="Speaking"
      features={[
        "Display source sentence",
        "Speech recognition input",
        "Pronunciation feedback",
        "Multiple acceptable answers",
        "Audio playback of recording",
      ]}
    />
  );
}
