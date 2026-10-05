import { afterEach, describe, expect, it, vi } from "vitest";
import { requestTopicEvaluation, type TopicEvaluation } from "./topicEvaluationRequest";
import { normalizeTopicExercises, topicAvailability } from "./topicExercise";
import { topicReportData } from "./topicReportData";
import { stripReportHeading } from "./reportHeading";
import { ImageEvaluationRequestGate, insertImageAccent } from "./writeImageInput";

const id = "c82c96ba-f033-4ef8-a3e7-c0445e5201d0";
export function fixture(mode: "write" | "speak" = "write"): TopicEvaluation {
  return {
    report_type: `${mode}_topic`, overall_score: 70, cefr_level: "A2", learning_language: "French", known_language: "English",
    overall_session_analysis: { summary: {
      task_objective_achievement: "The response gives a place but misses the requested reasons.",
      overall_performance: "Simple understandable language conveys the main idea.",
      what_the_learner_did_well: "The location is clear.", what_could_have_been_better: "Reasons are missing.",
      how_the_learner_can_improve: ["Give two reasons.", "Connect ideas.", "Check agreement."],
    }, ratings: { task_completion_content_coverage: 7, relevant_detail_development: 7, clarity_coherence: 7,
      grammar_control: 7, vocabulary_control: 7, range_expression: 7 } },
    grammar_analysis: { overall_language_feedback: "Check plural agreement.", corrected_response_segments: [
      { type: "unchanged", text: "Je vois des " }, { type: "correction", number: 1, original: "maison", corrected: "maisons" },
      { type: "unchanged", text: " sur Mars." }],
      correction_table: [{ number: 1, original: "maison", corrected: "maisons", explanation: "Use the plural noun after des." }] },
    sample_answers: ["Paris est une ville agréable.", "Lyon est une ville animée."],
    improved_version: "Je vois des maisons sur Mars.", source_exercise_id: id, prompt_version: "test",
  };
}
afterEach(() => vi.unstubAllGlobals());

describe("topic evaluation client", () => {
  it.each(["write", "speak"] as const)("routes %s to the correct endpoint with only saved exercise and response", async mode => {
    const fetch = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => ({ ok: true, json: async () => fixture(mode) }));
    vi.stubGlobal("fetch", fetch);
    const controller = new AbortController();
    await requestTopicEvaluation({ mode, exercise_id: id, learner_response: "Je vois des maison sur Mars." }, controller.signal);
    expect(fetch.mock.calls[0][0]).toContain(mode === "speak" ? "evaluate-speaking" : "evaluate-writing");
    const init = fetch.mock.calls[0][1] as RequestInit;
    expect(init.signal).toBe(controller.signal);
    expect(JSON.parse(String(init.body))).toEqual({ task_type: "topic", exercise_id: id,
      [mode === "speak" ? "transcript" : "user_text"]: "Je vois des maison sur Mars." });
  });
  it.each([503, 401, 422])("rejects %s instead of producing a fake score", async status => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status, json: async () => ({ detail: "Try again." }) })));
    await expect(requestTopicEvaluation({ mode: "write", exercise_id: id, learner_response: "Bonjour" }, new AbortController().signal)).rejects.toThrow();
  });
  it("rejects feedback for another exercise", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ ...fixture(), source_exercise_id: "other" }) })));
    await expect(requestTopicEvaluation({ mode: "write", exercise_id: id, learner_response: "Bonjour" }, new AbortController().signal)).rejects.toThrow("does not match");
  });
  it("invalidates an old request after reset even when transport does not stop", () => {
    const gate = new ImageEvaluationRequestGate();
    const first = gate.begin()!;
    expect(gate.begin()).toBeNull();
    gate.reset();
    const second = gate.begin()!;
    expect(first.signal.aborted).toBe(true);
    expect(gate.isCurrent(first)).toBe(false);
    gate.finish(first);
    expect(gate.isCurrent(second)).toBe(true);
  });
});

describe("topic content and reports", () => {
  it.each(["Overall Description", "What the Learner Did Well", "What Was Missing or Could Have Been Better"])(
    "removes a repeated image report heading: %s", heading => {
      expect(stripReportHeading(`**${heading}:** The learner describes two cats.`, [heading]))
        .toBe("The learner describes two cats.");
      expect(stripReportHeading("The learner describes two cats.", [heading]))
        .toBe("The learner describes two cats.");
    });
  it.each(["write", "speak"] as const)("removes repeated %s headings without changing learner text", mode => {
    const evaluation = fixture(mode);
    const summary = evaluation.overall_session_analysis.summary;
    summary.task_objective_achievement = "Task & Objective Achievement " + summary.task_objective_achievement;
    summary.overall_performance = "**Overall Writing/Speaking Performance:** " + summary.overall_performance;
    summary.what_the_learner_did_well = "### What the Learner Did Well\n" + summary.what_the_learner_did_well;
    summary.what_could_have_been_better = "What Could Have Been Better — " + summary.what_could_have_been_better;
    const report = topicReportData(evaluation);
    expect(report.topic_session_summary).toEqual(fixture(mode).overall_session_analysis.summary);
    expect(report.executive_summary).toBe(fixture(mode).overall_session_analysis.summary.task_objective_achievement);
    expect(report.corrected_response_segments).toEqual(evaluation.grammar_analysis.corrected_response_segments);
    expect(summary.task_objective_achievement).toMatch(/^Task &/);
  });

  it("keeps saved IDs and role fields in flat or nested data", () => {
    const content = { main_instruction_fr: "Parlez de votre ville.", main_instruction_en: "Describe your city.",
      topic_bullets_fr: ["Lieu", "Deux raisons"], topic_bullets_en: ["Place", "Two reasons"] };
    const nested = normalizeTopicExercises([{ id, content, config: { maxHighlightChars: 10 }, Level: "A2" }], "write")[0];
    expect(nested.topic_bullets_fr).toEqual(["Lieu", "Deux raisons"]);
    expect(nested.charLimit).toBe(10);
    expect(topicAvailability(nested)).toBeNull();
    expect(normalizeTopicExercises([{ id, ...content, maxHighlightChars: 10, Level: "A2" }], "write")[0]).toEqual(nested);
  });
  it("does not disguise a missing known-language instruction as French", () => {
    const value = normalizeTopicExercises([{ id, main_instruction_fr: "Parlez", Level: "A1" }], "write")[0];
    expect(value.main_instruction_en).toBe("");
    expect(topicAvailability(value)).toContain("both");
  });
  it("limits accents exactly like the textarea", () => {
    expect(insertImageAccent("12345",5,5,"é",5)).toBe("12345");
    expect(insertImageAccent("12345",4,5,"é",5)).toBe("1234é");
  });
  it.each(["write", "speak"] as const)("maps all final %s report sections and saved samples", mode => {
    const result = topicReportData(fixture(mode));
    expect(result.topic_session_summary?.task_objective_achievement).toContain("reasons");
    expect(result.grammar_correction_table?.[0].number).toBe(1);
    expect(result.parameters?.length).toBe(6);
    expect(result.parameters?.at(-1)?.name).toBe(`${mode === "write" ? "Written" : "Spoken"} Range & Expression`);
    expect(result.sample_descriptions).toEqual(fixture(mode).sample_answers);
    expect(result.sample_descriptions).not.toContain(fixture(mode).improved_version);
  });
});
