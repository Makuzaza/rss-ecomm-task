import React from "react";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import "./CartPage.css";

const CartPage = () => {
  const { myCart } = useCart();

  if (!myCart) {
    return (
      <div className="cart-container">
        <p>Loading your cart...</p>
      </div>
    );
  }

  const totalItems = myCart.totalLineItemQuantity || 0;
  const totalPrice = myCart.totalPrice?.centAmount
    ? (myCart.totalPrice.centAmount / 100).toFixed(2)
    : "0.00";

  return (
    <div className="cart-container">
      <h1 className="cart-title">Shopping cart ({totalItems})</h1>

      {myCart.lineItems && myCart.lineItems.length > 0 ? (
        <>
          <div className="products-section">
            <table className="price-table">
              <thead>
                <tr>
                  <th></th>
                  <th>PRODUCT</th>
                  <th>UNIT PRICE</th>
                  <th>QUANTITY</th>
                  <th>TOTAL</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {myCart.lineItems.map((item) => {
                  const itemPrice = item.price.value.centAmount / 100;
                  const totalItemPrice = item.totalPrice.centAmount / 100;
                  return (
                    <tr key={item.id}>
                      <td>
                        <img
                          className="product-image"
                          src={item.variant.images[0].url}
                        />
                      </td>
                      <td>{item.name["en-US"]}</td>
                      <td>{itemPrice.toFixed(2)} €</td>
                      <td>{item.quantity}</td>
                      <td>{totalItemPrice.toFixed(2)} €</td>
                      <td>
                        <button
                          className="button__remove-item"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <hr className="cart-divider" />

          <div className="total-section">
            <div className="total-amount">{totalPrice} €</div>
          </div>

          <div className="discount-section">
            Discount code
            <div className="discount-input">
              <input
                type="text"
                placeholder="For example: SALE50"
                className="discount-input-field"
              />
              <button className="apply-button">Apply</button>
            </div>
          </div>

          {/* <Link to="/checkout" className="continue-button">
            Continue
          </Link> */}
        </>
      ) : (
        <div>
          <p className="empty-cart-message">Your cart is empty</p>
          <Link to="/products" className="continue-button">
            Continue Shopping
          </Link>
        </div>
      )}
    </div>
  );
};

export default CartPage;
