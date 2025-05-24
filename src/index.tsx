import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "@/pages/login/Login";
import Register from "@/pages/register/Register";
import React, { Suspense } from "react";
import { ApiClientProvider } from "@/api/ApiClientContext";
import Shop from "@/pages/shop/Shop";
import About from "@/pages/about/About";
import Profile from "./pages/profile/Profile";

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
        path: "/shop",
        element: (
          <Suspense fallback={"Loading..."}>
            <Shop />
          </Suspense>
        ),
      },
      {
        path: "/profile",
        element: (
          <Suspense fallback={"Loading..."}>
            <Profile />
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
