import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

export const Header = () => {
  return (
    <header className="header">
      <nav className="nav-container">
        <ul className="nav-list">
          <li className="nav-item">
            <Link to="/" className="nav-link">
              Home
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/about" className="nav-link">
              About
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/shop" className="nav-link">
              Shop
            </Link>
          </li>
        </ul>
        <div className="auth-buttons">
          <Link to="/login" className="auth-button login-button">
            Login
          </Link>
          <Link to="/register" className="auth-button register-button">
            Register
          </Link>
        </div>
      </nav>
    </header>
  );
};
