import { readFileSync, writeFileSync } from "node:fs";
import { afterEach, expect, it, vi } from "vitest";
import { createWriteImagePdf } from "./writeImagePdf";
import type { EnhancedAnalysisData } from "./EnhancedFeedbackView";
import { jsPDF } from "jspdf";

afterEach(() => vi.unstubAllGlobals());

it("exports older combined summaries without repeating section headings", async () => {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => ({ ok: true,
    blob: async () => readFileSync(`public${url}`).toString("base64") })));
  vi.stubGlobal("FileReader", class {
    result = ""; onload: (() => void) | null = null;
    readAsDataURL(value: string) { this.result = `data:font/ttf;base64,${value}`; this.onload?.(); }
  });
  const strengths = "They identify the desks.";
  const gaps = "The arrangement needs detail.";
  const calls: string[] = [];
  // jsPDF installs text per instance; inspect its actual rendering events.
  const subscription = jsPDF.API.events;
  const event: [string, (args: { text: unknown }) => void] = ["preProcessText", (args) => {
    calls.push(JSON.stringify(args.text));
  }];
  subscription.push(event);
  try {
    await createWriteImagePdf({ overall_score: 70, cefr_level: "A1",
      overall_session_summary: {
        overall_description: `An office. What the Learner Did Well: ${strengths} What Was Missing or Could Have Been Better: ${gaps} How the Learner Can Improve: Observe.`,
        what_the_learner_did_well: strengths, what_was_missing_or_could_have_been_better: gaps,
        how_the_learner_can_improve: ["Observe.", "Describe.", "Relire."] },
      grammar_language_feedback: "Accord.", corrected_response_segments: [{ type: "unchanged", text: "Un bureau." }],
      grammar_correction_table: [], sample_descriptions: [] } as unknown as EnhancedAnalysisData, "Un bureau.");
    expect(calls.join(" ").match(/What the Learner Did Well/g)).toHaveLength(1);
  } finally {
    subscription.splice(subscription.indexOf(event), 1);
  }
});

it.each(["write_image", "speak_image", "write_topic", "speak_topic"] as const)("does not repeat model-provided headings in %s PDFs", async kind => {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => ({ ok: true,
    blob: async () => readFileSync(`public${url}`).toString("base64") })));
  vi.stubGlobal("FileReader", class {
    result = ""; onload: (() => void) | null = null;
    readAsDataURL(value: string) { this.result = `data:font/ttf;base64,${value}`; this.onload?.(); }
  });
  const calls: string[] = [];
  const event: [string, (args: { text: unknown }) => void] = ["preProcessText", args => { calls.push(JSON.stringify(args.text)); }];
  jsPDF.API.events.push(event);
  const imageSummary = { overall_description: "Overall Description: Une pièce.",
    what_the_learner_did_well: "What the Learner Did Well: Des objets.",
    what_was_missing_or_could_have_been_better: "What Was Missing or Could Have Been Better: Des détails.",
    how_the_learner_can_improve: ["Observer.", "Décrire.", "Relire."] };
  const topicSummary = { task_objective_achievement: "Task & Objective Achievement: La tâche est claire.",
    overall_performance: `Overall ${kind === "speak_topic" ? "Speaking" : "Writing"} Performance: Une réponse claire.`,
    what_the_learner_did_well: imageSummary.what_the_learner_did_well,
    what_could_have_been_better: "What Could Have Been Better: Des détails.",
    how_the_learner_can_improve: imageSummary.how_the_learner_can_improve };
  try {
    await createWriteImagePdf({ report_kind: kind === "write_image" ? undefined : kind, overall_score: 70, cefr_level: "A1",
      ...(kind.endsWith("topic") ? { topic_session_summary: topicSummary } : { overall_session_summary: imageSummary }),
      grammar_language_feedback: "**Overall Language Feedback:** Accord du verbe.",
      corrected_response_segments: [{ type: "unchanged", text: "Une pièce." }],
      grammar_correction_table: [], sample_descriptions: ["Première description.", "Deuxième description."]
    } as unknown as EnhancedAnalysisData, "Une pièce.");
    const rendered = calls.join(" ");
    expect(rendered.match(/What the Learner Did Well/g)).toHaveLength(1);
    expect(rendered.match(/Overall Language Feedback/g)).toHaveLength(1);
    expect(rendered).toContain("Accord du verbe.");
    expect(rendered).toContain("Première description.");
  } finally { jsPDF.API.events.splice(jsPDF.API.events.indexOf(event), 1); }
});

it("splits oversized correction rows across pages and keeps French text", async () => {
  vi.stubGlobal("fetch", vi.fn(async (url: string) => ({
    ok: true,
    blob: async () => readFileSync(`public${url}`).toString("base64"),
  })));
  vi.stubGlobal("FileReader", class {
    result = "";
    onload: (() => void) | null = null;
    readAsDataURL(base64: string) {
      this.result = `data:font/ttf;base64,${base64}`;
      this.onload?.();
    }
  });
  const explanation = Array.from({ length: 125 }, (_, index) => `Ligne ${index + 1} : précision française.`).join("\n");
  const data = {
    overall_score: 70, cefr_level: "A1",
    overall_session_summary: { overall_description: "Une pièce éclairée.", what_the_learner_did_well: "La scène est décrite.",
      what_was_missing_or_could_have_been_better: "Quelques détails.", how_the_learner_can_improve: ["Observer.", "Décrire.", "Relire."] },
    grammar_language_feedback: "Accord du nom et de l’adjectif.",
    corrected_response_segments: [{ type: "unchanged", text: "Je vois des " },
      { type: "correction", number: 1, original: "table", corrected: "tables" },
      { type: "unchanged", text: " dans une pièce éclairée." }],
    grammar_correction_table: [{ number: 1, original: "table", corrected: "tables", explanation }],
    sample_descriptions: ["Première description française.", "Deuxième description française."],
  } satisfies Partial<EnhancedAnalysisData>;
  const doc = await createWriteImagePdf(data as EnhancedAnalysisData, "Je vois des table dans une pièce éclairée.");
  expect(doc.getNumberOfPages()).toBeGreaterThanOrEqual(4);
  const pages = (doc.internal.pages as unknown as string[][]).slice(1).map((page) => page.join("\n"));
  // PDF rectangles must remain inside the printable table area on every page.
  const scale = doc.internal.scaleFactor;
  const pageHeight = doc.internal.pageSize.getHeight() * scale;
  const rectangles = pages.flatMap((page) => [...page.matchAll(/([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+) re/g)]);
  expect(rectangles.length).toBeGreaterThan(3);
  for (const [, , top, , height] of rectangles) {
    const bottomMm = (pageHeight - (Number(top) + Number(height))) / scale;
    expect(bottomMm).toBeLessThanOrEqual(276.01);
  }
  if (process.env.WRITE_IMAGE_PDF_TEST_OUTPUT) {
    writeFileSync(process.env.WRITE_IMAGE_PDF_TEST_OUTPUT, Buffer.from(doc.output("arraybuffer")));
  }
});
