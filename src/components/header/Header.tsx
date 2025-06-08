import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { SearchInput } from "../search/SearchInput";
import CategoryDropdown from "../products/ProductCategory/CategoryDropdown";
import { FaBars, FaTimes, FaSearch } from "react-icons/fa";
// import { useClickOutside } from "@/hooks/useClickOutside";
import { ClickOutsideEvent } from "@/@types/interfaces";

import "./Header.css";

export const Header = () => {
  const { isAuth, logout, customer } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (showMobileSearch) setShowMobileSearch(false);
  };

  const toggleMobileSearch = () => {
    setShowMobileSearch(!showMobileSearch);
    if (isMobileMenuOpen) setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: ClickOutsideEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // useClickOutside(menuRef, () => setIsMobileMenuOpen(false), isMobileMenuOpen);

  return (
    <header className="header">
      <nav className="nav-container">
        <div className="mobile-controls">
          <button
            className="mobile-menu-button"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
          <div className="mobile-search-container">
            {showMobileSearch && (
              <div className="mobile-search-input">
                <SearchInput />
              </div>
            )}
            <button
              className="mobile-search-button"
              onClick={toggleMobileSearch}
              aria-label="Toggle search"
            >
              <FaSearch />
            </button>
          </div>
        </div>
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
            <div className="nav-link">
              <CategoryDropdown />
            </div>
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
        <div className="search-wrapper desktop-search">
          <SearchInput />
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

        {isMobileMenuOpen && (
          <div className="mobile-menu" ref={menuRef}>
            <ul className="mobile-nav-list">
              <li className="mobile-nav-item">
                <Link
                  to="/"
                  className="mobile-nav-link"
                  onClick={toggleMobileMenu}
                >
                  Home
                </Link>
              </li>
              <li className="mobile-nav-item">
                <Link
                  to="/about"
                  className="mobile-nav-link"
                  onClick={toggleMobileMenu}
                >
                  About
                </Link>
              </li>
              <li className="mobile-nav-item">
                <div
                  className="mobile-nav-link"
                  style={{ paddingLeft: "14px" }}
                >
                  <CategoryDropdown />
                </div>
              </li>
              <li className="mobile-nav-item">
                <Link
                  to="/Products"
                  className="mobile-nav-link"
                  onClick={toggleMobileMenu}
                >
                  Products
                </Link>
              </li>
              {isAuth && (
                <li className="mobile-nav-item">
                  <Link
                    to="/profile"
                    className="mobile-nav-link"
                    onClick={toggleMobileMenu}
                  >
                    Profile
                  </Link>
                </li>
              )}
              <li className="mobile-nav-item">
                {isAuth ? (
                  <button
                    onClick={() => {
                      logout();
                      toggleMobileMenu();
                    }}
                    className="mobile-auth-button"
                  >
                    Logout
                  </button>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="mobile-auth-button"
                      onClick={toggleMobileMenu}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="mobile-auth-button"
                      onClick={toggleMobileMenu}
                    >
                      Register
                    </Link>
                  </>
                )}
              </li>
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
};
