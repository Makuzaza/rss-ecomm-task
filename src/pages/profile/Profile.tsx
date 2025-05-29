import React from "react";
import "./Profile.css";
import { useAuth } from "@/context/AuthContext";

const Profile = () => {
  const { customer } = useAuth();

  if (!customer) return <p>Loading...</p>;

  const {
    firstName,
    lastName,
    dateOfBirth,
    addresses,
    defaultBillingAddressId,
    defaultShippingAddressId,
  } = customer;

  return (
    <div className="profile-page">
      <h2>User Profile</h2>

      <section className="personal-info">
        <h3>Personal Information</h3>
        <p className="p-text"><strong>First Name:</strong> {firstName}</p>
        <p className="p-text"><strong>Last Name:</strong> {lastName}</p>
        <p className="p-text"><strong>Date of Birth:</strong> {dateOfBirth}</p>
      </section>

     <section className="addresses">
        <h3>Addresses</h3>
        {addresses && addresses.length > 0 ? (
          addresses.map((addr, index) => (
            <div key={addr.id || index} className="address-card">
              <p className="p-text">
                {addr.streetName}, {addr.postalCode}, {addr.city}, {addr.state || ""}, {addr.country}
              </p>

              {/* Billing */}
              {addr.id === defaultBillingAddressId && (
                <p className="address-label">🏷️ Default Billing Address</p>
              )}
              {addr.id !== defaultBillingAddressId && (
                <p className="address-label">❗ This address is not Default Billing Address</p>
              )}

              {/* Shipping */}
              {addr.id === defaultShippingAddressId && (
                <p className="address-label">📦 Default Shipping Address</p>
              )}
              {addr.id !== defaultShippingAddressId && (
                <p className="address-label">❗ This address is not Default Shipping Address</p>
              )}
            </div>
          ))
        ) : (
          <p>No addresses found.</p>
        )}
      </section>


    </div>
  );
};

export default Profile;
