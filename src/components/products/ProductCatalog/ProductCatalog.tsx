import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApiClient } from "@/context/ApiClientContext";
import { MyProductsData, ProductCatalogProps } from "@/@types/interfaces";
import "./ProductCatalog.css";
import "@/pages/shop/Shop.css";
import { sortProducts } from "@/utils/dataProcessing";

const ProductCatalog: React.FC<ProductCatalogProps> = ({
  categoryId,
  products: propsProducts,
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
        try {
          setLoading(true);
          const data: MyProductsData[] =
            await apiClient.searchProductsByCategory(categoryId);
          console.log(data);
          setProducts(data);
          setError(null);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
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
              {product.description.slice(0, 54) + "...  "}
            </div>
            <div className="cards-item-price-container">
              <div className="cards-item-price-discount">
                {product.priceDiscounted} &euro;
              </div>
              <div className="cards-item-price">{product.price} &euro;</div>
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
