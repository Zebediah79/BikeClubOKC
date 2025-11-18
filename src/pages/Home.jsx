import React from "react";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">Join Our Community</h1>
        <p className="home-subtitle">
          Please fill out application if you are a:
        </p>

        <ul className="home-list">
          <li>
            <a href="/register/volunteer" className="list-link">
              Volunteer
            </a>
          </li>
          <li>
            <a href="/register/parent" className="list-link">
              Parent
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

/*import React from "react";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <div className="home-card">
        <h1 className="home-title">Join Our Community</h1>
        <p className="home-subtitle">Please register if you are a:</p>

        <ul className="home-list">
          <li>Volunteer</li>
          <li>Parent</li>
          <li>Facilitator</li>
        </ul>

        <a href="/register" className="cta-button">
          Register Now
        </a>
      </div>
    </div>
  );
}*/
