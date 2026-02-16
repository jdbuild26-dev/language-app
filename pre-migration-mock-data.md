# Pre-Migration Mock Data — Vocabulary Practice Section

> This document compiles all mock data used in the vocabulary practice section **prior to the PostgreSQL migration**. It covers three categories: inline hardcoded data in components, `dummyData.js`, and local CSV files.

---

## 1. Inline Hardcoded Mock Data (in Components)

These pages had mock data directly defined in the `.jsx` files. After migration, they switched to `fetchPracticeQuestions()` or `fetchPracticeData()` API calls.

---

### 1.1 ChooseOptionGamePage — `MOCK_QUESTIONS`

**Source:** `src/features/vocabulary/pages/ChooseOptionGamePage.jsx` (commit `7c43836`)  
**Current data source:** `fetchPracticeQuestions("choose_options")`

```json
[
  {
    "id": 1,
    "question": "What is the French word for 'Dog'?",
    "correctAnswer": "Chien",
    "options": ["Chat", "Chien", "Lapin", "Oiseau"]
  },
  {
    "id": 2,
    "question": "Select the correct translation for 'House'.",
    "correctAnswer": "Maison",
    "options": ["Maison", "École", "Voiture", "Arbre"]
  },
  {
    "id": 3,
    "question": "Which word means 'Apple'?",
    "correctAnswer": "Pomme",
    "options": ["Poire", "Banane", "Pomme", "Orange"]
  },
  {
    "id": 4,
    "question": "Translate: 'Good Morning'",
    "correctAnswer": "Bonjour",
    "options": ["Bonsoir", "Salut", "Bonjour", "Au revoir"]
  },
  {
    "id": 5,
    "question": "What is 'Red' in French?",
    "correctAnswer": "Rouge",
    "options": ["Bleu", "Vert", "Jaune", "Rouge"]
  }
]
```

---

### 1.2 MatchPairsGamePage — `MOCK_DATA`

**Source:** `src/features/vocabulary/pages/MatchPairsGamePage.jsx` (commit `7c43836`)  
**Current data source:** `fetchMatchPairsData()` → `GET /api/practice/match-pairs`

```json
[
  { "id": "1", "english": "Dog", "french": "Chien", "image": null },
  { "id": "2", "english": "Cat", "french": "Chat", "image": null },
  { "id": "3", "english": "Apple", "french": "Pomme", "image": null },
  { "id": "4", "english": "Car", "french": "Voiture", "image": null },
  { "id": "5", "english": "House", "french": "Maison", "image": null },
  { "id": "6", "english": "Book", "french": "Livre", "image": null }
]
```

---

### 1.3 GroupWordsGamePage — `MOCK_LEVELS`

**Source:** `src/features/vocabulary/pages/GroupWordsGamePage.jsx` (commit `a9fc427`)  
**Current data source:** `fetchPracticeQuestions("group_words")`

```json
[
  {
    "id": 1,
    "title": "Animals vs Food",
    "groups": [
      { "id": "A", "name": "Animals", "icon": "🐶" },
      { "id": "B", "name": "Food", "icon": "🍎" }
    ],
    "items": [
      { "word": "Chien", "group": "A" },
      { "word": "Pomme", "group": "B" },
      { "word": "Chat", "group": "A" },
      { "word": "Pain", "group": "B" },
      { "word": "Oiseau", "group": "A" },
      { "word": "Fromage", "group": "B" }
    ]
  },
  {
    "id": 2,
    "title": "Masculine vs Feminine",
    "groups": [
      { "id": "A", "name": "Masculine (Le/Un)", "icon": "👨" },
      { "id": "B", "name": "Feminine (La/Une)", "icon": "👩" }
    ],
    "items": [
      { "word": "Garçon", "group": "A" },
      { "word": "Fille", "group": "B" },
      { "word": "Livre", "group": "A" },
      { "word": "Maison", "group": "B" },
      { "word": "Soleil", "group": "A" },
      { "word": "Lune", "group": "B" }
    ]
  }
]
```

---

### 1.4 HighlightWordGamePage — `MOCK_DATA`

**Source:** `src/features/vocabulary/pages/HighlightWordGamePage.jsx` (commit `a9fc427`)  
**Current data source:** `fetchPracticeQuestions("highlight_word")`

