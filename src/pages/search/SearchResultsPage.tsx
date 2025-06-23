import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiClient } from "@/api/ApiClient";
import { MyProductsData } from "@/@types/interfaces";
import ProductCatalog from "@/components/products/ProductCatalog/ProductCatalog";
import "./SearchResultsPage.css";

const SearchResultsPage = () => {
  const location = useLocation();
  const [results, setResults] = useState<MyProductsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const query = new URLSearchParams(location.search).get("query") || "";
    setSearchQuery(query);

    if (query) {
      setLoading(true);

      apiClient
        .searchData("name", query)
        .then((response) => {
          setResults(response);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Search error:", error);
          setLoading(false);
        });
    } else {
      setResults([]);
      setLoading(false);
    }
  }, [location.search]);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="main-container">
      <div className="search-results-container">
        <h2 className="search-results-title">
          {results.length === 0
            ? `No results found for "${searchQuery}"`
            : `Search Results for "${searchQuery}" (${results.length})`}
        </h2>

        <ProductCatalog
          propsLimit={results.length}
          propsSort="name-asc"
          propsProducts={results}
        />
      </div>
    </div>
  );
};

export default SearchResultsPage;
