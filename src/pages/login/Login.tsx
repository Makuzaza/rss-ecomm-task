import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useApiClient } from "@/api/ApiClientContext";
import "./Login.css";

const Login = () => {
  // API CLIENT
  const apiClient = useApiClient();

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
        newErrors.password =
          "Password must contain at least one uppercase letter (A-Z)";
        valid = false;
      }
      if (!/[a-z]/.test(password)) {
        newErrors.password =
          "Password must contain at least one lowercase letter (a-z)";
        valid = false;
      }
      if (!/[0-9]/.test(password)) {
        newErrors.password = "Password must contain at least one digit (0-9)";
        valid = false;
      }
      if (!/[^A-Za-z0-9]/.test(password)) {
        newErrors.password =
          "Password must contain at least one special character (!@#$%^&*)";
        valid = false;
      }
      if (password !== password.trim()) {
        newErrors.password =
          "Password must not contain leading or trailing whitespace";
        valid = false;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const [loginError, setLoginError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (!validateForm()) return;

    try {
      const { accessToken } = await apiClient.loginCustomer(email, password);
      localStorage.setItem("accessToken", accessToken);
      console.log("Login successful. Token:", accessToken);
      // navigate("/shop");

    } catch (err) {
      console.error("Login error:", err);
      setLoginError(err instanceof Error ? err.message : "Unexpected login error.");
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
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
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
          {loginError && <p className="error-message">{loginError}</p>}
        </form>

        <div className="signup-link">
          Don&apos;t have an account? <Link to="/register">Sign up</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
