import { afterEach, expect, test, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "./route";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
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
