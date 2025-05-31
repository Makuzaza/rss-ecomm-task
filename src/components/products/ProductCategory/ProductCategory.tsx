import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApiClient } from "@/context/ApiClientContext";
import { ProductCatalogProps } from "@/@types/interfaces";
import { BiCategory } from "react-icons/bi";
import "./ProductCategory.css";
import "@/pages/shop/Shop.css";

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
        const search = await apiClient.searchProduct("Ivory Plate");
        console.log("Search:", search);

        const arg = {
          limit: propsLimit,
          sort: propsSort,
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

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="main-content">Error: {error}</div>;

  return (
    <div className="cards-container">
      {/* Array of Products */}
      {categories.map((category) => (
        <div key={category.id} className="category-cards-item">
          <Link to={"/product/" + category.key}>
            <div className="cards-item-img">
              <BiCategory className="img__category" />
            </div>
            <div className="cards-category-name cards-item-text">
              <h2>{category.name["en-US"]}</h2>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );

  // end
};

export default ProductCategory;
