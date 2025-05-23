import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApiClient } from "@/api/ApiClientContext";
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const apiClient = useApiClient();
  const europeanCountries: typeof europeanCountriesData = europeanCountriesData;

  useEffect(() => {
    if (user) {
      navigate("/shop");
    }
  }, [user, navigate]);

  const [formData, setFormData] = useState<RegisterFormFields>({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
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
    street: "",
    city: "",
    postalCode: "",
    country: "",
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
  const [isDefaultAddress, setIsDefaultAddress] = useState(true);

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      postalCode: "",
    }));
    setErrors((prev) => ({
      ...prev,
      postalCode: "",
    }));
  };
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
        europeanCountries
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
      europeanCountries
    );
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const validateForm = () => {
    const { isValid, errors } = validateRegisterForm(
      formData,
      europeanCountries
    );
    setErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (validateForm()) {
      try {
        const result = await apiClient.registerCustomer({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          dateOfBirth: formData.dateOfBirth,
          addresses: [
            {
              streetName: formData.street,
              city: formData.city,
              postalCode: formData.postalCode,
              country: formData.country,
            },
          ],
          ...(isDefaultAddress && {
            defaultShippingAddress: 0,
            defaultBillingAddress: 0,
          }),
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

  const isAddressDisabled = !formData.country;
  const showPasswordHints = formData.password && !allPasswordRequirementsMet;
  // const selectedCountry = europeanCountries.find(
  //   (c) => c.code === formData.country
  // );
  // const postalCodeExample = selectedCountry?.codeExample || "12345";

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

          {/* Country Field */}
          <div className="form-group">
            <label htmlFor="country">Country</label>
            <div
              className={`input-wrapper${errors.country ? " has-error" : ""}`}
            >
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleCountryChange}
                onBlur={handleBlur}
                className={errors.country ? "input-error" : ""}
              >
                <option value="">Select a country</option>
                {europeanCountries.map(({ name, code }) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
              {errors.country && <MdError className="error-icon" />}
            </div>
            {errors.country && (
              <span className="error-message">{errors.country}</span>
            )}
          </div>

          {/* Street Address Field */}
          <div className="form-group">
            <label htmlFor="street">Street Address</label>
            <div
              className={`input-wrapper${errors.street ? " has-error" : ""}`}
            >
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.street ? "input-error" : ""}
                placeholder={
                  isAddressDisabled
                    ? "Select country first"
                    : "Enter your street address"
                }
                disabled={isAddressDisabled}
              />
              {errors.street && <MdError className="error-icon" />}
            </div>
            {errors.street && (
              <span className="error-message">{errors.street}</span>
            )}
          </div>

          {/* City Field */}
          <div className="form-group">
            <label htmlFor="city">City</label>
            <div className={`input-wrapper${errors.city ? " has-error" : ""}`}>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.city ? "input-error" : ""}
                placeholder={
                  isAddressDisabled ? "Select country first" : "Enter your city"
                }
                disabled={isAddressDisabled}
              />
              {errors.city && <MdError className="error-icon" />}
            </div>
            {errors.city && (
              <span className="error-message">{errors.city}</span>
            )}
          </div>

          {/* Postal Code Field */}
          <div className="form-group">
            <label htmlFor="postalCode">Postal Code</label>
            <div
              className={`input-wrapper${errors.postalCode ? " has-error" : ""}`}
            >
              <input
                type="text"
                id="postalCode"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.postalCode ? "input-error" : ""}
                placeholder={
                  isAddressDisabled
                    ? "Select country first"
                    : "Enter your postal code"
                }
                disabled={isAddressDisabled}
              />
              {errors.postalCode && <MdError className="error-icon" />}
            </div>
            {errors.postalCode && (
              <span className="error-message">{errors.postalCode}</span>
            )}
          </div>
          {/* Default Address Checkbox */}
          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isDefaultAddress}
                onChange={() => setIsDefaultAddress(!isDefaultAddress)}
              />
              <span>Set as default address</span>
            </label>
          </div>

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
