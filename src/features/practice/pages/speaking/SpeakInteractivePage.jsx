import { Bot } from "lucide-react";
import GenericSpeakingPage from "./GenericSpeakingPage";

const MOCK_DATA = [
  {
    id: 1,
    Scenario: "Au restaurant",
    Prompt: "Serveur: Bonjour, vous désirez commander ?",
    Description: "Répondez au serveur que vous voulez une table pour deux."
  },
  {
    id: 2,
    Scenario: "À la boulangerie",
    Prompt: "Boulanger: Et avec ceci, ce sera tout ?",
    Description: "Demandez deux baguettes s'il vous plaît."
  },
  {
    id: 3,
    Scenario: "Dans la rue",
    Prompt: "Passant: Pardon, vous savez où se trouve le métro ?",
    Description: "Dites-lui de continuer tout droit."
  }
];

export default function SpeakInteractivePage() {
  return (
    <GenericSpeakingPage
      title="Interactive Speaking"
      taskType="interactive"
      sheetName="A1_Speaking_Interactive"
      instructionEn="Respond to the prompt in French"
      instructionFr="Répondez à l'invite en français"
      icon={Bot}
      mockData={MOCK_DATA}
    />
  );
}
