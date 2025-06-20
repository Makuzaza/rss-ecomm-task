import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem } from "@/@types/interfaces";
import { CartContextType } from "@/@types/interfaces";
import { useApiClient } from "@/context/ApiClientContext";
import { cartItemsNormalization } from "@/utils/dataNormalization";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const apiClient = useApiClient();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        const myCart = await apiClient.getCart();
        const items = cartItemsNormalization(myCart);
        setCartItems(items);
      } catch (error) {
        console.error("Failed to fetch cart items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [apiClient]);

  const addToCart = async (product: CartItem) => {
    const carts = await apiClient.getAllCarts();
    console.log("My cart:", carts);

    try {
      // Update API state
      const myCart = await apiClient.getCart();
      const updatedCart = await apiClient.updateCart(myCart, product);
      console.log("updatedCart:", updatedCart);

      // Update local state
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);

        if (existingItem) {
          return prevItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }

        return [...prevItems, { ...product, quantity: 1 }];
      });
    } catch (error) {
      console.error("Failed to add item to cart:", error);
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cartItems, addToCart, cartCount, isLoading }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
