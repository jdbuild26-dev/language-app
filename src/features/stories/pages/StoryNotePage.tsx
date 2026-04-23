"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Loader2, AlertCircle, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { fetchStorySubtopicNotes, fetchStoryNoteHtml, StoryNote } from "@/services/storiesApi";

export default function StoryNotePage() {
  const params = useParams<{ subtopicId: string }>();
  const subtopicId = params?.subtopicId;
  const router = useRouter();
  const { knownLang } = useLanguage();

  const [notes, setNotes] = useState<StoryNote[]>([]);
  const [activeNote, setActiveNote] = useState<StoryNote | null>(null);
  const [html, setHtml] = useState<string | null>(null);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [loadingHtml, setLoadingHtml] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const loadNotes = useCallback(async () => {
    if (!subtopicId) return;
    setLoadingNotes(true);
    setError(null);
    try {
      let data = await fetchStorySubtopicNotes(Number(subtopicId), knownLang);
      if (data.length === 0) data = await fetchStorySubtopicNotes(Number(subtopicId));
      setNotes(data);
      if (data.length > 0) setActiveNote(prev => prev ?? data[0]);
    } catch (e: any) {
      setError(e.message ?? "Failed to load story");
    } finally {
      setLoadingNotes(false);
    }
  }, [subtopicId, knownLang]);

  const activeNoteId = activeNote?.id ?? null;

  const loadHtml = useCallback(async (noteId: number) => {
    setLoadingHtml(true);
    setHtml(null);
    try {
      const content = await fetchStoryNoteHtml(noteId);
      setHtml(content);
    } catch (e: any) {
      setError(e.message ?? "Failed to load story content");
    } finally {
      setLoadingHtml(false);
    }
  }, []);

  useEffect(() => { loadNotes(); }, [loadNotes]);
  useEffect(() => { if (activeNoteId) loadHtml(activeNoteId); }, [activeNoteId, loadHtml]);

  // Wire up all interactivity after HTML is injected
  useEffect(() => {
    if (!html || !contentRef.current) return;

    // Clean up previous listeners
    if (cleanupRef.current) cleanupRef.current();

    const root = contentRef.current;
    const abortCtrl = new AbortController();
    const sig = { signal: abortCtrl.signal };

    // ── Sidebar navigation ──────────────────────────────────────────────────
    const navLinks = root.querySelectorAll<HTMLElement>(".nav-link");

    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const target = (link as HTMLElement).dataset.section;

        // Re-query sections on each click to ensure fresh NodeList
        const sections = root.querySelectorAll<HTMLElement>(".conversation-section, .quiz-section");
        navLinks.forEach((l) => l.classList.remove("active"));
        link.classList.add("active");
        sections.forEach((s) => {
          s.classList.toggle("active", s.id === target);
        });

        // Fallback: if class-based query found nothing, use section[id] directly
        if (sections.length === 0) {
          root.querySelectorAll<HTMLElement>("section[id]").forEach((s) => {
            s.classList.toggle("active", s.id === target);
          });
        }

        if (window.history?.replaceState) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      }, sig);
    });

    // ── Hero translate ──────────────────────────────────────────────────────
    const heroBtn = root.querySelector<HTMLButtonElement>("#heroTranslateBtn");
    const titleGroup = root.querySelector<HTMLElement>(".hero-title-group");
    const descGroup = root.querySelector<HTMLElement>(".hero-description-group");
    const titleEl = root.querySelector<HTMLElement>(".hero-title");
    const descEl = root.querySelector<HTMLElement>(".hero-description");

    if (heroBtn && titleGroup && titleEl) {
      let heroShowing = false;
      const primaryLang = titleGroup.dataset.fr ? "fr" : "en"; // detect from data attrs
      // Find which lang is the primary (the one matching current text)
      const langs = ["fr", "en", "es", "de"];
      const currentTitle = titleEl.textContent?.trim() ?? "";
      const detectedPrimary = langs.find(l => titleGroup.dataset[l]?.trim() === currentTitle) ?? "fr";
      const transLang = detectedPrimary === "en" ? "fr" : "en";

      heroBtn.addEventListener("click", () => {
        heroShowing = !heroShowing;
        if (titleEl && titleGroup)
          titleEl.textContent = heroShowing
            ? (titleGroup.dataset[transLang] ?? titleEl.textContent)
            : (titleGroup.dataset[detectedPrimary] ?? titleEl.textContent);
        if (descEl && descGroup)
          descEl.textContent = heroShowing
            ? (descGroup.dataset[transLang] ?? descEl.textContent)
            : (descGroup.dataset[detectedPrimary] ?? descEl.textContent);
      }, sig);
    }

    // ── Monologue translate ─────────────────────────────────────────────────
    const paraBtn = root.querySelector<HTMLButtonElement>("#paraTranslateBtn");
    const translationPara = root.querySelector<HTMLElement>("#translationParagraph");
    if (paraBtn && translationPara) {
      let paraShowing = false;
      paraBtn.addEventListener("click", () => {
        paraShowing = !paraShowing;
        translationPara.style.display = paraShowing ? "block" : "none";
      }, sig);
    }

    // ── Monologue audio (TTS for paragraph) ────────────────────────────────
    const monoPlayBtn = root.querySelector<HTMLButtonElement>("#monoPlayBtn");
    const primaryPara = root.querySelector<HTMLElement>("#primaryParagraph");
    if (monoPlayBtn && primaryPara) {
      let monoPlaying = false;
      monoPlayBtn.addEventListener("click", () => {
        if (!window.speechSynthesis) return;
        if (monoPlaying) {
          window.speechSynthesis.cancel();
          monoPlaying = false;
          monoPlayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px"><path d="M8 5v14l11-7z"/></svg>';
        } else {
          const utt = new SpeechSynthesisUtterance(primaryPara.textContent ?? "");
          utt.onend = () => {
            monoPlaying = false;
            monoPlayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px"><path d="M8 5v14l11-7z"/></svg>';
          };
          window.speechSynthesis.speak(utt);
          monoPlaying = true;
          monoPlayBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>';
        }
      }, sig);
    }

    // ── Per-bubble translate ────────────────────────────────────────────────
    root.querySelectorAll<HTMLButtonElement>(".msg-translate-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const group = btn.closest(".msg-bubble-inner")?.querySelector<HTMLElement>(".msg-text-group");
        const tr = group?.querySelector<HTMLElement>(".msg-translation");
        if (tr) tr.style.display = tr.style.display === "block" ? "none" : "block";
      }, sig);
    });

    // ── Translate All ───────────────────────────────────────────────────────
    const translateAllBtn = root.querySelector<HTMLButtonElement>("#convTranslateAllBtn");
    if (translateAllBtn) {
      let allShowing = false;
      translateAllBtn.addEventListener("click", () => {
        allShowing = !allShowing;
        root.querySelectorAll<HTMLElement>(".msg-translation").forEach((el) => {
          el.style.display = allShowing ? "block" : "none";
        });
      }, sig);
    }

    // ── Quiz translate buttons ──────────────────────────────────────────────
    root.querySelectorAll<HTMLButtonElement>(".quiz-translate-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        const card = btn.closest<HTMLElement>(".quiz-card");
        if (!card) return;
        const qTr = card.querySelector<HTMLElement>(".quiz-translation-question");
        const optTrs = card.querySelectorAll<HTMLElement>(".quiz-translation-option");
        const expTr = card.querySelector<HTMLElement>(".feedback-translation");
        const isShowing = qTr?.style.display === "block";
        if (qTr) qTr.style.display = isShowing ? "none" : "block";
        optTrs.forEach((el) => { el.style.display = isShowing ? "none" : "block"; });
        if (expTr) expTr.style.display = isShowing ? "none" : "block";
      }, sig);
    });

    // ── Quiz submission ─────────────────────────────────────────────────────
    const submitBtn = root.querySelector<HTMLButtonElement>("#submitQuiz");
    const quizCards = root.querySelectorAll<HTMLElement>(".quiz-card");

    function checkAllAnswered() {
      let all = true;
      quizCards.forEach((card) => {
        if (!card.querySelector<HTMLInputElement>(".quiz-radio-input:checked")) all = false;
      });
      if (submitBtn) submitBtn.disabled = !all;
    }

    root.querySelectorAll<HTMLInputElement>(".quiz-radio-input").forEach((radio) => {
      radio.addEventListener("change", checkAllAnswered, sig);
    });

    if (submitBtn) {
      submitBtn.addEventListener("click", () => {
        let score = 0;
        quizCards.forEach((card) => {
          const selected = card.querySelector<HTMLInputElement>(".quiz-option input:checked");
          const feedback = card.querySelector<HTMLElement>(".quiz-feedback");
          if (feedback) feedback.style.display = "block";
          if (selected) {
            const opt = selected.closest<HTMLElement>(".quiz-option");
            if (opt?.dataset.type === "correct") {
              score++;
              opt.style.borderColor = "#10b981";
              opt.style.background = "#f0fdf4";
            } else if (opt) {
              opt.style.borderColor = "#ef4444";
              opt.style.background = "#fef2f2";
              const correctOpt = card.querySelector<HTMLElement>('.quiz-option[data-type="correct"]');
              if (correctOpt) { correctOpt.style.borderColor = "#10b981"; correctOpt.style.background = "#f0fdf4"; }
            }
          }
          card.querySelectorAll<HTMLInputElement>(".quiz-radio-input").forEach((r) => { r.disabled = true; });
        });
        const result = root.querySelector<HTMLElement>("#quizResult");
        if (result) result.textContent = `You scored ${score} out of ${quizCards.length}`;
        if (submitBtn) submitBtn.disabled = true;
      }, sig);
    }

    // ── Dialogue audio sidebar ──────────────────────────────────────────────
    const playBtn = root.querySelector<HTMLButtonElement>("#sidebarPlayBtn");
    const rewindBtn = root.querySelector<HTMLButtonElement>("#sidebarRewindBtn");
    const forwardBtn = root.querySelector<HTMLButtonElement>("#sidebarForwardBtn");
    const speedLabel = root.querySelector<HTMLElement>("#sidebarSpeedLabel");
    const progressFill = root.querySelector<HTMLElement>("#sidebarProgressFill");
    const msgRows = Array.from(root.querySelectorAll<HTMLElement>(".msg-row"));
    const speeds = [0.75, 1.0, 1.25, 1.5, 2.0];
    let speedIdx = 1, currentIdx = 0, playing = false;

    function updateProgress() {
      if (progressFill && msgRows.length > 0)
        progressFill.style.height = `${((currentIdx + 1) / msgRows.length) * 100}%`;
    }
    function highlight(idx: number) {
      msgRows.forEach((r, i) => r.classList.toggle("msg-playing", i === idx));
    }
    function speak(idx: number) {
      if (!window.speechSynthesis || idx < 0 || idx >= msgRows.length) return;
      window.speechSynthesis.cancel();
      const textEl = msgRows[idx].querySelector<HTMLElement>(".msg-text");
      if (!textEl) return;
      const utt = new SpeechSynthesisUtterance(textEl.textContent ?? "");
      utt.rate = speeds[speedIdx];
      utt.onend = () => {
        if (playing && idx + 1 < msgRows.length) {
          currentIdx = idx + 1; highlight(currentIdx); updateProgress(); speak(currentIdx);
        } else {
          playing = false;
          currentIdx = 0; // Reset to beginning for next play
          highlight(-1); // Clear highlight
          if (playBtn) playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px"><path d="M8 5v14l11-7z"/></svg>';
        }
      };
      window.speechSynthesis.speak(utt);
      highlight(idx); updateProgress();
    }

    if (playBtn) {
      playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px"><path d="M8 5v14l11-7z"/></svg>';
      playBtn.addEventListener("click", () => {
        playing = !playing;
        playBtn.innerHTML = playing
          ? '<svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>'
          : '<svg viewBox="0 0 24 24" fill="currentColor" style="width:20px;height:20px"><path d="M8 5v14l11-7z"/></svg>';
        if (playing) speak(currentIdx); else window.speechSynthesis?.cancel();
      }, sig);
    }
    if (rewindBtn) {
      rewindBtn.addEventListener("click", () => {
        if (currentIdx > 0) { currentIdx--; highlight(currentIdx); updateProgress(); if (playing) speak(currentIdx); }
      }, sig);
    }
    if (forwardBtn) {
      forwardBtn.addEventListener("click", () => {
        if (currentIdx < msgRows.length - 1) { currentIdx++; highlight(currentIdx); updateProgress(); if (playing) speak(currentIdx); }
      }, sig);
    }
    if (speedLabel) {
      speedLabel.addEventListener("click", () => {
        speedIdx = (speedIdx + 1) % speeds.length;
        speedLabel.textContent = `${speeds[speedIdx]}x`;
      }, sig);
    }

    cleanupRef.current = () => {
      abortCtrl.abort();
      window.speechSynthesis?.cancel();
    };

    return () => { abortCtrl.abort(); window.speechSynthesis?.cancel(); };
  }, [html]);

  const isLoading = loadingNotes || loadingHtml;

  return (
    <div className="flex flex-col bg-[#f9f5f0] dark:bg-slate-950" style={{ height: "100dvh" }}>
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => router.push("/stories")}
          className="inline-flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Stories
        </button>

        {notes.length > 1 && (
          <div className="flex gap-1 ml-4 overflow-x-auto">
            {notes.map((n, idx) => {
              const label = n.title ? (n.title.length > 22 ? n.title.slice(0, 20) + "…" : n.title) : `Part ${idx + 1}`;
              return (
                <button
                  key={n.id}
                  onClick={() => setActiveNote(n)}
                  title={n.title ?? undefined}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    activeNote?.id === n.id
                      ? "bg-slate-800 dark:bg-white text-white dark:text-slate-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        )}

        {activeNote?.title && (
          <span className="ml-auto text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-xs">
            {activeNote.title}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {isLoading && (
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        )}

        {!isLoading && error && (
          <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl mx-4 mt-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isLoading && !error && notes.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">No content available for this chapter yet.</p>
          </div>
        )}

        {!isLoading && !error && html && (
          <div
            ref={contentRef}
            className="bg-white dark:bg-slate-900"
            dangerouslySetInnerHTML={{ __html: extractBody(html) }}
          />
        )}
      </div>
    </div>
  );
}

function extractBody(fullHtml: string): string {
  const styleMatch = fullHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  const styles = styleMatch ? `<style>${styleMatch[1]}</style>` : "";
  const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const body = bodyMatch ? bodyMatch[1] : fullHtml;
  const bodyNoScripts = body.replace(/<script[\s\S]*?<\/script>/gi, "");
  return styles + bodyNoScripts;
}
