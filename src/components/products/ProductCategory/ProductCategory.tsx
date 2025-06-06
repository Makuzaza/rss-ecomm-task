import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useApiClient } from "@/context/ApiClientContext";
import { ProductCatalogProps } from "@/@types/interfaces";
import { BiCategory } from "react-icons/bi";
import "./ProductCategory.css";
import "@/pages/home/HomePage.css";
import furnitureImage from "../../../../assets/categories/furniture.png";
import kitchenImage from "../../../../assets/categories/kitchen.png";
import homeDecorImage from "../../../../assets/categories/home-decor.png";
import newArrivalsImage from "../../../../assets/categories/new-arrivals.png";
import collectionsImage from "../../../../assets/categories/collections.png";
import servewareImage from "../../../../assets/categories/kitchen-collections.png";
import dinnerwareImage from "../../../../assets/categories/dinnerware.png";
import beddingImage from "../../../../assets/categories/bedding.png";
import livingRoomFurnitureImage from "../../../../assets/categories/living-room.png";
import roomDecorImage from "../../../../assets/categories/room-decor.png";
import bedroomFurnitureImage from "../../../../assets/categories/bedroom-furniture.png";
import barGlasswareImage from "../../../../assets/categories/bar-and-glass.png";
import cheeseTrayImage from "../../../../assets/categories/menu.png";
import dressersImage from "../../../../assets/categories/dressers.png";
import tablesImage from "../../../../assets/categories/table.png";
import bowlsImage from "../../../../assets/categories/bowls.png";
import barImage from "../../../../assets/categories/bar.png";
import sofaImage from "../../../../assets/categories/sofa.png";
import minimalistImage from "../../../../assets/categories/minimalist.png";
import bakewareImage from "../../../../assets/categories/bakeware.png";

const categoryImages: Record<string, string> = {
  furniture: furnitureImage,
  kitchen: kitchenImage,
  "home-decor": homeDecorImage,
  "new-arrivals": newArrivalsImage,
  collections: collectionsImage,
  serveware: servewareImage,
  dinnerware: dinnerwareImage,
  "living-room-furniture": livingRoomFurnitureImage,
  bedding: beddingImage,
  "room-decor": roomDecorImage,
  "bedroom-furniture": bedroomFurnitureImage,
  "bar-and-glassware": barGlasswareImage,
  "cheese-trays": cheeseTrayImage,
  "storage--tables": dressersImage,
  tables: tablesImage,
  bowls: bowlsImage,
  "bar-accessories": barImage,
  sofas: sofaImage,
  "the-minimalist": minimalistImage,
  bakeware: bakewareImage,
};

const ProductCategory: React.FC<ProductCatalogProps> = ({
  propsLimit,
  propsSort,
}) => {
  const apiClient = useApiClient();
  const [categories, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const arg = {
          limit: propsLimit,
          sort: propsSort,
        };
        const productsData = await apiClient.getAllCategories(arg);
        setProducts(productsData.results);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [apiClient]);

  if (loading) return <div className="loading-container">Loading...</div>;
  if (error) return <div className="main-content">Error: {error}</div>;

  return (
    <div className="cards-container">
      {categories.map((category) => {
        const categoryKey = category.key.toLowerCase();
        const categoryImage: string | undefined = categoryImages[categoryKey];
        return (
          <div key={category.id} className="category-cards-item">
            <Link to={"/category/" + category.key}>
              <div className="cards-item-img">
                {categoryImage ? (
                  <img
                    src={categoryImage}
                    alt={category.name["en-US"]}
                    className="category-image"
                  />
                ) : (
                  <BiCategory className="img__category" />
                )}
              </div>
              <div className="cards-category-name cards-item-text">
                <h2>{category.name["en-US"]}</h2>
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );

  // end
};

export default ProductCategory;
