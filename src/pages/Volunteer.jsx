// src/pages/Volunteer.jsx
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "./Volunteer.css";
import "react-calendar/dist/Calendar.css";
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
        const profileRes = await fetch(
          `${API}/volunteers/volunteer/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const volunteerData = await profileRes.json();
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
    <div className="volunteer-container">
      {/* Volunteer Profile */}
      <div className="volunteer-profile">
        <h2>
          Welcome, {volunteer.first_name} {volunteer.last_name}
        </h2>
        <p className="volunteer-email">{volunteer.email}</p>
      </div>

      {/* Calendar */}
      <div className="volunteer-calendar">
        <h3>Event Calendar</h3>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileClassName={({ date }) => {
            const dateStr = date.toISOString().split("T")[0];
            return eventDates.includes(dateStr) ? "has-event" : null;
          }}
        />
      </div>

      {/* Events Section */}
      <div className="volunteer-events">
        <h3>
          {eventsForSelectedDate.length > 0
            ? `Events on ${selectedDate.toDateString()}`
            : "Assigned Events"}
        </h3>

        <div className="event-card-grid">
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

/*// src/pages/Volunteer.jsx
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "./Volunteer.css";
import "react-calendar/dist/Calendar.css";
import { ChevronDown, ChevronUp } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function Volunteer() {
  const [volunteer, setVolunteer] = useState(null);
  const [events, setEvents] = useState([]);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [declinedEvents, setDeclinedEvents] = useState([]);

  useEffect(() => {
    // Mock volunteer data
    setVolunteer({
      first_name: "John",
      last_name: "Smith",
      email: "john.smith@email.com",
    });

    // Mock assigned events with student + parent info
    setEvents([
      {
        id: 1,
        title: "Community Ride",
        type: "Outdoor",
        start_location: "Blackhawk Park",
        end_location: "Enchanted Rock",
        date: "2025-11-15",
        start_time: "09:00 AM",
        end_time: "12:00 PM",
        participants: [
          {
            student_name: "Alex Johnson",
            parent_name: "Mark Johnson",
            parent_email: "mark.johnson@email.com",
            parent_phone: "512-555-9834",
          },
          {
            student_name: "Ethan Kim",
            parent_name: "Sarah Kim",
            parent_email: "sarah.kim@email.com",
            parent_phone: "512-555-6578",
          },
          {
            student_name: "Jeff Curtis",
            parent_name: "Mark Curtis",
            parent_email: "mark.curtis@email.com",
            parent_phone: "512-555-9834",
          },
        ],
      },
      {
        id: 2,
        title: "River Side Loop",
        type: "Trail",
        start_location: "YMCA Gym",
        end_location: "YMCA Gym",
        date: "2025-12-02",
        start_time: "10:00 AM",
        end_time: "11:30 AM",
        participants: [
          {
            student_name: "Lucas Brown",
            parent_name: "Emma Brown",
            parent_email: "emma.brown@email.com",
            parent_phone: "512-555-7321",
          },
        ],
      },
    ]);
  }, []);

  if (!volunteer) return <p>Loading volunteer data...</p>;

  const selectedDateString = selectedDate.toISOString().split("T")[0];
  const eventDates = events.map((event) => event.date);

  const eventsForSelectedDate = events.filter(
    (e) => e.date === selectedDateString
  );

  // Toggle expand
  const toggleExpand = (id) => {
    setExpandedEventId(expandedEventId === id ? null : id);
  };

  // Decline event
  const handleDecline = (eventId) => {
    if (!declinedEvents.includes(eventId)) {
      setDeclinedEvents([...declinedEvents, eventId]);
    }
  };

  return (
    <div className="volunteer-container">
      {/* Volunteer Profile *}
      <div className="volunteer-profile">
        <h2>
          Welcome, {volunteer.first_name} {volunteer.last_name}
        </h2>
        <p className="volunteer-email">{volunteer.email}</p>
      </div>

      {/* Calendar *}
      <div className="volunteer-calendar">
        <h3>Event Calendar</h3>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileClassName={({ date }) => {
            const dateStr = date.toISOString().split("T")[0];
            return eventDates.includes(dateStr) ? "has-event" : "";
          }}
        />
      </div>

      {/* Events Section *}
      <div className="volunteer-events">
        <h3>
          {eventsForSelectedDate.length > 0
            ? `Events on ${selectedDate.toDateString()}`
            : "Assigned Events"}
        </h3>

        <div className="event-card-grid">
          {(eventsForSelectedDate.length > 0
            ? eventsForSelectedDate
            : events
          ).map((event) => (
            <div
              key={event.id}
              className={`event-card ${
                expandedEventId === event.id ? "expanded" : ""
              }`}
              onClick={() => toggleExpand(event.id)}
            >
              {/* Summary *}
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

              {/* Expanded Details *}
              {expandedEventId === event.id && (
                <div className="event-details">
                  <p>
                    <strong>Time:</strong> {event.start_time} – {event.end_time}
                  </p>
                  <p>
                    <strong>End Location:</strong> {event.end_location}
                  </p>

                  <h4>Students Signed Up</h4>
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
                          <td>{p.student_name}</td>
                          <td>{p.parent_name}</td>
                          <td>{p.parent_email}</td>
                          <td>{p.parent_phone}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Buttons *}
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
          ))}
        </div>
      </div>
    </div>
  );
}*/
