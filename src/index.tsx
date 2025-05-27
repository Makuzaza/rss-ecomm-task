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
import ProductsList from "@/pages/productsList/ProductsList";
import About from "@/pages/about/About";
import NotFound from "./pages/notfound/NotFound";
import Profile from "./pages/profile/Profile";
import ProductDetails from "./pages/productDetails/ProductDetails";

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
            <ProductsList />
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
        element: <Navigate to="/" replace />,
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
