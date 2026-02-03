import { Bot } from "lucide-react";
import GenericSpeakingPage from "./GenericSpeakingPage";

export default function SpeakInteractivePage() {
  return (
    <GenericSpeakingPage
      title="Interactive Speaking"
      taskType="interactive"
      sheetName="A1_Speaking_Interactive"
      instructionEn="Respond to the prompt in French"
      instructionFr="Répondez à l'invite en français"
      icon={Bot}
      csvName="practice/speaking/speak_interactive.csv"
    />
  );
}
