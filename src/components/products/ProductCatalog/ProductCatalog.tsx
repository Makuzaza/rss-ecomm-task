import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApiClient } from "@/context/ApiClientContext";
import { ProductCatalogProps } from "@/@types/interfaces";
import "./ProductCatalog.css";
import "@/pages/shop/Shop.css";

const ProductCatalog: React.FC<ProductCatalogProps> = ({
  propsLimit = 10,
  propsSort = "name.en-US asc",
}) => {
  const apiClient = useApiClient();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const path = "masterData.current.";
  // const pricePath = path + ".masterVariant.prices[0].value.centAmount";
  // const priceDiscountPath = pricePath + ".discounted.value.centAmount";
  // const pricePath = "current.masterVariant.prices[0].value";

  console.log("path: ", path + propsSort);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const arg = {
          limit: propsLimit,
          // sort: propsSort,
          // sort: path + propsSort,
          // sort: "variants.price.centAmount asc",
          // priceCurrency: "EUR",
        };

        const productsData = await apiClient.getAllProducts(arg);
        setProducts(productsData.results);
        setError(null);

        // tmp logs
        console.log("Product Catalog:", productsData.results);
        // console.log(
        //   "Description:",
        //   productsData.results[0].masterData.current.description["en-US"]
        // );
        console.log(
          productsData.results[0].masterData.current.masterVariant.prices[0]
            .discounted.value.centAmount
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiClient, propsSort, propsLimit]);

  if (loading) return <div className="main-content">Loading...</div>;
  if (error) return <div className="main-content">Error: {error}</div>;

  return (
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
            <div className="cards-item-price-container">
              <div className="cards-item-price-discount">
                {product.masterData.current.masterVariant.prices[0].discounted
                  .value.centAmount / 100}{" "}
                &euro;
              </div>
              <div className="cards-item-price">
                {product.masterData.current.masterVariant.prices[0].value
                  .centAmount / 100}{" "}
                &euro;
              </div>
            </div>
          </Link>
          <div className="cards-item-card cards-item-text">
            {/* <Link to={"/cart/"}>
              <h3>ADD TO CART</h3>
            </Link> */}
            <button className="button__addToCart">ADD TO CART</button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductCatalog;
