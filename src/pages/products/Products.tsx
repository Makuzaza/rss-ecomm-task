import React, { useState } from "react";
import ProductCatalog from "@/components/products/ProductCatalog/ProductCatalog";
import "./Products.css";

const Products = () => {
  const [sortOption, setSortOption] = useState<string>("name.en asc");

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
          <option value="name.en-US asc">Name (A-Z)</option>
          <option value="name.en-US desc">Name (Z-A)</option>
          <option value="masterVariant.prices[0].value.centAmount asc">
            Price (Low to High)
          </option>
          <option
            value="masterVariant.prices[0].value.centAmount
 desc"
          >
            Price (High to Low)
          </option>
        </select>
      </div>
      <ProductCatalog propsLimit={20} propsSort={sortOption} />
    </div>
  );
};

export default Products;
