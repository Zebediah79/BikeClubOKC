import React, { useState } from "react";
import "./Register.css";

export default function Register() {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    address: "",
    phone: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = {
      first_name,
      last_name,
      email,
      address,
      phone,
    };

    try {
      const response = await fetch(
        "https://script.google.com/macros/s/AKfycbxfgjqpfCvu6S-goSF216CWNJkIiQAzO08vukxyGk9w-d1lscrbigEXQbvMqpdb7K1KRg/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      console.log(result);

      alert("Registration submitted!");
    } catch (error) {
      console.error("Submit error:", error);
      alert("Failed to submit");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Register Here</h2>
        <p className="register-subtitle">
          Join our community of volunteers, parents, and facilitators.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              name="first_name"
              value={form.first_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={form.last_name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="register-btn">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

/*import React from "react";
import "./Register.css";

export default function Register() {
  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Register Here</h2>
        <p className="register-subtitle">
          Join our community of volunteers, parents, and facilitators.
        </p>

        <form>
          <div className="form-group">
            <label htmlFor="first_name">First Name</label>
            <input type="text" id="first_name" name="first_name" required />
          </div>

          <div className="form-group">
            <label htmlFor="last_name">Last Name</label>
            <input type="text" id="last_name" name="last_name" required />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" required />
          </div>

          <div className="form-group">
            <label htmlFor="Address">Address</label>
            <input type="text" id="address" name="address" required />
          </div>

          <div className="form-group">
            <label htmlFor="Phone">Phone Number</label>
            <input type="phone" id="phone" name="phone" required />
          </div>

          <button type="submit" className="register-btn">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}
*/
