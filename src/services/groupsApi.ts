const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function createGroup(groupData) {
  const response = await fetch(`${API_URL}/api/groups`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(groupData),
  });

  if (!response.ok) {
    throw new Error("Failed to create group");
  }

  return response.json();
}

export async function getTeacherGroups(teacherId) {
  const response = await fetch(`${API_URL}/api/groups/teacher/${teacherId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch groups");
  }

  return response.json();
}

export async function getGroupDetails(groupId) {
  const response = await fetch(`${API_URL}/api/groups/${groupId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch group details");
  }

  return response.json();
}

export async function addStudentsToGroup(groupId, studentIds) {
  const response = await fetch(`${API_URL}/api/groups/${groupId}/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ studentIds }),
  });

  if (!response.ok) {
    throw new Error("Failed to add students to group");
  }

  return response.json();
}

export async function removeStudentFromGroup(groupId, studentId) {
  const response = await fetch(
    `${API_URL}/api/groups/${groupId}/students/${studentId}`,
    {
      method: "DELETE",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to remove student from group");
  }

  return response.json();
}

export async function deleteGroup(groupId) {
  const response = await fetch(`${API_URL}/api/groups/${groupId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete group");
  }

  return response.json();
}
