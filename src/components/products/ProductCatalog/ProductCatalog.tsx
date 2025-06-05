import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApiClient } from "@/context/ApiClientContext";
import { sortProducts } from "@/utils/dataProcessing";
import DOMPurify from "dompurify";
import {
  type MyProductsData,
  type ProductCatalogProps,
} from "@/@types/interfaces";
import "./ProductCatalog.css";
import "@/pages/home/HomePage.css";

const ProductCatalog: React.FC<ProductCatalogProps> = ({
  categoryId,
  propsProducts,
  propsLimit = 10,
  propsApiSort = undefined,
  propsSort = "name-asc",
}) => {
  const apiClient = useApiClient();
  const [products, setProducts] = useState<MyProductsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (categoryId) {
        console.log("Category: products", products);
        try {
          setLoading(true);
          const data: MyProductsData[] =
            await apiClient.searchProductsByCategory(categoryId);
          setProducts(data);
          setError(null);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else if (propsProducts) {
        setProducts(propsProducts);
        setLoading(false);
      } else {
        try {
          setLoading(true);
          const arg = {
            limit: propsLimit,
            sort: propsApiSort,
          };

          const data: MyProductsData[] = await apiClient.getAllProducts(arg);
          let productsData = [];
          switch (propsSort) {
            case "name-desc":
              productsData = sortProducts(data, "name", "desc");
              break;
            case "price-asc":
              productsData = sortProducts(data, "price", "asc");
              break;
            case "price-desc":
              productsData = sortProducts(data, "price", "desc");
              break;
            default:
              productsData = sortProducts(data, "name", "asc");
          }
          setProducts(productsData);
          setError(null);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProducts();
  }, [categoryId, apiClient, propsProducts, propsSort, propsLimit]);

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="main-container">Error: {error}</div>;

  return (
    <div className="cards-container">
      {/* Array of Products */}
      {products.map((product) => (
        <div key={product.id} className="cards-item">
          <Link to={"/product/" + product.key}>
            <div className="cards-item-img">
              <img src={product.images[0].url} alt={product.name} />
            </div>
            <div className="cards-item-name cards-item-text">
              {product.name}
            </div>
            <div className="cards-item-desc cards-item-text">
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    DOMPurify.sanitize(product.description).slice(0, 55) +
                    "...  ",
                }}
              />
            </div>
            <div className="product-price-container">
              {product.priceDiscounted ? (
                <div className="price-with-discount">
                  <span className="price-discounted">
                    {product.priceDiscounted} &euro;
                  </span>
                  <span className="price-original">{product.price} &euro;</span>
                </div>
              ) : (
                <span className="price-regular">{product.price} &euro;</span>
              )}
            </div>
          </Link>
          <div className="cards-item-card cards-item-text">
            <button className="button__addToCart">ADD TO CART</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductCatalog;
