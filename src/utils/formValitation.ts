import { RegisterFormFields } from "@/@types/interfaces";

const defaultErrors: Record<keyof RegisterFormFields, string> = {
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
};

const EMAIL_REGEX = /\S+@\S+\.\S+/;
const NAME_REGEX = /^[a-zA-Z]+$/;
const CITY_REGEX = /^[a-zA-Z\s]+$/;
const POSTAL_CODE_REGEXES = [
  /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, // Canada
  /^\d{5}(-\d{4})?$/, // US
];

const calculateAge = (date: string): number => {
  const birthDate = new Date(date);
  const today = new Date();
  return (
    today.getFullYear() -
    birthDate.getFullYear() -
    (today <
    new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate())
      ? 1
      : 0)
  );
};

export const validateRegisterForm = (
  formData: RegisterFormFields,
  countries: { code: string }[]
): { isValid: boolean; errors: Record<keyof RegisterFormFields, string> } => {
  const errors = { ...defaultErrors };
  let valid = true;

  if (!formData.email) {
    errors.email = "Email is required";
    valid = false;
  } else if (!EMAIL_REGEX.test(formData.email)) {
    errors.email = "Email is invalid";
    valid = false;
  }

  if (!formData.password) {
    errors.password = "Password is required";
    valid = false;
  } else if (formData.password.length < 8) {
    errors.password = "Password must be at least 8 characters";
    valid = false;
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
    errors.password =
      "Password must contain at least one uppercase, one lowercase letter and one number";
    valid = false;
  }

  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword = "Passwords don't match";
    valid = false;
  }

  if (!formData.firstName) {
    errors.firstName = "First name is required";
    valid = false;
  } else if (!NAME_REGEX.test(formData.firstName)) {
    errors.firstName = "First name can only contain letters";
    valid = false;
  }

  if (!formData.lastName) {
    errors.lastName = "Last name is required";
    valid = false;
  } else if (!NAME_REGEX.test(formData.lastName)) {
    errors.lastName = "Last name can only contain letters";
    valid = false;
  }

  if (!formData.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required";
    valid = false;
  } else if (calculateAge(formData.dateOfBirth) < 13) {
    errors.dateOfBirth = "You must be at least 13 years old";
    valid = false;
  }

  if (!formData.street.trim()) {
    errors.street = "Street address is required";
    valid = false;
  }

  if (!formData.city) {
    errors.city = "City is required";
    valid = false;
  } else if (!CITY_REGEX.test(formData.city)) {
    errors.city = "City can only contain letters and spaces";
    valid = false;
  }

  if (!formData.postalCode) {
    errors.postalCode = "Postal code is required";
    valid = false;
  } else if (
    !POSTAL_CODE_REGEXES.some((regex) => regex.test(formData.postalCode))
  ) {
    errors.postalCode = "Postal code is invalid";
    valid = false;
  }

  if (!formData.country) {
    errors.country = "Country is required";
    valid = false;
  } else if (!countries.some((c) => c.code === formData.country)) {
    errors.country = "Please select a valid country";
    valid = false;
  }

  return { isValid: valid, errors };
};
