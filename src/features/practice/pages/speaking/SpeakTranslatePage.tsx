import { Mic } from "lucide-react";
import GenericSpeakingPage from "@/features/practice/pages/speaking/GenericSpeakingPage";

export default function SpeakTranslatePage() {
  return (
    <GenericSpeakingPage
      title="Translate by Speaking"
      taskType="translate"
      sheetName="A1_Speaking_Translate"
      instructionEn="Speak the French translation of the sentence"
      instructionFr="Traduisez la phrase à l'oral"
      icon={Mic}
      csvName="practice/speaking/speak_translate.csv"
    />
  );
}
