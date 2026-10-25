import { afterEach, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("bounds an unresponsive provider and aborts its request", async () => {
  vi.useFakeTimers(); vi.spyOn(console, "error").mockImplementation(() => {});
  const fetchMock = vi.fn().mockImplementation(() => new Promise<Response>(() => {}));
  vi.stubGlobal("fetch", fetchMock);
  const pending = POST(translationRequest({ text: "chat" }));
  await vi.advanceTimersByTimeAsync(10000);
  const response = await pending;
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "Translation failed" });
  expect(fetchMock.mock.calls[0][1]?.signal.aborted).toBe(true);
});

test("cancels the upstream request when the caller disconnects", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const fetchMock = vi.fn().mockImplementation(() => new Promise<Response>(() => {}));
  vi.stubGlobal("fetch", fetchMock);
  const controller = new AbortController();
  const request = new NextRequest("http://localhost/api/translate", {
    method: "POST", body: JSON.stringify({ text: "chat" }), signal: controller.signal,
  });
  const pending = POST(request);
  await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
  controller.abort();
  expect((await pending).status).toBe(500);
  expect(fetchMock.mock.calls[0][1]?.signal.aborted).toBe(true);
});

test("also bounds a provider that sends headers but never finishes its body", async () => {
  vi.useFakeTimers(); vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal("fetch", vi.fn(async () => ({ ok: true, json: () => new Promise(() => {}) })));
  const pending = POST(translationRequest({ text: "chat" }));
  await vi.advanceTimersByTimeAsync(10000);
  expect((await pending).status).toBe(500);
});

function translationRequest(body: Record<string, string>) {
  return new NextRequest("http://localhost/api/translate", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

test("translates a selected English answer into French", async () => {
  const fetch = vi.fn().mockResolvedValue(Response.json({
    responseStatus: 200,
    responseData: { translatedText: "lampe" },
  }));
  vi.stubGlobal("fetch", fetch);
  const response = await POST(translationRequest({ text: "lamp", source_lang: "en", target_lang: "fr" }));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ text: "lamp", translation: "lampe" });
  expect(new URL(fetch.mock.calls[0][0]).searchParams.get("langpair")).toBe("en|fr");
});

test("keeps French as the source for existing translation callers", async () => {
  const fetch = vi.fn().mockResolvedValue(Response.json({
    responseStatus: 200,
    responseData: { translatedText: "lamp" },
  }));
  vi.stubGlobal("fetch", fetch);
  const response = await POST(translationRequest({ text: "lampe", target_lang: "en" }));
  expect(response.status).toBe(200);
  expect(new URL(fetch.mock.calls[0][0]).searchParams.get("langpair")).toBe("fr|en");
});

test("does not present a provider error message as a translated answer", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({
    responseStatus: 429,
    responseData: { translatedText: "QUERY LIMIT EXCEEDED" },
  })));
  const response = await POST(translationRequest({ text: "lamp", source_lang: "en", target_lang: "fr" }));
  expect(response.status).toBe(500);
  expect(await response.json()).toEqual({ error: "Translation failed" });
});
