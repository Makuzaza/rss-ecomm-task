import React, { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Header } from "./header/Header";
import { Footer } from "./footer/Footer";
import "./App.css";
import { AuthProvider } from "./../context/AuthContext";
import { CartProvider } from "./../context/CartContext";

export const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Outlet />
          </main>
          <Footer />
        </div>
        <ToastContainer />
      </CartProvider>
    </AuthProvider>
  );
};
