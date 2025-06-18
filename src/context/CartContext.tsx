import React, { createContext, useContext, useEffect, useState } from "react";
import { Cart, Customer } from "@commercetools/platform-sdk";
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
    const initCart = async () => {
      try {
        const existingCart = await apiClient.getMyActiveCart();
        setCart(existingCart);
      } catch {
        const newCart = await apiClient.createMyCart();
        setCart(newCart);
      }
    };

    initCart();
  }, [apiClient]);

  const addToCart = async (productId: string, variantId: number = 1) => {
    try {
      setLoadingItems((prev) => [...prev, productId]);

      let customer: Customer | undefined;
      let activeCart = cart;

      // Если нет корзины — пытаемся получить текущего customer
      if (!activeCart) {
        try {
          customer = await apiClient.getCustomerProfile(); // если неавторизован, вернёт undefined или выбросит
        } catch {
          customer = undefined;
        }

        try {
          activeCart = await apiClient.getMyActiveCart();
        } catch (err: unknown) {
          if (
            err instanceof Error &&
            err.message.includes("404")
          ) {
            // если корзины нет — создаём
            activeCart = await apiClient.createMyCart(customer);
          } else {
            throw err;
          }
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
