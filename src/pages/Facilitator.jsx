import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import { ChevronDown, ChevronUp } from "lucide-react";
import "../stylings/Dashboard.css";
import { useAuth } from "../auth/AuthProvider";

const API = import.meta.env.VITE_API_URL;

export default function Facilitator() {
  const { token, userId, role, isFacilitator } = useAuth();

  const [facilitator, setFacilitator] = useState(null);
  const [events, setEvents] = useState([]);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [editingEventId, setEditingEventId] = useState(null); // Track which event is in edit mode
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingEvent, setEditingEvent] = useState(null); // edit event form data

  function handleEditEvent(event) {
    setEditingEventId(event.id); // Toggle edit mode for this event
    setEditingEvent(event); // Load event data into form
  }

  function cancelEditEvent() {
    setEditingEventId(null);
    setEditingEvent(null);
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
        const profileResponse = await fetch(
          `${API}/volunteers/facilitator/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const profileData = await profileResponse.json();
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
        // alert("Failed to create event.");
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

      // alert("Event created!");
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

    // Transform snake_case to camelCase for backend
    const eventData = {
      title: editingEvent.title,
      type: editingEvent.type,
      date: editingEvent.date,
      startLocation: editingEvent.start_location,
      endLocation: editingEvent.end_location,
      startTime: editingEvent.start_time,
      endTime: editingEvent.end_time,
    };

    const res = await fetch(
      `${API}/volunteers/facilitator/${userId}/events/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(eventData),
      }
    );

    const text = await res.text(); // safer than .json()

    if (!res.ok) {
      console.error("Update failed:", text);
      // alert("Failed to update event.");
      return;
    }

    const updated = JSON.parse(text);

    // Transform camelCase response back to snake_case to match frontend data structure
    const transformedUpdated = {
      ...updated,
      start_location: updated.startLocation || updated.start_location,
      end_location: updated.endLocation || updated.end_location,
      start_time: updated.startTime || updated.start_time,
      end_time: updated.endTime || updated.end_time,
    };

    setEvents((prev) =>
      prev.map((ev) =>
        ev.id === transformedUpdated.id
          ? { ...transformedUpdated } // ensures new object reference
          : ev
      )
    );

    setEditingEventId(null);
    setEditingEvent(null);
    // alert("Event updated!");
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
        // alert("Failed to create parent.");
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

      // alert("Parent created! (Password auto-set to 'password')");
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
        // alert("Failed to create volunteer.");
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

      // alert("Volunteer created! (Password auto-set to 'password')");
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
    <div className="container">
      <div className="profile">
        <h2>
          Welcome, {facilitator.first_name} {facilitator.last_name}
        </h2>
        <p>{facilitator.email}</p>
        <p>{facilitator.phone}</p>
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
        <h3>All Events</h3>

        {events.map((event) => (
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
                <strong>Date:</strong> {event.date}
              </p>

              {expandedEventId === event.id && (
                <div className="event-details">
                  {editingEventId === event.id && editingEvent ? (
                    // EDIT MODE: Show form inputs inline
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleUpdateEvent(e);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-edit-form"
                    >
                      <div className="form-group">
                        <label>Title</label>
                        <input
                          type="text"
                          value={editingEvent.title}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              title: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Type</label>
                        <input
                          type="text"
                          value={editingEvent.type}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              type: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Start Location</label>
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
                      </div>

                      <div className="form-group">
                        <label>End Location</label>
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
                      </div>

                      <div className="form-group">
                        <label>Date</label>
                        <input
                          type="date"
                          value={
                            editingEvent?.date
                              ? new Date(editingEvent.date)
                                  .toISOString()
                                  .split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              date: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>Start Time</label>
                        <input
                          type="time"
                          value={editingEvent.start_time}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              start_time: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="form-group">
                        <label>End Time</label>
                        <input
                          type="time"
                          value={editingEvent.end_time}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              end_time: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="save-btn">
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEditEvent();
                          }}
                          className="cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    // VIEW MODE: Show event details
                    <>
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
                    </>
                  )}
                </div>
              )}
            </div>
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
