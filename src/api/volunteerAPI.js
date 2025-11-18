// src/api/volunteerAPI.js
const API = import.meta.env.VITE_API_URL;

// Authorization helper
function authHeaders(token) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/* -----------------------------------------
   GET /volunteers/volunteer/:id
----------------------------------------- */
export async function fetchVolunteerProfile(id, token) {
  const res = await fetch(`${API}/volunteers/volunteer/${id}`, {
    headers: authHeaders(token),
  });

  if (!res.ok) throw new Error("Failed to load volunteer profile");
  return res.json();
}

/* -----------------------------------------
   GET /volunteers/volunteer/:id/events
----------------------------------------- */
export async function fetchVolunteerEvents(id, token) {
  const res = await fetch(`${API}/volunteers/volunteer/${id}/events`, {
    headers: authHeaders(token),
  });

  if (!res.ok) throw new Error("Failed to load volunteer events");
  return res.json();
}

/* -----------------------------------------
   GET students for event
----------------------------------------- */
export async function fetchStudentsForEvent(volunteerId, eventId, token) {
  const res = await fetch(
    `${API}/volunteers/volunteer/${volunteerId}/events/${eventId}/students`,
    { headers: authHeaders(token) }
  );

  if (!res.ok) throw new Error("Failed to load students for event");
  return res.json();
}

/* -----------------------------------------
   Mark volunteer absent (decline)
----------------------------------------- */
export async function declineEvent(volunteerId, eventId, token) {
  const res = await fetch(
    `${API}/volunteers/volunteer/${volunteerId}/events/${eventId}/absence`,
    {
      method: "PUT",
      headers: authHeaders(token),
      body: JSON.stringify({ absent: true }),
    }
  );

  if (!res.ok) throw new Error("Failed to decline event");
  return res.json();
}
