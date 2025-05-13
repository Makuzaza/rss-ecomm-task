import React, { Outlet } from "react-router-dom";
import { Header } from "./header/Header";
import { Footer } from "./footer/Footer";
import "./App.css";

export const App = () => {
  // console.log(process.env.VITE_CT_PROJECT_KEY); //  example of usage of env variable
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
