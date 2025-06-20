import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Cart } from "@commercetools/platform-sdk";
import { useApiClient } from "./ApiClientContext";
import { CartContextType } from "@/@types/interfaces";

// Create the Cart context
const CartContext = createContext<CartContextType | undefined>(undefined);

// CartProvider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const apiClient = useApiClient();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loadingItems, setLoadingItems] = useState<string[]>([]);

  // Compute the number of items in cart
  const cartCount = useMemo(() => {
    return cart?.lineItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  }, [cart]);

  // Clear cart and remove from localStorage
  const clearCart = () => {
    setCart(null);
    localStorage.removeItem("cartId");
  };

  // Reload the active cart from the backend
  const reloadCart = async () => {
    try {
      const activeCart = await apiClient.getMyActiveCart();
      setCart(activeCart);
      localStorage.setItem("cartId", activeCart.id);
    } catch (err) {
      console.warn("Failed to reload cart:", err);
    }
  };

  // Initial cart setup
  useEffect(() => {
    const initCart = async () => {
      try {
        apiClient.initClientFromStorage();

        // Try to get active cart
        try {
          const activeCart = await apiClient.getMyActiveCart();
          setCart(activeCart);
          localStorage.setItem("cartId", activeCart.id);
          return;
        } catch {
          console.warn("No active cart found.");
        }

        // Fallback: create new cart
        let customer;
        try {
          customer = await apiClient.getCustomerProfile();
        } catch {
          customer = undefined;
        }

        const newCart = await apiClient.createMyCart(customer);
        setCart(newCart);
        localStorage.setItem("cartId", newCart.id);
      } catch (err) {
        console.error("Cart initialization failed:", err);
      }
    };

    initCart();
  }, [apiClient]);

  // Add product to cart
  const addToCart = async (productId: string, variantId: number = 1) => {
    setLoadingItems((prev) => [...prev, productId]);

    try {
      let activeCart = cart;
      let customer;

      if (!activeCart) {
        try {
          const storedCartId = localStorage.getItem("cartId");
          if (storedCartId) {
            activeCart = await apiClient.getCartById(storedCartId);
          }
        } catch {
          localStorage.removeItem("cartId");
        }

        if (!activeCart) {
          try {
            customer = await apiClient.getCustomerProfile();
          } catch {
            customer = undefined;
          }

          activeCart = await apiClient.createMyCart(customer);
          localStorage.setItem("cartId", activeCart.id);
        }

        setCart(activeCart);
      }

      const updatedCart = await apiClient.addProductToCart(productId, variantId, customer);
      setCart(updatedCart);
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      setLoadingItems((prev) => prev.filter((id) => id !== productId));
    }
  };

  // Check if item is already in cart
  const isInCart = (productId: string, variantId?: number): boolean => {
    return (
      cart?.lineItems?.some(
        (item) =>
          item.productId === productId &&
          (variantId ? item.variant.id === variantId : true)
      ) ?? false
    );
  };

  // Loading state for adding specific product
  const isLoadingAddToCart = (productId: string): boolean => {
    return loadingItems.includes(productId);
  };

  // Provide cart context
  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        addToCart,
        isInCart,
        isLoadingAddToCart,
        clearCart,
        reloadCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use Cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
