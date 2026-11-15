"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import PracticeGameLayout from "@/components/layout/PracticeGameLayout";
import AudioWaveform from "@/components/ui/AudioWaveform";
import PracticeOptionCard from "@/components/ui/PracticeOptionCard";
import { TranslateButton } from "@/components/ui/TranslateButton";
import { useLanguage } from "@/contexts/LanguageContext";
import { useExerciseTimer } from "@/hooks/useExerciseTimer";
import { usePracticeComplete } from "@/hooks/usePracticeComplete";
import { useQuestionLanguage } from "@/hooks/useQuestionLanguage";
import { usePracticeExit } from "@/hooks/usePracticeExit";
import { useTextToSpeech } from "@/hooks/useTextToSpeech";
import { cn } from "@/lib/utils";
import { loadMockCSV } from "@/utils/csvLoader";
import { fetchPracticeData } from "@/utils/practiceFetcher";
import PracticeTwoPanel from "./PracticeTwoPanel";
import { readRunningConversation, type RunningConversationData } from "../lib/runningConversation";

type Mode = "reading" | "listening";
type Reply = { selected: string | null; expired: boolean };
type Copy = RunningConversationData["objective"];

const panelClass = "practice-comprehension-scroll min-h-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 practice-type-content dark:border-slate-700 dark:bg-slate-900";
const bubbleClass = "min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-left dark:border-slate-700";
const objectiveClass = cn(bubbleClass, "bg-slate-50 practice-type-content leading-relaxed dark:bg-slate-800 [&>div>button]:self-start");

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

function Translatable({ copy, target, audio, enabled, label }: {
  copy: Copy; target: string; audio?: (copy: Copy) => void; enabled: boolean; label: string;
}) {
  const [translated, setTranslated] = useState(false);
  const savedTranslation = copy.translation.trim();
  const showTranslation = translated && Boolean(savedTranslation);
  const displayed = showTranslation
    ? { text: savedTranslation, translation: copy.text, language: target }
    : copy;
  const showToggle = enabled && Boolean(copy.text) && copy.language !== target;
  return <div className="flex min-w-0 items-center gap-2">
    {audio ? (
      <button type="button" onClick={() => audio(displayed)} className="-my-2.5 min-w-0 flex-1 self-stretch px-3 py-2.5 text-left whitespace-pre-wrap break-words"
        aria-label={`Play ${label}: ${displayed.text}`}>
        {displayed.text}
      </button>
    ) : (
      <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">{displayed.text}</span>
    )}
    {showToggle && <TranslateButton onClick={() => setTranslated(value => !value)} disabled={!savedTranslation}
      title={savedTranslation ? undefined : "Saved translation unavailable"}
      aria-label={showTranslation ? `Show original ${label}` : `Translate ${label}`}
      aria-pressed={showTranslation} />}
  </div>;
}

