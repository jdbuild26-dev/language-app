"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { cn } from "@/lib/utils";

export function AnswerInstruction({ original, translation, htmlFor, id }: {
  original: string;
  translation?: string;
  htmlFor?: string;
  id?: string;
}) {
  const [translated, setTranslated] = useState(false);
  const showTranslation = translated && Boolean(translation);
  const text = (showTranslation ? translation : original) || translation;
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-slate-200 px-3 py-2 dark:border-slate-700">
      {original && translation && (
        <TranslateButton aria-label="Toggle answer instruction translation" aria-pressed={translated}
          onClick={() => setTranslated(value => !value)} />
      )}
      {htmlFor ? <label className="practice-type-content font-medium" htmlFor={htmlFor}>{text}</label>
        : <p id={id} className="practice-type-content font-medium">{text}</p>}
    </div>
  );
}

export function TopicPromptPanel({ task }: { task: {
  main_instruction_fr: string; main_instruction_en: string;
  topic_bullets_fr: string[]; topic_bullets_en: string[];
} }) {
  const [translated, setTranslated] = useState(false);
  const canTranslate = Boolean(task.main_instruction_fr && task.main_instruction_en)
    && (!task.topic_bullets_fr.length || Boolean(task.topic_bullets_en.length));
  const main = translated ? task.main_instruction_en : task.main_instruction_fr || task.main_instruction_en;
  const bullets = translated || !task.topic_bullets_fr.length ? task.topic_bullets_en : task.topic_bullets_fr;
  return (
    <section aria-label="Task context"
      className="practice-comprehension-scroll min-h-0 min-w-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white px-5 py-4 dark:border-slate-700 dark:bg-slate-900 [scrollbar-gutter:stable]">
      <div className="flex items-start gap-2">
        <p className="practice-passage-content practice-type-content min-w-0 flex-1 whitespace-pre-wrap break-words">{main}</p>
        {canTranslate && <TranslateButton aria-label="Toggle task and topic points translation" aria-pressed={translated}
          onClick={() => setTranslated(value => !value)} />}
      </div>
      {bullets.length > 0 && <ul className="practice-type-content mt-6 list-disc space-y-2 break-words pl-6 marker:text-slate-400">
        {bullets.map((bullet, index) => <li key={index}>{bullet}</li>)}
      </ul>}
    </section>
  );
}

export function ImagePromptPanel({ src, fillPanel = false }: { src: string; fillPanel?: boolean }) {
  return (
    <section aria-label="Exercise image"
      className={cn("flex min-h-0 min-w-0 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900",
        fillPanel && src ? "overflow-hidden p-3" : "p-3 sm:p-4")}>
      {src ? <div className={cn("relative aspect-video w-full",
        fillPanel ? "overflow-hidden rounded-xl md:aspect-auto md:self-stretch" : "max-w-[min(100%,calc((100dvh-15rem)*16/9))] overflow-hidden rounded-xl")}>
        <Image src={src} alt="Image to describe" fill sizes="(min-width: 768px) 60vw, 90vw" unoptimized
          className={fillPanel ? "object-cover" : "object-contain"} />
      </div> : <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-slate-400">
        <ImageIcon className="h-20 w-20" aria-hidden="true" />
        <p className="practice-type-content">Image not yet uploaded</p>
      </div>}
    </section>
  );
}
