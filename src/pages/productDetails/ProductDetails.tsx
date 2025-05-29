import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApiClient } from "@/context/ApiClientContext";
import { type Product } from "@commercetools/platform-sdk";
import "./ProductDetails.css";

const ProductDetail = () => {
  const apiClient = useApiClient();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("Product ID is missing");
        setLoading(false);
        return;
      }
      try {
        const productData = await apiClient.getProduct(id);
        if (!productData) {
          throw new Error("Product not found");
        }
        setProduct(productData);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, apiClient]);

  if (loading) return <div className="main-content">Loading...</div>;
  if (error) return <div className="main-content">Error: {error}</div>;
  if (!product) {
    return (
      <div className="product-detail-container">
        <p>Product not found</p>
        <button onClick={() => navigate(-1)} className="back-button">
          &larr; Back to Shop
        </button>
      </div>
    );
  }
  // PRODUCT
  const productName = product.masterData.current.name["en-US"];
  const productDesc = product.masterData.current.description["en-US"];
  const productPrice = product.masterData.current.masterVariant.prices[0].key;
  const productImg = product.masterData.current.masterVariant.images[0].url;

  console.log(product);
  return (
    <div className="main-content">
      <div className="products-list">
        <img src={productImg} height={200} />
        <h3>Product id: {id} page</h3>
        <div>
          <h3>Product name: </h3>
          {productName}
        </div>

        <div>
          <h3>Product Description:</h3>
          {productDesc}
        </div>

        <div>
          <h3>Product price: </h3>
          {productPrice}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
