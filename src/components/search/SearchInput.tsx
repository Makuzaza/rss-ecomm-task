import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/api/ApiClient";
import { SearchResult } from "@/@types/interfaces";
import "./SearchInput.css";

export const SearchInput = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (value: string) => {
    if (value.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      const response = await apiClient.searchProductsByName(value);
      setSearchResults(response.results || []);
      setIsDropdownOpen(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchValue)}`);
      setIsDropdownOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleResultClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setIsDropdownOpen(false);
    setSearchValue("");
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchValue) {
        handleSearch(searchValue);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="search-container" ref={dropdownRef}>
      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="search"
          className="search-input"
          placeholder="Search for products..."
          value={searchValue}
          onChange={(e) => {
            setSearchValue(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => searchValue && setIsDropdownOpen(true)}
        />
      </form>

      {isDropdownOpen && searchResults.length > 0 && (
        <div className="search-dropdown">
          <div className="search-dropdown-header">
            <span>Search results:</span>
          </div>
          <ul className="search-results-list">
            {searchResults.map((product) => (
              <li
                key={product.key}
                className="search-result-item"
                onClick={() => handleResultClick(product.key)}
              >
                {product.name?.["en-US"] || "Unnamed product"}
              </li>
            ))}
          </ul>
          <Link to={`/search?query=${encodeURIComponent(searchValue)}`}>
            <div className="search-dropdown-footer">View all results</div>
          </Link>
        </div>
      )}
    </div>
  );
};
