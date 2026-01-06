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
    throw new Error("Failed to check onboarding status");
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
    throw new Error("Failed to check teacher onboarding status");
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
