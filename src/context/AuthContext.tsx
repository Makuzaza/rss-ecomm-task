import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "@/api/ApiClient";
import { useNavigate } from "react-router-dom";
import { AuthContextType } from "@/@types/interfaces";
import { type TokenStore } from "@commercetools/ts-client";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate();
  const [isAuth = false, setAuth] = useState<boolean | null>(null);

  useEffect(() => {
    const tokenString = localStorage.getItem("accessToken");
    const accessToken: TokenStore | null = tokenString
      ? JSON.parse(tokenString)
      : null;
    console.log(accessToken);
    if (accessToken) {
      apiClient
        .loginCustomerWithToken(accessToken.token)
        .then((res) => {
          if (res.statusCode === 200) {
            setAuth(true);
          } else {
            logout();
          }
        })
        .catch(() => logout());
    }
  }, []);

  const login = () => {
    setAuth(true);
    console.log("Login");
    navigate("/");
  };

  const logout = () => {
    setAuth(false);
    localStorage.removeItem("accessToken");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
