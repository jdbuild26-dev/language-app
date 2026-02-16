# CSV to Skill & Category Mapping

This document maps all existing mock data CSV files to their corresponding **Skill** and **Practice Category**.

## Reading (`mock-data/practice/reading/`)

| File Name                       | Activity Type       | Category       | Implementation Notes                       |
| :------------------------------ | :------------------ | :------------- | :----------------------------------------- |
| `complete_passage_dropdown.csv` | Complete Passage    | **Main**       | Cloze test with dropdowns.                 |
| `conversation.csv`              | Dialogue            | **Main**       | Reading comprehension via dialogue.        |
| `reading_conversation.csv`      | Dialogue            | **Main**       | Similar to above.                          |
| `passage_mcq.csv`               | Passage MCQ         | **Main**       | Standard reading comprehension.            |
| `summary_completion.csv`        | Summary Completion  | **Main**       | Fill in blanks to summarize text.          |
| `true_false.csv`                | True/False          | **Main**       | Verify statements based on text.           |
| `highlight_text.csv`            | Highlight Answer    | **Main**       | Find answer in text.                       |
| `match_pairs.csv`               | Match Pairs         | **Vocabulary** | Word-to-Definition or Word-to-Translation. |
| `image_mcq.csv`                 | Image MCQ           | **Vocabulary** | Match word/sentence to image.              |
| `match_desc_game.csv`           | Match Description   | **Vocabulary** | Match description to image.                |
| `highlight_word.csv`            | Highlight Word      | **Vocabulary** | Find specific word (e.g., "Find 'black'"). |
| `image_labelling.csv`           | Label Image         | **Vocabulary** | Drag labels to image parts.                |
| `reorder_sentences.csv`         | Reorder Sentences   | **Grammar**    | Sentence structure practice.               |
| `fill_blanks.csv`               | Fill in Blanks      | **Grammar**    | Cloze test (focus on grammar/vocab).       |
| `diagram_mapping.csv`           | Diagram Mapping     | **Grammar**    | often used for structural labeling.        |
| `sentence_completion.csv`       | Sentence Completion | **Grammar**    | Finish the sentence.                       |
| `translate_bubbles.csv`         | Translate (Bubbles) | **Grammar**    | Sentence construction/translation.         |
| `match_sentence_ending.csv`     | Match Endings       | **Grammar**    | Connect sentence parts.                    |

## Listening (`mock-data/practice/listening/`)

| File Name                     | Activity Type         | Category    | Implementation Notes                 |
| :---------------------------- | :-------------------- | :---------- | :----------------------------------- |
| `listen_passage.csv`          | Passage Comprehension | **Main**    | Listen to story, answer questions.   |
| `listening_comprehension.csv` | Comprehension         | **Main**    | Standard listening Q&A.              |
| `listening_conversation.csv`  | Conversation          | **Main**    | Listen to dialogue, answer Qs.       |
| `listen_interactive.csv`      | Interactive Audio     | **Main**    | Respond to audio prompts.            |
| `listen_select.csv`           | Select Correct        | **Main**    | Listen and choose correct option.    |
| `listen_type.csv`             | Dictation             | **Main**    | Type what you hear.                  |
| `listen_bubble.csv`           | Sentence Builder      | **Grammar** | Listen and build sentence (bubbles). |
| `listen_order.csv`            | Order Events          | **Grammar** | Order sentences based on audio.      |
| `listen_fill_blanks.csv`      | Audio FITB            | **Grammar** | Fill blanks based on audio.          |

## Speaking (`mock-data/practice/speaking/`)

| File Name               | Activity Type     | Category    | Implementation Notes             |
| :---------------------- | :---------------- | :---------- | :------------------------------- |
| `speak_image.csv`       | Describe Image    | **Main**    | Record description of image.     |
| `speak_topic.csv`       | Topic Talk        | **Main**    | Speak about a cohesive topic.    |
| `speak_interactive.csv` | Interactive       | **Main**    | Simulated conversation/response. |
| `repeat_sentence.csv`   | Repeat Sentence   | **Main**    | Pronunciation focus.             |
| `speak_translate.csv`   | Translate (Speak) | **Grammar** | Oral translation of sentences.   |

## Writing (`mock-data/practice/writing/`)

| File Name                       | Activity Type       | Category       | Implementation Notes          |
| :------------------------------ | :------------------ | :------------- | :---------------------------- |
| `write_analysis.csv`            | Write Analysis      | **Main**       | Describe/Analyze table/chart. |
| `write_documents.csv`           | Write Documents     | **Main**       | Email/Letter writing.         |
| `write_image.csv`               | Write Image         | **Main**       | Describe an image.            |
| `write_sentence_completion.csv` | Sentence Completion | **Main**       | Complete sentences from text. |
| `write_topic.csv`               | Write Topic         | **Main**       | Write about a topic.          |
| `writing_conversation.csv`      | Chat/Dialogue       | **Main**       | Interactive chat simulation.  |
| `spelling.csv`                  | Correct Spelling    | **Vocabulary** | Correct misspelled words.     |
| `translate_typed.csv`           | Translate (Typed)   | **Grammar**    | Translate sentence (typing).  |
| `write_fill_blanks.csv`         | Fill in Blanks      | **Grammar**    | Text entry cloze test.        |

## Grammar (`mock-data/practice/grammar/`)

| File Name                    | Activity Type       | Category    | Implementation Notes                 |
| :--------------------------- | :------------------ | :---------- | :----------------------------------- |
| `fill_blanks_options.csv`    | Fill Blanks Options | **Grammar** | Multiple choice fill-in-blanks.      |
| `grammar_find_error.csv`     | Find Error          | **Grammar** | Identify error in sentence.          |
| `four_options.csv`           | 4 Options MCQ       | **Grammar** | Standard grammar MCQ.                |
| `grammar_reorder.csv`        | Reorder Words       | **Grammar** | Unscramble sentence.                 |
| `grammar_transformation.csv` | Rewrite (Transform) | **Grammar** | Transform sentence (active/passive). |
| `grammar_combination.csv`    | Rewrite (Combine)   | **Grammar** | Combine two sentences.               |
| `grammar_rewrite.csv`        | Rewrite (Standard)  | **Grammar** | Rewrite sentence (tense change).     |
| `three_options.csv`          | 3 Options MCQ       | **Grammar** | Grammar MCQ with 3 options.          |
| `two_options.csv`            | 2 Options (T/F)     | **Grammar** | True/False or Yes/No.                |
