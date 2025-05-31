import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/api/ApiClient";
import "./SearchInput.css";

interface SearchResult {
  id: string;
  key?: string;
  name: { [key: string]: string };
}

export const SearchInput = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async (term: string) => {
    if (term.trim() === "") {
      setSearchResults([]);
      return;
    }

    try {
      const response = await apiClient.searchProduct(term);
      setSearchResults(response.results || []);
      setIsDropdownOpen(true);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchTerm)}`);
      setIsDropdownOpen(false);
      inputRef.current?.blur();
    }
  };

  const handleResultClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setIsDropdownOpen(false);
    setSearchTerm("");
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        handleSearch(searchTerm);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

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
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsDropdownOpen(true);
          }}
          onFocus={() => searchTerm && setIsDropdownOpen(true)}
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
          <Link to={`/search?query=${encodeURIComponent(searchTerm)}`}>
            <div className="search-dropdown-footer">View all results</div>
          </Link>
        </div>
      )}
    </div>
  );
};
