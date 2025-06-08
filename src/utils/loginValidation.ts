export const validateEmail = (email: string): string => {
  if (!email) return "Email is required";
  if (!/\S+@\S+\.\S+/.test(email)) return "Email is invalid";
  return "";
};

export const validatePassword = (password: string): string => {
  if (!password.trim()) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password))
    return "Password must contain at least one uppercase letter";
  if (!/[a-z]/.test(password))
    return "Password must contain at least one lowercase letter";
  if (!/[0-9]/.test(password))
    return "Password must contain at least one digit";
  return "";
};


export const validateEmailFormat = (email: string): boolean => {
  if (!email || email.length > 320) return false;

  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return emailRegex.test(email);
};