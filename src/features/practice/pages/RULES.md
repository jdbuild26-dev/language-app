# Main Practice rules

These pages implement Main Practice. Vocabulary Practice lives in `src/features/vocabulary/pages/` and has a separate behavior contract. Identify the exercise from its route and page before editing. A request naming an exercise or showing its screen authorizes changes to that exercise; do not require the user to say “Main Practice.”

## Screenshot changes

1. Turn each user annotation and follow-up into a checkable requirement, including states that appear only after submission. Treat later corrections as the latest specification.
2. Inspect the named reference exercise and shared components before copying its layout or behavior. For translation work, compare `writing/TranslateTypedPage.tsx`, `listening/ListenTypePage.tsx`, and `PracticeGameLayout.tsx` as applicable. Match the relevant font size, weight, spacing, answer field, accent keys, and footer controls.
3. Review the entire interaction: initial question, typing and paste, submit, correct and incorrect feedback, every translation toggle, continue, and the next question. A visually matching initial screen alone is incomplete.
4. For this user's practice-screen work, verify through source inspection and local checks. Open a browser only if the user later explicitly asks for browser verification.

## Current writing-screen contract

- **Translate the Sentence:** The source question has font weight **500**. After submit, a translate button on the question toggles English and French; the answer area displays the correct French sentence and offers its English translation. The accent keyboard, answer field, counter, spacing, and footer follow the Listen & Type pattern where requested.
- **Fix the Spelling:** Use the shared reading exercise two-column layout. Show the incorrect French sentence and English reference in separate scrollable cards on the left, with heading dividers inset from the card edges. Give the two left cards and the right column a subtle border matching the reading exercise panels. Keep the right column as its own white panel with a rounded grey answer surface inside it. Use spacing between columns, without a center divider. Match the answer field's border, focus ring, and submitted green/red states to Listen & Type and Translate Typed; keep its grey resting fill and its specified font size, and do not add a separate hover effect. After submit, the reference shows correct French and offers an English translation toggle. Display the configured character limit beside the answer, and enforce it for typing, paste, and accent-button insertion. Keep submit, feedback, and continue controls available in the shared footer.

## Typography for these screens

Describe the Image uses an unboxed image area on the left and a bordered answer panel on the right, with a square (1:1) photo on a neutral grey left surface and a white answer area on the right. Source photos will be 1:1; display them with Next.js Image in a positioned square container, using cover fitting so the displayed photo fills the 1:1 square without stretching. Imported URLs currently load directly with unoptimized because the app has no configured remote image hosts. Keep the counter on its own row below the accent keyboard; arrange keys in twelve columns on wide screens and two balanced rows of six on smaller screens. Use the same answer typography, border, focus state, and blinking cursor as the other writing screens. Keep the existing image AI evaluation, validation messages, report, and Continue flow.

Write About Data uses exactly the Describe the Image design, with a graph replacing the image. Preserve graph labels with contain fitting inside the square frame. The user will supply the data evaluation prompts separately; do not invent or replace them during layout work.

Summarise Audio uses the listening passage layout: passage title, blue replay/play-pause/slow controls, and a blue played-progress waveform on the left; the matching writing answer field, blinking cursor, accents, and character counter on the right. Reuse shared speech playback and waveform behavior, preserving position when paused and providing replay and seeking. Submit keeps the current AI report flow; the user will supply the summary analysis prompt separately.

Write on a Topic and Write About Documents follow the supplied screenshot: a bordered objective panel on the left and a wider bordered white answer field on the right, with an inset line below OBJECTIVE, a blinking empty-field cursor, and the accent keyboard and configured character counter below the field. Use the shared practice content sizes (20/21px, weight 400), heading sizes (22/24px, weight 500), and 16px accent letters and counter. Match the Listen & Type field focus and accent-button interaction styles. Enforce the character limit for typing, paste, and accent insertion, and pause the timer during submission. Submit runs each exercise's existing AI evaluation and opens its report; retain its loading and Continue behavior and the topic exercise's retry and unavailable-content messages.

Use these effective sizes when matching or reviewing the current Translate the Sentence and Fix the Spelling screens. The first value is below the `lg` breakpoint; the second is at `lg` and wider. Keep weights with their corresponding text, and update this table when the UI specification changes. Shared role sizes come from `src/styles/globals.css`; page sizes come from the page and keyboard components. Keep the existing Noto Sans font family on Fix the Spelling.

| Text item | Size below `lg` / at `lg` | Weight |
| --- | --- | --- |
| Exercise title in the shared header | 26px / 28px | 700 |
| Question number and timer in the shared header | 12px / 14px | 600 |
| Translate the Sentence source question, including its translated state | 24px / 30px | 500 |
| Translate the Sentence answer and placeholder | 18px / 18px | 400; correct answer after submit 500 |
| Translate the Sentence accent characters | 16px / 16px | 600 |
| Translate the Sentence character counter | 14px / 14px | inherited 400 |
| Fix the Spelling panel titles | 22px / 24px | 500 |
| Fix the Spelling language labels beside panel titles | 16px / 16px | 400 |
| Fix the Spelling French and English reference text | 20px / 21px | inherited 400 |
| Fix the Spelling instruction and its translated state | 22px / 24px | 500 |
| Fix the Spelling original instruction shown beneath a translation | 16px / 16px | inherited 400 |
| Fix the Spelling answer and placeholder | 20px / 21px | 400 |
| Fix the Spelling character counter | 16px / 16px | 600 |
| Fix the Spelling accent characters | 16px / 16px | 600 |
| Shared Check, Submit Answer, Continue, and Finish labels | 14px / 16px | 700 |
| Shared feedback message and correct-answer text | 16px / 18px | message and answer 700; label 500 |

Translate icons do not contain text. Check their button and icon dimensions against the reference component rather than assigning them a font size.

Before reporting completion, check each requirement against the changed source, run the focused checks available for the edited files, and state any verification limit plainly. Keep unrelated user changes intact.

## Translate by Speaking

Use the supplied spoken-translation screenshots: plain centered source text at 24/30px weight 500, blue microphone changing to a square Stop icon, and a disabled replay control until an actual learner recording is available. Each recording has a fixed 60-second limit and stops automatically at that limit. After Submit, show the correct answer in green beneath the source, an inset horizontal rule, and the finalized recognized transcript colored by evaluation. Preserve replay and the shared Continue footer. Audio remains in browser memory only; release microphone tracks and revoke the recording URL on re-record, Next, exit, and unmount. Do not upload audio, synthesize replay from text, or show an AI report overlay for this exercise.

## Speak on a Topic and Describe the Image

Use a neutral grey two-column surface with no middle divider or right-side card. The topic objective is a white bordered card with an inset heading rule, 22/24px weight-500 heading, and 20/21px weight-400 instructions and bullets. The image is an unboxed 1:1 photo using Next Image and cover fitting. Center microphone and actual-recording replay controls on the right, using the spoken translation blue button styles and square Stop icon. Replay starts disabled. Limit each recording to exactly 60 seconds, independently of the exercise timer; stop and finalize speech before AI evaluation. Preserve existing topic and image evaluation endpoints, report, validation, completion tracking, and Continue flow. Release tracks and clear audio on re-record, context changes, Continue, and unmount.

Recording activity uses the captured microphone stream: a volume-reactive ring and five frequency bars, with a visible Recording status during silence. Stop, reset, and unmount release the analyser and AudioContext. If live monitoring is unavailable, recording and its status remain usable.
