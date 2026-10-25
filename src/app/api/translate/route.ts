import { NextRequest, NextResponse } from "next/server";

async function readProvider(url: string, callerSignal: AbortSignal) {
  const controller = new AbortController();
  let reject!: (error: Error) => void;
  const interrupted = new Promise<never>((_, fail) => { reject = fail; });
  const abort = () => { reject(new Error("Translation cancelled")); controller.abort(); };
  const timeout = setTimeout(() => {
    reject(new Error("Translation provider timed out"));
    controller.abort();
  }, 8000);
  callerSignal.addEventListener("abort", abort, { once: true });
  if (callerSignal.aborted) abort();
  try {
    return await Promise.race([(async () => {
      if (controller.signal.aborted) throw new Error("Translation cancelled");
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`MyMemory API error: ${response.status}`);
      return response.json();
    })(), interrupted]);
  } finally {
    clearTimeout(timeout);
    callerSignal.removeEventListener("abort", abort);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { text, source_lang = "fr", target_lang = "en" } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    // MyMemory free translation API — no key needed
    const url = new URL("https://api.mymemory.translated.net/get");
    url.searchParams.set("q", text);
    url.searchParams.set("langpair", `${source_lang}|${target_lang}`);
    const data = await readProvider(url.toString(), req.signal);
    if (data?.responseStatus && Number(data.responseStatus) !== 200) {
      throw new Error("Translation provider rejected the request");
    }
    const translation = data?.responseData?.translatedText;

    if (typeof translation !== "string" || !translation.trim()) {
      throw new Error("No translation returned");
    }

    return NextResponse.json({ text, translation });
  } catch (err) {
    console.error("[/api/translate] Error:", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
