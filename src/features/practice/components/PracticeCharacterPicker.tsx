"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import SpecialCharacterKeyboard from "./SpecialCharacterKeyboard";

type Editable = HTMLInputElement | HTMLTextAreaElement;

export default function PracticeCharacterPicker({ rootRef }: { rootRef: RefObject<HTMLDivElement | null> }) {
  const { learningLang = "fr" } = useLanguage() as { learningLang?: string };
  const [target, setTarget] = useState<Editable | null>(null);
  const caret = useRef({ start: 0, end: 0 });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const remember = () => {
      if (target && document.activeElement === target) {
        caret.current = { start: target.selectionStart ?? 0, end: target.selectionEnd ?? 0 };
      }
    };
    const onFocus = (event: FocusEvent) => {
      const field = event.target;
      if (field instanceof HTMLTextAreaElement || field instanceof HTMLInputElement) {
        if (field.matches("[data-special-characters]") && !field.disabled && !field.readOnly) {
          setTarget(field);
          caret.current = { start: field.selectionStart ?? 0, end: field.selectionEnd ?? 0 };
        } else if (!field.closest("[data-practice-character-picker]")) {
          setTarget(null);
        }
      }
    };
    root.addEventListener("focusin", onFocus);
    document.addEventListener("selectionchange", remember);
    const focused = document.activeElement;
    if (focused instanceof HTMLTextAreaElement || focused instanceof HTMLInputElement) {
      if (root.contains(focused) && focused.matches("[data-special-characters]")) {
        setTarget(focused);
      }
    }
    return () => {
      root.removeEventListener("focusin", onFocus);
      document.removeEventListener("selectionchange", remember);
    };
  }, [rootRef, target]);

  if (!target?.isConnected || target.disabled || target.readOnly) return null;

  const insert = (character: string) => {
    const { start, end } = caret.current;
    const next = target.value.slice(0, start) + character + target.value.slice(end);
    if (target.maxLength >= 0 && next.length > target.maxLength) return;
    const prototype = target instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(prototype, "value")?.set?.call(target, next);
    target.dispatchEvent(new Event("input", { bubbles: true }));
    target.focus({ preventScroll: true });
    target.setSelectionRange(start + character.length, start + character.length);
    caret.current = { start: start + character.length, end: start + character.length };
  };

  return (
    <div data-practice-character-picker className="fixed bottom-20 right-4 z-30 max-w-[min(32rem,calc(100vw-2rem))] rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-md dark:border-slate-700 dark:bg-slate-800">
      <SpecialCharacterKeyboard key={learningLang} learningLanguage={learningLang} onInsert={insert} />
    </div>
  );
}
