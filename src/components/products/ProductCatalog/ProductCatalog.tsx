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
  propsSort = "name-asc",
}) => {
  const apiClient = useApiClient();
  const [products, setProducts] = useState<MyProductsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (categoryId) {
        console.log("CategoryId", categoryId);
      }

      if (categoryId) {
        // let sortedProducts = [];
        // switch (propsSort) {
        //   case "name-desc":
        //     sortedProducts = sortProducts(propsProducts, "name", "desc");
        //     break;
        //   case "price-asc":
        //     sortedProducts = sortProducts(propsProducts, "price", "asc");
        //     break;
        //   case "price-desc":
        //     sortedProducts = sortProducts(propsProducts, "price", "desc");
        //     break;
        //   default:
        //     sortedProducts = sortProducts(propsProducts, "name", "asc");
        // }
        // setProducts(sortedProducts.slice(0, propsLimit));
        // setLoading(false);
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
  }, [propsProducts, propsSort, propsLimit]);

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="main-container">Error: {error}</div>;

  return (
    <div className="cards-container">
      {/* Array of Products */}
      {products.map((product) => (
        <div key={product.id} className="cards-item">
          <Link to={"/product/" + product.key}>
            <div className="cards-item-img">
              <img height={150} src={product.images[0].url} />
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
