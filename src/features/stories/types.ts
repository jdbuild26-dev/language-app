export interface QuizOption {
  text: string;
  isCorrect: boolean;
}

export interface QuizQuestion {
  num: number;
  question: string;
  options: QuizOption[];
  explanation: string;
}

export interface StoryLine {
  speaker: string;
  number: string;
  text: string;
  translation: string;
  side: "left" | "right";
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
}

export type StoryContentTab = "story" | "quiz";
