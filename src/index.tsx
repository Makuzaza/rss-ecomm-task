import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import React, { Suspense } from "react";
import { ApiClientProvider } from "@/context/ApiClientContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { apiClient } from "./api/ApiClient";

// PAGES
import HomePage from "@/pages/home/HomePage";
import LoginPage from "@/pages/login/LoginPage";
import RegisterPage from "@/pages/register/RegisterPage";
import AboutPage from "@/pages/about/AboutPage";
import NotFoundPage from "@/pages/notfound/NotFoundPage";
import ProfilePage from "@/pages/profile/ProfilePage";
import ProductDetailsPage from "@/pages/productDetails/ProductDetailsPage";
import CategoryPage from "@/pages/category/CategoryPage";
import ProductsPage from "@/pages/products/ProductsPage";
import SearchResultsPage from "@/pages/search/SearchResultsPage";
import CategoryProductsPage from "@/pages/category/CategoryProductsPage";
import CartPage from "@/pages/cart/CartPage";

const root = document.getElementById("root");

if (!root) {
  throw new Error("root not found");
}

const container = createRoot(root);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={"Loading..."}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: "/login",
        element: (
          <Suspense fallback={"Loading..."}>
            <LoginPage />
          </Suspense>
        ),
      },
      {
        path: "/register",
        element: (
          <Suspense fallback={"Loading..."}>
            <RegisterPage />
          </Suspense>
        ),
      },
      {
        path: "/about",
        element: (
          <Suspense fallback={"Loading..."}>
            <AboutPage />
          </Suspense>
        ),
      },
      {
        path: "/profile",
        element: (
          <Suspense fallback={"Loading..."}>
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "/cart",
        element: (
          <Suspense fallback={"Loading..."}>
            <CartPage />
          </Suspense>
        ),
      },
      {
        path: "/product",
        element: <Navigate to="/products" replace />,
      },
      {
        path: "/products",
        element: <ProductsPage />,
      },
      {
        path: "/product/:id",
        element: (
          <Suspense fallback={"Loading..."}>
            <ProductDetailsPage />
          </Suspense>
        ),
      },
      {
        path: "/category",
        element: <CategoryPage />,
      },
      {
        path: "/category/:categorySlug",
        element: <CategoryProductsPage />,
      },
      {
        path: "/search",
        element: <SearchResultsPage />,
      },
      {
        path: "*",
        element: (
          <Suspense fallback={"Loading..."}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
]);

apiClient.initClientFromStorage();

container.render(
  <ApiClientProvider>
    <RouterProvider router={router} />
  </ApiClientProvider>
);
