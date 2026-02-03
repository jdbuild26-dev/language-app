import { Mic } from "lucide-react";
import GenericSpeakingPage from "./GenericSpeakingPage";

const MOCK_DATA = [
  {
    id: 1,
    Sentence: "I would like to order a croissant.",
    Translation: "Je voudrais commander un croissant.",
    Prompt: "Traduisez: I would like to order a croissant."
  },
  {
    id: 2,
    Sentence: "Where is the nearest pharmacy?",
    Translation: "Où est la pharmacie la plus proche ?",
    Prompt: "Traduisez: Where is the nearest pharmacy?"
  },
  {
    id: 3,
    Sentence: "The weather is beautiful today.",
    Translation: "Il fait beau aujourd'hui.",
    Prompt: "Traduisez: The weather is beautiful today."
  }
];

export default function SpeakTranslatePage() {
  return (
    <GenericSpeakingPage
      title="Translate by Speaking"
      taskType="translate"
      sheetName="A1_Speaking_Translate"
      instructionEn="Speak the French translation of the sentence"
      instructionFr="Traduisez la phrase à l'oral"
      icon={Mic}
      mockData={MOCK_DATA}
    />
  );
}
