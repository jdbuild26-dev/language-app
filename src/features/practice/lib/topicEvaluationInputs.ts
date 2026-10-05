type TopicContent = {
  main_instruction_fr: string;
  main_instruction_en: string;
  topic_bullets_fr: string[];
  topic_bullets_en: string[];
};

/** Importers store learning/known language content in legacy *_fr/*_en role aliases. */
export function topicEvaluationInputs(content: TopicContent, learningLanguage: string, knownLanguage: string) {
  return {
    learning_language: learningLanguage,
    known_language: knownLanguage,
    main_instruction_ll: content.main_instruction_fr,
    main_instruction_kl: content.main_instruction_en,
    topics_to_cover_ll: content.topic_bullets_fr,
    topics_to_cover_kl: content.topic_bullets_en,
  };
}
