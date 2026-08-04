import { StoryNote } from "@/services/storiesApi";
import { QuizQuestion, StoryDisplayData } from "../types";

export function parseQuizFromHtml(html: string): QuizQuestion[] {
  if (typeof window === "undefined") return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  return Array.from(doc.querySelectorAll(".quiz-card"))
    .map((card, i) => {
      const question = card.querySelector(".quiz-question-content span")?.textContent?.trim() ?? "";
      const options = Array.from(card.querySelectorAll(".quiz-option"))
        .map((opt) => ({
          text: opt.querySelector(".quiz-option-text")?.textContent?.trim() ?? "",
          isCorrect: opt.getAttribute("data-type") === "correct",
        }))
        .filter((opt) => opt.text);
      const explanation = card.querySelector(".feedback-text")?.textContent?.trim() ?? "";
      return { num: i + 1, question, options, explanation };
    })
    .filter((q) => q.question && q.options.length > 0);
}

export function parseStoryDisplayData(html: string, activeNote: StoryNote | null): StoryDisplayData {
  const fallbackTitle = activeNote?.title ?? "Story";
  if (typeof window === "undefined") {
    return {
      title: fallbackTitle,
      translatedTitle: "",
      description: "",
      translatedDescription: "",
      tags: [],
      lines: [],
      monologue: "",
      translatedMonologue: "",
    };
  }

  const doc = new DOMParser().parseFromString(html, "text/html");
  const titleGroup = doc.querySelector<HTMLElement>(".hero-title-group");
  const descriptionGroup = doc.querySelector<HTMLElement>(".hero-description-group");
  const title = doc.querySelector(".hero-title")?.textContent?.trim() || fallbackTitle;
  const description = doc.querySelector(".hero-description")?.textContent?.trim() || activeNote?.title || "";
  const translatedTitle = titleGroup?.dataset.en || "";
  const translatedDescription = descriptionGroup?.dataset.en || "";
  const tags = Array.from(doc.querySelectorAll(".meta-badge"))
    .map((tag) => tag.textContent?.trim() ?? "")
    .filter(Boolean)
    .slice(0, 4);

  const lines = Array.from(doc.querySelectorAll(".msg-row")).map((row, index) => ({
    speaker: row.querySelector(".msg-label span")?.textContent?.trim() || (index % 2 === 0 ? "Speaker A" : "Speaker B"),
    number: row.querySelector(".msg-label .badge")?.textContent?.trim() || String(index + 1),
    text: row.querySelector(".msg-text")?.textContent?.trim() || "",
    translation: row.querySelector(".msg-translation")?.textContent?.trim() || "",
    side: index % 2 === 0 ? "left" as const : "right" as const,
  }));

  const monologue = doc.querySelector("#primaryParagraph")?.textContent?.trim() || "";
  const translatedMonologue = doc.querySelector("#translationParagraph")?.textContent?.trim() || "";
  return { title, translatedTitle, description, translatedDescription, tags, lines, monologue, translatedMonologue };
}
