import React from "react";
import ProductCatalog from "@/components/products/ProductCatalog/ProductCatalog";
import "./Products.css";

const Products = () => {
  return (
    <div>
      <ProductCatalog
      // propsLimit={8}
      // propsSort="name.en asc"
      // propsTitle="ALL PRODUCTS"
      />
    </div>
  );
};

export default Products;
