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
import { useCart } from "@/context/CartContext";
// Assuming you have a utility function to reload the cart

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Initialize auth state from localStorage
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Set initial loading to true
  const [error, setError] = useState<string | null>(null);
  const { clearCart, reloadCart } = useCart(); // Combined call

  // ✅ You already imported apiClient correctly

  // ✅ INIT LOGIC FOR AUTHENTICATED CUSTOMERS
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log(
          "AccessToken in localStorage:",
          localStorage.getItem("accessToken")
        );
        apiClient.initClientFromStorage(); // загружает клиент с токеном

        const raw = localStorage.getItem("accessToken");
        const token = raw ? JSON.parse(raw) : null;

        const isValid =
          token?.expirationTime && token.expirationTime > Date.now();

        if (!isValid) {
          console.warn("Token expired");
          localStorage.removeItem("accessToken");
          return;
        }

        // Попробуй вызвать /me
        const customer = await apiClient.getCustomerProfile();
        setCustomer(customer);
        setToken(token.token);
      } catch (error) {
        console.warn("Auth restoration failed:", error);
        localStorage.removeItem("accessToken");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(
    async (
      email: string,
      password: string,
      options?: { preventRedirect?: boolean }
    ): Promise<Customer> => {
      setLoading(true);
      clearError();
      localStorage.removeItem("accessToken");
      let customerProfile: Customer;

      try {
        const customerSignIn = await apiClient.getCustomerWithPassword(
          email,
          password
        );
        setCustomer(customerSignIn);

        const storedToken = localStorage.getItem("accessToken");
        if (storedToken) {
          const parsedToken: TokenStore = JSON.parse(storedToken);
          setToken(parsedToken.token);
        }

        await reloadCart();

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
    [clearError, navigate, reloadCart]
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
    [clearError]
  );

  const logout = useCallback(async () => {
    localStorage.removeItem("accessToken");
    apiClient.setAuth(false);
    setCustomer(null);
    setToken(null);

    // apiClient.initAnonymousClient(); // ✅ переключаем client на anonymous

    clearCart(); // 🔁 сбрасываем локальную корзину
    await reloadCart(); // ✅ создаём новую анонимную корзину
  }, [clearCart, reloadCart]);

  const register = useCallback(
    async (customerData: MyCustomerDraft): Promise<Customer> => {
      setLoading(true);
      clearError();
      localStorage.removeItem("accessToken");

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
    [clearError]
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
    [login]
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
