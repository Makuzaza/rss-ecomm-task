import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Register.css"; 
import { useNavigate } from "react-router-dom"; 
import { getAnonimusToken } from "@/api/getAnonimusToken";
import { singnUp } from "@/api/singnUp";
import { getLoginToken } from "@/api/login";
import { adminClient, spaClient } from "@/shared/clients";


const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    street: "",
    city: "",
    postalCode: "",
    country: ""
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    street: "",
    city: "",
    postalCode: "",
    country: ""
  });

  const countries = [
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "Germany",
    "France",
    "Spain",
    "Italy",
    "India",
    "China",
    "Japan",
    "Brazil"
  ];

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      street: "",
      city: "",
      postalCode: "",
      country: ""
    };

    if (!formData.email) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase, one lowercase letter and one number";
      valid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
      valid = false;
    }

    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
      valid = false;
    } else if (!/^[a-zA-Z]+$/.test(formData.firstName)) {
      newErrors.firstName = "First name can only contain letters";
      valid = false;
    }

    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
      valid = false;
    } else if (!/^[a-zA-Z]+$/.test(formData.lastName)) {
      newErrors.lastName = "Last name can only contain letters";
      valid = false;
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
      valid = false;
    } else {
      const dob = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      if (age < 13) {
        newErrors.dateOfBirth = "You must be at least 13 years old";
        valid = false;
      }
    }

    if (!formData.street.trim()) {
      newErrors.street = "Street address is required";
      valid = false;
    }

    if (!formData.city) {
      newErrors.city = "City is required";
      valid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(formData.city)) {
      newErrors.city = "City can only contain letters and spaces";
      valid = false;
    }

    if (!formData.postalCode) {
      newErrors.postalCode = "Postal code is required";
      valid = false;
    } else if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(formData.postalCode) && 
               !/^\d{5}(-\d{4})?$/.test(formData.postalCode)) {
      newErrors.postalCode = "Postal code is invalid";
      valid = false;
    }

    if (!formData.country) {
      newErrors.country = "Country is required";
      valid = false;
    } else if (!countries.includes(formData.country)) {
      newErrors.country = "Please select a valid country";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    console.log("API:", process.env.CT_API_URL);
    const anonymousToken = await getAnonimusToken(
      adminClient.clientId,
      adminClient.clientSecret,
      adminClient.projectKey,
      adminClient.authUrl
    );

    if (!anonymousToken) {
      alert("Failed to get anonymous token");
      return;
    }
    
    const userData = { ...formData };
    delete userData.confirmPassword;

    // Registration first step
    const signupRes = await singnUp(userData, anonymousToken);

    if (!signupRes.ok) {
      const error = await signupRes.json();
      alert(`Signup failed: ${error.message}`);
      return;
    }

    //  Authorization (withPasswordFlow) second step 
    const tokenRes = await getLoginToken(userData.email, userData.password);

    if (!tokenRes.ok) {
      const error = await tokenRes.json();
      alert(`Login failed: ${error.message}`);
      return;
    }

    const tokens = await tokenRes.json();
    localStorage.setItem("token", tokens.access_token);
    navigate("/shop");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Create Account</h1>
        <p className="login-subtitle">Please fill in your details</p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? "input-error" : ""}
              placeholder="Enter your password"
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? "input-error" : ""}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={errors.firstName ? "input-error" : ""}
              placeholder="Enter your first name"
            />
            {errors.firstName && (
              <span className="error-message">{errors.firstName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={errors.lastName ? "input-error" : ""}
              placeholder="Enter your last name"
            />
            {errors.lastName && (
              <span className="error-message">{errors.lastName}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className={errors.dateOfBirth ? "input-error" : ""}
            />
            {errors.dateOfBirth && (
              <span className="error-message">{errors.dateOfBirth}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="street">Street Address</label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              className={errors.street ? "input-error" : ""}
              placeholder="Enter your street address"
            />
            {errors.street && (
              <span className="error-message">{errors.street}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="city">City</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={errors.city ? "input-error" : ""}
              placeholder="Enter your city"
            />
            {errors.city && (
              <span className="error-message">{errors.city}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="postalCode">Postal Code</label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className={errors.postalCode ? "input-error" : ""}
              placeholder="Enter your postal code"
            />
            {errors.postalCode && (
              <span className="error-message">{errors.postalCode}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className={errors.country ? "input-error" : ""}
            >
              <option value="">Select a country</option>
              {countries.map(country => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
            {errors.country && (
              <span className="error-message">{errors.country}</span>
            )}
          </div>

          <button type="submit" className="login-button">
            Register
          </button>
        </form>

        <div className="signup-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;