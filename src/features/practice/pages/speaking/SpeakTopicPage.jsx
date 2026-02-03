import { MessageSquare } from "lucide-react";
import GenericSpeakingPage from "./GenericSpeakingPage";

const MOCK_DATA = [
  {
    id: 1,
    Topic: "Vos loisirs préférés",
    Description: "Parlez de ce que vous aimez faire pendant votre temps libre.",
  },
  {
    id: 2,
    Topic: "Votre routine matinale",
    Description: "Décrivez ce que vous faites le matin après vous être réveillé.",
  },
  {
    id: 3,
    Topic: "Votre plat préféré",
    Description: "Dites-nous quel est votre plat préféré et pourquoi vous l'aimez.",
  }
];

export default function SpeakTopicPage() {
  return (
    <GenericSpeakingPage
      title="Speak About Topic"
      taskType="topic"
      sheetName="A1_Speaking_Topic"
      instructionEn="Speak about the given topic in French"
      instructionFr="Parlez du sujet donné en français"
      icon={MessageSquare}
      mockData={MOCK_DATA}
    />
  );
}
