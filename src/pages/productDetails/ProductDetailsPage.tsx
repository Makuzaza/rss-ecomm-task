import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApiClient } from "@/context/ApiClientContext";
import {
  getFirstParagraph,
  hasMultipleParagraphs,
} from "@/utils/textProcessing";
import DOMPurify from "dompurify";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";

import "./ProductDetailsPage.css";
import { type MyProductsData } from "@/@types/interfaces";

const ProductDetailsPage = () => {
  const apiClient = useApiClient();
  const navigate = useNavigate();
  const [product, setProduct] = useState<MyProductsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageIndex, setModalImageIndex] = useState(0);

  const { id } = useParams<{ id: string }>();

  const handleNextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1,
    );
    setModalImageIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1,
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1,
    );
    setModalImageIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1,
    );
  };

  const handleThumbnailClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const openImageModal = (imageUrl: string, index: number) => {
    setModalImageIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleAddToCart = () => {
    console.log("Added to cart:", product.name);
  };
  const closeImageModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
  };

  // ESC KEY HANDLER FOR MODAL
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeImageModal();
      }
      if (isModalOpen) {
        if (e.key === "ArrowLeft") handlePrevImage();
        if (e.key === "ArrowRight") handleNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, closeImageModal]);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("Product ID is missing");
        setLoading(false);
        return;
      }
      try {
        // GET PRODUCT DATA
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

  // HTML SANITIZATION
  const sanitizedDesc = DOMPurify.sanitize(product.description);

  return (
    <div className="main-content">
      <div className="product-detail-container">
        {/* PRODUCT GALLERY */}
        <div className="product-gallery">
          <div className="slider-container">
            {product.images.length > 1 && (
              <>
                <button
                  className="slider-arrow left-arrow"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                >
                  <FiChevronLeft size={24} />
                </button>
                <button
                  className="slider-arrow right-arrow"
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  <FiChevronRight size={24} />
                </button>
              </>
            )}

            <div
              className="main-image"
              onClick={() =>
                openImageModal(
                  product.images[currentImageIndex]?.url,
                  currentImageIndex,
                )
              }
            >
              <img
                src={product.images[currentImageIndex]?.url}
                alt={product.name}
              />
            </div>
          </div>

          {product.images.length > 1 && (
            <div className="thumbnail-container">
              {product.images.map((image, index) => (
                <div
                  key={index}
                  className={`thumbnail ${currentImageIndex === index ? "active" : ""}`}
                  onClick={() => handleThumbnailClick(index)}
                >
                  <img
                    src={image.url}
                    alt={`${product.name} thumbnail ${index}`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="product-info">
          {/* PRODUCT NAME */}
          <h2 className="product-title">{product.name}</h2>
          {/* PRODUCT VARIANTS */}
          {product.variants.length > 0 && (
            <div className="variants-section">
              <h3>Product variants:</h3>
              <div className="variant-thumbnails">
                {product.variants.map((variant, index) => (
                  <div
                    key={index}
                    className={`variant-thumbnail ${selectedVariant === index ? "active" : ""}`}
                    onClick={() => setSelectedVariant(index)}
                  >
                    {variant.images?.[0] && (
                      <img
                        src={variant.images[0].url}
                        alt={`Variant ${index}`}
                        title={`${product.variants[index]?.attributes[0]?.value[0]?.["en-US"]} - ${product.variants[index]?.attributes[1]?.value?.["en-US"]}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* PRODUCT DESCRIPTION */}
          <div className="product-description">
            <h3>Description:</h3>
            <div className="description-content">
              {showFullDescription ? (
                <div>
                  <div dangerouslySetInnerHTML={{ __html: sanitizedDesc }} />
                  <div className="show-more-btn-container">
                    <button
                      className="show-more-btn"
                      onClick={() => setShowFullDescription(false)}
                    >
                      Show less
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: getFirstParagraph(sanitizedDesc),
                    }}
                  />
                  {hasMultipleParagraphs(sanitizedDesc) && (
                    <div className="show-more-btn-container">
                      <button
                        className="show-more-btn"
                        onClick={() => setShowFullDescription(true)}
                      >
                        Show full description
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* PRODUCT PRICE */}
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
          {/* ADD TO CART BUTTON */}
          <div className="buy-section">
            <button className="button__addToCart" onClick={handleAddToCart}>
              Add to Cart
            </button>
          </div>
        </div>
      </div>
      {/* PRODUCT IMAGE MODAL */}
      {isModalOpen && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeImageModal}>
              <FiX size={24} />
            </button>

            {product.images.length > 1 && (
              <>
                <button
                  className="modal-arrow left-arrow"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevImage();
                  }}
                >
                  <FiChevronLeft size={32} />
                </button>
                <button
                  className="modal-arrow right-arrow"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextImage();
                  }}
                >
                  <FiChevronRight size={32} />
                </button>
              </>
            )}

            <img
              src={product.images[modalImageIndex]?.url}
              alt={`Enlarged ${product.name}`}
            />

            {product.images.length > 1 && (
              <div className="modal-image-counter">
                {modalImageIndex + 1} / {product.images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
