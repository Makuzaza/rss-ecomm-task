import React, { createContext, useContext, useState } from "react";
import { CartItem } from "@/@types/interfaces";
import { CartContextType } from "@/@types/interfaces";
import {
  UpdateQuantityFn,
  IncrementQuantityFn,
  DecrementQuantityFn,
} from "@/@types/interfaces";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const addToCart = (product: CartItem) => {
    console.log("Current cart items before add:", cartItems);
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        const updatedItems = prevItems.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
        console.log("Updated existing item:", updatedItems);
        return updatedItems;
      }
      const newItems = [...prevItems, { ...product, quantity: 1 }];
      console.log("Added new item:", newItems);
      return newItems;
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((prevItems) => {
      const filteredItems = prevItems.filter((item) => item.id !== productId);
      return filteredItems;
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateQuantity: UpdateQuantityFn = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const incrementQuantity: IncrementQuantityFn = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      ),
    );
  };

  const decrementQuantity: DecrementQuantityFn = (id) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item,
      ),
    );
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalItems = cartItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        cartCount,
        totalItems,
        updateQuantity,
        incrementQuantity,
        decrementQuantity,
      }}
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
