// src/api/parentsAPI.js
const API = import.meta.env.VITE_API_URL;

// Helper: Authorization headers
function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/* ============================================================
   FACILITATOR CREATES NEW PARENT  (POST /parents/create)
   ============================================================ */
export async function createParent(data) {
  try {
    const res = await fetch(`${API}/parents/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`Failed to create parent (${res.status})`);
    }

    return await res.json();
  } catch (err) {
    console.error("❌ Error creating parent:", err);
    throw err;
  }
}

/* ============================================================
   GET /parents/:id  (Parent Profile)
   ============================================================ */
export async function fetchParentProfile(parentId, token) {
  const res = await fetch(`${API}/parents/${parentId}`, {
    headers: authHeaders(token),
  });

  if (!res.ok) {
    throw new Error(`Failed to load parent profile (${res.status})`);
  }

  return res.json();
}

/* ============================================================
   GET /parents/:id/students
   ============================================================ */
export async function fetchParentStudents(parentId, token) {
  const res = await fetch(`${API}/parents/${parentId}/students`, {
    headers: authHeaders(token),
  });

  if (!res.ok) {
    throw new Error(`Failed to load students (${res.status})`);
  }

  return res.json();
}

/* ============================================================
   GET /parents/:id/students/:studentId/events
   ============================================================ */
export async function fetchEventsForStudent(parentId, studentId, token) {
  const res = await fetch(
    `${API}/parents/${parentId}/students/${studentId}/events`,
    { headers: authHeaders(token) }
  );

  if (!res.ok) {
    throw new Error(`Failed to load events for student (${res.status})`);
  }

  return res.json();
}

/* ============================================================
   PUT /parents/:id/students/:studentId/events/:eventId/absence
   ============================================================ */
export async function markStudentAbsent(parentId, studentId, eventId, token) {
  const res = await fetch(
    `${API}/parents/${parentId}/students/${studentId}/events/${eventId}/absence`,
    {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify({ absent: true }),
    }
  );

  if (!res.ok) {
    throw new Error(
      `Failed to mark absent (status: ${res.status}, ${res.statusText})`
    );
  }

  return res.json();
}
