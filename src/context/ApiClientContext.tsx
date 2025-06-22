import React, { createContext, useContext } from "react";
import { apiClient, ApiClient } from "@/api/ApiClient";

const ApiClientContext = createContext<ApiClient | null>(null);

export const ApiClientProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ApiClientContext.Provider value={apiClient}>
      {children}
    </ApiClientContext.Provider>
  );
};

export const useApiClient = (): ApiClient => {
  const context = useContext(ApiClientContext);
  if (!context) {
    throw new Error("useApiClient must be used within an ApiClientProvider");
  }
  return context;
};