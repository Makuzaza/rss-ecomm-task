import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem } from "@/@types/interfaces";
import { CartContextType } from "@/@types/interfaces";
import { useApiClient } from "@/context/ApiClientContext";

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

        // Convert API cart items to local CartItem format
        const items = myCart.lineItems.map((item) => ({
          id: item.productId,
          name: item.name?.["en-US"] || "",
          price: item.price?.value.centAmount
            ? item.price.value.centAmount / 100
            : 0,
          priceDiscounted: item.price?.discounted?.value.centAmount
            ? item.price.discounted.value.centAmount / 100
            : undefined,
          image: item.variant.images?.[0]?.url || "",
          key: item.productKey || "",
          quantity: item.quantity,
        }));

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
    try {
      // UPDATE CART
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
