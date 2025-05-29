import React from "react";
import ProductCatalog from "@/components/products/ProductCatalog/ProductCatalog";
import ProductCategories from "@/components/products/ProductCategory/ProductCategory";
import "./Shop.css";

const Shop = () => {
  return (
    <div className="main-container">
      <ProductCategories />
      <ProductCatalog propsLimit={8} propsTitle="NEW PRODUCTS" />
    </div>
  );
};

export default Shop;
