"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import AudioWaveform from "@/components/ui/AudioWaveform";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { useQuestionLanguage } from "@/hooks/useQuestionLanguage";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { useTranslateText } from "@/hooks/useTranslateText";
import { cn } from "@/lib/utils";
import { loadMockCSV } from "@/utils/csvLoader";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import PracticeTwoPanel from "./PracticeTwoPanel";
import { readRunningConversation, type RunningConversationData } from "../lib/runningConversation";

type Mode = "reading" | "listening";
type Reply = { selected: string | null; expired: boolean };
type Copy = RunningConversationData["objective"];

const panelClass = "practice-comprehension-scroll min-h-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900";
const bubbleClass = "min-w-0 rounded-2xl border border-slate-200 px-4 py-3 text-left dark:border-slate-700";

function Loading() {
  return <div className="grid min-h-screen place-items-center"><Loader2 className="h-8 w-8 animate-spin text-sky-500" aria-label="Loading conversation" /></div>;
}

export default function RunningConversation({ mode }: { mode: Mode }) {
  return <Suspense fallback={<Loading />}><ConversationLoader mode={mode} /></Suspense>;
}

function ConversationLoader({ mode }: { mode: Mode }) {
  const tag = useSearchParams()?.get("tag") ?? undefined;
  const { learningLang = "fr", knownLang = "en" } = useLanguage();
  const requestKey = JSON.stringify([mode, tag, learningLang, knownLang]);
  const [loaded, setLoaded] = useState<{ key: string; conversations: RunningConversationData[] }>();
  const exit = usePracticeExit();

  useEffect(() => {
    let active = true;
    const options = { tag, learningLang, knownLang };
    const request = mode === "reading"
      ? loadMockCSV("practice/reading/reading_conversation.csv", options)
      : fetchPracticeData("listening_conversation", options);
    request.then(data => {
      const conversations = data.map(item => readRunningConversation(item, learningLang, knownLang))
        .filter(item => item.turns.length > 0);
      if (active) setLoaded({ key: requestKey, conversations });
    }).catch(error => {
      console.error("Failed to load running conversations", error);
      if (active) setLoaded({ key: requestKey, conversations: [] });
    });
    return () => { active = false; };
  }, [requestKey, tag, learningLang, knownLang, mode]);

  if (loaded?.key !== requestKey) return <Loading />;
  if (!loaded.conversations.length) {
    return <div className="grid min-h-screen place-content-center gap-4 text-center">
      <p>No conversations available.</p>
      <button type="button" className="underline" onClick={() => exit()}>Back to Practice</button>
    </div>;
  }
  return <ConversationSession key={requestKey} conversations={loaded.conversations} mode={mode} learningLang={learningLang} knownLang={knownLang} />;
}

function Translatable({ copy, target, audio, audioOnly, enabled, label }: {
  copy: Copy; target: string; audio?: () => void; audioOnly?: boolean; enabled: boolean; label: string;
}) {
  const translation = useTranslateText(enabled ? copy.text : "", copy.language, copy.translation, target);
  const showToggle = enabled && Boolean(copy.text) && copy.language !== target;
  return <div className="flex min-w-0 items-center gap-2">
    {audio && !audioOnly ? (
      <button type="button" onClick={audio} className="-my-3 min-w-0 flex-1 self-stretch px-4 py-3 text-left whitespace-pre-wrap break-words"
        aria-label={`Play ${label}: ${translation.displayText || copy.text}`}>
        {translation.displayText || copy.text}
      </button>
    ) : !audioOnly ? (
      <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">{translation.displayText || copy.text}</span>
    ) : translation.showTranslation ? (
      <span className="min-w-0 flex-1 break-words">{translation.displayText}</span>
    ) : null}
    {showToggle && <TranslateButton onClick={translation.toggle} isLoading={translation.isTranslating}
      aria-label={translation.showTranslation ? `Show original ${label}` : `Translate ${label}`}
      aria-pressed={translation.showTranslation} />}
    {translation.error && <span role="status" className="text-xs text-red-700 dark:text-red-300">{translation.error}</span>}
  </div>;
}

