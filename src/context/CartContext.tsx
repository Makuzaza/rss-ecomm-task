import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem } from "@/@types/interfaces";
import { CartContextType } from "@/@types/interfaces";
import { useApiClient } from "@/context/ApiClientContext";
import { cartItemsNormalization } from "@/utils/dataNormalization";
import { useAuth } from "@/context/AuthContext";
import { type Cart } from "@commercetools/platform-sdk";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuth } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [myCart, setCart] = useState<Cart>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const apiClient = useApiClient();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setIsLoading(true);

        let cart;

        if (isAuth) {
          const customerCartId = localStorage.getItem("customerCart");
          if (customerCartId) {
            cart = await apiClient.getCustomerCartById(customerCartId);
          } else {
            cart = await apiClient.createCustomerCart();
            localStorage.setItem("customerCart", myCart.id);
          }
          // const myActiveCart = await apiClient.getCustomerActiveCart();
          // console.log("myActiveCart", myActiveCart);
        } else {
          const defaultCartId = localStorage.getItem("defaultCart");
          if (defaultCartId) {
            cart = await apiClient.getDefaultCartById(defaultCartId);
          } else {
            cart = await apiClient.createDefaultCart();
            localStorage.setItem("defaultCart", myCart.id);
          }
        }

        if (!cart) {
          throw new Error("Failed to fetch cart");
        }

        const items = cartItemsNormalization(cart);
        setCart(cart);
        setCartItems(items);
      } catch (error) {
        console.error("Failed to fetch cart items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [apiClient, isAuth]);

  const addToCart = async (product: CartItem) => {
    try {
      // Update API state

      const updatedCart = await apiClient.updateCart(myCart, product);
      console.log("myCart: (add)", myCart);
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
      value={{ myCart, cartItems, addToCart, cartCount, isLoading }}
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
