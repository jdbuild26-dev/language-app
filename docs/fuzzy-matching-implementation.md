# Fuzzy Matching Implementation Guide

> **Purpose**: Implement fuzzy text matching for speech recognition validation in speaking exercises.

---

## What is Fuzzy Matching?

Fuzzy matching finds strings that are **approximately equal** rather than exactly equal. This is essential for speech recognition because:

- Recognition engines mishear words
- Users have accents or pronunciation variations
- Minor differences (spaces, punctuation) shouldn't count as failures

### Example

```
Target:     "Je m'appelle Marie"
Recognized: "je mappelle marie"
Exact:      ❌ FAIL
Fuzzy:      ✅ PASS (92% similar)
```

---

## Core Algorithm: Levenshtein Distance

Measures the minimum single-character edits (insert, delete, substitute) to transform one string into another.

```javascript
/**
 * Calculate Levenshtein distance between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Edit distance
 */
export function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;

  // Create 2D array for dynamic programming
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  // Base cases
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  // Fill the matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  return dp[m][n];
}
```

---

## Similarity Score (0-100%)

Convert distance to a percentage score:

```javascript
/**
 * Calculate similarity score between two strings
 * @param {string} str1 - First string
 * @param {string} str2 - Second string
 * @returns {number} - Similarity score (0 to 1)
 */
export function getSimilarityScore(str1, str2) {
  if (str1 === str2) return 1;
  if (!str1 || !str2) return 0;

  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);

  return 1 - distance / maxLength;
}

// Example usage:
getSimilarityScore("bonjour", "bon jour"); // 0.875 (87.5%)
getSimilarityScore("merci", "merci"); // 1.0 (100%)
getSimilarityScore("chat", "chien"); // 0.4 (40%)
```

---

## Text Normalization (Critical Step)

Always normalize before comparing:

```javascript
/**
 * Normalize text for comparison
 * @param {string} text - Input text
 * @returns {string} - Normalized text
 */
export function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"«»\-]/g, "") // Remove punctuation
    .replace(/\s+/g, " ") // Normalize whitespace
    .replace(/'/g, "'"); // Normalize apostrophes
}

/**
 * Normalize with French accent removal (loose matching)
 */
export function normalizeLoose(text) {
  return normalizeText(text)
    .normalize("NFD") // Decompose accents
    .replace(/[\u0300-\u036f]/g, "") // Remove accent marks
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae");
}
```

---

## Complete Fuzzy Matcher Utility

Create `src/utils/fuzzyMatcher.js`:

```javascript
// src/utils/fuzzyMatcher.js

/**
 * Fuzzy matching utility for speech recognition validation
 */

const THRESHOLDS = {
  EXCELLENT: 0.95, // Near-perfect match
  GOOD: 0.85, // Acceptable pronunciation
  PARTIAL: 0.7, // Needs improvement
  POOR: 0.5, // Significant errors
};

function levenshteinDistance(str1, str2) {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost,
      );
    }
  }
  return dp[m][n];
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"«»\-]/g, "")
    .replace(/\s+/g, " ")
    .replace(/'/g, "'");
}

function normalizeLoose(text) {
  return normalizeText(text)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae");
}

/**
 * Compare transcript with target using fuzzy matching
 * @param {string} transcript - What was recognized
 * @param {string} target - What was expected
 * @param {object} options - Matching options
 * @returns {object} - Match result
 */
export function fuzzyMatch(transcript, target, options = {}) {
  const {
    looseAccents = true, // Ignore accent differences
    threshold = THRESHOLDS.GOOD,
  } = options;

  // Normalize both strings
  const normTranscript = looseAccents
    ? normalizeLoose(transcript)
    : normalizeText(transcript);
  const normTarget = looseAccents
    ? normalizeLoose(target)
    : normalizeText(target);

  // Check exact match first
  if (normTranscript === normTarget) {
    return {
      isMatch: true,
      score: 1,
      percentage: 100,
      rating: "excellent",
      transcript: normTranscript,
      target: normTarget,
    };
  }

  // Calculate similarity
  const distance = levenshteinDistance(normTranscript, normTarget);
  const maxLength = Math.max(normTranscript.length, normTarget.length);
  const score = maxLength > 0 ? 1 - distance / maxLength : 0;

  // Determine rating
  let rating;
  if (score >= THRESHOLDS.EXCELLENT) rating = "excellent";
  else if (score >= THRESHOLDS.GOOD) rating = "good";
  else if (score >= THRESHOLDS.PARTIAL) rating = "partial";
  else rating = "poor";

  return {
    isMatch: score >= threshold,
    score,
    percentage: Math.round(score * 100),
    rating,
    transcript: normTranscript,
    target: normTarget,
  };
}

/**
 * Word-by-word comparison for sentences
 * @param {string} transcript - What was recognized
 * @param {string} target - What was expected
 * @returns {object} - Detailed word-level results
 */
export function wordByWordMatch(transcript, target) {
  const spokenWords = normalizeLoose(transcript).split(" ").filter(Boolean);
  const targetWords = normalizeLoose(target).split(" ").filter(Boolean);

  const results = targetWords.map((targetWord, index) => {
    const spokenWord = spokenWords[index] || "";

    if (!spokenWord) {
      return { target: targetWord, spoken: "", score: 0, status: "missing" };
    }

    const distance = levenshteinDistance(spokenWord, targetWord);
    const maxLen = Math.max(spokenWord.length, targetWord.length);
    const score = maxLen > 0 ? 1 - distance / maxLen : 0;

    let status;
    if (score >= 0.9) status = "correct";
    else if (score >= 0.6) status = "partial";
    else status = "incorrect";

    return {
      target: targetWord,
      spoken: spokenWord,
      score: Math.round(score * 100),
      status,
    };
  });

  // Check for extra words spoken
  if (spokenWords.length > targetWords.length) {
    for (let i = targetWords.length; i < spokenWords.length; i++) {
      results.push({
        target: "",
        spoken: spokenWords[i],
        score: 0,
        status: "extra",
      });
    }
  }

  const correctCount = results.filter((r) => r.status === "correct").length;
  const overallScore = Math.round(
    results.reduce((sum, r) => sum + r.score, 0) / targetWords.length,
  );

  return {
    words: results,
    overallScore,
    correctCount,
    totalWords: targetWords.length,
    accuracy: Math.round((correctCount / targetWords.length) * 100),
  };
}

export { THRESHOLDS };
```

