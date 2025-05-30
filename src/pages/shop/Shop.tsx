import React from "react";
import ProductCatalog from "@/components/products/ProductCatalog/ProductCatalog";
import ProductCategories from "@/components/products/ProductCategory/ProductCategory";
import "./Shop.css";
import { Link } from "react-router-dom";

const Shop = () => {
  return (
    <div className="main-container">
      <section className="section__categories">
        <Link to={"/category"}>
          <div>
            <h2 className="section__header">TOP CATEGORIES</h2>
          </div>
        </Link>
        <ProductCategories propsLimit={4} />
        <div>
          <Link to={"/category"}>
            <h2 className="section__header">ALL CATEGORIES</h2>
          </Link>
        </div>
      </section>
      {/* PRODUCT SECTION */}
      <section className="section__product-catalog">
        <div>
          <h2 className="section__header">NEW ARRIVALS</h2>
        </div>
        <ProductCatalog propsLimit={8} />
        <div>
          <Link to={"/products"}>
            <h2 className="section__header">ALL PRODUCTS</h2>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Shop;
