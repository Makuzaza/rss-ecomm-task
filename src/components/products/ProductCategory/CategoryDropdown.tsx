import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiClient } from "@/api/ApiClient";
import { Category } from "@commercetools/platform-sdk";
import "./CategoryDropdown.css";

interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

const CategoryDropdown = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    setActiveCategory(null);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    const handleInteraction = (event: MouseEvent | KeyboardEvent | TouchEvent) => {
      // Handle click outside
      if (
        dropdownRef.current &&
        event instanceof MouseEvent &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        closeMenu();
      }

      // Handle Escape key
      if (event instanceof KeyboardEvent && event.key === "Escape") {
        closeMenu();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleInteraction);
      document.addEventListener("touchstart", handleInteraction);
      document.addEventListener("keydown", handleInteraction);
    }

    return () => {
      document.removeEventListener("mousedown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
    };
  }, [isOpen, closeMenu]);

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

  const handleCategoryClick = (category: CategoryWithChildren) => {
    if (isMobile) {
      if (category.children?.length) {
        setActiveCategory(category.id);
      } else {
        navigate(`/category/${category.slug?.["en-US"] || category.id}`);
        closeMenu();
      }
    } else {
      setActiveCategory(category.id);
    }
  };

  const handleBackClick = () => {
    setActiveCategory(null);
  };

   return (
    <div className="category-dropdown" ref={dropdownRef}>
      <button
        className="dropdown-toggle"
        onClick={() => {
          setIsOpen(!isOpen);
          setActiveCategory(null);
        }}
        onMouseEnter={() => !isMobile && setIsOpen(true)}
      >
        Categories
      </button>

      {isOpen && (
        <div className={`mega-menu ${isMobile ? "mobile-view" : ""}`}>
          {isMobile && activeCategory && (
            <button className="back-button" onClick={handleBackClick}>
              ← Back to Categories
            </button>
          )}
          {(!isMobile || !activeCategory) && (
            <div className="main-categories">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className={`main-category ${activeCategory === category.id ? "active" : ""}`}
                  onClick={() => handleCategoryClick(category)}
                  onMouseEnter={() => !isMobile && setActiveCategory(category.id)}
                >
                  <span className="main-category-link">
                    {getCategoryName(category)}
                  </span>
                  {category.children && category.children.length > 0 && (
                    <span className="arrow">›</span>
                  )}
                </div>
              ))}
            </div>
          )}

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
                            onClick={() => !child.children?.length && closeMenu()}
                          >
                            {getCategoryName(child)}
                          </Link>
                        </h4>
                        {child.children?.map((subChild) => (
                          <Link
                            key={subChild.id}
                            to={`/category/${subChild.slug?.["en-US"] || subChild.id}`}
                            className="subcategory-item"
                            onClick={closeMenu}
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
