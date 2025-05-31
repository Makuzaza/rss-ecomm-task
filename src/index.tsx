import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import Login from "@/pages/login/Login";
import Register from "@/pages/register/Register";
import React, { Suspense } from "react";
import { ApiClientProvider } from "@/context/ApiClientContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Shop from "@/pages/shop/Shop";
import About from "@/pages/about/About";
import NotFound from "@/pages/notfound/NotFound";
import Profile from "@/pages/profile/Profile";
import ProductDetails from "@/pages/productDetails/ProductDetails";
import Category from "@/pages/category/Category";
import Products from "@/pages/products/Products";
import SearchResults from "@/pages/search/SearchResults";

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
            <Shop />
          </Suspense>
        ),
      },
      {
        path: "/login",
        element: (
          <Suspense fallback={"Loading..."}>
            <Login />
          </Suspense>
        ),
      },
      {
        path: "/register",
        element: (
          <Suspense fallback={"Loading..."}>
            <Register />
          </Suspense>
        ),
      },
      {
        path: "/about",
        element: (
          <Suspense fallback={"Loading..."}>
            <About />
          </Suspense>
        ),
      },
      {
        path: "/profile",
        element: (
          <Suspense fallback={"Loading..."}>
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          </Suspense>
        ),
      },
      {
        path: "/product",
        element: <Navigate to="/products" replace />,
      },
      {
        path: "/products",
        element: <Products />,
      },
      {
        path: "/product/:id",
        element: (
          <Suspense fallback={"Loading..."}>
            <ProductDetails />
          </Suspense>
        ),
      },
      {
        path: "/category",
        element: <Category />,
      },
      {
        path: "/search",
        element: <SearchResults />,
      },
      {
        path: "*",
        element: (
          <Suspense fallback={"Loading..."}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
]);

container.render(
  <ApiClientProvider>
    <RouterProvider router={router} />
  </ApiClientProvider>
);