```json
[
  {
    "id": 1,
    "prompt": "Select the French word for 'Dog'",
    "sentence": "Le chien joue dans le parc.",
    "correctWord": "chien",
    "meaning": "Dog"
  },
  {
    "id": 2,
    "prompt": "Select the French word for 'Red'",
    "sentence": "Ma voiture est rouge et rapide.",
    "correctWord": "rouge",
    "meaning": "Red"
  },
  {
    "id": 3,
    "prompt": "Select the French word for 'To Eat'",
    "sentence": "J'aime manger des pommes.",
    "correctWord": "manger",
    "meaning": "To Eat"
  },
  {
    "id": 4,
    "prompt": "Select the French word for 'Happy'",
    "sentence": "Elle est très heureuse aujourd'hui.",
    "correctWord": "heureuse",
    "meaning": "Happy"
  },
  {
    "id": 5,
    "prompt": "Select the French word for 'Book'",
    "sentence": "Le livre est sur la table.",
    "correctWord": "livre",
    "meaning": "Book"
  }
]
```

---

### 1.5 OddOneOutGamePage — `MOCK_QUESTIONS`

**Source:** `src/features/vocabulary/pages/OddOneOutGamePage.jsx` (commit `a9fc427`)  
**Current data source:** `fetchPracticeQuestions("odd_one_out")`

```json
[
  {
    "id": 1,
    "words": ["Chien", "Chat", "Lapin", "Pomme"],
    "correctAnswer": "Pomme",
    "reason": "'Pomme' is a fruit, the others are animals."
  },
  {
    "id": 2,
    "words": ["Rouge", "Bleu", "Voiture", "Vert"],
    "correctAnswer": "Voiture",
    "reason": "'Voiture' is a vehicle, the others are colors."
  },
  {
    "id": 3,
    "words": ["Manger", "Boire", "Dormir", "Heureux"],
    "correctAnswer": "Heureux",
    "reason": "'Heureux' is an adjective, the others are verbs."
  },
  {
    "id": 4,
    "words": ["Lundi", "Mardi", "Janvier", "Mercredi"],
    "correctAnswer": "Janvier",
    "reason": "'Janvier' is a month, the others are days."
  },
  {
    "id": 5,
    "words": ["Un", "Deux", "Trois", "Livre"],
    "correctAnswer": "Livre",
    "reason": "'Livre' is an object, the others are numbers."
  }
]
```

---

## 2. dummyData.js — Lesson Learning Cards

**Source:** `src/features/vocabulary/components/lesson-learn/dummyData.js`  
**Used by:** `LearningCard.jsx` (development/testing only, not production)

```json
[
  {
    "id": 1,
    "english": "Dog",
    "forms": [
      {
        "word": "Chien",
        "gender": "Masculine ♂",
        "genderColor": "text-sky-500"
      },
      {
        "word": "Chienne",
        "gender": "Feminine ♀",
        "genderColor": "text-pink-500"
      }
    ],
    "image": "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&q=80&w=500",
    "exampleTarget": "Le chien caresse le quoi?",
    "phonetic": "luh shvah(n) kah-ress luh kwah?",
    "exampleNative": "The boy pets the dog?"
  },
  {
    "id": 2,
    "english": "Cat",
    "forms": [
      {
        "word": "Chat",
        "gender": "Masculine ♂",
        "genderColor": "text-sky-500"
      },
      {
        "word": "Chatte",
        "gender": "Feminine ♀",
        "genderColor": "text-pink-500"
      }
    ],
    "image": "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=500",
    "exampleTarget": "Le chat dort sur le canapé.",
    "phonetic": "luh shah dor soor luh kah-nah-pay",
    "exampleNative": "The cat sleeps on the sofa."
  },
  {
    "id": 3,
    "english": "Horse",
    "forms": [
      {
        "word": "Cheval",
        "gender": "Masculine ♂",
        "genderColor": "text-sky-500"
      }
    ],
    "image": "https://images.unsplash.com/photo-1534759846116-5799c33ce46a?auto=format&fit=crop&q=80&w=500",
    "exampleTarget": "Le cheval court vite.",
    "phonetic": "luh shuh-val koor veet",
    "exampleNative": "The horse runs fast."
  }
]
```

---

## 3. Local CSV Files (Fallback Data)

Located in `public/mock-data/`. These are used by `loadMockCSV()` as a fallback when the backend API is unreachable.

### Reading (14 files)

