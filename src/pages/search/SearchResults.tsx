import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiClient } from "@/api/ApiClient";
import { MyProductsData } from "@/@types/interfaces";
import ProductCatalog from "@/components/products/ProductCatalog/ProductCatalog";
import "./SearchResults.css";

const SearchResults = () => {
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
        .searchProductsByName(query)
        .then((response) => {
          const transformedResults = response.results.map((product) => ({
            id: product.id,
            key: product.key || product.id,
            sku: product.masterVariant.sku,
            name: product.name?.["en-US"] || "Unnamed product",
            description: product.description?.["en-US"] || "",
            images: product.masterVariant.images || [],
            price:
              product.masterVariant.prices?.[0]?.value?.centAmount / 100 || 0,
            priceDiscounted:
              product.masterVariant.prices?.[0]?.discounted?.value?.centAmount /
                100 || 0,
          }));
          setResults(transformedResults);
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
          products={results}
          propsLimit={results.length}
          propsSort="name-asc"
        />
      </div>
    </div>
  );
};

export default SearchResults;
