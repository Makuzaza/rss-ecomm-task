export interface CommerceToolsError {
  body: {
    statusCode: number;
    message: string;
    errors?: {
      code: string;
      message: string;
      field?: string;
    }[];
  };
}

export type RegisterFormFields = {
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

export interface СountriesList {
  name: string;
  code: string;
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

