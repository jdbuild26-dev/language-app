const API_BASE_URL =
  import.meta.env.VITE_API_URL || "https://language-api-mine.onrender.com";

/**
 * Track user interaction event
 * @param {Object} event
 * @param {string} event.sessionId - Optional session ID
 * @param {string} event.itemId - The word ID or item ID
 * @param {string} event.interactionType - Type of interaction (flip, know, unknown, mastered, speak, bookmark)
 * @param {Object} event.metadata - Additional data
 */
export async function trackEvent({
  sessionId,
  itemId,
  interactionType,
  metadata = {},
}) {
  try {
    const payload = {
      sessionId,
      itemId,
      interactionType,
      metadata,
      timestamp: new Date().toISOString(),
      path: window.location.pathname,
    };

    console.log("📝 TRACK_EVENT:", payload);

    // Fire and forget - don't await response to avoid blocking UI
    fetch(`${API_BASE_URL}/api/event_tracker`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }).catch((err) => console.warn("Failed to send tracking event:", err));

    return true;
  } catch (error) {
    console.warn("Error initiating tracking event:", error);
    return false;
  }
}
