"use client";

import GenericSpeakingPage from "@/features/practice/pages/speaking/GenericSpeakingPage";

export default function SpeakImagePage() {
  return (
    <GenericSpeakingPage
      title="Speak About Image"
      taskType="image"
      sheetName="A1_Speaking_Image"
      instructionEn="Describe the image in French"
      instructionFr="Décrivez l'image en français"
      csvName="practice/speaking/speak_image.csv"
    />
  );
}
