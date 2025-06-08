import europeanCountries from "@/data/europeanCountries.json";

export function validatePostalCode(countryCode: string, postalCode: string): string | null {
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