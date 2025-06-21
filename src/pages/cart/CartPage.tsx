import React from "react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import "./CartPage.css";

const CartPage = () => {
  const { cartItems, myCart } = useCart();
  console.log("myCart (cart page:)", myCart);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ padding: "20px", backgroundColor: "#f0f0f0" }}>
      <h1>
        Your Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
      </h1>
      {cartItems.length > 0 ? (
        <>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {cartItems.map((item) => (
              <li
                key={item.id}
                style={{
                  margin: "10px 0",
                  padding: "10px",
                  backgroundColor: "white",
                }}
              >
                <p>
                  <strong>{item.name}</strong>
                </p>
                <p>
                  Price: {(item.priceDiscounted || item.price).toFixed(2)} €
                </p>
                <p>Quantity: {item.quantity}</p>
                <img
                  src={item.image}
                  alt={item.name}
                  style={{ maxWidth: "100px", height: "auto" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </li>
            ))}
          </ul>
          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <p>
              <strong>Total Items: {totalItems}</strong>
            </p>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center" }}>
          <p>Your cart is empty</p>
          <Link to="/products" className="button__continue-shopping">
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartPage;