---

## Usage in Speaking Exercises

### Repeat Word Exercise

```javascript
import { fuzzyMatch } from "@/utils/fuzzyMatcher";

function validateWord(transcript, targetWord) {
  const result = fuzzyMatch(transcript, targetWord, {
    threshold: 0.8, // 80% similarity required
  });

  if (result.isMatch) {
    return {
      correct: true,
      message:
        result.rating === "excellent"
          ? "Parfait! 🎉"
          : "Bien! Keep practicing.",
      score: result.percentage,
    };
  }

  return {
    correct: false,
    message: `Try again. You said "${transcript}"`,
    score: result.percentage,
  };
}
```

### Repeat Sentence Exercise

```javascript
import { wordByWordMatch } from "@/utils/fuzzyMatcher";

function validateSentence(transcript, targetSentence) {
  const result = wordByWordMatch(transcript, targetSentence);

  // Visual feedback for each word
  const feedback = result.words.map((word) => ({
    text: word.target || word.spoken,
    className:
      word.status === "correct"
        ? "text-green-500"
        : word.status === "partial"
          ? "text-yellow-500"
          : "text-red-500",
  }));

  return {
    correct: result.accuracy >= 80,
    feedback,
    accuracy: result.accuracy,
    correctWords: result.correctCount,
    totalWords: result.totalWords,
  };
}
```

---

## Visual Word Feedback Component

```jsx
// WordFeedback.jsx
function WordFeedback({ words }) {
  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {words.map((word, index) => (
        <span
          key={index}
          className={`
            px-2 py-1 rounded font-medium
            ${word.status === "correct" && "bg-green-100 text-green-700"}
            ${word.status === "partial" && "bg-yellow-100 text-yellow-700"}
            ${word.status === "incorrect" && "bg-red-100 text-red-700"}
            ${word.status === "missing" && "bg-gray-100 text-gray-400 line-through"}
            ${word.status === "extra" && "bg-purple-100 text-purple-700 italic"}
          `}
          title={
            word.status === "partial" ? `${word.score}% similar` : word.status
          }
        >
          {word.target || word.spoken}
        </span>
      ))}
    </div>
  );
}
```

---

## Recommended Thresholds

| Exercise Type   | Threshold | Rationale                             |
| --------------- | --------- | ------------------------------------- |
| Repeat Word     | 80%       | Single word should be fairly accurate |
| Repeat Sentence | 75%       | Allow for natural speech variations   |
| Read Aloud      | 85%       | Reading should be more precise        |
| Conversation    | 70%       | Meaning matters more than exactness   |

---

## Quick Reference

```javascript
// Import
import { fuzzyMatch, wordByWordMatch, THRESHOLDS } from "@/utils/fuzzyMatcher";

// Single word/phrase
const result = fuzzyMatch("bonjour", "bon jour");
// { isMatch: true, percentage: 87, rating: 'good' }

// Sentence with word details
const sentenceResult = wordByWordMatch("je suis marie", "Je suis Marie");
// { accuracy: 100, correctCount: 3, words: [...] }
```

---

_Document created: January 31, 2026_
