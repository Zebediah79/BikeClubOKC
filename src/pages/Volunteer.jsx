// src/pages/Volunteer.jsx
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "../stylings/Dashboard.css";
import { ChevronDown, ChevronUp } from "lucide-react";

import { useAuth } from "../auth/AuthProvider";

export default function Volunteer() {
  const { token, userId } = useAuth();

  const [volunteer, setVolunteer] = useState(null);
  const [events, setEvents] = useState([]);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [declinedEvents, setDeclinedEvents] = useState([]);

  const API = import.meta.env.VITE_API_URL;

  /* ------------------------------
     Format SQL time → "9:00 AM"
  ------------------------------ */
  function formatTime(sqlTime) {
    if (!sqlTime) return "";
    const [h, m] = sqlTime.split(":");
    const hour = Number(h);
    const suffix = hour >= 12 ? "PM" : "AM";
    return `${hour % 12 || 12}:${m} ${suffix}`;
  }

  /* =====================================================
       LOAD VOLUNTEER PROFILE + EVENTS
  ====================================================== */
  useEffect(() => {
    if (!token || !userId) return;

    async function loadData() {
      try {
        /* ------------------ VOLUNTEER PROFILE ------------------ */
        const profileResponse = await fetch(
          `${API}/volunteers/volunteer/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const volunteerData = await profileResponse.json();
        setVolunteer(volunteerData);

        /* ------------------ VOLUNTEER EVENTS ------------------ */
        const eventsRes = await fetch(
          `${API}/volunteers/volunteer/${userId}/events`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        let eventsList = await eventsRes.json();

        /* ------------------ NORMALIZE EVENT DATES ------------------ */
        eventsList = eventsList.map((e) => {
          const normalizedDate = e.date
            ? new Date(e.date).toISOString().split("T")[0]
            : null;

          return {
            ...e,
            date: normalizedDate,
            start_time: formatTime(e.start_time),
            end_time: formatTime(e.end_time),
          };
        });

        setEvents(eventsList);
      } catch (err) {
        console.error("Failed to load volunteer dashboard:", err);
      }
    }

    loadData();
  }, [token, userId]);

  if (!volunteer) return <p>Loading volunteer data...</p>;

  /* =====================================================
       CALENDAR + FILTERING
  ====================================================== */
  const selectedDateString = selectedDate.toISOString().split("T")[0];
  const eventDates = events.map((e) => e.date);

  const eventsForSelectedDate = events.filter(
    (e) => e.date === selectedDateString
  );

  /* =====================================================
       LOAD PARTICIPANTS WHEN EXPANDED
  ====================================================== */
  async function loadParticipants(event) {
    try {
      const [studentsRes, volunteersRes] = await Promise.all([
        fetch(
          `${API}/volunteers/volunteer/${userId}/events/${event.id}/students`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        fetch(
          `${API}/volunteers/volunteer/${userId}/events/${event.id}/volunteers`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);

      const students = await studentsRes.json();
      const volunteers = await volunteersRes.json();

      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === event.id
            ? { ...ev, participants: students, volunteers }
            : ev
        )
      );
    } catch (err) {
      console.error("Failed to load event participants:", err);
    }
  }

  /* =====================================================
       EXPAND / COLLAPSE EVENT CARD
  ====================================================== */
  const toggleExpand = (id) => {
    const event = events.find((e) => e.id === id);
    if (!event) return;

    if (expandedEventId !== id) {
      loadParticipants(event);
    }

    setExpandedEventId(expandedEventId === id ? null : id);
  };

  /* =====================================================
       DECLINE EVENT
  ====================================================== */
  function handleDecline(eventId) {
    if (!declinedEvents.includes(eventId)) {
      setDeclinedEvents([...declinedEvents, eventId]);
    }
  }

  /* =====================================================
       UI RENDER
  ====================================================== */
  return (
    <div className="container">
      {/* Volunteer Profile */}
      <div className="profile">
        <h2>
          Welcome, {volunteer.first_name} {volunteer.last_name}
        </h2>
        <p className="email">{volunteer.email}</p>
      </div>

      {/* Calendar */}
      <h3>Event Calendar</h3>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileClassName={({ date }) => {
          const dateStr = date.toISOString().split("T")[0];
          return eventDates.includes(dateStr) ? "has-event" : null;
        }}
      />

      {/* Events Section */}
      <div className="event-grid">
        <h3>
          {eventsForSelectedDate.length > 0
            ? `Events on ${selectedDate.toDateString()}`
            : "Assigned Events"}
        </h3>

        <div>
          {(eventsForSelectedDate.length ? eventsForSelectedDate : events).map(
            (event) => (
              <div
                key={event.id}
                className={`event-card ${
                  expandedEventId === event.id ? "expanded" : ""
                }`}
                onClick={() => toggleExpand(event.id)}
              >
                {/* Event Summary */}
                <div className="event-summary">
                  <div className="event-header">
                    <h4>{event.title}</h4>
                    <span
                      className={`chevron ${
                        expandedEventId === event.id ? "rotated" : ""
                      }`}
                    >
                      {expandedEventId === event.id ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </span>
                  </div>

                  <p className="event-type">{event.type}</p>
                  <p>
                    <strong>Location:</strong> {event.start_location}
                  </p>
                  <p>
                    <strong>Date:</strong> {event.date}
                  </p>
                </div>

                {/* Expanded Details */}
                {expandedEventId === event.id && (
                  <div className="event-details">
                    <p>
                      <strong>Time:</strong> {event.start_time} –{" "}
                      {event.end_time}
                    </p>

                    <h4>Students Signed Up</h4>

                    {!event.participants ? (
                      <p>Loading...</p>
                    ) : (
                      <table className="events-table">
                        <thead>
                          <tr>
                            <th>Student</th>
                            <th>Parent</th>
                            <th>Email</th>
                            <th>Phone</th>
                          </tr>
                        </thead>

                        <tbody>
                          {event.participants.map((p, index) => (
                            <tr key={index}>
                              <td>
                                {p.student_first_name} {p.student_last_name}
                              </td>
                              <td>
                                {p.parent_first_name} {p.parent_last_name}
                              </td>
                              <td>{p.parent_email}</td>
                              <td>{p.parent_phone}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}

                    <div className="button-row">
                      <button
                        className={`decline-btn ${
                          declinedEvents.includes(event.id) ? "disabled" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDecline(event.id);
                        }}
                        disabled={declinedEvents.includes(event.id)}
                      >
                        {declinedEvents.includes(event.id)
                          ? "Declined"
                          : "Decline Event"}
                      </button>

                      <button
                        className="close-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(event.id);
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
