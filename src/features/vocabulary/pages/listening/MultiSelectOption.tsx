"use client";

import PracticeOptionCard from "@/components/ui/PracticeOptionCard";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { useTranslateText } from "@/hooks/useTranslateText";

type Option = { text: string; en?: string };

export default function MultiSelectOption({
  option,
  selected,
  correct,
  submitted,
  onSelect,
  onPlay,
}: {
  option: Option;
  selected: boolean;
  correct: boolean;
  submitted: boolean;
  onSelect: () => void;
  onPlay: () => void;
}) {
  const savedTranslation = option.en?.trim();
  const translation = useTranslateText(option.text, "fr", savedTranslation, "en");

  return (
    <PracticeOptionCard
      selected={selected}
      correct={correct}
      submitted={submitted}
      onSelect={onSelect}
      onSubmittedPlay={onPlay}
      submittedPlayLabel={`Play ${option.text}${correct ? ", correct answer" : selected ? ", incorrect selection" : ""}`}
      className="min-h-[96px] rounded-[18px] text-xl sm:text-2xl"
      action={submitted && (
        <TranslateButton
          iconVariant="option"
          aria-label={translation.showTranslation ? `Show original ${option.text}` : `Translate ${option.text}`}
          aria-pressed={translation.showTranslation}
          disabled={!savedTranslation}
          title={savedTranslation ? undefined : "Saved translation unavailable"}
          onClick={() => { if (savedTranslation) void translation.toggle(); }}
        />
      )}
    >
      <span lang={submitted && translation.showTranslation ? "en" : "fr"}>{submitted && translation.showTranslation ? translation.displayText : option.text}</span>
    </PracticeOptionCard>
  );
}