function ResponseOption({ copy, target, index, selected, correct, submitted, audioOnly, playing, pattern, onSelect, onPlay }: {
  copy: Copy; target: string; index: number; selected: boolean; correct: boolean; submitted: boolean;
  audioOnly: boolean; playing: boolean; pattern: string; onSelect: () => void; onPlay: (copy: Copy) => void;
}) {
  const [translated, setTranslated] = useState(false);
  const savedTranslation = copy.translation.trim();
  const showTranslation = submitted && translated && Boolean(savedTranslation);
  const displayed = showTranslation
    ? { text: savedTranslation, translation: copy.text, language: target }
    : copy;
  const label = `response option ${index + 1}`;
  const result = correct ? ", correct" : selected ? ", incorrect" : "";
  return (
    <div className="min-w-0">
      <PracticeOptionCard
        variant="row"
        className="min-h-11 py-2.5 font-normal"
        selected={selected}
        correct={correct}
        submitted={submitted}
        onSelect={() => { onSelect(); onPlay(copy); }}
        onSubmittedPlay={() => onPlay(audioOnly ? copy : displayed)}
        submittedPlayLabel={`Play ${audioOnly ? label : displayed.text}${result}`}
        leading={submitted && correct ? <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
          : submitted && selected ? <XCircle className="h-5 w-5 shrink-0" aria-hidden="true" />
          : <span aria-hidden="true" className={cn("size-4 shrink-0 rounded-full border", selected ? "border-[5px] border-sky-500" : "border-slate-400")} />}
        action={submitted && copy.language !== target ? (
          <TranslateButton onClick={() => setTranslated(value => !value)} disabled={!savedTranslation}
            title={savedTranslation ? undefined : "Saved translation unavailable"}
            aria-label={showTranslation ? `Show original ${label}` : `Translate ${label}`}
            aria-pressed={showTranslation} />
        ) : undefined}
      >
        {audioOnly ? <>
          <span className="sr-only">Play {label}</span>
          <span className="min-w-0 flex-1"><AudioWaveform decorative patternKey={pattern} isPlaying={playing} className="w-full !min-w-0" /></span>
          {showTranslation && <span className="min-w-0 break-words">{displayed.text}</span>}
        </> : <span className="min-w-0 break-words">{displayed.text}</span>}
      </PracticeOptionCard>
    </div>
  );
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
    if (dialogue) dialogue.scrollTop = review ? 0 : dialogue.scrollHeight;
  }, [conversationIndex, replies.length, review]);

  const { objective, title } = conversation;
  const translationTarget = (copy: Copy) => copy.language === knownLang ? learningLang : knownLang;
  const readingQuestion = (copy: Copy): Copy =>
    showQuestionInKnown && copy.translation && copy.language !== knownLang
      ? { text: copy.translation, translation: copy.text, language: knownLang }
      : copy;
  const correct = pending?.selected === turn?.correctId;
  const renderBubble = (copy: Copy, key: string, label: string, appearance: "speaker" | "reply" | "correct" | "incorrect" = "speaker") => {
    if (!copy.text) return null;
    return <div className={cn(bubbleClass, "max-w-[92%] px-0 practice-type-content", !audioOnly && "w-fit",
      appearance === "speaker" ? "mr-auto bg-slate-50 dark:bg-slate-800" : "ml-auto",
      appearance === "reply" && "bg-teal-50 dark:bg-teal-950/50",
      appearance === "correct" && "border-emerald-300 bg-emerald-100 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-100",
      appearance === "incorrect" && "border-red-300 bg-red-100 text-red-950 dark:border-red-700 dark:bg-red-950 dark:text-red-100")}>
      {audioOnly ? <button type="button" className="-my-2.5 block w-full cursor-pointer rounded-xl px-3 py-2.5 text-left hover:bg-sky-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 dark:hover:bg-sky-950/40" onClick={() => play(key, copy)} aria-label={`Play ${label}`}>
        <AudioWaveform decorative patternKey={key} isPlaying={isSpeaking && playing === key} className="w-full !min-w-0" />
      </button> : <Translatable copy={copy} target={translationTarget(copy)} audio={displayed => play(key, displayed)} enabled={review} label={label} />}
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
      {renderBubble(entry.speaker.text ? entry.speaker : entry.question, `speaker-${index}`, `speaker, turn ${index + 1}`, entry.options.length === 0 && secondSpeaker ? "reply" : "speaker")}
      {review && question.text && entry.speaker.text && question.text !== entry.speaker.text
        && question.translation !== entry.speaker.text && entry.speaker.translation !== question.text
        && renderBubble(question, `question-${index}`, `question ${index + 1}`)}
      {answer && renderBubble(answer.label, `reply-${index}`, `your reply, turn ${index + 1}`, answer.id === expected?.id ? "correct" : "incorrect")}
      {!reply && entry.options.length > 0 && <div aria-label="Pending reply" className={cn(bubbleClass, "ml-auto h-8 w-24 border-dashed bg-slate-50 dark:bg-slate-800")} />}
      {reply && expected && reply.selected !== expected.id && (
        renderBubble(expected.label, `correct-${index}`, `correct reply, turn ${index + 1}`, "correct")
      )}
    </div>;
  };
  return (
    <PracticeGameLayout key={conversationIndex} questionType={listening ? "Listening Conversation" : "Running Conversation"}
      instructionFr={title.text || conversation.headingFr || "Conversation continue"}
      instructionEn={title.text ? title.translation : conversation.headingEn || "Running Conversation"}
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
      {review ? <section key={conversationIndex} className="flex min-h-0 w-full flex-1 flex-col gap-3 p-3" aria-label="Conversation review">
        {objective.text && <div className={objectiveClass}><Translatable copy={objective} target={translationTarget(objective)} enabled label="objective" /></div>}
        <section ref={dialogueRef} className={cn(panelClass, "flex-1 space-y-5")} aria-label="Transcript">
          {conversation.turns.map((entry, index) => renderTurn(entry, index, replies[index]))}
        </section>
      </section> : (
        <PracticeTwoPanel key={conversationIndex}>
          <section ref={dialogueRef} className={cn(panelClass, "space-y-4")} aria-label="Dialogue">
            {replies.map((reply, index) => renderTurn(conversation.turns[index], index, reply))}
            {renderTurn(turn, replies.length)}
          </section>
          <section className={cn(panelClass, "space-y-3")} aria-label="Response options">
            {objective.text && <div className={objectiveClass}>
              <Translatable copy={objective} target={translationTarget(objective)} enabled label="objective" />
            </div>}
            {turn.options.length > 0 && <>
              <h2 className="practice-type-content font-normal !leading-relaxed">
                {listening ? "Select the best response" : readingQuestion(turn.question).text || "Select the best response"}
              </h2>
              <div key={replies.length} className="grid gap-2">
                {turn.options.map((option, index) => {
                  const key = `option-${replies.length}-${option.id}`;
                  return <ResponseOption
                    key={option.id}
                    index={index}
                    copy={option.label}
                    target={translationTarget(option.label)}
                    selected={(pending ? pending.selected : selected) === option.id}
                    correct={option.id === turn.correctId}
                    submitted={pending !== null}
                    audioOnly={audioOnly}
                    playing={isSpeaking && playing === key}
                    pattern={key}
                    onSelect={() => setSelected(option.id)}
                    onPlay={copy => play(key, copy)}
                  />;
                })}
              </div>
            </>}
          </section>
        </PracticeTwoPanel>
      )}
    </PracticeGameLayout>
  );
}
