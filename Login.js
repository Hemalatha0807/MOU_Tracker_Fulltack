
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Authform.css"; 

const Login = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (res.ok) {
      alert(data.message);
      navigate("/dashboard");
    } else {
      alert(data.message);
    }
  };

  return (
    <div
      className="auth-container"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(to right, #667eea, #764ba2)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div
        style={{
          background: "white",
          padding: "2rem",
          borderRadius: "15px",
          boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
          width: "350px",
          textAlign: "center",
        }}
      >
        <h1 style={{ marginBottom: "0.5rem", color: "#764ba2" }}>📘 MOU Tracker</h1>
        <h2 style={{ marginBottom: "1.5rem", color: "#333" }}>Login</h2>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", textAlign: "left", marginBottom: "5px" }}>Email</label>
          <input
            type="text"
            name="email"
            value={credentials.email}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <label style={{ display: "block", textAlign: "left", marginBottom: "5px", marginTop: "1rem" }}>Password</label>
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleChange}
            required
            style={inputStyle}
          />

          <button type="submit" style={buttonStyle}>Login</button>

          <div style={{ marginTop: "1rem", fontSize: "14px" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "#667eea", textDecoration: "underline" }}>
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "5px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  outline: "none",
};

const buttonStyle = {
  width: "100%",
  marginTop: "1.5rem",
  padding: "10px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#764ba2",
  color: "white",
  fontWeight: "bold",
  cursor: "pointer",
};

export default Login;
