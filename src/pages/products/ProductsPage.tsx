import React, { useState } from "react";
import ProductCatalog from "@/components/products/ProductCatalog/ProductCatalog";
import "./ProductsPage.css";

const ProductsPage = () => {
  const [sortOption, setSortOption] = useState<string>("name-asc");

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOption(e.target.value);
  };
  return (
    <div className="main-container">
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
        </select>
      </div>
      <ProductCatalog propsLimit={20} propsSort={sortOption} />
    </div>
  );
};

export default ProductsPage;
