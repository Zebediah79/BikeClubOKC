// src/pages/Parent.jsx
import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "../stylings/Dashboard.css";
import { ChevronDown, ChevronUp } from "lucide-react";

import {
  fetchParentProfile,
  fetchParentStudents,
  fetchEventsForStudent,
  markStudentAbsent,
} from "../api/parentsAPI";

import { useAuth } from "../auth/AuthProvider";

export default function Parent() {
  const { token, userId } = useAuth();

  const [parent, setParent] = useState(null);
  const [students, setStudents] = useState([]);
  const [events, setEvents] = useState([]);

  const [expandedKey, setExpandedKey] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [absentEvents, setAbsentEvents] = useState([]);

  // Format SQL TIME → "9:00 AM"
  const formatTime = (timeString) => {
    if (!timeString) return "";
    const [hour, minute] = timeString.split(":");
    const h = parseInt(hour, 10);
    const suffix = h >= 12 ? "PM" : "AM";
    const formatted = h % 12 || 12;
    return `${formatted}:${minute} ${suffix}`;
  };

  /* =========================================================
      LOAD DATA FROM BACKEND
  ========================================================== */
  useEffect(() => {
    if (!token || !userId) {
      console.log("Missing token or userId", { token, userId });
      return;
    }

    async function loadData() {
      try {
        console.log("Loading parent profile:", userId);

        // 1️ Parent Profile
        const parentData = await fetchParentProfile(userId, token);
        setParent(parentData);

        // 2️ Student List
        const studentList = await fetchParentStudents(userId, token);
        setStudents(studentList);
        console.log("Students loaded:", studentList);

        // 3️Load events per student
        let allEvents = [];

        for (let student of studentList) {
          console.log("Fetching events for student:", student);

          const studentEvents = await fetchEventsForStudent(
            userId,
            student.id,
            token
          );

          if (!Array.isArray(studentEvents)) continue;

          const formattedEvents = studentEvents.map((event) => ({
            ...event,
            date: new Date(event.date).toISOString().split("T")[0], //  normalize date
            student_id: student.id,
            student_name: `${student.first_name} ${student.last_name}`,
            start_time: formatTime(event.start_time),
            end_time: formatTime(event.end_time),
            key: `${event.id}-${student.id}`, // UNIQUE KEY
          }));

          allEvents.push(...formattedEvents);
        }

        // 4️ Deduplicate events (each student has their own copy)
        const deduped = Array.from(
          new Map(allEvents.map((e) => [e.key, e])).values()
        );

        console.log("Final events:", deduped);
        setEvents(deduped);
      } catch (err) {
        console.error("Failed to load parent data:", err);
      }
    }

    loadData();
  }, [token, userId]);

  if (!parent) return <p>Loading...</p>;

  /* =========================================================
      CALENDAR + FILTERING
  ========================================================== */
  const selectedDateString = selectedDate.toISOString().split("T")[0];
  const eventDates = events.map((e) => e.date);

  const eventsForSelectedDate = events.filter(
    (event) => event.date === selectedDateString
  );

  /* =========================================================
      ABSENCE ACTION
  ========================================================== */
  const handleMarkAbsent = async (event) => {
    try {
      await markStudentAbsent(userId, event.student_id, event.id, token);
      setAbsentEvents([...absentEvents, event.key]);
    } catch (err) {
      console.error("Absence update error:", err);
    }
  };

  const toggleExpand = (key) =>
    setExpandedKey(expandedKey === key ? null : key);

  /* =========================================================
      UI RENDER
  ========================================================== */
  return (
    <div className="container">
      <div className="profile">
        <h2>
          Welcome, {parent.first_name} {parent.last_name}
        </h2>
        <p>{parent.email}</p>
        <p>{parent.phone}</p>
      </div>

      {/* Calendar */}
      <h3>Event Calendar</h3>
      <Calendar
        onChange={setSelectedDate}
        value={selectedDate}
        tileClassName={({ date }) => {
          const formatted = date.toISOString().split("T")[0];
          return eventDates.includes(formatted) ? "event-date" : null;
        }}
      />

      {/* Events */}
      <div className="event-grid">
        <h3>
          {eventsForSelectedDate.length > 0
            ? `Events on ${selectedDate.toDateString()}`
            : "All Events"}
        </h3>

        {events.length === 0 && <p>No events found for your children yet.</p>}

        <div>
          {(eventsForSelectedDate.length ? eventsForSelectedDate : events).map(
            (event) => (
              <div
                key={event.key}
                className={`event-card ${
                  expandedKey === event.key ? "expanded" : ""
                }`}
                onClick={() => toggleExpand(event.key)}
              >
                {/* Event Summary */}
                <div className="event-summary">
                  <div className="event-header">
                    <h4>{event.title}</h4>
                    <span
                      className={`chevron ${
                        expandedKey === event.key ? "rotated" : ""
                      }`}
                    >
                      {expandedKey === event.key ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </span>
                  </div>
                  <p className="event-type">{event.type}</p>
                  <p>
                    <strong>Date:</strong> {event.date}
                  </p>
                </div>

                {expandedKey === event.key && (
                  <div className="event-details">
                    <p>
                      <strong>Time:</strong> {event.start_time} –{" "}
                      {event.end_time}
                    </p>
                    <p>
                      <strong>Start Location:</strong> {event.start_location}
                    </p>
                    <p>
                      <strong>End Location:</strong> {event.end_location}
                    </p>
                    <p>
                      <strong>Student:</strong> {event.student_name}
                    </p>

                    <button
                      className={`absent-btn ${
                        absentEvents.includes(event.key) ? "disabled" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAbsent(event);
                      }}
                      disabled={absentEvents.includes(event.key)}
                    >
                      {absentEvents.includes(event.key)
                        ? "Marked Absent"
                        : "Mark Absent"}
                    </button>
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
