import { StoryNote } from "@/services/storiesApi";
import { MonologueSection, QuizQuestion, StoryDisplayData } from "../types";

function getParagraphs(container: Element | null): string[] {
  if (!container) return [];
  const paragraphs = Array.from(container.querySelectorAll("p"))
    .map((paragraph) => paragraph.textContent?.trim() ?? "")
    .filter(Boolean);
  if (paragraphs.length > 0) return paragraphs;
  const text = container.textContent?.trim() ?? "";
  return text ? [text] : [];
}

export function parseQuizFromHtml(html: string): QuizQuestion[] {
  if (typeof window === "undefined") return [];
  const doc = new DOMParser().parseFromString(html, "text/html");
  return Array.from(doc.querySelectorAll(".quiz-card"))
    .map((card, i) => {
      const question = card.querySelector(".quiz-question-content span")?.textContent?.trim() ?? "";
      const options = Array.from(card.querySelectorAll(".quiz-option"))
        .map((opt) => ({
          text: opt.querySelector(".quiz-option-text")?.textContent?.trim() ?? "",
          translation: (opt as HTMLElement).dataset.en?.trim() || opt.querySelector(".quiz-translation-option, .quiz-option-translation")?.textContent?.trim() || "",
          isCorrect: opt.getAttribute("data-type") === "correct",
        }))
        .filter((opt) => opt.text);
      const explanation = card.querySelector(".feedback-text")?.textContent?.trim() ?? "";
      const explanationTranslation = (card.querySelector(".feedback-text") as HTMLElement | null)?.dataset.en?.trim() || card.querySelector(".feedback-translation")?.textContent?.trim() || "";
      const translation = (card.querySelector(".quiz-question-content") as HTMLElement | null)?.dataset.en?.trim() || card.querySelector(".quiz-translation-question, .quiz-question-translation")?.textContent?.trim() || "";
      return { num: i + 1, question, translation, options, explanation, explanationTranslation };
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
      monologueSections: [],
      imageUrls: [],
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
  const imageUrls = Array.from(doc.querySelectorAll<HTMLElement>(".story-image-metadata [data-url]"))
    .map((image) => image.dataset.url?.trim() ?? "")
    .filter(Boolean);

  const lines = Array.from(doc.querySelectorAll(".msg-row")).map((row, index) => ({
    speaker: row.querySelector(".msg-label span")?.textContent?.trim() || (index % 2 === 0 ? "Speaker A" : "Speaker B"),
    number: row.querySelector(".msg-label .badge")?.textContent?.trim() || String(index + 1),
    text: row.querySelector(".msg-text")?.textContent?.trim() || "",
    translation: row.querySelector(".msg-translation")?.textContent?.trim() || "",
    side: index % 2 === 0 ? "left" as const : "right" as const,
  }));

  const monologueParagraphs = getParagraphs(doc.querySelector("#primaryParagraph"));
  const translatedMonologueParagraphs = getParagraphs(doc.querySelector("#translationParagraph"));
  const monologueSections: MonologueSection[] = monologueParagraphs.map((text, index) => ({
    text,
    translation: translatedMonologueParagraphs[index] || "",
  }));
  const monologue = monologueParagraphs.join("\n\n");
  const translatedMonologue = translatedMonologueParagraphs.join("\n\n");
  return { title, translatedTitle, description, translatedDescription, tags, lines, monologue, translatedMonologue, monologueSections, imageUrls };
}
