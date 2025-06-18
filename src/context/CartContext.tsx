import React, { createContext, useContext, useEffect, useState } from "react";
import { Cart, CartPagedQueryResponse } from "@commercetools/platform-sdk";
import { useApiClient } from "./ApiClientContext";

interface CartContextType {
  cart: CartPagedQueryResponse | Cart | null;
  addToCart: (productId: string, variantId?: number) => Promise<void>;
  isInCart: (productId: string) => boolean;
  isLoadingAddToCart: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const apiClient = useApiClient();
  const [cart, setCart] = useState<CartPagedQueryResponse | Cart | null>(null);
  const [loadingItems, setLoadingItems] = useState<string[]>([]);

  // On mount → fetch or create cart
  useEffect(() => {
    const initCart = async () => {
      try {
        const existingCart = await apiClient.getMyCarts();
        console.log("existingCart:", existingCart);
        setCart(existingCart[0]);
      } catch (error) {
        console.log(error);
        const newCart = await apiClient.createMyCart();
        setCart(newCart);
      }
    };

    initCart();
  }, [apiClient]);

  const addToCart = async (productId: string, variantId: number = 1) => {
    try {
      setLoadingItems((prev) => [...prev, productId]);

      let activeCart = cart;
      let customer;

      if (!activeCart) {
        customer = await apiClient.getCustomerProfile();
        activeCart = await apiClient.createMyCart(customer);
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

  const isInCart = (productId: string): boolean => {
    return (
      cart?.lineItems?.some((item) => item.productId === productId) ?? false
    );
  };

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
