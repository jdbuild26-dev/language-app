import { useEffect, useState } from "react";
import Papa from "papaparse";

export type PracticeFeedbackLabels = {
  submit_answer: string;
  correct: string;
  incorrect: string;
  continue: string;
  correct_answer: string;
  time_up: string;
};

const english: PracticeFeedbackLabels = {
  submit_answer: "Submit answer",
  correct: "Correct",
  incorrect: "Incorrect",
  continue: "Continue",
  correct_answer: "Correct answer:",
  time_up: "Time's up!",
};

let labelsPromise: Promise<Record<string, PracticeFeedbackLabels>> | null = null;

function loadLabels() {
  if (!labelsPromise) {
    labelsPromise = fetch("/localization/practice_feedback.csv")
      .then((response) => {
        if (!response.ok) throw new Error("Practice feedback labels unavailable");
        return response.text();
      })
      .then((csv) => {
        const rows = Papa.parse<Record<string, string>>(csv, {
          header: true,
          skipEmptyLines: true,
        }).data;
        return Object.fromEntries(
          rows.filter((row) => row.language_code).map((row) => [
            row.language_code.trim().toLowerCase(),
            Object.fromEntries(
              Object.keys(english).map((key) => [key, row[key]?.trim() || english[key as keyof PracticeFeedbackLabels]]),
            ) as PracticeFeedbackLabels,
          ]),
        );
      })
      .catch(() => ({ en: english }));
  }
  return labelsPromise;
}

export function usePracticeFeedbackLabels(languageCode: string) {
  const [labels, setLabels] = useState<PracticeFeedbackLabels>(english);

  useEffect(() => {
    let active = true;
    loadLabels().then((byLanguage) => {
      if (active) setLabels(byLanguage[languageCode.trim().toLowerCase()] || byLanguage.en || english);
    });
    return () => { active = false; };
  }, [languageCode]);

  return labels;
}
