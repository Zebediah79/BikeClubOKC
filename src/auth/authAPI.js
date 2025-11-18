// src/auth/authAPI.js

const API = import.meta.env.VITE_API_URL; //"http://localhost:3000"

// --------- PARENT LOGIN ----------
export async function parentLogin(email, password) {
  const res = await fetch(`${API}/users/parents/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const text = await res.text();
  console.log("🔥 SERVER RAW LOGIN RESPONSE:", text);

  if (!res.ok) {
    throw new Error("Parent login failed");
  }

  return text; // returns JWT token
}

// --------- VOLUNTEER LOGIN ----------
export async function volunteerLogin(email, password) {
  const res = await fetch(`${API}/users/volunteers/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw new Error("Volunteer login failed");
  }

  return await res.text(); // returns JWT token
}
