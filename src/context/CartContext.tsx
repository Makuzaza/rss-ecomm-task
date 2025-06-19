import React, { createContext, useContext, useEffect, useState } from "react";
import { Cart } from "@commercetools/platform-sdk";
import { useApiClient } from "./ApiClientContext";

interface CartContextType {
  cart: Cart | null;
  addToCart: (productId: string, variantId?: number) => Promise<void>;
  isInCart: (productId: string, variantId?: number) => boolean;
  isLoadingAddToCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const apiClient = useApiClient();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loadingItems, setLoadingItems] = useState<string[]>([]);

  // On mount → fetch or create cart
  useEffect(() => {
    apiClient.initClientFromStorage();

    const initCart = async () => {
      try {
        const storedCartId = localStorage.getItem("cartId");

        if (storedCartId) {
          try {
            const cart = await apiClient.getCartById(storedCartId);
            setCart(cart);
            console.log("Your cart", cart.lineItems)
            return;
          } catch {
            console.warn("Stored cart is invalid or expired.");
            localStorage.removeItem("cartId");
          }
        }

        let customer;
        try {
          customer = await apiClient.getCustomerProfile();
        } catch {
          customer = undefined ;
        }

        const newCart = await apiClient.createMyCart(customer);
        setCart(newCart);
        localStorage.setItem("cartId", newCart.id);
      } catch (error) {
        console.error("Cart init failed:", error);
      }
    };

    initCart();
  }, [apiClient]);


 const addToCart = async (productId: string, variantId: number = 1) => {
  setLoadingItems((prev) => [...prev, productId]);

  try {
    let activeCart = cart;
    console.log("im here", activeCart.lineItems)
    let customer;

    if (!activeCart) {
      const storedCartId = localStorage.getItem("cartId");

      if (storedCartId) {
        try {
          console.log("Trying to restore cart with ID:", storedCartId);
          activeCart = await apiClient.getCartById(storedCartId);
        } catch (error) {
          console.warn("Cart restore failed. Creating new one.", error);
          localStorage.removeItem("cartId");
        }
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

    const updatedCart = await apiClient.addProductToCart(
      productId,
      variantId,
      customer
    );

    setCart(updatedCart);
  } catch (error) {
    console.error("Add to cart failed:", error);
  } finally {
    setLoadingItems((prev) => prev.filter((id) => id !== productId));
  }
};



    function isInCart(productId: string, variantId?: number): boolean {
      return cart?.lineItems?.some(
        (item) =>
          item.productId === productId &&
          (variantId ? item.variant.id === variantId : true)
      ) ?? false;
    }

    const isLoadingAddToCart = (productId: string): boolean => {
      return loadingItems.includes(productId);
    };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, isInCart, isLoadingAddToCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
