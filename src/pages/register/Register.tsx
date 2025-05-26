import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApiClient } from "@/context/ApiClientContext";
import {
  validateRegisterForm,
  validateField,
} from "@/utils/registerValitation";
import europeanCountriesData from "@/data/europeanCountries.json";
import { RegisterFormFields } from "@/@types/interfaces";
import "./Register.css";
import { useAuth } from "@/context/AuthContext";
import { MdError } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Register = () => {
  const { isAuth } = useAuth();
  const navigate = useNavigate();
  if (isAuth) navigate("/");

  const apiClient = useApiClient();
  const europeanCountries: typeof europeanCountriesData = europeanCountriesData;

  const [formData, setFormData] = useState<RegisterFormFields>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",

    shippingCountry: "",
    shippingCity: "",
    shippingStreet: "",
    shippingPostalCode: "",

    billingCountry: "",
    billingCity: "",
    billingStreet: "",
    billingPostalCode: "",
  });

  const [errors, setErrors] = useState<
    Record<keyof RegisterFormFields, string>
  >({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",

    shippingCountry: "",
    shippingCity: "",
    shippingStreet: "",
    shippingPostalCode: "",

    billingCountry: "",
    billingCity: "",
    billingStreet: "",
    billingPostalCode: "",
  });

  const [formError, setFormError] = useState<string | null>(null);
  const [passwordValidation, setPasswordValidation] = useState({
    minLength: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [showBillingAddress, setShowBillingAddress] = useState(false);
  const [defaultShippingAddress, setDefaultShippingAddress] = useState(true);
  const [defaultBillingAddress, setDefaultBillingAddress] = useState(true);

  const shippingCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      shippingPostalCode: "",
    }));
    setErrors((prev) => ({
      ...prev,
      shippingPostalCode: "",
    }));
  };

  const billingCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      billingPostalCode: "",
    }));
    setErrors((prev) => ({
      ...prev,
      billingPostalCode: "",
    }));
  };

  // Update the default address checkboxes when showBillingAddress changes
  useEffect(() => {
    if (!showBillingAddress) {
      setDefaultShippingAddress(true);
      setDefaultBillingAddress(true);
    }
  }, [showBillingAddress]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedForm = { ...prev, [name]: value };

      if (name === "password") {
        setPasswordValidation({
          minLength: value.length >= 8,
          hasUpper: /[A-Z]/.test(value),
          hasLower: /[a-z]/.test(value),
          hasNumber: /\d/.test(value),
        });
      }

      const error = validateField(
        name as keyof RegisterFormFields,
        value,
        updatedForm,
        europeanCountries,
        showBillingAddress
      );
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: error,
      }));
      return updatedForm;
    });
  };

  const handleBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const error = validateField(
      name as keyof RegisterFormFields,
      value,
      formData,
      europeanCountries,
      showBillingAddress
    );
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const validateForm = () => {
    const { isValid, errors } = validateRegisterForm(
      formData,
      europeanCountries,
      showBillingAddress
    );
    setErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (validateForm()) {
      try {
        // Create address objects
        const addresses = [
          {
            country: formData.shippingCountry,
            city: formData.shippingCity,
            streetName: formData.shippingStreet,
            postalCode: formData.shippingPostalCode,
            key: "shipping-address",
          },
        ];

        // Add billing address if enabled
        if (showBillingAddress) {
          addresses.push({
            country: formData.billingCountry,
            city: formData.billingCity,
            streetName: formData.billingStreet,
            postalCode: formData.billingPostalCode,
            key: "billing-address",
          });
        }

        const result = await apiClient.registerCustomer({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          addresses: addresses,
          defaultShippingAddress: defaultShippingAddress ? 0 : undefined,
          defaultBillingAddress:
            showBillingAddress && defaultBillingAddress ? 1 : undefined,
        });

        console.log("Registration successful:", result);
        navigate("/login");
      } catch (err: unknown) {
        if (err instanceof Error) {
          setFormError(err.message);
        } else {
          setFormError("Unexpected error occurred.");
        }
      }
    }
  };

  const allPasswordRequirementsMet =
    passwordValidation.minLength &&
    passwordValidation.hasUpper &&
    passwordValidation.hasLower &&
    passwordValidation.hasNumber;

  const showPasswordHints = formData.password && !allPasswordRequirementsMet;

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Create Account</h1>
        <p className="login-subtitle">Please fill in your details</p>
        <form onSubmit={handleSubmit} className="login-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className={`input-wrapper${errors.email ? " has-error" : ""}`}>
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
            {errors.email && (
              <span className="error-message">{errors.email}</span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group password-input-container">
            <label htmlFor="password">Password</label>
            <div
              className={`input-wrapper${errors.password ? " has-error" : ""}`}
            >
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
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.password && <MdError className="error-icon" />}
            </div>
            {errors.password && (
              <span className="error-message">{errors.password}</span>
            )}
            {showPasswordHints && (
              <div className="password-hints">
                <span className={passwordValidation.minLength ? "valid" : ""}>
                  • Minimum 8 characters
                </span>
                <span className={passwordValidation.hasUpper ? "valid" : ""}>
                  • At least 1 uppercase letter
                </span>
                <span className={passwordValidation.hasLower ? "valid" : ""}>
                  • At least 1 lowercase letter
                </span>
                <span className={passwordValidation.hasNumber ? "valid" : ""}>
                  • At least 1 number
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group password-input-container">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div
              className={`input-wrapper${errors.confirmPassword ? " has-error" : ""}`}
            >
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.confirmPassword ? "input-error" : ""}
                placeholder="Confirm your password"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
              {errors.confirmPassword && <MdError className="error-icon" />}
            </div>
            {errors.confirmPassword && (
              <span className="error-message">{errors.confirmPassword}</span>
            )}
          </div>

          {/* First Name Field */}
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <div
              className={`input-wrapper${errors.firstName ? " has-error" : ""}`}
            >
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.firstName ? "input-error" : ""}
                placeholder="Enter your first name"
              />
              {errors.firstName && <MdError className="error-icon" />}
            </div>
            {errors.firstName && (
              <span className="error-message">{errors.firstName}</span>
            )}
          </div>

          {/* Last Name Field */}
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <div
              className={`input-wrapper${errors.lastName ? " has-error" : ""}`}
            >
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.lastName ? "input-error" : ""}
                placeholder="Enter your last name"
              />
              {errors.lastName && <MdError className="error-icon" />}
            </div>
            {errors.lastName && (
              <span className="error-message">{errors.lastName}</span>
            )}
          </div>

          {/* Date of Birth Field */}
          <div className="form-group">
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <div
              className={`input-wrapper${errors.dateOfBirth ? " has-error" : ""}`}
            >
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.dateOfBirth ? "input-error" : ""}
              />
              {errors.dateOfBirth && <MdError className="error-icon" />}
            </div>
            {errors.dateOfBirth && (
              <span className="error-message">{errors.dateOfBirth}</span>
            )}
          </div>

          {/* Shipping Address - Country */}
          <div className="address-section address-section-shipping">
            <h3 className="address-section-title">Shipping Address</h3>
            <div className="form-group">
              <label htmlFor="shippingCountry">Country</label>
              <div
                className={`input-wrapper${errors.shippingCountry ? " has-error" : ""}`}
              >
                <select
                  id="shippingCountry"
                  name="shippingCountry"
                  value={formData.shippingCountry}
                  onChange={shippingCountryChange}
                  onBlur={handleBlur}
                  className={errors.shippingCountry ? "input-error" : ""}
                >
                  <option value="">Select a country</option>
                  {europeanCountries.map(({ name, code }) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
                {errors.shippingCountry && <MdError className="error-icon" />}
              </div>
              {errors.shippingCountry && (
                <span className="error-message">{errors.shippingCountry}</span>
              )}
            </div>

            {/* Shipping Address - City*/}
            <div className="form-group">
              <label htmlFor="shippingCity">City</label>
              <div
                className={`input-wrapper${errors.shippingCity ? " has-error" : ""}`}
              >
                <input
                  type="text"
                  id="shippingCity"
                  name="shippingCity"
                  value={formData.shippingCity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.shippingCity ? "input-error" : ""}
                  placeholder={
                    !formData.shippingCountry
                      ? "Select country first"
                      : "Enter your city"
                  }
                  disabled={!formData.shippingCountry}
                />
                {errors.shippingCity && <MdError className="error-icon" />}
              </div>
              {errors.shippingCity && (
                <span className="error-message">{errors.shippingCity}</span>
              )}
            </div>

            {/* Shipping Address - Street */}
            <div className="form-group">
              <label htmlFor="shippingStreet">Street Address</label>
              <div
                className={`input-wrapper${errors.shippingStreet ? " has-error" : ""}`}
              >
                <input
                  type="text"
                  id="shippingStreet"
                  name="shippingStreet"
                  value={formData.shippingStreet}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.shippingStreet ? "input-error" : ""}
                  placeholder={
                    !formData.shippingCountry
                      ? "Select country first"
                      : "Enter your street address"
                  }
                  disabled={!formData.shippingCountry}
                />
                {errors.shippingStreet && <MdError className="error-icon" />}
              </div>
              {errors.shippingStreet && (
                <span className="error-message">{errors.shippingStreet}</span>
              )}
            </div>

            {/* Shipping Address - Postal Code */}
            <div className="form-group">
              <label htmlFor="shippingPostalCode">Postal Code</label>
              <div
                className={`input-wrapper${errors.shippingPostalCode ? " has-error" : ""}`}
              >
                <input
                  type="text"
                  id="shippingPostalCode"
                  name="shippingPostalCode"
                  value={formData.shippingPostalCode}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.shippingPostalCode ? "input-error" : ""}
                  placeholder={
                    !formData.shippingCountry
                      ? "Select country first"
                      : "Enter your postal code"
                  }
                  disabled={!formData.shippingCountry}
                />
                {errors.shippingPostalCode && (
                  <MdError className="error-icon" />
                )}
              </div>
              {errors.shippingPostalCode && (
                <span className="error-message">
                  {errors.shippingPostalCode}
                </span>
              )}
            </div>

            {/* Default Address Checkbox */}
            {showBillingAddress && (
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={defaultShippingAddress}
                    onChange={(e) =>
                      setDefaultShippingAddress(e.target.checked)
                    }
                  />
                  <span>Set as default shipping address</span>
                </label>
              </div>
            )}
          </div>

          {/* Billing Address Section */}
          {showBillingAddress && (
            <div className="address-section address-section-billing">
              <h3 className="address-section-title">Billing Address</h3>

              {/* Billing Country Field */}
              <div className="form-group">
                <label htmlFor="billingCountry">Country</label>
                <div
                  className={`input-wrapper${errors.billingCountry ? " has-error" : ""}`}
                >
                  <select
                    id="billingCountry"
                    name="billingCountry"
                    value={formData.billingCountry}
                    onChange={billingCountryChange}
                    onBlur={handleBlur}
                    className={errors.billingCountry ? "input-error" : ""}
                  >
                    <option value="">Select a country</option>
                    {europeanCountries.map(({ name, code }) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                  {errors.billingCountry && <MdError className="error-icon" />}
                </div>
                {errors.billingCountry && (
                  <span className="error-message">{errors.billingCountry}</span>
                )}
              </div>

              {/* Billing City Field */}
              <div className="form-group">
                <label htmlFor="billingCity">City</label>
                <div
                  className={`input-wrapper${errors.billingCity ? " has-error" : ""}`}
                >
                  <input
                    type="text"
                    id="billingCity"
                    name="billingCity"
                    value={formData.billingCity}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.billingCity ? "input-error" : ""}
                    placeholder="Enter your billing city"
                    disabled={!formData.billingCountry}
                  />
                  {errors.billingCity && <MdError className="error-icon" />}
                </div>
                {errors.billingCity && (
                  <span className="error-message">{errors.billingCity}</span>
                )}
              </div>

              {/* Billing Street Address Field */}
              <div className="form-group">
                <label htmlFor="billingStreet">Street Address</label>
                <div
                  className={`input-wrapper${errors.billingStreet ? " has-error" : ""}`}
                >
                  <input
                    type="text"
                    id="billingStreet"
                    name="billingStreet"
                    value={formData.billingStreet}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.billingStreet ? "input-error" : ""}
                    placeholder="Enter your billing street address"
                    disabled={!formData.billingCountry}
                  />
                  {errors.billingStreet && <MdError className="error-icon" />}
                </div>
                {errors.billingStreet && (
                  <span className="error-message">{errors.billingStreet}</span>
                )}
              </div>

              {/* Billing Postal Code Field */}
              <div className="form-group">
                <label htmlFor="billingPostalCode">Postal Code</label>
                <div
                  className={`input-wrapper${errors.billingPostalCode ? " has-error" : ""}`}
                >
                  <input
                    type="text"
                    id="billingPostalCode"
                    name="billingPostalCode"
                    value={formData.billingPostalCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={errors.billingPostalCode ? "input-error" : ""}
                    placeholder="Enter your billing postal code"
                    disabled={!formData.billingCountry}
                  />
                  {errors.billingPostalCode && (
                    <MdError className="error-icon" />
                  )}
                </div>
                {errors.billingPostalCode && (
                  <span className="error-message">
                    {errors.billingPostalCode}
                  </span>
                )}
              </div>

              {/* Default Billing Address Checkbox  */}
              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={defaultBillingAddress}
                    onChange={(e) => {
                      setDefaultBillingAddress(e.target.checked);
                    }}
                  />
                  <span>Set as default billing address</span>
                </label>
              </div>
            </div>
          )}
          {/* Separate Billing Address Checkbox */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={!showBillingAddress}
                onChange={() => setShowBillingAddress(!showBillingAddress)}
              />
              <span>Shipping and billing addresses are the same.</span>
            </label>
          </div>
          {/* SUBMIT BUTTON */}
          <button type="submit" className="login-button">
            Register
          </button>
          {formError && <p className="error-message">{formError}</p>}
        </form>

        <div className="signup-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
