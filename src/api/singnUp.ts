type UserData = {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
};

const countryMap: Record<string, string> = {
  Germany: "DE",
  France: "FR",
  "United States": "US",
  Canada: "CA",
  "United Kingdom": "GB",
  Australia: "AU",
  Spain: "ES",
  Italy: "IT",
  India: "IN",
  China: "CN",
  Japan: "JP",
  Brazil: "BR",
};



export const singnUp = async (userData: UserData, token: string) => {
  const safeUser = { ...userData };
    delete safeUser.confirmPassword;

  const countryCode = countryMap[safeUser.country] || safeUser.country;

  const body = {
    email: safeUser.email,
    password: safeUser.password,
    firstName: safeUser.firstName,
    lastName: safeUser.lastName,
    dateOfBirth: safeUser.dateOfBirth,
    addresses: [
      {
        streetName: safeUser.street,
        city: safeUser.city,
        country: countryCode,
        postalCode: safeUser.postalCode,
      },
    ],
  };

  console.log("📦 Sending signup payload:", body);

  const signupRes = await fetch(
    `${process.env.CT_API_URL}/${process.env.CT_PROJECT_KEY}/me/signup`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );

  return signupRes;
};
