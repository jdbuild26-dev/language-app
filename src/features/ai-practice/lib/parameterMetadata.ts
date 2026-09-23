const PARAMETER_DESCRIPTIONS: Record<string, string> = {
  "Task completion": "How successfully the learner completed the required objective and important task components.",
  "Basic comprehensibility": "How easily the learner's intended meaning could be understood despite possible mistakes.",
  "Appropriateness of response": "How relevant, suitable, and appropriate the learner's responses were to the questions and situation.",
  "Ability to express meaning": "How successfully the learner communicated the required information, requests, preferences, reasons, or opinions.",
  "Vocabulary control": "How appropriately and accurately the learner used vocabulary expected at the stated CEFR level.",
  "Grammar control": "How effectively the learner used grammatical structures expected at the stated CEFR level.",
  "Fluency": "How smoothly the learner communicated without excessive fragmentation, repetition, or dependence on very short responses.",
  "Interaction management": "How well the learner responded, handled follow-ups, clarified meaning, and helped move the conversation forward.",
  "Naturalness": "How natural and conversational the learner's responses were for the stated CEFR level.",
  "Range": "The variety of level-appropriate vocabulary, sentence patterns, grammar, connectors, and communicative functions demonstrated.",
};

export function getParameterDescription(name: string, fallback?: string) {
  return PARAMETER_DESCRIPTIONS[name] || fallback || "How the learner performed in this area for the stated CEFR level.";
}
