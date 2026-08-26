export interface QuizOption {
  text: string;
  translation?: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  num: number;
  question: string;
  translation?: string;
  options: QuizOption[];
  explanation: string;
  explanationTranslation?: string;
}

export interface StoryLine {
  speaker: string;
  number: string;
  text: string;
  translation: string;
  side: "left" | "right";
}

export interface MonologueSection {
  text: string;
  translation: string;
}

export interface StoryDisplayData {
  title: string;
  translatedTitle: string;
  description: string;
  translatedDescription: string;
  tags: string[];
  lines: StoryLine[];
  monologue: string;
  translatedMonologue: string;
  monologueSections: MonologueSection[];
  imageUrls: string[];
}

export type StoryContentTab = "story" | "quiz";
