import { Image as ImageIcon } from "lucide-react";
import GenericSpeakingPage from "./GenericSpeakingPage";

const MOCK_DATA = [
  {
    id: 1,
    Prompt: "Décrivez ce que vous voyez sur cette image.",
    Description: "Une famille qui déjeune dans un parc.",
    Image: "https://images.unsplash.com/photo-1526726538690-5cbf95642cb0?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: 2,
    Prompt: "Que se passe-t-il sur cette photo ?",
    Description: "Un homme qui lit un livre dans un café.",
    Image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=1887&auto=format&fit=crop"
  },
  {
    id: 3,
    Prompt: "Décrivez le paysage.",
    Description: "Une montagne enneigée sous un ciel bleu.",
    Image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop"
  }
];

export default function SpeakImagePage() {
  return (
    <GenericSpeakingPage
      title="Speak About Image"
      taskType="image"
      sheetName="A1_Speaking_Image"
      instructionEn="Describe the image in French"
      instructionFr="Décrivez l'image en français"
      icon={ImageIcon}
      mockData={MOCK_DATA}
    />
  );
}
