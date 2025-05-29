import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApiClient } from "@/context/ApiClientContext";
import "./ProductCatalog.css";
import "@/pages/shop/Shop.css";

interface ProductCatalogProps {
  propsLimit?: number; // Optional prop with default value
  propsSort?: string; // Optional prop
  propsTitle?: string; // Optional custom title
  showAllLink?: boolean; // Optional flag to show "All Products" link
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({
  propsLimit,
  propsSort,
  propsTitle,
}) => {
  const apiClient = useApiClient();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const arg = {
          limit: propsLimit,
          sort: propsSort,
          // sort: "name.en asc",
        };
        const productsData = await apiClient.getAllProducts(arg);
        setProducts(productsData.results);
        setLoading(false);
        console.log("Product Catalog:", productsData.results);
        console.log(
          "Description:",
          productsData.results[0].masterData.current.description["en-US"]
        );
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
    <section className="section__product-catalog">
      <div>
        <h2 className="section__header">{propsTitle}</h2>
      </div>

      <div className="cards-container">
        {/* Array of Products */}
        {products.map((product) => (
          <div key={product.id} className="cards-item">
            <Link to={"/product/" + product.key}>
              <div className="cards-item-img">
                <img
                  height={150}
                  src={product.masterData.current.masterVariant.images[0].url}
                />
              </div>
              <div className="cards-item-name cards-item-text">
                {product.masterData.current.name["en-US"]}
              </div>
              <div className="cards-item-desc cards-item-text">
                {product.masterData.current.description["en-US"].slice(0, 54) +
                  "...  "}
              </div>
              <div className="cards-item-price cards-item-text">
                {product.masterData.current.masterVariant.prices[0].value
                  .centAmount + " EUR"}
              </div>
            </Link>
            <div className="cards-item-card cards-item-text">
              <Link to={"/cart/"}>
                <h3>ADD TO CART</h3>
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div>
        <Link to={"/products"}>
          <h2 className="section__header">ALL PRODUCTS</h2>
        </Link>
      </div>
    </section>
  );
};

export default ProductCatalog;
