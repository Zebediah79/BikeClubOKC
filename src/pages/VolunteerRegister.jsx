import React, { useState } from "react";
import "./Register.css";

export default function VolunteerRegister() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    interest: "repair",
    preferred_school: "",
  });

  const schools = [
    "Pflugerville Elementary",
    "Highland Park Elementary",
    "Brookhollow Elementary",
    "Springhill Elementary",
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Volunteer registration:", form);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Volunteer Application</h2>
        <p className="register-subtitle">Apply to help our biking community.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name</label>
            <input name="first_name" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input name="last_name" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input name="email" type="email" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input name="phone" onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Interest</label>
            <select name="interest" onChange={handleChange}>
              <option value="repair">Repair</option>
              <option value="rider">Rider</option>
            </select>
          </div>

          <div className="form-group">
            <label>Preferred School</label>
            <select name="preferred_school" onChange={handleChange} required>
              <option value="">Select a school</option>
              {schools.map((school, i) => (
                <option key={i} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </div>

          <button className="register-btn" type="submit">
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
}
