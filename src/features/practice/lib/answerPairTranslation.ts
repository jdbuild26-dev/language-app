export type AnswerPairInput = {
  wrong?: string;
  correct: string;
  wrongTranslation?: string;
  correctTranslation?: string;
  targetLang: string;
};

export type AnswerPairSnapshot = {
  wrong?: string;
  correct: string;
  translated: boolean;
  loading: boolean;
  error: string;
};

/** Keeps a feedback row in one language, including while a missing translation loads. */
export function createAnswerPairTranslation(input: AnswerPairInput) {
  let state: AnswerPairSnapshot = {
    wrong: input.wrong, correct: input.correct, translated: false, loading: false, error: "",
  };
  const listeners = new Set<() => void>();
  const cache = new Map<string, string>();
  if (input.wrong && input.wrongTranslation?.trim()) cache.set(input.wrong, input.wrongTranslation.trim());
  if (input.correctTranslation?.trim()) cache.set(input.correct, input.correctTranslation.trim());
  let generation = 0;
  let request: AbortController | undefined;
  const update = (next: Partial<AnswerPairSnapshot>) => {
    state = { ...state, ...next };
    listeners.forEach(listener => listener());
  };
  return {
    subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    getSnapshot: () => state,
    cancel() {
      generation++;
      request?.abort();
      update({ wrong: input.wrong, correct: input.correct, translated: false, loading: false, error: "" });
    },
    async toggle() {
      if (state.loading) return;
      if (state.translated) {
        update({ wrong: input.wrong, correct: input.correct, translated: false, error: "" });
        return;
      }
      const currentGeneration = ++generation;
      const controller = new AbortController();
      request = controller;
      const timeout = setTimeout(() => controller.abort(), 10_000);
      const cancelled = new Promise<never>((_, reject) => {
        controller.signal.addEventListener("abort", () => reject(new Error("Translation cancelled")), { once: true });
      });
      update({ loading: true, error: "" });
      try {
        await Promise.race([cancelled, Promise.all([...new Set([input.wrong, input.correct].filter((text): text is string => Boolean(text)))].map(async text => {
          if (cache.has(text)) return;
          const response = await fetch("/api/translate", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, source_lang: input.targetLang === "fr" ? "en" : "fr", target_lang: input.targetLang }),
            signal: controller.signal,
          });
          if (!response.ok) throw new Error("Translation failed");
          const data = await response.json() as { translation?: string };
          if (!data.translation?.trim()) throw new Error("Translation empty");
          if (currentGeneration === generation && !controller.signal.aborted) cache.set(text, data.translation.trim());
        }))]);
        if (currentGeneration !== generation) return;
        update({ wrong: input.wrong ? cache.get(input.wrong) : undefined, correct: cache.get(input.correct)!, translated: true, loading: false });
      } catch {
        controller.abort();
        if (currentGeneration === generation) update({ loading: false, error: "Translation unavailable. Try again." });
      } finally {
        clearTimeout(timeout);
        if (request === controller) request = undefined;
      }
    },
  };
}

export function findBilingualAnswer(text: string | undefined, pairs: { fr?: string; en?: string }[], sourceLang: string) {
  if (!text) return undefined;
  const source = sourceLang === "fr" ? "fr" : "en";
  const target = source === "fr" ? "en" : "fr";
  return pairs.find(pair => pair[source] === text)?.[target] || undefined;
}
