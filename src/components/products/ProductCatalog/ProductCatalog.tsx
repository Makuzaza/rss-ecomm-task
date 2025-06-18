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
import { getEURVariant } from "@/utils/productHelpers";

const ProductCatalog: React.FC<ProductCatalogProps> = ({
  categoryId,
  propsProducts,
  propsLimit = 20,
  propsApiSort,
  propsSort = "name-asc",
  filterMinPrice,
  filterMaxPrice,
  filterDiscountOnly = false,
}) => {
  const apiClient = useApiClient();
  const [products, setProducts] = useState<MyProductsData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart, isInCart, isLoadingAddToCart } = useCart();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [productsPerPage, setProductsPerPage] = useState(12);
  const totalPages = Math.ceil(totalProductsCount / productsPerPage);

  useEffect(() => {
    const calculateProductsPerPage = () => {
      const width = window.innerWidth;

      if (width >= 2560) return 20; // 2K+
      if (width >= 1920) return 16; // FullHD+
      if (width >= 1440) return 12;
      if (width >= 1024) return 9;
      if (width >= 768) return 6;
      return 4; // movile
    };

    const updatePerPage = () => {
      setProductsPerPage(calculateProductsPerPage());
    };

    updatePerPage(); // initial
    window.addEventListener("resize", updatePerPage);

    return () => window.removeEventListener("resize", updatePerPage);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (categoryId) {
        try {
          setLoading(true);
          const { products: fetchedProducts, total } =
            await apiClient.searchData("category", categoryId, {
              limit: productsPerPage,
              offset: (currentPage - 1) * productsPerPage,
              sort: propsApiSort,
              minPrice: filterMinPrice ? Number(filterMinPrice) : undefined,
              maxPrice: filterMaxPrice ? Number(filterMaxPrice) : undefined,
              discountOnly: filterDiscountOnly,
            });

          setProducts(fetchedProducts);
          setTotalProductsCount(total);
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

          const offset = (currentPage - 1) * productsPerPage;

          const arg = {
            limit: productsPerPage,
            offset,
            sort: propsApiSort,
          };
          const { products: fetchedProducts, total } =
            await apiClient.getAllProducts(arg);
          setTotalProductsCount(total);

          // SORT PRODUCTS DATA
          const sortedData = sortProducts(fetchedProducts, propsSort);
          // FILTER PRODUCTS DATA
          const filterArg: MyProductFilter = {
            minPrice: filterMinPrice,
            maxPrice: filterMaxPrice,
            discountOnly: filterDiscountOnly,
          };
          const filteredData = filterProducts(sortedData, filterArg);

          setProducts(filteredData);
          setError(null);

          // tmp
          const myCart = await apiClient.getMyCarts();
          console.log("MyCart:", myCart);
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
    productsPerPage,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterMinPrice, filterMaxPrice, filterDiscountOnly, propsSort]); // Reset the current page when changing filters.

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="main-container">Error: {error}</div>;

  if (!loading && products.length === 0) {
    return (
      <div className="main-container">
        <p className="no-found">
          No products were found matching your filters.
        </p>
      </div>
    );
  }

  return (
    <>
      {totalProductsCount > 0 && (
        <p className="product-count-info">
          Showing {(currentPage - 1) * productsPerPage + 1}–
          {(currentPage - 1) * productsPerPage + products.length} of{" "}
          {totalProductsCount} products
        </p>
      )}
      <div className="cards-container">
        {/* Array of Products */}
        {products.map((product) => (
          <div key={product.id} className="cards-item">
            <Link to={"/product/" + product.key}>
              <div className="cards-item-img">
                <img
                  src={product.images[0].url}
                  alt={`Image of ${product.name}`}
                />
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
                  <span className="price-regular">{product.price} &euro;</span>
                )}
              </div>
            </Link>
            <div className="cards-item-card cards-item-text">
              <button
                className="button__addToCart"
                onClick={() => {
                  console.log("PRODUCT:", product); // 👈
                  const variant = getEURVariant(product);

                  if (!variant) {
                    console.warn("No EUR-priced variant");
                    return;
                  }

                  console.log("ADDING TO CART:", {
                    productId: product.id,
                    variantId: variant.id,
                    variantSKU: variant.sku,
                  });

                  addToCart(product.id, variant.id);
                }}
                aria-label={`Add ${product.name} to cart`}
                disabled={
                  isInCart(product.id) || isLoadingAddToCart(product.id)
                }
              >
                {isLoadingAddToCart(product.id)
                  ? "Adding..."
                  : isInCart(product.id)
                    ? "In Cart"
                    : "Add to Cart"}
              </button>
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </button>

          <span className="pagination-info">
            Page {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
};

export default ProductCatalog;
