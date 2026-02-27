const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Check if the user has completed onboarding.
 * @param {string} userId - Clerk User ID
 * @returns {Promise<{isComplete: boolean, studentId: string | null, role: string | null}>}
 */
export async function checkOnboardingStatus(token) {
  const response = await fetch(`${API_URL}/api/students/check`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `[checkOnboardingStatus] Failed: ${response.status} ${response.statusText}`,
      errorText
    );
    throw new Error(
      `Failed to check onboarding status: ${response.status} ${response.statusText} - ${errorText}`
    );
  }
  return response.json();
}

/**
 * Create a new student profile.
 * @param {Object} profileData - The student profile data
 * @returns {Promise<Object>} The created profile
 */
export async function createStudentProfile(profileData, token) {
  const response = await fetch(`${API_URL}/api/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw new Error("Failed to create student profile");
  }
  return response.json();
}

/**
 * Get the current student's profile.
 * @param {string} userId - Clerk User ID
 * @returns {Promise<Object>} The student profile
 */
export async function getStudentProfile(token) {
  const response = await fetch(`${API_URL}/api/students/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch student profile");
  }
  return response.json();
}

/**
 * Get placement test questions.
 * @param {string} language - Target language (e.g., "French")
 * @returns {Promise<{questions: Array}>}
 */
export async function getPlacementTest(language) {
  const response = await fetch(
    `${API_URL}/api/students/placement-test?language=${language}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch placement test");
  }
  return response.json();
}

/**
 * Check if the user has completed teacher onboarding.
 * @param {string} userId - Clerk User ID
 * @returns {Promise<{isComplete: boolean, teacherId: string | null, role: string | null}>}
 */
export async function checkTeacherOnboardingStatus(token) {
  const response = await fetch(`${API_URL}/api/teachers/check`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    console.error(
      `[checkTeacherOnboardingStatus] Failed: ${response.status} ${response.statusText}`,
      errorText
    );
    throw new Error(
      `Failed to check teacher onboarding status: ${response.status} ${response.statusText} - ${errorText}`
    );
  }
  return response.json();
}

/**
 * Create a new teacher profile.
 * @param {Object} profileData - The teacher profile data
 * @returns {Promise<Object>} The created profile
 */
export async function createTeacherProfile(profileData, token) {
  const response = await fetch(`${API_URL}/api/teachers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw new Error("Failed to create teacher profile");
  }
  return response.json();
}

/**
 * Get the current teacher's profile.
 * @param {string} userId - Clerk User ID
 * @returns {Promise<Object>} The teacher profile
 */
export async function getTeacherProfile(token) {
  const response = await fetch(`${API_URL}/api/teachers/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch teacher profile");
  }
  return response.json();
}

/**
 * Update the current teacher's profile.
 * @param {Object} updates - The fields to update
 * @param {string} token - Auth token
 * @param {string} language - Optional language filter
 */
export async function updateTeacherProfile(updates, token, language = null) {
  let url = `${API_URL}/api/teachers/me`;
  if (language) {
    url += `?language=${encodeURIComponent(language)}`;
  }

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to update teacher profile: ${errorText}`);
  }
  return response.json();
}

/**
 * Check if a username is available.
 */
export async function checkUsernameAvailability(username, token) {
  const response = await fetch(
    `${API_URL}/api/students/check-username?username=${username}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error("Failed to check username availability");
  }
  return response.json();
}

/**
 * Update student privacy settings.
 */
export async function updatePrivacySettings(privacyData, token) {
  const response = await fetch(`${API_URL}/api/students/me/privacy`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(privacyData),
  });
  if (!response.ok) {
    throw new Error("Failed to update privacy settings");
  }
  return response.json();
}

/**
 * Get a public profile by username.
 */
export async function getPublicProfile(username) {
  const response = await fetch(`${API_URL}/api/profiles/${username}`);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to fetch public profile");
  }
  return response.json();
}
