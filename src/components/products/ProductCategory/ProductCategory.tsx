import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApiClient } from "@/context/ApiClientContext";
import "./ProductCategory.css";
import "@/pages/shop/Shop.css";

const ProductCategory = () => {
  const apiClient = useApiClient();
  const [categories, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const arg = {
          limit: 4,
          // sort: "name.en asc"
        };
        const productsData = await apiClient.getAllCategories(arg);
        console.log("Categories", productsData);
        setProducts(productsData.results);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiClient]);

  if (loading) return <div className="main-content">Loading...</div>;
  if (error) return <div className="main-content">Error: {error}</div>;

  return (
    <section className="section__categories">
      <Link to={"/category"}>
        <div>
          <h2 className="section__header">TOP CATEGORIES</h2>
        </div>
      </Link>
      <div className="cards-container">
        {/* Array of Products */}
        {categories.map((category) => (
          <div key={category.id} className="category-cards-item">
            <Link to={"/product/" + category.key}>
              <div className="cards-item-img">
                {/* <img
                    height={180}
                    src={product.masterData.current.masterVariant.images[0].url}
                  /> */}{" "}
              </div>
              <div className="cards-category-name cards-item-text">
                <h2>{category.name["en-US"]}</h2>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <div>
        <Link to={"/category"}>
          <h2 className="section__header">ALL CATEGORIES</h2>
        </Link>
      </div>
    </section>
  );

  // end
};

export default ProductCategory;
