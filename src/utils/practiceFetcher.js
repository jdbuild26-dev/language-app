const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Standardized fetcher for practice exercise data from the backend.
 * Integrates with the /api/practice/{slug} endpoints.
 */
export async function fetchPracticeData(slug, options = {}) {
    const { level, limit } = options;
    const params = new URLSearchParams();
    if (level) params.append("level", level);
    if (limit) params.append("limit", limit.toString());

    const queryString = params.toString();
    const url = `${API_URL}/api/practice/${slug}${queryString ? `?${queryString}` : ""}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch practice data for ${slug}: ${response.statusText}`);
        }
        const result = await response.json();

        // The backend returns { sheet: string, count: number, data: Array } 
        // or a direct array for specialized routes.
        return result.data || result;
    } catch (error) {
        console.error(`Error in fetchPracticeData(${slug}):`, error);
        throw error;
    }
}

/**
 * Fetches match pairs data specifically from the optimized endpoint.
 */
export async function fetchMatchPairsData(level) {
    return fetchPracticeData("match-pairs", { level });
}

/**
 * Fetches repeat sentence data specifically from the optimized endpoint.
 */
export async function fetchRepeatSentenceData(level) {
    return fetchPracticeData("repeat-sentence", { level });
}

/**
 * Fetches what do you see data specifically from the optimized endpoint.
 */
export async function fetchWhatDoYouSeeData() {
    return fetchPracticeData("what-do-you-see");
}

/**
 * Fetches dictation image data specifically from the optimized endpoint.
 */
export async function fetchDictationImageData() {
    return fetchPracticeData("dictation-image");
}
