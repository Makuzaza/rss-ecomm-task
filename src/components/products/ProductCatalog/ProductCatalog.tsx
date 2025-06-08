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
  filterMinPrice,
  filterMaxPrice,
  filterDiscountOnly = false,
}) => {
  const apiClient = useApiClient();
  const [products, setProducts] = useState<MyProductsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const applyFilters = (data: MyProductsData[]) => {
    return data.filter((product) => {
      const price = product.priceDiscounted || product.price;

      const passesMin = filterMinPrice ? price >= Number(filterMinPrice) : true;
      const passesMax = filterMaxPrice ? price <= Number(filterMaxPrice) : true;
      const passesDiscount = filterDiscountOnly
        ? !!product.priceDiscounted
        : true;

      return passesMin && passesMax && passesDiscount;
    });
  };

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
          let sorted = [];
          switch (propsSort) {
            case "name-desc":
              sorted = sortProducts(data, "name", "desc");
              break;
            case "price-asc":
              sorted = sortProducts(data, "price", "asc");
              break;
            case "price-desc":
              sorted = sortProducts(data, "price", "desc");
              break;
            default:
              sorted = sortProducts(data, "name", "asc");
          }
          const filtered = applyFilters(sorted);
          setProducts(filtered);
          setError(null);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProducts();
  }, [
    categoryId,
    apiClient,
    propsProducts,
    propsSort,
    propsLimit,
    propsApiSort,
    filterMinPrice,
    filterMaxPrice,
    filterDiscountOnly,
  ]);

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="main-container">Error: {error}</div>;

  if (products.length === 0) {
    return (
      <div className="main-container">
        <p className="no-found">No products were found matching your filters.</p>
      </div>
    );
  }

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
