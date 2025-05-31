import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "@/api/ApiClient";
import ProductCatalog from "@/components/products/ProductCatalog/ProductCatalog";
import "./CategoryProductsPage.css";

const CategoryProductsPage = () => {
  const { categorySlug } = useParams();
  const [categoryName, setCategoryName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        // First get the category details to get the name
        const categories = await apiClient.getAllCategories({
          where: `slug(en-US="${categorySlug}")`,
        });
        console.log("category slug:", categories);

        if (categories.results.length > 0) {
          const category = categories.results[0];
          setCategoryName(category.name?.["en-US"] || "");
          setCategoryId(category.id);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching category:", error);
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [categorySlug]);

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  return (
    <div className="category-products-container">
      <h1 className="category-title">{categoryName}</h1>
      <ProductCatalog categoryId={categoryId} />
    </div>
  );
};

export default CategoryProductsPage;
