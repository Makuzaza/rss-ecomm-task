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
import { productDataNormalization } from "@/utils/dataNormalization";

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
  const PRODUCTS_PER_PAGE = 12;
  const totalPages = Math.ceil(totalProductsCount / PRODUCTS_PER_PAGE);
  

  useEffect(() => {
    const fetchProducts = async () => {
      if (categoryId) {
        try {
          setLoading(true);
          const { results: fetchedProducts, total } = await apiClient.searchData("category", categoryId, {
            limit: PRODUCTS_PER_PAGE,
            offset: (currentPage - 1) * PRODUCTS_PER_PAGE,
            sort: propsApiSort,
            minPrice: filterMinPrice ? Number(filterMinPrice) : undefined,
            maxPrice: filterMaxPrice ? Number(filterMaxPrice) : undefined,
            discountOnly: filterDiscountOnly,
          });

          setTotalProductsCount(total);
          setProducts(fetchedProducts.map(productDataNormalization));
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

          const PRODUCTS_PER_PAGE = 12;
          const offset = (currentPage - 1) * PRODUCTS_PER_PAGE;

          const arg = {
            limit: PRODUCTS_PER_PAGE,
            offset,
            sort: propsApiSort,
          };
          const { products: fetchedProducts, total } = await apiClient.getAllProducts(arg);
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
  ]);

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
     <>
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
                  disabled={isInCart(product.id) || isLoadingAddToCart(product.id)}
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
