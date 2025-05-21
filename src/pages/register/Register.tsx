import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApiClient } from "@/api/ApiClientContext";
import {
  validateRegisterForm,
  validateField,
} from "@/utils/registerValitation";
import europeanCountriesData from "@/data/europeanCountries.json";
import { RegisterFormFields, СountriesList } from "@/@types/interfaces";
import "./Register.css";
import { MdError } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";


const Register = () => {
  const navigate = useNavigate();
  const apiClient = useApiClient();
  const europeanCountries: СountriesList[] = europeanCountriesData;

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
          defaultShippingAddress: 0,
          defaultBillingAddress: 0,
        });

        console.log("Registration successful:", result);
        navigate("/");
      } catch (err: unknown) {
        if (err instanceof Error) {
          setFormError(err.message);
        } else {
          setFormError("Unexpected error occurred.");
        }
      }
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check if all password requirements are met
  const allPasswordRequirementsMet =
    passwordValidation.minLength &&
    passwordValidation.hasUpper &&
    passwordValidation.hasLower &&
    passwordValidation.hasNumber;

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Create Account</h1>
        <p className="login-subtitle">Please fill in your details</p>
        <form onSubmit={handleSubmit} className="login-form">
          {[
            {
              id: "email",
              type: "email",
              label: "Email",
              placeholder: "Enter your email",
            },
            {
              id: "password",
              type: "password",
              label: "Password",
              placeholder: "Enter your password",
            },
            {
              id: "confirmPassword",
              type: "password",
              label: "Confirm Password",
              placeholder: "Confirm your password",
            },
            {
              id: "firstName",
              type: "text",
              label: "First Name",
              placeholder: "Enter your first name",
            },
            {
              id: "lastName",
              type: "text",
              label: "Last Name",
              placeholder: "Enter your last name",
            },
            {
              id: "dateOfBirth",
              type: "date",
              label: "Date of Birth",
              placeholder: "",
            },
            {
              id: "street",
              type: "text",
              label: "Street Address",
              placeholder: "Enter your street address",
            },
            {
              id: "city",
              type: "text",
              label: "City",
              placeholder: "Enter your city",
            },
            {
              id: "postalCode",
              type: "text",
              label: "Postal Code",
              placeholder: "Enter your postal code",
            },
          ].map(({ id, type, label, placeholder }) => {
            const hasError = !!errors[id as keyof RegisterFormFields];
            const showPasswordHints =
              id === "password" &&
              formData.password &&
              !allPasswordRequirementsMet;
              
            if (id === "password" || id === "confirmPassword") {
              const isPassword = id === "password";
              const showCurrentPassword = isPassword ? showPassword : showConfirmPassword;
              const toggleShowCurrentPassword = isPassword
                ? () => setShowPassword(!showPassword)
                : () => setShowConfirmPassword(!showConfirmPassword);

              return (
                <div className="form-group password-input-container" key={id}>
                  <label htmlFor={id}>{label}</label>
                  <div className={`input-wrapper${hasError ? " has-error" : ""}`}>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      id={id}
                      name={id}
                      value={formData[id as keyof RegisterFormFields]}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={hasError ? "input-error" : ""}
                      placeholder={placeholder}
                    />

                    <button
                      type="button"
                      className="password-toggle"
                      onClick={toggleShowCurrentPassword}
                      aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                    >
                      {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>

                    {hasError && <MdError className="error-icon" />}
                  </div>

                  {hasError && (
                    <span className="error-message">
                      {errors[id as keyof RegisterFormFields]}
                    </span>
                  )}

                  {isPassword && showPasswordHints && (
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
              );
            }

            return (
              <div className="form-group" key={id}>
                <label htmlFor={id}>{label}</label>
                <div className="input-wrapper">
                  <input
                    type={type}
                    id={id}
                    name={id}
                    value={formData[id as keyof RegisterFormFields]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={hasError ? "input-error" : ""}
                    placeholder={placeholder}
                  />
                  {hasError && <MdError className="error-icon" />}
                </div>
                {hasError && (
                  <span className="error-message">
                    {errors[id as keyof RegisterFormFields]}
                  </span>
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
            );
          })}

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <div className="input-wrapper">
              <select
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
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


          <button type="submit" className="login-button">Register</button>
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
