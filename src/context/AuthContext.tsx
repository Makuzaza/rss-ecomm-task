import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { apiClient } from "@/api/ApiClient";
import {
  Customer,
  MyCustomerDraft,
} from "@commercetools/platform-sdk";
import { TokenStore, AuthContextType } from "@/@types/interfaces";
import { useCart } from "@/context/CartContext";
import { mergeAnonymousCartWithCustomerCart } from "@/api/cart/cartMergeUtils";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { clearCart, reloadCart } = useCart();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        apiClient.initClientFromStorage();
        const raw = localStorage.getItem("accessToken");
        const storedToken: TokenStore | null = raw ? JSON.parse(raw) : null;

        const isValid = storedToken?.expirationTime && storedToken.expirationTime > Date.now();
        if (!isValid) {
          localStorage.removeItem("accessToken");
          return;
        }

        const customer = await apiClient.getCustomerProfile();
        setCustomer(customer);
        setToken(storedToken.token);
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
      options?: { preventRedirect?: boolean },
    ): Promise<Customer> => {
      setLoading(true);
      clearError();
      localStorage.removeItem("accessToken");

      try {
        const customerSignIn = await apiClient.getCustomerWithPassword(email, password);
        setCustomer(customerSignIn);

        const stored = localStorage.getItem("accessToken");
        if (stored) {
          const parsed: TokenStore = JSON.parse(stored);
          setToken(parsed.token);
        }

        const mergedCart = await mergeAnonymousCartWithCustomerCart();
        if (mergedCart) {
          localStorage.setItem("customerCartId", mergedCart.id);
        }

        await reloadCart();

        if (!options?.preventRedirect) {
          navigate("/");
        }

        return customerSignIn;
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Login failed";
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [clearError, navigate, reloadCart],
  );

  const loginWithToken = useCallback(
    async (token: string): Promise<void> => {
      setLoading(true);
      clearError();

      try {
        const customerSignIn = await apiClient.getCustomerWithToken(token);
        if (customerSignIn) {
          const profile = await apiClient.getCustomerProfile();
          setCustomer(profile);
          setToken(token);
        } else {
          localStorage.removeItem("accessToken");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Session validation failed";
        setError(msg);
        throw new Error(msg);
      } finally {
        setLoading(false);
      }
    },
    [clearError],
  );

  const logout = useCallback(async () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("customerCartId");
    setCustomer(null);
    setToken(null);

    apiClient.initAnonymousClient();
    clearCart();
    await reloadCart();
  }, [clearCart, reloadCart]);

  const register = useCallback(
    async (data: MyCustomerDraft): Promise<Customer> => {
      setLoading(true);
      clearError();
      localStorage.removeItem("accessToken");

      try {
        await apiClient.registerCustomer(data);
        const profile = await apiClient.getCustomerProfile();
        setCustomer(profile);

        const stored = localStorage.getItem("accessToken");
        if (stored) {
          const parsed: TokenStore = JSON.parse(stored);
          setToken(parsed.token);
        }

        return profile;
      } catch (err) {
        let msg = "Registration failed";
        if (err instanceof Error) {
          msg = err.message.includes("DuplicateField")
            ? "Email already exists"
            : err.message;
        }
        setError(msg);
        throw new Error(msg);
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
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
