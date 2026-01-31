# Speaking Exercises with WebkitSpeechRecognition - Research Document

> **Purpose**: Comprehensive research on implementing speaking exercises for French language learning using the Web Speech API (webkitSpeechRecognition), including types of exercises, accuracy improvement techniques, and implementation strategies.

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Types of Speaking Exercises](#types-of-speaking-exercises)
3. [WebkitSpeechRecognition API Overview](#webkitspeechrecognition-api-overview)
4. [Improving Recognition Accuracy](#improving-recognition-accuracy)
5. [French Language Specific Considerations](#french-language-specific-considerations)
6. [Pronunciation Scoring Algorithms](#pronunciation-scoring-algorithms)
7. [Implementation Recommendations](#implementation-recommendations)
8. [Browser Compatibility & Limitations](#browser-compatibility--limitations)
9. [Alternative/Supplementary Solutions](#alternativesupplementary-solutions)
10. [References](#references)

---

## Executive Summary

The Web Speech API (`webkitSpeechRecognition`) provides a browser-native solution for speech recognition that can power various speaking exercises. While convenient and cost-effective, its accuracy for non-native speakers (especially French) can be limited. This document outlines:

- **8 types** of speaking exercises suitable for language learning
- **15+ techniques** to improve recognition accuracy
- **French-specific** optimizations
- **Pronunciation scoring** approaches
- **Implementation strategies** for our language learning app

---

## Types of Speaking Exercises

### 1. 🔤 Repeat Word (Currently Implemented)

**Description**: User repeats a single vocabulary word after hearing it.

| Aspect                 | Details                                      |
| ---------------------- | -------------------------------------------- |
| Complexity             | Low                                          |
| Recognition Difficulty | Low (single word)                            |
| Best For               | Vocabulary practice, basic pronunciation     |
| Implementation         | Compare transcribed word against target word |

### 2. 📝 Repeat Sentence (Planned)

**Description**: User repeats a complete sentence after hearing it.

| Aspect                 | Details                                      |
| ---------------------- | -------------------------------------------- |
| Complexity             | Medium                                       |
| Recognition Difficulty | Medium-High                                  |
| Best For               | Fluency, rhythm, intonation practice         |
| Implementation         | Full sentence comparison with fuzzy matching |

### 3. 🎯 Read Aloud / Oral Reading Fluency (ORF)

**Description**: User reads a passage or text displayed on screen.

| Aspect                 | Details                                               |
| ---------------------- | ----------------------------------------------------- |
| Complexity             | Medium                                                |
| Recognition Difficulty | Medium                                                |
| Best For               | Reading fluency, pronunciation accuracy               |
| Metrics                | Reading accuracy, speaking rate, pausing, hesitations |

### 4. 💬 Conversational Simulations / Role-Playing

**Description**: User responds to AI prompts in realistic dialogue scenarios.

| Aspect                 | Details                          |
| ---------------------- | -------------------------------- |
| Complexity             | High                             |
| Recognition Difficulty | High (open-ended)                |
| Best For               | Real-world communication skills  |
| Implementation         | LLM-assisted response validation |

### 5. 🎤 Dictation Exercises

**Description**: User speaks a given text, and the system transcribes and compares.

| Aspect                 | Details                                         |
| ---------------------- | ----------------------------------------------- |
| Complexity             | Low-Medium                                      |
| Recognition Difficulty | Medium                                          |
| Best For               | Connecting spoken sounds with written forms     |
| Implementation         | Side-by-side comparison of transcript vs target |

### 6. 🔊 Minimal Pair Games

**Description**: User distinguishes and pronounces similar-sounding words (e.g., "poisson" vs "poison").

| Aspect                 | Details                                 |
| ---------------------- | --------------------------------------- |
| Complexity             | Low                                     |
| Recognition Difficulty | High (subtle differences)               |
| Best For               | Phonetic accuracy, sound discrimination |
| Implementation         | Precise phoneme detection required      |

### 7. 🌐 Speech-Enabled Translation

**Description**: User speaks a word/phrase in French, system translates back to English to verify.

| Aspect                 | Details                            |
| ---------------------- | ---------------------------------- |
| Complexity             | Medium                             |
| Recognition Difficulty | Medium                             |
| Best For               | Verifying communication accuracy   |
| Implementation         | STT → Translation API verification |

### 8. 🗣️ Open-Ended Speaking (Spontaneous Speech)

**Description**: User speaks freely on a topic with assessment of grammar, vocabulary, and pronunciation.

| Aspect                 | Details                          |
| ---------------------- | -------------------------------- |
| Complexity             | Very High                        |
| Recognition Difficulty | Very High                        |
| Best For               | Advanced fluency practice        |
| Implementation         | LLM-assisted evaluation required |

---

## WebkitSpeechRecognition API Overview

### Core Properties

```javascript
const recognition = new webkitSpeechRecognition();

// Essential Configuration
recognition.lang = "fr-FR"; // French (France)
recognition.continuous = true; // Keep listening
recognition.interimResults = true; // Show real-time results
recognition.maxAlternatives = 3; // Get multiple possibilities
```

### Key Properties Explained

| Property          | Default         | Recommendation       | Purpose                                  |
| ----------------- | --------------- | -------------------- | ---------------------------------------- |
| `lang`            | Browser default | `'fr-FR'`            | Set to French for French recognition     |
| `continuous`      | `false`         | `true` for sentences | Continues listening after pauses         |
| `interimResults`  | `false`         | `true`               | Shows real-time transcription feedback   |
| `maxAlternatives` | `1`             | `3-5`                | Returns multiple possible transcriptions |

### Event Handlers

```javascript
recognition.onresult = (event) => {
  const results = event.results;
  const isFinal = results[results.length - 1].isFinal;
  const transcript = results[results.length - 1][0].transcript;
  const confidence = results[results.length - 1][0].confidence;

  // Use confidence score for validation
  if (isFinal && confidence > 0.7) {
    evaluatePronunciation(transcript);
  }
};

recognition.onerror = (event) => {
  // Handle: 'no-speech', 'audio-capture', 'not-allowed', 'network'
};

recognition.onend = () => {
  // Restart if continuous mode needed
};
```

---

## Improving Recognition Accuracy

### 1. Audio Input Optimization

| Technique               | Impact | Implementation                                |
| ----------------------- | ------ | --------------------------------------------- |
| **Quiet Environment**   | High   | Prompt users to find quiet space              |
| **Quality Microphone**  | High   | Recommend external mic if available           |
| **Microphone Distance** | Medium | 6-8 inches from mouth                         |
| **Clear Speech**        | High   | UI guidance: "Speak clearly at moderate pace" |
| **Speaking Rate**       | Medium | Target 130-160 words per minute               |

### 2. API Configuration Techniques

#### a. Contextual Biasing (Phrase Hints)

```javascript
// Use SpeechRecognitionPhraseList to bias towards expected vocabulary
const phraseList = new SpeechGrammarList();
const expectedWords = ["bonjour", "merci", "je suis"];
const grammar = `#JSGF V1.0; grammar words; public <word> = ${expectedWords.join(" | ")};`;
phraseList.addFromString(grammar, 1);
recognition.grammars = phraseList;
```

> **Note**: Grammar support in browsers is limited. Chrome may not fully utilize JSGF grammars, but providing hints can still help.

#### b. Multiple Alternatives

```javascript
recognition.maxAlternatives = 5;

recognition.onresult = (event) => {
  const alternatives = event.results[0];
  for (let i = 0; i < alternatives.length; i++) {
    const { transcript, confidence } = alternatives[i];
    // Check if any alternative matches target
    if (normalizeText(transcript) === normalizeText(targetWord)) {
      markAsCorrect();
      return;
    }
  }
};
```

#### c. Confidence Thresholds

```javascript
const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.85, // Definitely correct
  MEDIUM: 0.65, // Likely correct, show feedback
  LOW: 0.45, // Uncertain, allow retry
};

function evaluateResult(transcript, confidence, targetWord) {
  const normalized = normalizeText(transcript);
  const target = normalizeText(targetWord);

  if (normalized === target) {
    if (confidence >= CONFIDENCE_THRESHOLDS.HIGH) {
      return { status: "excellent", message: "Parfait!" };
    } else if (confidence >= CONFIDENCE_THRESHOLDS.MEDIUM) {
      return { status: "good", message: "Bien! Try to speak more clearly." };
    }
  }
  return { status: "retry", message: "Try again" };
}
```

### 3. Text Normalization for Comparison

```javascript
function normalizeText(text) {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD") // Decompose accents
    .replace(/[\u0300-\u036f]/g, "") // Remove accent marks for loose matching
    .replace(/[.,!?;:'"«»]/g, "") // Remove punctuation
    .replace(/\s+/g, " "); // Normalize whitespace
}

// Keep accented version for strict matching
function normalizePreserveAccents(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:'"«»]/g, "")
    .replace(/\s+/g, " ");
}
```

### 4. Fuzzy Matching for Sentences

```javascript
// Levenshtein distance for similarity scoring
function levenshteinDistance(str1, str2) {
  const dp = Array(str1.length + 1)
    .fill(null)
    .map(() => Array(str2.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) dp[i][0] = i;
  for (let j = 0; j <= str2.length; j++) dp[0][j] = j;

  for (let i = 1; i <= str1.length; i++) {
    for (let j = 1; j <= str2.length; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1, // deletion
        dp[i][j - 1] + 1, // insertion
        dp[i - 1][j - 1] + cost, // substitution
      );
    }
  }
  return dp[str1.length][str2.length];
}

function getSimilarityScore(transcript, target) {
  const distance = levenshteinDistance(
    normalizeText(transcript),
    normalizeText(target),
  );
  const maxLength = Math.max(transcript.length, target.length);
  return 1 - distance / maxLength; // 0 to 1 scale
}
```

### 5. Voice Activity Detection (VAD)

```javascript
// Prevent transcription of background noise
let audioContext;
let analyser;

function setupVAD() {
  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    analyser = audioContext.createAnalyser();
    source.connect(analyser);

    // Only start recognition when voice detected
    detectVoice();
  });
}

function detectVoice() {
  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  analyser.getByteFrequencyData(dataArray);
  const average = dataArray.reduce((a, b) => a + b) / dataArray.length;

  if (average > 20) {
    // Voice threshold
    recognition.start();
  }

  requestAnimationFrame(detectVoice);
}
```

---

## French Language Specific Considerations

### 1. Language Code Selection

```javascript
// Standard French (France)
recognition.lang = "fr-FR";

// Canadian French (if needed)
recognition.lang = "fr-CA";
```

### 2. French-Specific Pronunciation Challenges

| Challenge      | Example                | Recognition Tips                           |
| -------------- | ---------------------- | ------------------------------------------ |
| Nasal vowels   | "bon", "vin", "un"     | Accept phonetic variations                 |
| Silent letters | "beaucoup"             | Don't penalize for spoken transcription    |
| Liaisons       | "les amis" → "lez-ami" | Account for connected speech               |
| R sounds       | "rouge"                | Multiple acceptable pronunciations         |
| U vs OU        | "tu" vs "tout"         | Critical distinction, may need fuzzy match |

### 3. Accent-Aware Matching

```javascript
const FRENCH_ACCENT_MAP = {
  é: "e",
  è: "e",
  ê: "e",
  ë: "e",
  à: "a",
  â: "a",
  ä: "a",
  ô: "o",
  ö: "o",
  î: "i",
  ï: "i",
  ù: "u",
  û: "u",
  ü: "u",
  ç: "c",
  œ: "oe",
  æ: "ae",
};

function createAccentInsensitiveRegex(word) {
  let pattern = "";
  for (const char of word.toLowerCase()) {
    const base = FRENCH_ACCENT_MAP[char] || char;
    const variants = Object.entries(FRENCH_ACCENT_MAP)
      .filter(([k, v]) => v === base)
      .map(([k]) => k);
    pattern += variants.length > 0 ? `[${base}${variants.join("")}]` : base;
  }
  return new RegExp(`^${pattern}$`, "i");
}
```

---

## Pronunciation Scoring Algorithms

### 1. Simple Match Scoring

```javascript
function simpleScore(transcript, target) {
  const normalized = normalizeText(transcript);
  const targetNorm = normalizeText(target);

  if (normalized === targetNorm) return 100;

  // Partial word scoring
  const words = normalized.split(" ");
  const targetWords = targetNorm.split(" ");
  let matches = 0;

  for (const word of targetWords) {
    if (words.includes(word)) matches++;
  }

  return Math.round((matches / targetWords.length) * 100);
}
```

### 2. Word-Level Scoring (for Sentences)

```javascript
function wordLevelScore(transcript, target) {
  const spokenWords = normalizeText(transcript).split(" ");
  const targetWords = normalizeText(target).split(" ");

  const results = targetWords.map((targetWord, index) => {
    const spokenWord = spokenWords[index] || "";
    const similarity = getSimilarityScore(spokenWord, targetWord);

    return {
      target: targetWord,
      spoken: spokenWord,
      score: Math.round(similarity * 100),
      status:
        similarity >= 0.8
          ? "correct"
          : similarity >= 0.5
            ? "partial"
            : "incorrect",
    };
  });

  const overallScore =
    results.reduce((sum, r) => sum + r.score, 0) / results.length;

  return { results, overallScore };
}
```

### 3. Advanced: Phoneme-Based Scoring (Conceptual)

For more accurate pronunciation assessment, consider integrating external APIs:

```javascript
// Conceptual implementation with external pronunciation API
async function phonemeBasedScore(audioBlob, targetText) {
  // Send to pronunciation assessment API
  const response = await fetch("https://api.speechace.com/api/scoring", {
    method: "POST",
    body: createFormData(audioBlob, targetText),
  });

  const result = await response.json();

  return {
    overall: result.quality_score,
    phonemes: result.phoneme_scores,
    fluency: result.fluency_score,
    feedback: result.suggested_improvements,
  };
}
```

---

## Implementation Recommendations

### Phase 1: Basic Implementation (Immediate)

1. **Improve Repeat Word Exercise**
   - Add `maxAlternatives = 3`
   - Implement accent-aware matching
   - Show confidence score to users
   - Add "Try Again" for low confidence

2. **Implement Repeat Sentence Exercise**
   - Use fuzzy matching with similarity threshold ≥ 0.75
   - Show word-by-word feedback
   - Highlight incorrect words

### Phase 2: Enhanced Experience (Short-term)

3. **Add Visual Feedback**
   - Real-time waveform visualization
   - Interim results display
   - Color-coded word highlighting

4. **Error Recovery**
   - Auto-restart on `onend` if incomplete
   - Handle network errors gracefully
   - Provide offline fallback message

### Phase 3: Advanced Features (Long-term)

5. **LLM Post-Processing**

   ```javascript
   async function llmCorrection(transcript, targetText) {
     const prompt = `
       User attempted to say: "${targetText}"
       Speech recognition heard: "${transcript}"
       
       Determine if this is acceptable pronunciation.
       Consider French accent variations and common recognition errors.
       Return: { acceptable: boolean, feedback: string }
     `;

     return await callLLM(prompt);
   }
   ```

6. **Integrate External Pronunciation API** (Optional)
   - Consider Speechace, ReadSpeaker, or similar for detailed phoneme feedback

---

## Browser Compatibility & Limitations

### Support Matrix

| Browser | Support    | Interim Results | Continuous Mode   | Notes                           |
| ------- | ---------- | --------------- | ----------------- | ------------------------------- |
| Chrome  | ✅ Full    | ✅              | ✅                | Best support, server-based      |
| Edge    | ✅ Full    | ✅              | ✅                | Uses same engine as Chrome      |
| Safari  | ⚠️ Partial | ⚠️ Limited      | ⚠️ Issues in PWAs | Mobile has more issues          |
| Firefox | ❌ No      | ❌              | ❌                | Does not support Web Speech API |
| Opera   | ✅ Full    | ✅              | ✅                | Chromium-based                  |

### Key Limitations

1. **Requires Internet**: Chrome/Safari send audio to servers for processing
2. **HTTPS Required**: Microphone access requires secure context
3. **Continuous Mode Timeout**: Chrome may stop after ~60 seconds of silence
4. **Permission Prompts**: Non-HTTPS triggers repeated prompts on restart
5. **Accuracy Variability**: Non-native accents and noisy environments reduce accuracy

### Handling Unsupported Browsers

```javascript
function checkSpeechRecognitionSupport() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    return {
      supported: false,
      message:
        "Speech recognition is not supported in your browser. Please use Chrome or Edge.",
    };
  }

  return { supported: true };
}
```

---

## Alternative/Supplementary Solutions

### 1. External Speech-to-Text APIs

| Service              | Pros                              | Cons                   | Pricing       |
| -------------------- | --------------------------------- | ---------------------- | ------------- |
| **Google Cloud STT** | High accuracy, French support     | Requires backend, cost | $0.006/15 sec |
| **Azure Speech**     | Pronunciation assessment built-in | Complex setup          | $1/audio hour |
| **AssemblyAI**       | Easy API, real-time               | English-focused        | $0.00025/sec  |
| **Whisper (OpenAI)** | Very accurate, multilingual       | Batch only, cost       | $0.006/min    |

### 2. Open-Source Alternatives

| Library                | Use Case             | Offline | Notes                   |
| ---------------------- | -------------------- | ------- | ----------------------- |
| **Vosk**               | Privacy-focused apps | ✅      | French models available |
| **Mozilla DeepSpeech** | Custom models        | ✅      | Deprecated, use Coqui   |
| **Coqui STT**          | DeepSpeech successor | ✅      | Active development      |

### 3. Hybrid Approach (Recommended for Production)

```
                    ┌─────────────────────┐
                    │   User Speaks       │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
                    │ webkitSpeechRecog.  │
                    │   (Primary)         │
                    └──────────┬──────────┘
                               ▼
                    ┌─────────────────────┐
              ┌─────┤ Confidence Check    ├─────┐
              │     └─────────────────────┘     │
              ▼                                 ▼
     ┌────────────────┐               ┌────────────────┐
     │ High Confidence│               │ Low Confidence │
     │ → Accept       │               │ → LLM Verify   │
     └────────────────┘               └────────────────┘
```

---

## References

### Official Documentation

- [MDN Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [W3C Speech API Specification](https://wicg.github.io/speech-api/)
- [JSGF Grammar Format](https://www.w3.org/TR/jsgf/)

### Research & Best Practices

- Google Cloud Speech-to-Text Best Practices
- Speechace API Documentation (Pronunciation Assessment)
- Academic papers on Computer-Assisted Pronunciation Training (CAPT)

### Browser Compatibility

- [Can I Use: Web Speech API](https://caniuse.com/speech-recognition)

---

## Summary: Key Implementation Points

| Priority  | Action                                 | Effort | Impact    |
| --------- | -------------------------------------- | ------ | --------- |
| 🔴 High   | Set `lang = 'fr-FR'` explicitly        | Low    | High      |
| 🔴 High   | Use `maxAlternatives = 3-5`            | Low    | Medium    |
| 🔴 High   | Implement text normalization           | Medium | High      |
| 🟡 Medium | Add confidence thresholds              | Medium | Medium    |
| 🟡 Medium | Implement fuzzy matching for sentences | Medium | High      |
| 🟡 Medium | Add visual feedback (interim results)  | Medium | High      |
| 🟢 Low    | Voice Activity Detection               | High   | Medium    |
| 🟢 Low    | LLM post-processing                    | Medium | High      |
| 🟢 Low    | External pronunciation API             | High   | Very High |

---

_Document created: January 31, 2026_
_Last updated: January 31, 2026_
