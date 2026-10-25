import { NextRequest, NextResponse } from "next/server";

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
    const res = await fetch(url.toString());

    if (!res.ok) {
      throw new Error(`MyMemory API error: ${res.status}`);
    }

    const data = await res.json();
    if (data?.responseStatus && Number(data.responseStatus) !== 200) {
      throw new Error("Translation provider rejected the request");
    }
    const translation = data?.responseData?.translatedText;

    if (!translation) {
      throw new Error("No translation returned");
    }

    return NextResponse.json({ text, translation });
  } catch (err) {
    console.error("[/api/translate] Error:", err);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
