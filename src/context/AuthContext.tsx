// src/context/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { apiClient } from "@/api/ApiClient";
import { Customer, MyCustomerDraft } from "@commercetools/platform-sdk";
import { ClientResponse } from "@commercetools/ts-client";

interface AuthContextType {
  isAuth: boolean;
  customer: Customer | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  logout: () => void;
  register: (customerData: Customer) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check for existing session on initial load
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          setLoading(true);
          await loginWithToken(token);
        } catch (err) {
          console.error("Session validation failed:", err);
          localStorage.removeItem("accessToken");
        } finally {
          setLoading(false);
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<Customer> => {
    setLoading(true);
    setError(null);
    try {
      const customer = await apiClient.loginCustomer(email, password);
      setCustomer(customer);
      return customer;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loginWithToken = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const customer: ClientResponse<Customer> =
        await apiClient.loginCustomerWithToken(token);
      if (customer) {
        console.log(customer);
        setCustomer(customer.body);
      } else {
        logout();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Session validation failed"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("accessToken");
    setCustomer(null);
  };

  const register = async (customerData: MyCustomerDraft) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiClient.registerCustomer(customerData);
      if (result.customer) {
        setCustomer(result.customer);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isAuth: !!customer,
    customer,
    login,
    loginWithToken,
    logout,
    register,
    loading,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
