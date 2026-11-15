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
  const translation = useTranslateText(option.text, "fr", option.en, "en");

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
          aria-label={translation.showTranslation ? `Hide translation for ${option.text}` : `Translate ${option.text}`}
          aria-pressed={translation.showTranslation}
          isLoading={translation.isTranslating}
          onClick={() => { void translation.toggle(); }}
        />
      )}
    >
      <span>{option.text}</span>
      {submitted && translation.showTranslation && (
        <span lang="en" className="mt-1 text-sm font-normal opacity-80">{translation.displayText}</span>
      )}
      {submitted && translation.error && (
        <span role="status" className="mt-1 text-sm font-normal">{translation.error}</span>
      )}
    </PracticeOptionCard>
  );
}
