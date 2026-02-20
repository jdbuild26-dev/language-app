const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Teacher assigns a task to students.
 */
export async function createAssignments(assignmentData, token) {
  const response = await fetch(`${API_URL}/api/teachers/assign`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(assignmentData),
  });
  if (!response.ok) {
    throw new Error("Failed to create assignments");
  }
  return response.json();
}

/**
 * Student fetches their own assignments.
 * @param {string} token - The auth token.
 * @param {string} status - Optional status filter (pending, completed, etc).
 * @param {string} source - Optional source filter ('individual' or 'class').
 */
export async function getMyAssignments(token, status = null, source = null) {
  let url = `${API_URL}/api/students/me/assignments`;
  const params = new URLSearchParams();
  if (status) params.append("status", status);
  if (source) params.append("source", source);

  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch assignments");
  }
  return response.json();
}

/**
 * Teacher fetches assignments for a specific student.
 */
export async function getStudentAssignments(studentId, token) {
  const response = await fetch(
    `${API_URL}/api/teachers/students/${studentId}/assignments`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch student assignments");
  }
  return response.json();
}

/**
 * Student completes an assignment and submits results.
 */
export async function completeAssignment(
  assignmentId,
  score,
  metadata = {},
  token,
) {
  const response = await fetch(
    `${API_URL}/api/assignments/${assignmentId}/complete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ score, metadata }),
    },
  );
  if (!response.ok) {
    throw new Error("Failed to complete assignment");
  }
  return response.json();
}

/**
 * Teacher fetches all assignments they created.
 */
export async function getTeacherAssignments(token) {
  const response = await fetch(`${API_URL}/api/teachers/assignments`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch teacher assignments");
  }
  return response.json();
}

/**
 * Fetch available exercise types and slugs for assignment.
 */
export async function getTaskOptions(token) {
  const response = await fetch(`${API_URL}/api/assignments/task-options`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch task options");
  }
  return response.json();
}
