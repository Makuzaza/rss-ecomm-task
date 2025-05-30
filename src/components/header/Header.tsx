import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import "./Header.css";

export const Header = () => {
  const { isAuth, logout, customer } = useAuth();
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
            <Link to="/category" className="nav-link">
              Category
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/Products" className="nav-link">
              Products
            </Link>
          </li>
          {isAuth && (
            <li className="nav-item">
              <Link to="/profile" className="nav-link">
                Profile
              </Link>
            </li>
          )}
        </ul>
        <div className="search-container">
          <input
            type="search"
            id="search-input"
            name="searchInput"
            className="input__search"
            placeholder="search for product..."
          />
        </div>
        <div className="auth-buttons">
          {isAuth ? (
            <>
              <span className="welcome-message">
                Welcome, {customer.firstName}!
              </span>
              <button onClick={logout} className="auth-button logout-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-button login-button">
                Login
              </Link>
              <Link to="/register" className="auth-button register-button">
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};
