import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApiClient } from "@/context/ApiClientContext";
import { filterProducts, sortProducts } from "@/utils/dataProcessing";
import DOMPurify from "dompurify";
import {
  type MyProductFilter,
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
  propsLimit = 20,
  propsApiSort,
  propsSort = "name-asc",
  filterMinPrice,
  filterMaxPrice,
  filterDiscountOnly = false,
  itemsPerPage = 12,
  onResetFilters,
}) => {
  const apiClient = useApiClient();
  const [filteredProducts, setFilteredProducts] = useState<MyProductsData[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cartItems, addToCart, removeFromCart } = useCart();
  

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
    if (onResetFilters) {
      onResetFilters();
    }
  }, [propsSort, filterMinPrice, filterMaxPrice, filterDiscountOnly]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (categoryId) {
        try {
          setLoading(true);
          const response = await apiClient.searchData("category", categoryId);
          const data: MyProductsData[] = response.products;
          setFilteredProducts(data);
          setError(null);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else if (propsProducts) {
        setFilteredProducts(propsProducts);
        setLoading(false);
      } else {
        try {
          setLoading(true);

          // GET PRODUCTS FROM API
          const arg = {
            limit: propsLimit,
            sort: propsApiSort,
          };
          const { products: data } = await apiClient.getAllProducts(arg);

          // SORT PRODUCTS DATA
          const sortedData = sortProducts(data, propsSort);

          // FILTER PRODUCTS DATA
          const filterArg: MyProductFilter = {
            minPrice: filterMinPrice,
            maxPrice: filterMaxPrice,
            discountOnly: filterDiscountOnly,
          };
          const filteredData = filterProducts(sortedData, filterArg);

          setFilteredProducts(filteredData);
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

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

  if (filteredProducts.length === 0) {
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
        {currentItems.map((product) => {
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
                      console.log("Adding to cart:", product.name);
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

      {filteredProducts.length > itemsPerPage && (
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