| File                  | Path                                         |
| --------------------- | -------------------------------------------- |
| Bubble Selection      | `practice/reading/bubble_selection.csv`      |
| Complete Passage      | `practice/reading/complete_passage.csv`      |
| Comprehension         | `practice/reading/comprehension.csv`         |
| Conversation          | `practice/reading/conversation.csv`          |
| Diagram Labelling     | `practice/reading/diagram_labelling.csv`     |
| Fill Blanks           | `practice/reading/fill_blanks.csv`           |
| Highlight Text        | `practice/reading/highlight_text.csv`        |
| Highlight Word        | `practice/reading/highlight_word.csv`        |
| Image Labelling       | `practice/reading/image_labelling.csv`       |
| Image MCQ             | `practice/reading/image_mcq.csv`             |
| Match Desc Game       | `practice/reading/match_desc_game.csv`       |
| Match Pairs           | `practice/reading/match_pairs.csv`           |
| Match Sentence Ending | `practice/reading/match_sentence_ending.csv` |
| Reading Conversation  | `practice/reading/reading_conversation.csv`  |
| Reorder               | `practice/reading/reorder.csv`               |
| Sentence Completion   | `practice/reading/sentence_completion.csv`   |
| Summary Completion    | `practice/reading/summary_completion.csv`    |
| True False            | `practice/reading/true_false.csv`            |

### Listening (9 files)

| File                    | Path                                             |
| ----------------------- | ------------------------------------------------ |
| Listen Bubble           | `practice/listening/listen_bubble.csv`           |
| Listen Fill Blanks      | `practice/listening/listen_fill_blanks.csv`      |
| Listen Interactive      | `practice/listening/listen_interactive.csv`      |
| Listen Order            | `practice/listening/listen_order.csv`            |
| Listen Passage          | `practice/listening/listen_passage.csv`          |
| Listen Select           | `practice/listening/listen_select.csv`           |
| Listen Type             | `practice/listening/listen_type.csv`             |
| Listening Comprehension | `practice/listening/listening_comprehension.csv` |
| Listening Conversation  | `practice/listening/listening_conversation.csv`  |

### Writing (4 files)

| File                 | Path                                        |
| -------------------- | ------------------------------------------- |
| Spelling             | `practice/writing/spelling.csv`             |
| Translate Typed      | `practice/writing/translate_typed.csv`      |
| Write Fill Blanks    | `practice/writing/write_fill_blanks.csv`    |
| Writing Conversation | `practice/writing/writing_conversation.csv` |

### Speaking (5 files)

| File              | Path                                      |
| ----------------- | ----------------------------------------- |
| Repeat Sentence   | `practice/speaking/repeat_sentence.csv`   |
| Speak Image       | `practice/speaking/speak_image.csv`       |
| Speak Interactive | `practice/speaking/speak_interactive.csv` |
| Speak Topic       | `practice/speaking/speak_topic.csv`       |
| Speak Translate   | `practice/speaking/speak_translate.csv`   |

### Grammar (11 files)

| File                         | Path                                       |
| ---------------------------- | ------------------------------------------ |
| Fill Blanks Options          | `grammar/fill_blanks_options.csv`          |
| Four Options                 | `grammar/four_options.csv`                 |
| Grammar Combination          | `grammar/grammar_combination.csv`          |
| Grammar Fill Blanks          | `grammar/grammar_fill_blanks.csv`          |
| Grammar Fill Blanks Question | `grammar/grammar_fill_blanks_question.csv` |
| Grammar Find Error           | `grammar/grammar_find_error.csv`           |
| Grammar Reorder              | `grammar/grammar_reorder.csv`              |
| Grammar Rewrite              | `grammar/grammar_rewrite.csv`              |
| Grammar Transformation       | `grammar/grammar_transformation.csv`       |
| Three Options                | `grammar/three_options.csv`                |
| Two Options                  | `grammar/two_options.csv`                  |

---

## 4. Pages That Never Had Inline Mock Data

These pages used `fetchPracticeQuestions()` (direct API calls) from their very first commit:

| Page                          | API Slug Called                 |
| ----------------------------- | ------------------------------- |
| `FillInBlankGamePage.jsx`     | `"C1_Writing_FITB"`             |
| `CorrectSpellingGamePage.jsx` | `"C2_Writing_Correct spelling"` |

---

## Summary

| Data Source                           | Count           | Type            |
| ------------------------------------- | --------------- | --------------- |
| Inline mock data (hardcoded in JSX)   | 5 components    | JSON objects    |
| `dummyData.js` (lesson learning)      | 1 file, 3 words | JS export       |
| Local CSV files (`public/mock-data/`) | 47 files        | CSV (PapaParse) |
| Pages with no mock data (always API)  | 2 components    | N/A             |
