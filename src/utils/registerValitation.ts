import { RegisterFormFields } from "@/@types/interfaces";
import europeanCountriesData from "@/data/europeanCountries.json";

const EMAIL_REGEX = /\S+@\S+\.\S+/;
const NAME_REGEX = /^[a-zA-Z]+$/;
const CITY_REGEX = /^[a-zA-Z\s]+$/;
// const POSTAL_CODE_REGEXES = [
//   /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/, // Canada
//   /^\d{5}(-\d{4})?$/, // US
// ];

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

export const validateField = (
  name: keyof RegisterFormFields,
  value: string,
  formData: RegisterFormFields,
  countries: typeof europeanCountriesData
): string => {
  switch (name) {
    case "email":
      if (!value) return "Email is required";
      if (!EMAIL_REGEX.test(value)) return "Email is invalid";
      break;

    case "password":
      if (!value) return "Password is required";
      break;

    case "confirmPassword":
      if (value !== formData.password) return "Passwords don't match";
      break;

    case "firstName":
    case "lastName":
      if (!value)
        return `${name === "firstName" ? "First" : "Last"} name is required`;
      if (!NAME_REGEX.test(value))
        return `${name === "firstName" ? "First" : "Last"} name can only contain letters`;
      break;
    case "dateOfBirth":
      if (!value) return "Date of birth is required";
      if (calculateAge(value) < 0)
        return "You are not born yet. Try again later.";
      if (calculateAge(value) < 13) return "You must be at least 13 years old";
      break;

    // SHIPPING ADRESS
    case "shippingCountry":
    case "billingCountry":
      if (!value) return "Country is required";
      if (!countries.some((c) => c.code === value))
        return "Please select a valid country";
      break;

    case "shippingCity":
    case "billingCity":
      if (!value) return "City is required";
      if (!CITY_REGEX.test(value))
        return "City can only contain letters and spaces";
      break;

    case "shippingStreet":
    case "billingStreet":
      if (!value.trim()) return "Street address is required";
      break;

    case "shippingPostalCode": {
      if (!formData.shippingCountry) return "Please select a country first";
      if (!value) return "Postal code is required";
      const selectedCountry = countries.find(
        (c) => c.code === formData.shippingCountry
      );
      if (selectedCountry) {
        const regex = new RegExp(selectedCountry.codeRegex);
        if (!regex.test(value)) {
          return `Invalid postal code format. Example for ${selectedCountry.name}: ${selectedCountry.codeExample}`;
        }
      }
      break;
    }

    // BILLING ADRESS

    case "billingPostalCode": {
      if (!formData.billingCountry) return "Please select a country first";
      if (!value) return "Postal code is required";
      const selectedCountry = countries.find(
        (c) => c.code === formData.billingCountry
      );
      if (selectedCountry) {
        const regex = new RegExp(selectedCountry.codeRegex);
        if (!regex.test(value)) {
          return `Invalid postal code format. Example for ${selectedCountry.name}: ${selectedCountry.codeExample}`;
        }
      }
      break;
    }
  }

  return "";
};

export const validateRegisterForm = (
  formData: RegisterFormFields,
  countries: typeof europeanCountriesData
): { isValid: boolean; errors: Record<keyof RegisterFormFields, string> } => {
  const errors: Record<keyof RegisterFormFields, string> = {
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
  };

  let isValid = true;

  for (const field in formData) {
    const key = field as keyof RegisterFormFields;
    const error = validateField(key, formData[key], formData, countries);
    if (error) {
      errors[key] = error;
      isValid = false;
    }
  }

  return { isValid, errors };
};
