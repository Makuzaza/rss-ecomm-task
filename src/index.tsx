import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "@/pages/login/Login";
import Register from "@/pages/register/Register";
import React, { Suspense } from "react";
import { ApiClientProvider } from "@/api/ApiClientContext";
import Shop from "@/pages/shop/shop";
import About from "@/pages/about/About";

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
    ],
  },
]);

container.render(
  <ApiClientProvider>
    <RouterProvider router={router} />
  </ApiClientProvider>
);
