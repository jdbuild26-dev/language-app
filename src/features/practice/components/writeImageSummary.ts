import type { WriteImageEvaluation } from "@/features/practice/hooks/useWriteImageEvaluation";

type Summary = WriteImageEvaluation["summary"];

const normalizeText = (text: string) => text.replace(/\s+/g, " ").trim();
const sectionText = (text: string) => normalizeText(text.replace(/^[\s:*#]+|[\s*#]+$/g, ""));

// Older model responses sometimes repeated the complete report in the first field.
// Remove that suffix only when its sections match the separate structured fields.
export function normalizeWriteImageSummary(summary: Summary): Summary {
  const text = summary.overall_description;
  const well = /What\s+the\s+Learner\s+Did\s+Well|Ce que l[’']apprenant a bien fait|Points forts|Was der Lernende gut gemacht hat|Lo que el estudiante hizo bien|Cosa ha fatto bene lo studente|O que o aluno fez bem|Wat de leerling goed deed/i.exec(text);
  const missing = /What\s+Was\s+Missing\s+or\s+Could\s+Have\s+Been\s+Better|Ce qui manquait ou pourrait être amélioré|Points à améliorer|Was fehlte oder besser sein könnte|Lo que faltó o podría mejorar|Cosa mancava o poteva essere migliorato|O que faltou ou poderia melhorar|Wat ontbrak of beter kon/i.exec(text);
  const improve = /How\s+the\s+Learner\s+Can\s+Improve|Comment l[’']apprenant peut s[’']améliorer|Comment progresser|Wie sich der Lernende verbessern kann|Cómo puede mejorar el estudiante|Come può migliorare lo studente|Como o aluno pode melhorar|Hoe de leerling kan verbeteren/i.exec(text);
  if (!well || !missing || !improve || well.index <= 0 ||
      missing.index <= well.index || improve.index <= missing.index) return summary;

  const repeatedStrengths = sectionText(text.slice(well.index + well[0].length, missing.index));
  const repeatedGaps = sectionText(text.slice(missing.index + missing[0].length, improve.index));
  if (repeatedStrengths !== normalizeText(summary.what_the_learner_did_well) ||
      repeatedGaps !== normalizeText(summary.what_was_missing_or_could_have_been_better)) return summary;

  return { ...summary, overall_description: sectionText(text.slice(0, well.index)) };
}
