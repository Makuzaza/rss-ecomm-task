import { CustomerAddress } from "@/@types/interfaces";
import europeanCountries from "@/data/europeanCountries.json";

export function validatePostalCode(
  countryCode: string,
  postalCode: string,
): string | null {
  if (!countryCode) return "Please select a country first";
  if (!postalCode.trim()) return "Postal code is required";

  const selectedCountry = europeanCountries.find((c) => c.code === countryCode);

  if (!selectedCountry) return "Unknown country selected";

  const regex = new RegExp(selectedCountry.codeRegex);
  if (!regex.test(postalCode)) {
    return `Invalid postal code format. Example for ${selectedCountry.name}: ${selectedCountry.codeExample}`;
  }

  return null;
}

export function validateAddress(
  address: CustomerAddress,
): Partial<Record<keyof CustomerAddress, string>> {
  const errors: Partial<Record<keyof CustomerAddress, string>> = {};

  if (!address.streetName) errors.streetName = "Street name is required.";
  if (!address.city) errors.city = "City is required.";
  if (!address.country) errors.country = "Country is required.";
  if (!address.postalCode) {
    errors.postalCode = "Postal code is required.";
  } else if (!validatePostalCode(address.postalCode, address.country)) {
    errors.postalCode = "Invalid postal code format for selected country.";
  }

  return errors;
}
