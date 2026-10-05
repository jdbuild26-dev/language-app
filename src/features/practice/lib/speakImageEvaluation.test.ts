import { afterEach, expect, it, vi } from "vitest";
import { requestSpeakImageEvaluation } from "./speakImageEvaluationRequest";
import { normalizeSpeakImageExercises, speakImageAvailability } from "./speakImageExercise";
import { ImageEvaluationRequestGate } from "./writeImageInput";

const id = "c82c96ba-f033-4ef8-a3e7-c0445e5201d0";
const result = { report_type: "speak_image", source_exercise_id: id, overall_score: 74,
  overall_session_analysis: { summary: {}, ratings: {} }, grammar_analysis: {} };
afterEach(() => vi.unstubAllGlobals());

it("sends the exact captured transcript and saved ID to the speech image endpoint", async () => {
  const fetch = vi.fn(async (_url: RequestInfo | URL, _init?: RequestInit) => ({ ok: true, json: async () => result }));
  vi.stubGlobal("fetch", fetch);
  const controller = new AbortController();
  const params = { exercise_id: id, transcript: "Nous est dans une pharmacie. euh bonjourr\nDeux personnes." };
  await requestSpeakImageEvaluation(params, controller.signal);
  expect(fetch.mock.calls[0][0]).toContain("evaluate-speak-image");
  const init = fetch.mock.calls[0][1]!;
  expect(JSON.parse(String(init.body))).toEqual(params);
  expect(init.signal).toBe(controller.signal);
});
it.each([401, 503, 422])("rejects %s without a fabricated report", async status => {
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: false, status, json: async () => ({ detail: "Failure" }) })));
  await expect(requestSpeakImageEvaluation({ exercise_id: id, transcript: "Bonjour" }, new AbortController().signal)).rejects.toThrow();
});
it.each([{ source_exercise_id: "other" }, { report_type: "write_image" }, { overall_score: null }])("rejects mismatched or incomplete feedback %j", async override => {
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: async () => ({ ...result, ...override }) })));
  await expect(requestSpeakImageEvaluation({ exercise_id: id, transcript: "Bonjour" }, new AbortController().signal)).rejects.toThrow();
});
it("preserves saved IDs, timer, level and filters blank references consistently", () => {
  const question = normalizeSpeakImageExercises([{ id, Level: "B1", config: { timeLimitSeconds: 90 },
    content: { image_url: "image.jpg", sample_answers_fr: ["", "First", "Second"] } }])[0];
  expect(question.id).toBe(id);
  expect(question.timeLimitSeconds).toBe(90);
  expect(question.sample_answers_fr).toEqual(["First", "Second"]);
  expect(speakImageAvailability(question)).toBeNull();
  expect(speakImageAvailability({ ...question, sample_answers_fr: ["First"] })).toContain("two saved");
});
it("invalidates late speech feedback after exercise reset", () => {
  const gate = new ImageEvaluationRequestGate();
  const old = gate.begin()!;
  gate.reset();
  const current = gate.begin()!;
  expect(old.signal.aborted).toBe(true);
  expect(gate.isCurrent(old)).toBe(false);
  gate.finish(old);
  expect(gate.isCurrent(current)).toBe(true);
});
