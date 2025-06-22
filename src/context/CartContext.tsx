import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Cart, MyCartUpdate } from "@commercetools/platform-sdk";
import { CartContextType, ICartService } from "@/@types/interfaces";
import { CartServiceFactory } from "@/api/cart/CartServiceFactory";

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartService, setCartService] = useState<ICartService | null>(null);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loadingItems, setLoadingItems] = useState<string[]>([]);

  useEffect(() => {
    try {
      const service = CartServiceFactory.create();
      setCartService(service);
    } catch (err) {
      console.error("Failed to create CartService:", err);
    }
  }, []);

  const ensureCart = async (): Promise<Cart> => {
    if (!cartService) throw new Error("Cart service not ready");
    try {
      return await cartService.getActiveCart();
    } catch {
      return await cartService.createCart();
    }
  };

  const cartItems = useMemo(() => {
    if (!cart) return [];

    return cart.lineItems.map((item) => ({
      id: item.id, 
      productId: item.productId,
      name: item.name?.["en-US"] || "",
      price: item.price?.value.centAmount / 100,
      priceDiscounted:
        item.discountedPricePerQuantity?.[0]?.discountedPrice?.value?.centAmount / 100,
      quantity: item.quantity,
      image: item.variant?.images?.[0]?.url || "",
      key: item.variant?.key || "",
    }));
  }, [cart]);
  
  const cartCount = useMemo(() => cart?.lineItems?.reduce((sum, item) => sum + item.quantity, 0) ?? 0, [cart]);
  const totalItems = useMemo(() => cartItems.length, [cartItems]);

  const changeQuantity = async (lineItemId: string, quantity: number) => {
    if (!cartService || !cart) return;

    try {
      const updatedCart = await cartService.changeLineItemQuantity(cart.id, cart.version, lineItemId, quantity);
      setCart(updatedCart);
    } catch (err) {
      console.error("Failed to change quantity:", err);
    }
  };

  const incrementQuantity = async (lineItemId: string) => {
    if (!cart || !cartService) return;
    const lineItem = cart.lineItems.find((item) => item.id === lineItemId);
    if (!lineItem) return;

    await changeQuantity(lineItemId, lineItem.quantity + 1);
  };

  const decrementQuantity = async (lineItemId: string) => {
    if (!cart || !cartService) return;
    const lineItem = cart.lineItems.find((item) => item.id === lineItemId);
    if (!lineItem) return;

    const newQuantity = Math.max(1, lineItem.quantity - 1);
    await changeQuantity(lineItemId, newQuantity);
  };

  const reloadCart = async () => {
    if (!cartService) return;
    try {
      const updatedCart = await cartService.getActiveCart();
      setCart(updatedCart);
    } catch (err) {
      console.warn("Failed to reload cart:", err);
    }
  };

  const clearEntireCart = async () => {
    if (!cartService || !cart || cart.lineItems.length === 0) return;

    try {
      let updatedCart = cart;
      const lineItemIds = updatedCart.lineItems.map((item) => item.id);

      for (const lineItemId of lineItemIds) {
        const payload: MyCartUpdate = {
          version: updatedCart.version,
          actions: [{ action: "removeLineItem", lineItemId }],
        };
        updatedCart = await cartService.updateCart(updatedCart.id, payload);
      }

      setCart(updatedCart);
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  const removeLineItem = async (lineItemId: string) => {
    if (!cartService || !cart) return;

    try {
      const payload: MyCartUpdate = {
        version: cart.version,
        actions: [{ action: "removeLineItem", lineItemId }],
      };
      const updatedCart = await cartService.updateCart(cart.id, payload);
      setCart(updatedCart);
    } catch (err) {
      console.error("Failed to remove line item:", err);
    }
  };
  const removeAllDiscountCodes = async () => {
    if (!cartService || !cart) return;

    try {
      let updatedCart = cart;

      for (const discount of cart.discountCodes) {
        const payload: MyCartUpdate = {
          version: updatedCart.version,
          actions: [
            {
              action: "removeDiscountCode",
              discountCode: { typeId: "discount-code", id: discount.discountCode.id },
            },
          ],
        };
        updatedCart = await cartService.updateCart(updatedCart.id, payload);
      }

      setCart(updatedCart);
    } catch (err) {
      console.error("Failed to remove discount codes:", err);
    }
  };

  const clearCart = async () => {
    if (!cartService) return;
    try {
      const newCart = await cartService.createCart();
      setCart(newCart);
    } catch (err) {
      console.error("Failed to clear cart:", err);
    }
  };

  const addToCart = async (productId: string, variantId: number = 1) => {
    if (!cartService) return;

    setLoadingItems((prev) => [...prev, productId]);

    try {
      const currentCart = cart ?? (await ensureCart());

      const payload: MyCartUpdate = {
        version: currentCart.version,
        actions: [
          {
            action: "addLineItem",
            productId,
            variantId,
            quantity: 1,
          },
        ],
      };

      const updatedCart = await cartService.updateCart(currentCart.id, payload);
      setCart(updatedCart);
    } catch (err) {
      console.error("Add to cart failed:", err);
    } finally {
      setLoadingItems((prev) => prev.filter((id) => id !== productId));
    }
  };

  const removeFromCart = (productId: string, variantId?: number) => {
    if (!cartService || !cart) return;

    const lineItem = cart.lineItems.find(
      (item) =>
        item.productId === productId &&
        (variantId ? item.variant.id === variantId : true)
    );

    if (lineItem) {
      removeLineItem(lineItem.id);
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

  const applyPromoCode = async (code: string) => {
    if (!cartService || !cart) return;

    try {
      const updatedCart = await cartService.addDiscountCode(cart.id, cart.version, code);
      setCart(updatedCart);
    } catch (err) {
      console.error("Failed to apply promo code:", err);
      throw err; // чтобы можно было отловить в UI
    }
  };

  useEffect(() => {
    if (!cartService) return;

    const initCart = async () => {
      try {
        const initialCart = await ensureCart();
        setCart(initialCart);
      } catch (err) {
        console.error("Cart init failed:", err);
      }
    };

    initCart();
  }, [cartService]);

  if (!cartService) return <div>Loading cart...</div>;

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
        totalItems,
        changeQuantity,
        incrementQuantity,
        decrementQuantity,
        applyPromoCode,
        cartService,
        removeAllDiscountCodes,
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
