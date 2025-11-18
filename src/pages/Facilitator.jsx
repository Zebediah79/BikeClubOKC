import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { ChevronDown, ChevronUp } from "lucide-react";
import "./Facilitator.css";
import "react-calendar/dist/Calendar.css";
import { useAuth } from "../auth/AuthProvider";

const API = import.meta.env.VITE_API_URL;

export default function Facilitator() {
  const { token, userId, role, isFacilitator } = useAuth();

  const [facilitator, setFacilitator] = useState(null);
  const [events, setEvents] = useState([]);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingEvent, setEditingEvent] = useState(null); // edit event

  function handleEditEvent(event) {
    setEditingEvent(event); // loads event into form
  }

  // Dropdown sections
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showAddParent, setShowAddParent] = useState(false);
  const [showAddVolunteer, setShowAddVolunteer] = useState(false);

  // Event form
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "",
    startLocation: "",
    endLocation: "",
    date: "",
    startTime: "",
    endTime: "",
  });

  // Parent form
  const [newParent, setNewParent] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    waiver: "true",
  });

  // Volunteer form
  const [newVolunteer, setNewVolunteer] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    interest: "",
    preferred_school: "",
  });

  const schoolOptions = [
    "Blackhawk Middle School",
    "Pflugerville High School",
    "Park Crest Middle School",
    "Kelly Lane Middle School",
    "Cele Middle School",
    "Rowe Lane Elementary",
    "Murchison Elementary",
    "Hendrickson High School",
    "Westview Middle School",
    "Timmerman Elementary",
  ];

  /* ================================
        LOAD FACILITATOR + EVENTS
  ================================= */
  useEffect(() => {
    if (!token || !userId || role !== "volunteer" || !isFacilitator) return;

    async function fetchData() {
      try {
        // Load facilitator profile
        const profRes = await fetch(`${API}/volunteers/facilitator/${userId}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const profileData = await profRes.json();
        setFacilitator(profileData);

        // Load events for this facilitator
        const eventsRes = await fetch(
          `${API}/volunteers/facilitator/${userId}/events`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const eventsData = await eventsRes.json();
        setEvents(eventsData || []);
      } catch (err) {
        console.error("Error loading facilitator data:", err);
      }
    }

    fetchData();
  }, [token, userId, role, isFacilitator]);

  if (!facilitator) return <p>Loading facilitator dashboard...</p>;

  /* ================================
        CREATE EVENT (BACKEND)
  ================================= */
  async function handleAddEvent(e) {
    e.preventDefault();

    try {
      const res = await fetch(
        `${API}/volunteers/facilitator/${userId}/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newEvent),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert("Failed to create event.");
        return;
      }

      setEvents([...events, data.event]);
      setNewEvent({
        title: "",
        type: "",
        startLocation: "",
        endLocation: "",
        date: "",
        startTime: "",
        endTime: "",
      });

      alert("Event created!");
    } catch (err) {
      console.error("Event create error:", err);
    }
  }

  /* ================================
        DELETE EVENT
  ================================= */
  async function deleteEvent(id) {
    try {
      const res = await fetch(
        `${API}/volunteers/facilitator/${userId}/events/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.ok) {
        setEvents(events.filter((ev) => ev.id !== id));
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  }

  // Edit An Event
  async function handleUpdateEvent(e) {
    e.preventDefault();
    console.log("Updating event:", editingEvent);

    const id = editingEvent.id;
    console.log("ID being sent:", id);

    if (!id) {
      console.error("No event ID found!");
      return;
    }

    const res = await fetch(
      `${API}/volunteers/facilitator/${userId}/events/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingEvent),
      }
    );

    const text = await res.text(); // safer than .json()

    if (!res.ok) {
      console.error("Update failed:", text);
      alert("Failed to update event.");
      return;
    }

    const updated = JSON.parse(text);

    //setEvents(events.map((ev) => (ev.id === id ? updated : ev)));

    // setEvents((prev) =>
    //   prev.map((ev) => (ev.id === updated.id ? updated : ev))
    // );

    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === updated.id
          ? { ...updated } // ensures new object reference
          : ev
      )
    );

    setEditingEvent(null);
    alert("Event updated!");
  }

  /* ================================
        CREATE PARENT (AUTO PASSWORD)
  ================================= */
  async function handleAddParent(e) {
    e.preventDefault();
    console.log("Sending to backend:", newParent);

    try {
      const res = await fetch(
        `${API}/volunteers/facilitator/${userId}/parents`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newParent),
        }
      );

      if (!res.ok) {
        alert("Failed to create parent.");
        return;
      }

      setNewParent({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        waiver: true,
      });

      alert("Parent created! (Password auto-set to 'password')");
    } catch (err) {
      console.error("Parent create error:", err);
    }
  }

  /* ================================
        CREATE VOLUNTEER (AUTO PASSWORD)
  ================================= */
  async function handleAddVolunteer(e) {
    e.preventDefault();

    try {
      const newVolunteerBody = {
        ...newVolunteer,
        password: "password",
        facilitator: false,
        school_id: facilitator.school_id,
        flexible: true,
        background_check: true,
        status: "active",
      };

      const res = await fetch(
        `${API}/volunteers/facilitator/${userId}/volunteers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(newVolunteerBody),
        }
      );

      if (!res.ok) {
        alert("Failed to create volunteer.");
        return;
      }

      setNewVolunteer({
        first_name: "",
        last_name: "",
        birthdate: "",
        email: "",
        phone: "",
        interest: "",
        preferred_school: "",
      });

      alert("Volunteer created! (Password auto-set to 'password')");
    } catch (err) {
      console.error("Volunteer create error:", err);
    }
  }

  const eventDates = events.map((e) => e.date);
  const toggleExpand = (id) =>
    setExpandedEventId(expandedEventId === id ? null : id);

  /* ================================
              RETURN UI
  ================================= */
  return (
    <div className="facilitator-container">
      <div className="facilitator-profile">
        <h2>
          Welcome, {facilitator.first_name} {facilitator.last_name}
        </h2>
        <p>{facilitator.email}</p>
      </div>

      <div className="calendar-section">
        <h3>Event Calendar</h3>
        <Calendar
          onChange={setSelectedDate}
          value={selectedDate}
          tileClassName={({ date }) => {
            const formatted = date.toISOString().split("T")[0];
            return eventDates.includes(formatted) ? "event-date" : null;
          }}
        />
      </div>

      <div className="event-grid">
        <h3>All Events</h3>

        {editingEvent && (
          <form
            onSubmit={handleUpdateEvent}
            className="edit-form"
            key={editingEvent.id}
          >
            <h3>Edit Event</h3>

            <input
              type="text"
              value={editingEvent.title}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, title: e.target.value })
              }
            />

            <input
              type="text"
              value={editingEvent.type}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, type: e.target.value })
              }
            />

            <input
              type="text"
              value={editingEvent.start_location}
              onChange={(e) =>
                setEditingEvent({
                  ...editingEvent,
                  start_location: e.target.value,
                })
              }
            />

            <input
              type="text"
              value={editingEvent.end_location}
              onChange={(e) =>
                setEditingEvent({
                  ...editingEvent,
                  end_location: e.target.value,
                })
              }
            />

            <input
              type="date"
              value={
                editingEvent?.date
                  ? new Date(editingEvent.date).toISOString().split("T")[0]
                  : ""
              }
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, date: e.target.value })
              }
            />

            <input
              type="time"
              value={editingEvent.start_time}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, start_time: e.target.value })
              }
            />

            <input
              type="time"
              value={editingEvent.end_time}
              onChange={(e) =>
                setEditingEvent({ ...editingEvent, end_time: e.target.value })
              }
            />

            <button type="submit">Save</button>
            <button type="button" onClick={() => setEditingEvent(null)}>
              Cancel
            </button>
          </form>
        )}

        {events.map((event) => (
          <div
            key={event.id}
            className={`event-card ${
              expandedEventId === event.id ? "expanded" : ""
            }`}
            onClick={() => toggleExpand(event.id)}
          >
            <div className="event-header-row">
              <h4>{event.title}</h4>
              {expandedEventId === event.id ? <ChevronUp /> : <ChevronDown />}
            </div>

            <p className="event-type">{event.type}</p>
            <p>
              <strong>Start:</strong> {event.start_location}
            </p>

            {expandedEventId === event.id && (
              <div className="event-details">
                <p>
                  <strong>Date:</strong> {event.date}
                </p>
                <p>
                  <strong>Time:</strong> {event.start_time} – {event.end_time}
                </p>
                <p>
                  <strong>End:</strong> {event.end_location}
                </p>

                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteEvent(event.id);
                  }}
                >
                  Delete Event
                </button>

                <button
                  className="edit-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditEvent(event);
                  }}
                >
                  Edit Event
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ============ ADMIN ACTIONS ============ */}
      <div className="admin-actions">
        {/* --- ADD EVENT --- */}
        <div className="action-card">
          <div
            className="action-header"
            onClick={() => setShowAddEvent(!showAddEvent)}
          >
            <h4>Add Event</h4>
            {showAddEvent ? <ChevronUp /> : <ChevronDown />}
          </div>

          {showAddEvent && (
            <form className="action-form" onSubmit={handleAddEvent}>
              <input
                placeholder="Title"
                required
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
              />
              <input
                placeholder="Type"
                required
                value={newEvent.type}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, type: e.target.value })
                }
              />
              <input
                placeholder="Start Location"
                required
                value={newEvent.startLocation}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, startLocation: e.target.value })
                }
              />
              <input
                placeholder="End Location"
                required
                value={newEvent.endLocation}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, endLocation: e.target.value })
                }
              />
              <div className="input-wrapper">
                <input
                  type="date"
                  placeholder=" "
                  required
                  value={newEvent.date}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date: e.target.value })
                  }
                />
                <label>Event Date</label>
              </div>

              <div className="input-wrapper">
                <input
                  type="time"
                  placeholder=" "
                  required
                  value={newEvent.startTime}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, startTime: e.target.value })
                  }
                />
                <label>Start Time</label>
              </div>

              <div className="input-wrapper">
                <input
                  type="time"
                  placeholder=" "
                  required
                  value={newEvent.endTime}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, endTime: e.target.value })
                  }
                />
                <label>End Time</label>
              </div>

              <button className="action-btn">Add Event</button>
            </form>
          )}
        </div>

        {/* --- ADD PARENT --- */}
        {/* <div className="action-card">
          <div
            className="action-header"
            onClick={() => setShowAddParent(!showAddParent)}
          >
            <h4>Add Parent</h4>
            {showAddParent ? <ChevronUp /> : <ChevronDown />}
          </div>

          {showAddParent && (
            <form className="action-form" onSubmit={handleAddParent}>
              {Object.keys(newParent).map((field) => (
                <input
                  key={field}
                  placeholder={field.replace("_", " ").toUpperCase()}
                  required
                  value={newParent[field]}
                  onChange={(e) =>
                    setNewParent({ ...newParent, [field]: e.target.value })
                  }
                />
              ))}
              <button className="action-btn">Add Parent</button>
            </form>
          )}
        </div> */}

        <div className="action-card">
          <div
            className="action-header"
            onClick={() => setShowAddParent(!showAddParent)}
          >
            <h4>Add Parent</h4>
            {showAddParent ? <ChevronUp /> : <ChevronDown />}
          </div>

          {showAddParent && (
            <form className="action-form" onSubmit={handleAddParent}>
              <input
                placeholder="First Name"
                required
                value={newParent.first_name}
                onChange={(e) =>
                  setNewParent({ ...newParent, first_name: e.target.value })
                }
              />
              <input
                placeholder="Last Name"
                required
                value={newParent.last_name}
                onChange={(e) =>
                  setNewParent({ ...newParent, last_name: e.target.value })
                }
              />
              <input
                placeholder="Email"
                required
                value={newParent.email}
                onChange={(e) =>
                  setNewParent({ ...newParent, email: e.target.value })
                }
              />
              <input
                placeholder="Phone Number"
                required
                value={newParent.phone}
                onChange={(e) =>
                  setNewParent({ ...newParent, phone: e.target.value })
                }
              />
              <input
                placeholder="Home Address"
                required
                value={newParent.address}
                onChange={(e) =>
                  setNewParent({ ...newParent, address: e.target.value })
                }
              />

              <button className="action-btn">Add Parent</button>
            </form>
          )}
        </div>

        {/* --- ADD VOLUNTEER --- */}
        <div className="action-card">
          <div
            className="action-header"
            onClick={() => setShowAddVolunteer(!showAddVolunteer)}
          >
            <h4>Add Volunteer</h4>
            {showAddVolunteer ? <ChevronUp /> : <ChevronDown />}
          </div>

          {showAddVolunteer && (
            <form className="action-form" onSubmit={handleAddVolunteer}>
              <input
                placeholder="First Name"
                required
                value={newVolunteer.first_name}
                onChange={(e) =>
                  setNewVolunteer({
                    ...newVolunteer,
                    first_name: e.target.value,
                  })
                }
              />
              <input
                placeholder="Last Name"
                required
                value={newVolunteer.last_name}
                onChange={(e) =>
                  setNewVolunteer({
                    ...newVolunteer,
                    last_name: e.target.value,
                  })
                }
              />

              <input
                placeholder="Birthdate (YYYY-MM-DD Format)"
                required
                value={newVolunteer.birthdate}
                onChange={(e) =>
                  setNewVolunteer({
                    ...newVolunteer,
                    birthdate: e.target.value,
                  })
                }
              />

              <input
                type="email"
                placeholder="Email"
                required
                value={newVolunteer.email}
                onChange={(e) =>
                  setNewVolunteer({ ...newVolunteer, email: e.target.value })
                }
              />
              <input
                placeholder="Phone Number"
                required
                value={newVolunteer.phone}
                onChange={(e) =>
                  setNewVolunteer({ ...newVolunteer, phone: e.target.value })
                }
              />

              {/* <select
                value={newVolunteer.interest}
                onChange={(e) =>
                  setNewVolunteer({ ...newVolunteer, interest: e.target.value })
                }
              >
                <option value="repair">Repair</option>
                <option value="rider">Rider</option>
              </select> */}

              <input
                placeholder="Interest"
                required
                value={newVolunteer.interest}
                onChange={(e) =>
                  setNewVolunteer({ ...newVolunteer, interest: e.target.value })
                }
              />

              <select
                required
                value={newVolunteer.preferred_school}
                onChange={(e) =>
                  setNewVolunteer({
                    ...newVolunteer,
                    preferred_school: e.target.value,
                  })
                }
              >
                <option value="">Preferred School</option>
                {schoolOptions.map((school) => (
                  <option key={school} value={school}>
                    {school}
                  </option>
                ))}
              </select>
              <button className="action-btn">Add Volunteer</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
