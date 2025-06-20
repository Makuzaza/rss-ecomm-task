import React from "react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import "./CartPage.css";



const CartPage = () => {
  const { cart, removeLineItem, clearEntireCart } = useCart();
  const lineItems = cart?.lineItems ?? [];
  const totalItems = lineItems.reduce((sum: number, item) => sum + item.quantity, 0);
  

  
  return (
    <div style={{ padding: "20px", backgroundColor: "#f0f0f0" }}>
      <h1>
        Your Cart ({totalItems} {totalItems === 1 ? "item" : "items"})
      </h1>
      <button
        onClick={clearEntireCart}
        className="button__clear-cart"
        style={{ marginBottom: "10px" }}
      >
        Remove All Items
      </button>
      {lineItems.length > 0 ? (
        <>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {lineItems.map((item) => (
              <li
                key={item.id}
                style={{
                  margin: "10px 0",
                  padding: "10px",
                  backgroundColor: "white",
                }}
              >
                <p>
                  <strong>{item.name?.["en-US"]}</strong>
                </p>
                <p>
                  Price: {(item.price.discounted?.value.centAmount ?? item.price.value.centAmount) / 100} €
                </p>
                <p>Quantity: {item.quantity}</p>
                {item.variant.images?.[0]?.url && (
                  <div className="img-cart-container">
                    <img
                      src={item.variant.images[0].url}
                      alt={item.name?.["en-US"]}
                      style={{ maxWidth: "100px", height: "50px" }}
                    />
                  </div>
                )}
                <div className="button__remove-item-container">
                  <button
                    onClick={() => removeLineItem(item.id)}
                    className="button__remove-item"
                  >
                    Remove
                  </button>
                </div>
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
