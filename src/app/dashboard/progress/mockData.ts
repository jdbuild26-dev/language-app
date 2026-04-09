
export interface Topic {
  id: string;
  slug: string;
  name: string;
  level: string; // A1, A2, B1, B2, C1, C2
  category: string;
  mastery: number; // 0 to 100
  status: 'completed' | 'in-progress' | 'locked' | 'untested';
}

export const MOCK_TOPICS: Topic[] = [
  // A1 Topics
  { id: '1', slug: 'a1/intro/greetings', name: 'Greetings & Introductions', level: 'A1', category: 'intro', mastery: 90, status: 'completed' },
  { id: '2', slug: 'a1/verb/present/er', name: 'Present Tense: -ER Verbs', level: 'A1', category: 'verb', mastery: 75, status: 'in-progress' },
  { id: '3', slug: 'a1/article/definite', name: 'Definite Articles', level: 'A1', category: 'article', mastery: 100, status: 'completed' },
  { id: '4', slug: 'a1/article/indefinite', name: 'Indefinite Articles', level: 'A1', category: 'article', mastery: 85, status: 'completed' },
  { id: '5', slug: 'a1/pronoun/subject', name: 'Subject Pronouns', level: 'A1', category: 'pronoun', mastery: 95, status: 'completed' },
  { id: '6', slug: 'a1/verb/core/be-have', name: 'Being/Having', level: 'A1', category: 'verb', mastery: 60, status: 'in-progress' },
  { id: '7', slug: 'a1/vocab/numbers', name: 'Numbers 1-100', level: 'A1', category: 'vocab', mastery: 40, status: 'in-progress' },
  { id: '8', slug: 'a1/noun/gender', name: 'Gender of Nouns', level: 'A1', category: 'noun', mastery: 20, status: 'untested' },
  { id: '9', slug: 'a1/adj/basic', name: 'Basic Adjectives', level: 'A1', category: 'adj', mastery: 0, status: 'untested' },
  { id: '10', slug: 'a1/vocab/colors', name: 'Colors', level: 'A1', category: 'vocab', mastery: 0, status: 'locked' },
  { id: '11', slug: 'a1/vocab/family', name: 'Family Members', level: 'A1', category: 'vocab', mastery: 0, status: 'locked' },
  { id: '12', slug: 'a1/negation/basic', name: 'Basic Negation', level: 'A1', category: 'negation', mastery: 0, status: 'locked' },

  // A2 Topics
  { id: '13', slug: 'a2/verb/past/pc-avoir', name: 'Passé Composé (Avoir)', level: 'A2', category: 'verb', mastery: 30, status: 'in-progress' },
  { id: '14', slug: 'a2/verb/past/pc-etre', name: 'Passé Composé (Être)', level: 'A2', category: 'verb', mastery: 10, status: 'in-progress' },
  { id: '15', slug: 'a2/pronoun/cod', name: 'Direct Object Pronouns', level: 'A2', category: 'pronoun', mastery: 0, status: 'untested' },
  { id: '16', slug: 'a2/adj/comparison', name: 'Comparative', level: 'A2', category: 'adj', mastery: 0, status: 'untested' },
  { id: '17', slug: 'a2/vocab/travel', name: 'Travel', level: 'A2', category: 'vocab', mastery: 0, status: 'locked' },
  { id: '18', slug: 'a2/vocab/health', name: 'Health', level: 'A2', category: 'vocab', mastery: 0, status: 'locked' },

  // B1 Topics
  { id: '19', slug: 'b1/verb/mood/subjunctive', name: 'Subjunctive', level: 'B1', category: 'verb', mastery: 0, status: 'locked' },
  { id: '20', slug: 'b1/syntax/passive', name: 'Passive Voice', level: 'B1', category: 'syntax', mastery: 0, status: 'locked' },
  { id: '21', slug: 'b1/vocab/society', name: 'Society', level: 'B1', category: 'vocab', mastery: 0, status: 'locked' },

  // B2 Topics
  { id: '22', slug: 'b2/vocab/ethics', name: 'Ethics', level: 'B2', category: 'vocab', mastery: 0, status: 'locked' },
  { id: '23', slug: 'b2/syntax/rhetoric', name: 'Rhetoric', level: 'B2', category: 'syntax', mastery: 0, status: 'locked' },
];
