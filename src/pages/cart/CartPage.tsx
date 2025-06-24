import React, { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import "./CartPage.css";
import { HandleQuantityChange } from "@/@types/interfaces";

const CartPage = () => {
  const {
    cart,
    cartItems,
    removeFromCart,
    clearCart,
    incrementQuantity,
    changeQuantity,
    decrementQuantity,
    applyPromoCode,
    removePromoCode,
  } = useCart();

  const [promoCode, setPromoCode] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  useEffect(() => {
    if (cart?.discountCodes && cart.discountCodes.length > 0) {
      setPromoApplied(true);
    } else {
      setPromoApplied(false);
    }
  }, [cart]);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.priceDiscounted || item.price) * item.quantity,
    0,
  );
  const totalCartPrice = cart?.totalPrice?.centAmount
    ? (cart.totalPrice.centAmount / 100).toFixed(2)
    : subtotal.toFixed(2);

  const handleQuantityChange: HandleQuantityChange = (e, id) => {
    const newQuantity = parseInt(e.target.value) || 1;
    changeQuantity(String(id), newQuantity);
  };

  const handleApplyPromo = async () => {
    if (!promoCode) {
      setPromoMessage("Please enter a promo code. For example: PROMO20");
      return;
    }

    const promoCodes: Record<string, number> = {
      PROMO20: 0.2,
      // SAVE15: 0.15,
    };

    if (promoCode.toUpperCase() in promoCodes) {
      const newDiscount = promoCodes[promoCode.toUpperCase()];

      try {
        await applyPromoCode(promoCode.trim());
        setPromoMessage("Promo code applied successfully!");
        setPromoApplied(true);
      } catch {
        setPromoMessage("Invalid or expired promo code.");
        setPromoApplied(false);
      }
      setPromoMessage(`Promo code applied! ${newDiscount * 100}% discount`);
    } else {
      // setDiscount(0);
      // setAppliedPromo("");
      setPromoMessage("Insert a valid promo code, for example: PROMO20");
    }
  };

  const handleRemovePromo = async () => {
    try {
      await removePromoCode(promoCode.trim());
      setPromoCode("");
      setPromoMessage("");
      setPromoApplied(false);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="cart-page">
      <h2>
        Your Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
      </h2>

      {cartItems.length > 0 ? (
        <>
          <ul className="cart-items-list">
            {cartItems.map((item) => (
              <li className="cart-item" key={item.id}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="cart-item-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <div className="cart-item-details">
                  <strong>{item.name}</strong>
                  <div>
                    Price: {(item.priceDiscounted || item.price).toFixed(2)} €
                  </div>
                  <div className="quantity-controls">
                    <button
                      onClick={() => decrementQuantity(item.id)}
                      aria-label="Decrease quantity"
                    >
                      <FaMinus />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(e, item.id)}
                    />
                    <button
                      onClick={() => incrementQuantity(item.id)}
                      aria-label="Increase quantity"
                    >
                      <FaPlus />
                    </button>
                  </div>
                  <div>
                    Subtotal:{" "}
                    {(
                      (item.priceDiscounted || item.price) * item.quantity
                    ).toFixed(2)}{" "}
                    €
                  </div>
                </div>
                <button
                  onClick={() =>
                    removeFromCart(
                      item.productId,
                      item.key ? parseInt(item.key) : undefined,
                    )
                  }
                  className="button__remove-item"
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>

          {/* Promo Code */}
          <div className="promo-code-section">
            <div className="promo-code-input">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder={
                  promoApplied ? "Promo code applied" : "Enter promo code"
                }
                disabled={promoApplied}
              />
              {!promoApplied ? (
                <button onClick={handleApplyPromo}>Apply</button>
              ) : (
                <button onClick={handleRemovePromo}>Clear</button>
              )}
            </div>
            {promoMessage && (
              <div
                className={`promo-message ${promoApplied ? "success" : "error"}`}
              >
                {promoMessage}
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="cart-summary">
            <p>
              <strong>Total Items: {totalItems}</strong>
            </p>

            {parseFloat(totalCartPrice) < subtotal ? (
              <>
                <p className="original-price">
                  <span
                    style={{ textDecoration: "line-through", color: "gray" }}
                  >
                    {subtotal.toFixed(2)} €
                  </span>
                </p>
                <p className="discount-info">
                  <strong style={{ color: "RED" }}>
                    Discount applied: –
                    {(subtotal - parseFloat(totalCartPrice)).toFixed(2)} €
                  </strong>
                </p>
                <p className="total-price">
                  <strong style={{ fontSize: "1.3rem", color: "#2e7d32" }}>
                    Total Price: {totalCartPrice} €
                  </strong>
                </p>
              </>
            ) : (
              <p className="total-price">
                <strong>Total Price: {totalCartPrice} €</strong>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="cart-actions">
            <button onClick={clearCart} className="button__clear-all">
              Clear All
            </button>
            <Link to="/products" className="button__continue-shopping">
              Continue Shopping
            </Link>
            <button className="button__checkout">Proceed to Checkout</button>
          </div>
        </>
      ) : (
        <div className="empty-cart">
          <div>Your cart is empty</div>
          <Link to="/products" className="button__continue-shopping">
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartPage;
