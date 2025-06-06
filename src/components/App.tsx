import React, { Outlet } from "react-router-dom";
import { Header } from "./header/Header";
import { Footer } from "./footer/Footer";
import "./App.css";
import { AuthProvider } from "./../context/AuthContext";

export const App = () => {
  return (
    <AuthProvider>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
};
