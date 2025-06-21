import React from "react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import { FaTrash, FaPlus, FaMinus } from "react-icons/fa";
import "./CartPage.css";
import { HandleQuantityChange } from "@/@types/interfaces";

const CartPage = () => {
  const {
    cartItems,
    removeFromCart,
    clearCart,
    incrementQuantity,
    decrementQuantity,
    updateQuantity,
  } = useCart();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cartItems
    .reduce(
      (sum, item) => sum + (item.priceDiscounted || item.price) * item.quantity,
      0,
    )
    .toFixed(2);

  const handleQuantityChange: HandleQuantityChange = (e, id) => {
    const newQuantity = parseInt(e.target.value) || 1;
    updateQuantity(String(id), newQuantity);
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
                  <div>
                    <strong>{item.name}</strong>
                  </div>
                  <div>
                    Price: {(item.priceDiscounted || item.price).toFixed(2)} €
                  </div>
                  <div className="quantity-controls">
                    <button
                      onClick={() => decrementQuantity(item.id)}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <FaMinus />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(e, item.id)}
                      aria-label={`Quantity of ${item.name}`}
                    />
                    <button
                      onClick={() => incrementQuantity(item.id)}
                      aria-label={`Increase quantity of ${item.name}`}
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
                  onClick={() => removeFromCart(item.id)}
                  className="button__remove-item"
                  aria-label={`Remove ${item.name} from cart`}
                >
                  <FaTrash />
                </button>
              </li>
            ))}
          </ul>
          <div className="cart-summary">
            <p>
              <strong>Total Items: {totalItems}</strong>
            </p>
            <p>
              <strong>Total Price: {totalPrice} €</strong>
            </p>
          </div>
          <div className="cart-actions">
            <button
              onClick={clearCart}
              className="button__clear-all"
              aria-label="Clear all items from cart"
            >
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
