import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Cart } from "@commercetools/platform-sdk";
import { useApiClient } from "./ApiClientContext";
import {
  CartContextType,
  //   UpdateQuantityFn,
  //   ChangeQuantityFn,
} from "@/@types/interfaces";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const apiClient = useApiClient();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loadingItems, setLoadingItems] = useState<string[]>([]);

  const cartItems = useMemo(() => {
    if (!cart) return [];
    return cart.lineItems.map((item) => ({
      id: item.productId,
      name: item.name?.["en-US"] || "",
      price: item.price?.value.centAmount / 100,
      priceDiscounted:
        item.discountedPricePerQuantity?.[0]?.discountedPrice?.value
          ?.centAmount / 100,
      quantity: item.quantity,
      image: item.variant?.images?.[0]?.url || "",
      key: item.variant?.key || "",
    }));
  }, [cart]);

  const cartCount = useMemo(() => {
    return cart?.lineItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  }, [cart]);

  const totalItems = useMemo(() => cartItems.length, [cartItems]);

  const clearCart = async () => {
    if (!cart) return;

    try {
      await apiClient.deleteCart(cart.id, cart.version);
      const newCart = await apiClient.createMyCart();
      setCart(newCart);
      localStorage.setItem("cartId", newCart.id);
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  const reloadCart = async () => {
    try {
      const activeCart = await apiClient.getCart();
      setCart(activeCart);
      localStorage.setItem("cartId", activeCart.id);
    } catch (err) {
      console.warn("Failed to reload cart:", err);
    }
  };

  const removeLineItem = async (lineItemId: string) => {
    if (!cart) return;
    try {
      const updatedCart = await apiClient.removeLineItemFromCart(
        cart.id,
        cart.version,
        lineItemId
      );
      setCart(updatedCart);
    } catch (err) {
      console.error("Failed to remove line item:", err);
    }
  };

  const clearEntireCart = async () => {
    if (!cart || cart.lineItems.length === 0) return;

    try {
      let updatedCart = cart;
      const lineItemIds = [...updatedCart.lineItems].map((item) => item.id);

      for (const lineItemId of lineItemIds) {
        updatedCart = await apiClient.removeLineItemFromCart(
          updatedCart.id,
          updatedCart.version,
          lineItemId
        );
      }

      setCart(updatedCart);
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  const addToCart = async (productId: string, variantId: number = 1) => {
    setLoadingItems((prev) => [...prev, productId]);

    try {
      const cart = await apiClient.getCart();
      console.log("Your cart:", cart);

      const updatedCart = await apiClient.addProductToCart(
        cart,
        productId,
        variantId
      );
      console.log("Your updated cart:", updatedCart);
      setCart(updatedCart);
    } catch (err) {
      // try {
      //   let activeCart = cart;
      //   let customer;

      //   if (!activeCart) {
      //     const storedCartId = localStorage.getItem("cartId");
      //     if (storedCartId) {
      //       try {
      //         activeCart = await apiClient.getCartById(storedCartId);
      //       } catch {
      //         localStorage.removeItem("cartId");
      //       }
      //     }

      //     if (!activeCart) {
      //       try {
      //         customer = await apiClient.getCustomerProfile();
      //       } catch {
      //         customer = undefined;
      //       }

      //       activeCart = await apiClient.createMyCart(customer);
      //       localStorage.setItem("cartId", activeCart.id);
      //     }

      // const updatedCart = await apiClient.addProductToCart(
      //   productId,
      //   variantId,
      //   customer
      // );
      // setCart(updatedCart);
      console.error("Add to cart failed:", err);
    } finally {
      setLoadingItems((prev) => prev.filter((id) => id !== productId));
    }
  };

  const isInCart = (productId: string, variantId?: number): boolean => {
    return (
      cart?.lineItems?.some(
        (item) =>
          item.productId === productId &&
          (variantId ? item.variant.id === variantId : true)
      ) ?? false
    );
  };

  const isLoadingAddToCart = (productId: string): boolean => {
    return loadingItems.includes(productId);
  };

  // const updateQuantity: UpdateQuantityFn = (id, newQuantity) => {
  //   if (newQuantity < 1) {
  //     removeFromCart(id);
  //     return;
  //   }

  //   setCartItems((prevItems) =>
  //     prevItems.map((item) =>
  //       item.id === id ? { ...item, quantity: newQuantity } : item
  //     )
  //   );
  // };

  // const incrementQuantity: ChangeQuantityFn = (id) => {
  //   setCartItems((prevItems) =>
  //     prevItems.map((item) =>
  //       item.id === id ? { ...item, quantity: item.quantity + 1 } : item
  //     )
  //   );
  // };

  // const decrementQuantity: ChangeQuantityFn = (id) => {
  //   setCartItems((prevItems) =>
  //     prevItems.map((item) =>
  //       item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
  //     )
  //   );
  // };

  const removeFromCart = (productId: string, variantId?: number) => {
    if (!cart) return;

    const lineItem = cart.lineItems.find(
      (item) =>
        item.productId === productId &&
        (variantId ? item.variant.id === variantId : true)
    );

    if (lineItem) {
      removeLineItem(lineItem.id);
    }
  };

  useEffect(() => {
    const initCart = async () => {
      try {
        apiClient.initClientFromStorage();
        try {
          const activeCart = await apiClient.getCart();
          setCart(activeCart);
          localStorage.setItem("cartId", activeCart.id);
        } catch {
          console.warn("No active cart found.");
        }
      } catch (err) {
        console.error("Cart initialization failed:", err);
      }
    };

    initCart();
  }, [apiClient]);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartItems,
        addToCart,
        isInCart,
        isLoadingAddToCart,
        clearCart,
        reloadCart,
        removeLineItem,
        clearEntireCart,
        removeFromCart,
        // updateQuantity,
        // incrementQuantity,
        // decrementQuantity,
        totalItems,
      }}
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
