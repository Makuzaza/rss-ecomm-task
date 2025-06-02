import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "@/api/ApiClient";
import { Category } from "@commercetools/platform-sdk";
import "./CategoryDropdown.css";

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

const CategoryDropdown = () => {
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const closeMenu = () => {
    setIsOpen(false);
    setActiveCategory(null);
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.getAllCategories({ limit: 500 });
        const allCategories = response.results;
        const categoryTree = buildCategoryTree(allCategories);
        setCategories(categoryTree);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Closing category menu when ESC key is pressed
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const buildCategoryTree = (
    allCategories: Category[]
  ): CategoryWithChildren[] => {
    const categoryMap = new Map<string, CategoryWithChildren>();
    allCategories.forEach((category) => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    const rootCategories: CategoryWithChildren[] = [];

    categoryMap.forEach((category) => {
      if (category.parent) {
        const parent = categoryMap.get(category.parent.id);
        if (parent) {
          parent.children?.push(category);
        }
      } else {
        rootCategories.push(category);
      }
    });

    const sortCategories = (
      categories: CategoryWithChildren[]
    ): CategoryWithChildren[] => {
      return [...categories]
        .sort((a, b) => {
          return (a.orderHint || "").localeCompare(b.orderHint || "");
        })
        .map((category) => {
          if (category.children && category.children.length > 0) {
            return {
              ...category,
              children: sortCategories(category.children),
            };
          }
          return category;
        });
    };

    return sortCategories(rootCategories);
  };

  const getCategoryName = (category: Category) => {
    return category.name?.["en-US"] || category.key || "Unnamed Category";
  };

  return (
    <div className="category-dropdown">
      <button
        className="dropdown-toggle"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
      >
        Categories
      </button>

      {isOpen && (
        <div
          className="mega-menu"
          onMouseLeave={() => {
            setIsOpen(false);
            setActiveCategory(null);
          }}
        >
          <div className="main-categories">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`main-category ${activeCategory === category.id ? "active" : ""}`}
                onMouseEnter={() => setActiveCategory(category.id)}
              >
                <Link
                  to={`/category/${category.slug?.["en-US"] || category.id}`}
                  className="main-category-link"
                >
                  {getCategoryName(category)}
                </Link>
                {category.children && category.children.length > 0 && (
                  <span className="arrow">›</span>
                )}
              </div>
            ))}
          </div>

          {activeCategory && (
            <div className="subcategories-panel">
              {categories
                .filter((category) => category.id === activeCategory)
                .map((category) => (
                  <div key={category.id} className="subcategories-columns">
                    {category.children?.map((child) => (
                      <div key={child.id} className="subcategory-group">
                        <h4 className="subcategory-title">
                          <Link
                            to={`/category/${child.slug?.["en-US"] || child.id}`}
                            className="subcategory-link"
                          >
                            {getCategoryName(child)}
                          </Link>
                        </h4>
                        {child.children?.map((subChild) => (
                          <Link
                            key={subChild.id}
                            to={`/category/${subChild.slug?.["en-US"] || subChild.id}`}
                            className="subcategory-item"
                          >
                            {getCategoryName(subChild)}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryDropdown;
