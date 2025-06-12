import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { apiClient } from "@/api/ApiClient";
import {
  Customer,
  // CustomerSignInResult,
  MyCustomerDraft,
} from "@commercetools/platform-sdk";
import { TokenStore, AuthContextType } from "@/@types/interfaces";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        try {
          const parsedToken: TokenStore = JSON.parse(storedToken);
          if (parsedToken.expirationTime > Date.now()) {
            setToken(parsedToken.token);
            await loginWithToken(parsedToken.token);
          } else {
            localStorage.removeItem("accessToken");
          }
        } catch (err) {
          console.error("Failed to parse stored token:", err);
          localStorage.removeItem("accessToken");
        }
      }
    };

    initializeAuth();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(
    async (
      email: string,
      password: string,
      options?: { preventRedirect?: boolean },
    ): Promise<Customer> => {
      setLoading(true);
      clearError();
      let customerProfile: Customer;

      try {
        const customerSignIn = await apiClient.getCustomerWithPassword(
          email,
          password,
        );

        if (customerSignIn) {
          customerProfile = await apiClient.getCustomerProfile();
          setCustomer(customerProfile);
        }

        const storedToken = localStorage.getItem("accessToken");
        if (storedToken) {
          const parsedToken: TokenStore = JSON.parse(storedToken);
          setToken(parsedToken.token);
        }

        if (!options?.preventRedirect) {
          navigate("/");
        }

        return customerProfile;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Login failed";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [clearError, navigate],
  );

  const loginWithToken = useCallback(
    async (token: string): Promise<void> => {
      setLoading(true);
      clearError();
      let customerProfile: Customer;
      try {
        const customerSignIn = await apiClient.getCustomerWithToken(token);
        if (customerSignIn) {
          customerProfile = await apiClient.getCustomerProfile();
          setCustomer(customerProfile);
          setToken(token);
        } else {
          localStorage.removeItem("accessToken");
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Session validation failed";
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [clearError],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    setCustomer(null);
    setToken(null);
  }, []);

  const register = useCallback(
    async (customerData: MyCustomerDraft): Promise<Customer> => {
      setLoading(true);
      clearError();

      try {
        const customerSignUp = await apiClient.registerCustomer(customerData);
        let customerProfile: Customer;
        if (customerSignUp) {
          customerProfile = await apiClient.getCustomerProfile();
          setCustomer(customerProfile);

          // If registration includes automatic login
          const storedToken = localStorage.getItem("accessToken");
          if (storedToken) {
            const parsedToken: TokenStore = JSON.parse(storedToken);
            setToken(parsedToken.token);
          }
        }
        return customerProfile;
      } catch (err) {
        let message = "Registration failed";

        if (err instanceof Error) {
          message = err.message.includes("DuplicateField")
            ? "Email already exists"
            : err.message;
        }

        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [clearError],
  );

  const refreshToken = useCallback(async (): Promise<void> => {
    if (!token) return;

    setLoading(true);
    try {
      await loginWithToken(token);
    } catch (err) {
      console.error("Token refresh failed:", err);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, loginWithToken, logout]);

  const relogin = useCallback(
    async ({ email, password }: { email: string; password: string }) => {
      try {
        await login(email, password, { preventRedirect: true });
      } catch (err) {
        console.error("Relogin failed", err);
      }
    },
    [login],
  );

  const value: AuthContextType = {
    isAuth: !!customer,
    customer,
    token,
    login,
    loginWithToken,
    logout,
    relogin,
    register,
    loading,
    error,
    clearError,
    refreshToken,
    setCustomer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
