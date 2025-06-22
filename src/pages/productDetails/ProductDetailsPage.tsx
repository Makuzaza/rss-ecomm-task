import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useApiClient } from "@/context/ApiClientContext";
import { getFirstParagraph, hasMultipleParagraphs } from "@/utils/textProcessing";
import DOMPurify from "dompurify";
import { FiChevronLeft, FiChevronRight, FiX } from "react-icons/fi";
import { FaShoppingCart, FaTimes } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { type MyProductsData } from "@/@types/interfaces";
import "./ProductDetailsPage.css";

const ProductDetailsPage = () => {
  const apiClient = useApiClient();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<MyProductsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { cart, addToCart, removeLineItem, isInCart } = useCart();

  const inCart = product ? isInCart(product.id, selectedVariant + 1) : false;

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError("Product ID is missing");
        setLoading(false);
        return;
      }
      try {
        const data = await apiClient.getProduct(id);
        if (!data) throw new Error("Product not found");
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, apiClient]);

  const handleNextImage = () => {
    if (product) {
      setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
    }
  };

  const handlePrevImage = () => {
    if (product) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? product.images.length - 1 : prev - 1,
      );
    }
  };

  const openImageModal = (index: number) => {
    setCurrentImageIndex(index);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
  };

  const handleRemoveFromCart = () => {
    if (!cart || !product) return;

    const lineItem = cart.lineItems.find(
      (item) =>
        item.productId === product.id &&
        item.variant.id === selectedVariant
    );

    if (lineItem) {
      removeLineItem(lineItem.id);
    } else {
      console.warn("Line item not found for removal!", {
        productId: product.id,
        selectedVariant,
        lineItems: cart.lineItems.map((i) => ({
          id: i.id,
          productId: i.productId,
          variantId: i.variant.id,
        })),
      });
    }
  };

  if (loading) return <div className="main-content">Loading...</div>;
  if (error || !product) {
    return (
      <div className="main-content">
        <p>{error || "Product not found"}</p>
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back to Shop
        </button>
      </div>
    );
  }

  const sanitizedDesc = DOMPurify.sanitize(product.description ?? "");

  return (
    <div className="main-content">
      <div className="product-detail-container">
        {/* IMAGE GALLERY */}
        <div className="product-gallery">
          <div className="slider-container">
            {product.images.length > 1 && (
              <>
                <button onClick={handlePrevImage} className="slider-arrow left-arrow">
                  <FiChevronLeft size={24} />
                </button>
                <button onClick={handleNextImage} className="slider-arrow right-arrow">
                  <FiChevronRight size={24} />
                </button>
              </>
            )}
            <div className="main-image" onClick={() => openImageModal(currentImageIndex)}>
              <img src={product.images[currentImageIndex]?.url} alt={product.name} />
            </div>
          </div>
          <div className="thumbnail-container">
            {product.images.map((img, idx) => (
              <div
                key={idx}
                className={`thumbnail ${currentImageIndex === idx ? "active" : ""}`}
                onClick={() => setCurrentImageIndex(idx)}
              >
                <img src={img.url} alt={`Thumb ${idx}`} />
              </div>
            ))}
          </div>
        </div>

        {/* PRODUCT INFO */}
        <div className="product-info">
          <h2 className="product-title">{product.name}</h2>

          {product.variants.length > 0 && (
            <div className="variants-section">
              <h3>Variants</h3>
              <div className="variant-thumbnails">
                {product.variants.map((variant, idx) => (
                  <div
                    key={idx}
                    className={`variant-thumbnail ${selectedVariant === idx ? "active" : ""}`}
                    onClick={() => setSelectedVariant(idx)}
                  >
                    {variant.images?.[0] && <img src={variant.images[0].url} alt={`Variant ${idx}`} />}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="product-description">
            <h3>Description</h3>
            <div
              className="description-content"
              dangerouslySetInnerHTML={{
                __html: showFullDescription
                  ? sanitizedDesc
                  : getFirstParagraph(sanitizedDesc),
              }}
            />
            {hasMultipleParagraphs(sanitizedDesc) && (
              <button
                className="show-more-btn"
                onClick={() => setShowFullDescription((v) => !v)}
              >
                {showFullDescription ? "Show less" : "Show more"}
              </button>
            )}
          </div>

          <div className="product-price-container">
            {product.priceDiscounted ? (
              <div className="price-with-discount">
                <span className="price-discounted">{product.priceDiscounted} €</span>
                <span className="price-original">{product.price} €</span>
              </div>
            ) : (
              <span className="price-regular">{product.price} €</span>
            )}
          </div>

          <div className="buy-section">
            {inCart ? (
              <button className="button__removeFromCart" onClick={handleRemoveFromCart}>
                <FaTimes /> REMOVE FROM CART
              </button>
            ) : (
              <button
                className="button__addToCart"
                onClick={() => addToCart(product.id, selectedVariant + 1)}
              >
                <FaShoppingCart /> ADD TO CART
              </button>
            )}
          </div>
        </div>
      </div>

      {/* IMAGE MODAL */}
      {isModalOpen && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeImageModal}>
              <FiX size={24} />
            </button>
            <img src={product.images[currentImageIndex]?.url} alt="Modal View" />
            {product.images.length > 1 && (
              <div className="modal-image-counter">
                {currentImageIndex + 1} / {product.images.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
