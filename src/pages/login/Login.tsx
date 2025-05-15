import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import { spaClient } from "../../shared/clients";


const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const validateForm = () => {
    let valid = true;
    const newErrors = { email: "", password: "" };

    if (!email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    } else {
      if (password.length < 6) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
      }
      if (!/[A-Z]/.test(password)) {
        newErrors.password = "Password must contain at least one uppercase letter (A-Z)";
        valid = false;
      }
      if (!/[a-z]/.test(password)) {
        newErrors.password = "Password must contain at least one lowercase letter (a-z)";
        valid = false;
      }
      if (!/[0-9]/.test(password)) {
        newErrors.password = "Password must contain at least one digit (0-9)";
        valid = false;
      }
      if (!/[^A-Za-z0-9]/.test(password)) {
        newErrors.password = "Password must contain at least one special character (!@#$%^&*)";
      valid = false;
      }
      if (password !== password.trim()) {
        newErrors.password = "Password must not contain leading or trailing whitespace";
        valid = false;
      }
    }
    
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  try {
    const body = new URLSearchParams();
    body.append("grant_type", "password");
    body.append("username", email);
    body.append("password", password);
    body.append("client_id", spaClient.clientId); // твой SPA clientId

    const response = await fetch(
      "https://auth.europe-west1.gcp.commercetools.com/oauth/api-rs-school/customers/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("Login error:", error);
      alert(error.error_description || "Login failed");
      return;
    }

    const data = await response.json();
    console.log("Login successful:", data);

    // Сохраняем токен, например, в localStorage
    localStorage.setItem("access_token", data.access_token);

    // Перенаправление (если используешь react-router)
    // navigate("/"); // если ты хочешь куда-то перенаправить
  } catch (error) {
    console.error("Unexpected error:", error);
    alert("Something went wrong during login.");
  }
};

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome!</h1>
        <p className="login-subtitle">Please enter your credentials</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "input-error" : ""}
              placeholder="Enter your email"
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={errors.password ? "input-error" : ""}
              placeholder="Enter your password"
            />
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              Remember me
            </label>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>

        <div className="signup-link">
          Don&apos;t have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;