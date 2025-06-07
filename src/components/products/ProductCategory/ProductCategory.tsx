import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApiClient } from "@/context/ApiClientContext";
import { ProductCatalogProps } from "@/@types/interfaces";
import { BiCategory } from "react-icons/bi";
import "./ProductCategory.css";
import "@/pages/home/HomePage.css";
import { categoryImagesMap } from "@/utils/categoryImagesMap";

const ProductCategory: React.FC<ProductCatalogProps> = ({
  propsLimit,
  propsSort,
}) => {
  const apiClient = useApiClient();
  const [categories, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const arg = {
          limit: propsLimit,
          sort: propsSort,
        };
        const productsData = await apiClient.getAllCategories(arg);
        setProducts(productsData.results);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiClient, propsLimit, propsSort]);

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="main-content">Error: {error}</div>;

  return (
    <div className="cards-container">
      {categories.map((category) => {
        const categoryKey = category.key.toLowerCase();
        const categoryImage: string | undefined =
          categoryImagesMap[categoryKey];
        return (
          <div key={category.id} className="category-cards-item">
            <Link to={"/category/" + category.key}>
              <div className="cards-item-img">
                {categoryImage ? (
                  <img
                    src={categoryImage}
                    alt={category.name["en-US"]}
                    className="category-image"
                  />
                ) : (
                  <BiCategory className="img__category" />
                )}
              </div>
              <div className="cards-category-name cards-item-text">
                <h2>{category.name["en-US"]}</h2>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
};

export default ProductCategory;