function ConversationSession({ conversations, mode, learningLang, knownLang }: {
  conversations: RunningConversationData[]; mode: Mode; learningLang: string; knownLang: string;
}) {
  const exit = usePracticeExit();
  const { speak, stop, isSpeaking } = useTextToSpeech();
  const [playing, setPlaying] = useState("");
  const [conversationIndex, setConversationIndex] = useState(0);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [pending, setPending] = useState<Reply | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const conversation = conversations[conversationIndex];
  const turn = conversation.turns[replies.length];
  const review = !turn;
  const dialogueRef = useRef<HTMLElement>(null);
  const { showQuestionInKnown } = useQuestionLanguage(conversation.level);
  const listening = mode === "listening";
  const audioOnly = listening && !review;
  const totalQuestions = conversations.reduce((count, item) => count + item.turns.filter(entry => entry.options.length).length, 0);
  const lastConversation = conversationIndex === conversations.length - 1;
  const exerciseType = listening ? "listening_conversation" : "conversation_dialogue";
  usePracticeComplete({ isGameOver: finished, score, totalQuestions, exerciseType, level: conversation.level });

  const resetPlayback = () => { stop(); setPlaying(""); };
  const play = (key: string, copy: Copy) => {
    if (!copy.text) return;
    setPlaying(key);
    speak(copy.text, copy.language);
  };
  const { timerString, resetTimer } = useExerciseTimer({
    duration: 45,
    mode: "timer",
    isPaused: review || pending !== null || !turn?.options.length || finished,
    onExpire: () => setPending(reply => reply ?? { selected: null, expired: true }),
  });
  useEffect(() => { resetTimer(); }, [conversationIndex, resetTimer]);
  function advance() {
    resetPlayback();
    if (review) {
      if (lastConversation) setFinished(true);
      else { setConversationIndex(index => index + 1); setReplies([]); }
    } else if (pending || !turn.options.length) {
      if (pending?.selected === turn.correctId) setScore(value => value + 1);
      setReplies(previous => [...previous, pending ?? { selected: null, expired: false }]);
      setPending(null);
      setSelected(null);
      resetTimer();
    } else if (selected !== null) {
      setPending(reply => reply ?? { selected, expired: false });
    }
  }
  function restart() {
    resetPlayback();
    setConversationIndex(0);
    setReplies([]);
    setSelected(null);
    setPending(null);
    setScore(0);
    setFinished(false);
    resetTimer();
  }

  useEffect(() => {
    const dialogue = dialogueRef.current;
    if (dialogue) dialogue.scrollTop = dialogue.scrollHeight;
  }, [conversationIndex, replies.length]);

  const objective = conversation.objective.text ? conversation.objective : conversation.title;
  const translationTarget = (copy: Copy) => copy.language === knownLang ? learningLang : knownLang;
  const readingQuestion = (copy: Copy): Copy =>
    showQuestionInKnown && copy.translation && copy.language !== knownLang
      ? { text: copy.translation, translation: copy.text, language: knownLang }
      : copy;
  const correct = pending?.selected === turn?.correctId;
  const renderBubble = (copy: Copy, key: string, label: string, reply = false) => {
    if (!copy.text) return null;
    return <div className={cn(bubbleClass, "max-w-[92%] px-0", reply ? "ml-auto bg-teal-50 dark:bg-teal-950/50" : "mr-auto bg-slate-50 dark:bg-slate-800")}>
      {audioOnly ? <button type="button" className="-my-3 block w-full px-4 py-3 text-left" onClick={() => play(key, copy)} aria-label={`Play ${label}`}>
        <AudioWaveform size="compact" decorative patternKey={key} isPlaying={isSpeaking && playing === key} />
      </button> : <Translatable copy={copy} target={translationTarget(copy)} audio={() => play(key, copy)} enabled={review} label={label} />}
    </div>;
  };
  const renderTurn = (entry: RunningConversationData["turns"][number], index: number, reply?: Reply) => {
    const answer = entry.options.find(option => option.id === reply?.selected);
    const expected = entry.options.find(option => option.id === entry.correctId);
    const question = listening ? entry.question : readingQuestion(entry.question);
    const secondSpeaker = entry.speakerName && entry.speakerName !== conversation.turns[0].speakerName;
    return <div key={index} className="space-y-2">
      {(!audioOnly && entry.options.length === 0 && entry.speakerName) && (
        <p className={cn("px-3 text-sm text-slate-600 dark:text-slate-300", secondSpeaker && "text-right")}>{entry.speakerName}</p>
      )}
      {renderBubble(entry.speaker, `speaker-${index}`, `speaker, turn ${index + 1}`, entry.options.length === 0 && Boolean(secondSpeaker))}
      {review && question.text && <div className="px-3 text-sm">
        <Translatable copy={question} target={translationTarget(question)} enabled label={`question ${index + 1}`} />
      </div>}
      {answer && renderBubble(answer.label, `reply-${index}`, `your reply, turn ${index + 1}`, true)}
      {!reply && entry.options.length > 0 && <div aria-label="Pending reply" className={cn(bubbleClass, "ml-auto h-11 w-28 border-dashed bg-slate-50 dark:bg-slate-800")} />}
      {review && reply && expected && reply.selected !== expected.id && (
        <div className="ml-4 border-l-2 border-emerald-400 pl-3 text-emerald-800 dark:text-emerald-300">
          <p className="text-sm font-medium">Correct response</p>
          {renderBubble(expected.label, `correct-${index}`, `correct reply, turn ${index + 1}`, true)}
        </div>
      )}
    </div>;
  };
  return (
    <PracticeGameLayout questionType={listening ? "Listening Conversation" : "Running Conversation"}
      instructionFr={conversation.headingFr || "Conversation continue"} instructionEn={conversation.headingEn || "Running Conversation"}
      onExit={() => { resetPlayback(); exit(); }} onNext={advance} onRestart={restart}
      progress={finished ? 100 : ((conversationIndex + (review ? 1 : replies.length / conversation.turns.length)) / conversations.length) * 100}
      currentQuestionIndex={conversationIndex} headerTotalQuestions={conversations.length}
      totalQuestions={totalQuestions} score={score} isGameOver={finished}
      timerValue={turn?.options.length ? timerString : ""}
      isSubmitEnabled={review || Boolean(pending) || !turn?.options.length || selected !== null}
      showFeedback={pending !== null} isCorrect={correct}
      feedbackMessage={pending?.expired ? "Time’s up" : correct ? "Correct" : "Incorrect"}
      submitLabel={review ? (lastConversation ? "Finish" : "Next conversation") : pending || !turn.options.length ? "Continue" : "Submit Answer"}
      disableContentScrollOnDesktop>
      {review ? <section key={conversationIndex} className="mx-auto w-full max-w-3xl space-y-4 overflow-y-auto p-4" aria-label="Conversation review">
        <h2 className="text-center text-xl font-medium">Conversation review</h2>
        {objective.text && <div className={bubbleClass}><Translatable copy={objective} target={translationTarget(objective)} enabled label="objective" /></div>}
        <div className={cn(panelClass, "space-y-5")}>
          {conversation.turns.map((entry, index) => renderTurn(entry, index, replies[index]))}
        </div>
      </section> : (
        <PracticeTwoPanel key={conversationIndex}>
          <section ref={dialogueRef} className={cn(panelClass, "space-y-4")} aria-label="Dialogue">
            {replies.map((reply, index) => renderTurn(conversation.turns[index], index, reply))}
            {renderTurn(turn, replies.length)}
          </section>
          <section className={cn(panelClass, "space-y-4")} aria-label="Response options">
            {objective.text && <div className={cn(bubbleClass, "bg-slate-50 dark:bg-slate-800")}>
              <Translatable copy={objective} target={translationTarget(objective)} enabled label="objective" />
            </div>}
            {turn.options.length > 0 && <>
              <h2 className="practice-reading-heading text-lg font-medium">
                {listening ? "Select the best response" : readingQuestion(turn.question).text || "Select the best response"}
              </h2>
              <div key={replies.length} className="grid gap-3">
                {turn.options.map((option, index) => {
                  const active = (pending ? pending.selected : selected) === option.id;
                  const right = pending && option.id === turn.correctId;
                  const wrong = pending && pending.selected === option.id && !right;
                  const key = `option-${replies.length}-${option.id}`;
                  return <div key={option.id} className={cn("flex min-w-0 flex-wrap items-center gap-2", bubbleClass, audioOnly && "px-0",
                    right && "border-emerald-400 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
                    wrong && "border-red-400 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-200",
                    !pending && active && "border-sky-500 bg-sky-50 dark:bg-sky-950")}>
                    {(audioOnly || !pending) && <button type="button" aria-label={audioOnly ? `Play response option ${index + 1}${right ? ", correct" : wrong ? ", incorrect" : ""}` : undefined}
                      aria-pressed={active} className={cn("min-w-0 flex-1 text-left", audioOnly && "-my-3 px-4 py-3")} onClick={() => {
                        if (!pending) setSelected(option.id);
                        if (audioOnly) play(key, option.label);
                      }}>
                      <span className="flex items-center gap-3">
                        {right ? <Check aria-hidden="true" className="size-4 shrink-0" /> : wrong ? <X aria-hidden="true" className="size-4 shrink-0" /> : (
                          <span aria-hidden="true" className={cn("size-4 shrink-0 rounded-full border", active ? "border-[5px] border-sky-500" : "border-slate-400")} />
                        )}
                        {audioOnly ? <AudioWaveform size="compact" decorative patternKey={key} isPlaying={isSpeaking && playing === key} /> : option.label.text}
                      </span>
                    </button>}
                    {!audioOnly && right && <Check className="size-4 shrink-0" aria-label="Correct response" />}
                    {!audioOnly && wrong && <X className="size-4 shrink-0" aria-label="Incorrect response" />}
                    {pending && <div className={audioOnly ? "min-w-0" : "min-w-0 flex-1"}>
                      <Translatable copy={option.label} target={translationTarget(option.label)} audioOnly={audioOnly} enabled label={`option ${index + 1}`} />
                    </div>}
                  </div>;
                })}
              </div>
            </>}
          </section>
        </PracticeTwoPanel>
      )}
    </PracticeGameLayout>
  );
}
