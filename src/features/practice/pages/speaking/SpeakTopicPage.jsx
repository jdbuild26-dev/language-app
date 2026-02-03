import { MessageSquare } from "lucide-react";
import GenericSpeakingPage from "./GenericSpeakingPage";

export default function SpeakTopicPage() {
  return (
    <GenericSpeakingPage
      title="Speak About Topic"
      taskType="topic"
      sheetName="A1_Speaking_Topic"
      instructionEn="Speak about the given topic in French"
      instructionFr="Parlez du sujet donné en français"
      icon={MessageSquare}
      csvName="practice/speaking/speak_topic.csv"
    />
  );
}
