import React, { useState } from "react";
import ProductCatalog from "@/components/products/ProductCatalog/ProductCatalog";
import "./ProductsPage.css";

const ProductsPage = () => {
  const [sortOption, setSortOption] = useState<string>("name-asc");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [onlyDiscounted, setOnlyDiscounted] = useState<boolean>(false);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinPrice(e.target.value);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPrice(e.target.value);
  };

  const handleDiscountToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOnlyDiscounted(e.target.checked);
  };

  function resetAllFilters(): void {
    setSortOption("name-asc");
    setMinPrice("");
    setMaxPrice("");
    setOnlyDiscounted(false);
  }

  return (
    <div className="main-container">
      <div className="products-filters">
        <div className="filter-controls">
          <div className="price-filter">
            <label>
              Min Price:
              <input
                type="number"
                value={minPrice}
                onChange={handleMinPriceChange}
                placeholder="0"
                className="price-input"
              />
            </label>
            <label>
              Max Price:
              <input
                type="number"
                value={maxPrice}
                onChange={handleMaxPriceChange}
                placeholder="0"
                className="price-input"
              />
            </label>
          </div>
          <label className="discount-toggle">
            <input
              type="checkbox"
              checked={onlyDiscounted}
              onChange={handleDiscountToggle}
            />
            Only Discounted
          </label>
        </div>
        <div className="sort-controls">
          <label htmlFor="sort">Sort by:</label>
          <select
            id="sort"
            value={sortOption}
            onChange={handleSortChange}
            className="sort-select"
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="date-desc">Date (New Products)</option>
            <option value="date-asc">Date (Old Products)</option>
          </select>
        </div>
      </div>
      <div className="applied-filters-container">
        {(minPrice ||
          maxPrice ||
          onlyDiscounted ||
          sortOption !== "name-asc") && (
          <div className="applied-filters">
            <strong>Applied Filters:</strong>
            <ul>
              {minPrice && <li>Min Price: {minPrice}</li>}
              {maxPrice && <li>Max Price: {maxPrice}</li>}
              {onlyDiscounted && <li>Only Discounted</li>}
              {sortOption !== "name-asc" && (
                <li>
                  Sort:{" "}
                  {
                    {
                      "name-asc": "Name (A-Z)",
                      "name-desc": "Name (Z-A)",
                      "price-asc": "Price (Low to High)",
                      "price-desc": "Price (High to Low)",
                      "date-asc": "Date (New First)",
                      "date-desc": "Date (Old First)",
                    }[sortOption]
                  }
                </li>
              )}
            </ul>
          </div>
        )}

        <button onClick={resetAllFilters} className="reset-button">
          Reset Filters
        </button>
      </div>
      <ProductCatalog
        propsLimit={200}
        propsSort={sortOption}
        filterMinPrice={minPrice}
        filterMaxPrice={maxPrice}
        filterDiscountOnly={onlyDiscounted}
      />
    </div>
  );
};

export default ProductsPage;
