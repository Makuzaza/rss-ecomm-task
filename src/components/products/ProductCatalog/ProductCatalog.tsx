import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApiClient } from "@/context/ApiClientContext";
import DOMPurify from "dompurify";
import {
  type MyProductsData,
  type ProductCatalogProps,
} from "@/@types/interfaces";
import "./ProductCatalog.css";
import "@/pages/home/HomePage.css";
import { useCart } from "@/context/CartContext";
import {
  FaShoppingCart,
  FaTimes,
  FaAngleLeft,
  FaAngleRight,
} from "react-icons/fa";

const ProductCatalog: React.FC<ProductCatalogProps> = ({
  categoryId,
  propsProducts,
  propsArgs,
  propsLimit = 20,
  propsApiSort,
  propsSort = "createdAt desc",
  filterMinPrice,
  filterMaxPrice,
  filterDiscountOnly = false,
  itemsPerPage = 12,
  onResetFilters,
}) => {
  const apiClient = useApiClient();
  const [products, setProducts] = useState<MyProductsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cartItems, addToCart, removeFromCart } = useCart();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  useEffect(() => {
    setCurrentPage(1);
    if (onResetFilters) {
      onResetFilters();
    }
  }, [propsSort, filterMinPrice, filterMaxPrice, filterDiscountOnly]);

  useEffect(() => {
    const fetchProducts = async () => {
      // SET PAGINATION
      if (propsArgs.offset !== undefined) {
        if (currentPage > 1) {
          propsArgs.offset = currentPage * propsArgs.limit - propsArgs.limit;
        } else {
          propsArgs.offset = 0;
        }
      }

      if (categoryId) {
        try {
          setLoading(true);
          const response = await apiClient.searchData(
            "category",
            categoryId,
            propsArgs,
          );

          const data: MyProductsData[] = response.products;
          setProducts(data);
          setTotalProducts(response.total);
          setError(null);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else if (propsProducts) {
        setProducts(propsProducts.products);
        setTotalProducts(propsProducts.total);
        setLoading(false);
      } else {
        try {
          setLoading(true);

          // GET PRODUCTS FROM API
          const { products: data, total } =
            await apiClient.getAllProducts(propsArgs);

          setProducts(data);
          setTotalProducts(total);
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
    currentPage,
    itemsPerPage,
  ]);

  const totalPages = Math.ceil(totalProducts / itemsPerPage);

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const isProductInCart = (productId: string) => {
    return cartItems.some((item) => item.productId === productId);
  };

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="main-container">Error: {error}</div>;

  if (products.length === 0) {
    return (
      <div className="main-container">
        <p className="no-found">
          No products were found matching your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="product-catalog-container">
      <div className="cards-container">
        {/* Array of Products */}
        {products.map((product) => {
          const inCart = isProductInCart(product.id);

          return (
            <div key={product.id} className="cards-item">
              <Link to={"/product/" + product.key}>
                <div className="cards-item-img">
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0].url} alt={product.name} />
                  ) : (
                    <div className="no-image-placeholder">No Image</div>
                  )}
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
                      <span className="price-original">
                        {product.price} &euro;
                      </span>
                    </div>
                  ) : (
                    <span className="price-regular">
                      {product.price} &euro;
                    </span>
                  )}
                </div>
              </Link>
              <div className="cards-item-card cards-item-text">
                {inCart ? (
                  <button
                    className="button__removeFromCart"
                    onClick={(e) => {
                      e.preventDefault();
                      removeFromCart(product.id);
                    }}
                  >
                    <FaTimes /> REMOVE FROM CART
                  </button>
                ) : (
                  <button
                    className="button__addToCart"
                    onClick={(e) => {
                      e.preventDefault();
                      addToCart(product.id, 1);
                    }}
                  >
                    <FaShoppingCart />
                    ADD TO CART
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {totalProducts > itemsPerPage && propsArgs.offset !== undefined && (
        <div className="pagination-container">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 1}
            className="pagination-button"
            aria-label="Previous page"
          >
            <FaAngleLeft />
          </button>

          <span className="current-page-indicator">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
            className="pagination-button"
            aria-label="Next page"
          >
            <FaAngleRight />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCatalog;
