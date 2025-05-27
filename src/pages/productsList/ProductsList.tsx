import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApiClient } from "@/context/ApiClientContext";
import "./ProductsList.css";

const ProductsList = () => {
  const apiClient = useApiClient();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const productsData = await apiClient.getAllProducts();
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
    <div className="main-content">
      <div className="products-list">
        {products.map((product) => (
          <div key={product.id} className="product-item">
            <h3>
              <Link to={"/product/" + product.id}>
                {product.masterData.current.name["en-US"]}
              </Link>
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductsList;
