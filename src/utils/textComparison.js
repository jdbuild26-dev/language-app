export const normalizeText = (text) => {
    if (!text) return "";
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Remove accents
        .replace(/[^\w\s]/g, "")        // Remove punctuation
        .trim();
};

// Levenshtein distance algorithm
export const levenshteinDistance = (a, b) => {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1,   // insertion
                        matrix[i - 1][j] + 1    // deletion
                    )
                );
            }
        }
    }
    return matrix[b.length][a.length];
};

export const calculateSimilarity = (a, b) => {
    if (!a || !b) return 0;
    const normalizedA = normalizeText(a);
    const normalizedB = normalizeText(b);

    const maxLength = Math.max(normalizedA.length, normalizedB.length);
    if (maxLength === 0) return 1.0;

    const distance = levenshteinDistance(normalizedA, normalizedB);
    return 1 - distance / maxLength;
};

// Checks if the 'text' contains the 'pattern' using fuzzy matching
// Used when the user might speak a sentence containing the target word
export const fuzzyIncludes = (text, pattern, threshold = 0.7) => {
    const normalizedText = normalizeText(text);
    const normalizedPattern = normalizeText(pattern);

    if (!normalizedText || !normalizedPattern) return false;

    // 1. Direct similarity check (useful if they are roughly same length)
    if (calculateSimilarity(text, pattern) >= threshold) return true;

    // 2. Word-by-word check (useful if pattern is a single word)
    // This helps when user says "Je vois un chat" and pattern is "chat"
    const words = normalizedText.split(/\s+/);
    const patternWords = normalizedPattern.split(/\s+/);

    if (patternWords.length === 1) {
        for (const word of words) {
            if (calculateSimilarity(word, normalizedPattern) >= threshold) {
                return true;
            }
        }
    } else {
        // 3. Sliding window for multi-word phrases
        // Check substrings of roughly the same length as the pattern
        const pLen = normalizedPattern.length;
        // Allow for some length variation
        const minLen = Math.floor(pLen * 0.7);
        const maxLen = Math.ceil(pLen * 1.3);

        // We only need to check reasonable start positions
        // Optimization: Step by 1 char? Yes.
        for (let len = minLen; len <= maxLen; len++) {
            for (let i = 0; i <= normalizedText.length - len; i++) {
                const sub = normalizedText.substr(i, len);
                // Calculate distance on the substring
                const distance = levenshteinDistance(sub, normalizedPattern);
                const similarity = 1 - distance / Math.max(sub.length, pLen);

                if (similarity >= threshold) return true;
            }
        }
    }

    return false;
};
