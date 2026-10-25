import { afterEach, expect, it, vi } from "vitest";
import { fetchPracticeQuestions } from "./vocabularyApi";

afterEach(() => vi.unstubAllGlobals());

it.each(["B5_Fill blanks_Audio", "b5_fill_blanks_audio"])("keeps the CSV fallback for sheet %s", async sheet => {
  const csv = 'ExerciseID,CompleteSentence,SentenceWithBlank,CorrectAnswer\nA1,Le chat dort.,Le ____ dort.,chat\n';
  const fetchMock = vi.fn().mockResolvedValueOnce({ ok: false, status: 404 })
    .mockResolvedValueOnce({ ok: true, text: async () => csv });
  vi.stubGlobal("fetch", fetchMock);
  const response = await fetchPracticeQuestions(sheet) as { data: Record<string, string>[] };
  expect(fetchMock.mock.calls[0][0]).toContain(`/api/practice/${encodeURIComponent(sheet)}`);
  expect(fetchMock.mock.calls[1][0]).toBe("/mock-data/csv/b5_fill_blanks_audio.csv");
  expect(response.data[0]).toMatchObject({ CompleteSentence: "Le chat dort.", SentenceWithBlank: "Le ____ dort.", CorrectAnswer: "chat" });
});
