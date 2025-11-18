import React, { useState } from "react";
import "./Register.css";

export default function ParentRegister() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Parent registration:", form);
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Parent Application</h2>
        <p className="register-subtitle">
          Apply a parent to manage your child's events.
        </p>

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
            <label>Address</label>
            <input name="address" onChange={handleChange} required />
          </div>

          <button className="register-btn" type="submit">
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
}
