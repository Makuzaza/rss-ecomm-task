import React from "react";
import ProductCatalog from "@/components/products/ProductCatalog/ProductCatalog";
import ProductCategories from "@/components/products/ProductCategory/ProductCategory";
import { Link } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="main-container">
      <section className="section__categories">
        <Link to={"/category"}>
          <div>
            <h2 className="section__header">TOP CATEGORIES</h2>
          </div>
        </Link>
        <ProductCategories propsLimit={4} />
        <Link to={"/category"}>
          <div className="section__footer">
            <h2>ALL CATEGORIES</h2>
          </div>
        </Link>
      </section>
      {/* PRODUCT SECTION */}
      <section className="section__product-catalog">
        <div>
          <h2 className="section__header">NEW ARRIVALS</h2>
        </div>
        <ProductCatalog
          propsLimit={8}
          propsSort={"createdAt desc"}
          propsArgs={{
            limit: 6,
            sort: "createdAt desc",
          }}
        />
        <Link to={"/products"}>
          <div className="section__footer">
            <h2>ALL PRODUCTS</h2>
          </div>
        </Link>
      </section>
    </div>
  );
};

export default HomePage;
