import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApiClient } from "@/api/ApiClientContext";
import { validateEmail, validatePassword } from "@/utils/loginValidation";
import "./Login.css";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { MdError } from "react-icons/md"

const Login = () => {
  const { user } = useAuth();
  const apiClient = useApiClient();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/shop");
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [loginError, setLoginError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    } else if (name === "password") {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "email") {
      setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    } else if (name === "password") {
      setErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    try {
      const userData = await apiClient.loginCustomer(
        formData.email,
        formData.password
      );
      login(userData);
      navigate("/shop");
    } catch (err) {
      console.error("Login error:", err);
      setLoginError(err instanceof Error ? err.message : "Unexpected error");
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
          <div className="input-wrapper">
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.email ? "input-error" : ""}
              placeholder="Enter your email"
            />
            {errors.email && <MdError className="error-icon" />}
            </div>
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>


          <div className="form-group password-input-container">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.password ? "input-error" : ""}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              Remember me
            </label>
            {/* <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link> */}
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
