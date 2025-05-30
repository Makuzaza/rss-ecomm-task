import React, { useState } from "react";
import "./Profile.css";
import { useAuth } from "@/context/AuthContext";
import { apiClient } from "@/api/ApiClient";






const Profile = () => {
  const { customer, setCustomer } = useAuth() 
  const [isEditing, setIsEditing] = useState(false);

  const [editedFirstName, setEditedFirstName] = useState("");
  const [editedLastName, setEditedLastName] = useState("");
  const [editedDOB, setEditedDOB] = useState("");

  if (!customer) return <p>Loading...</p>;

  const {
    firstName,
    lastName,
    dateOfBirth,
    addresses,
    defaultBillingAddressId,
    defaultShippingAddressId,
    version,
  } = customer;

  const startEdit = () => {
    setEditedFirstName(firstName);
    setEditedLastName(lastName);
    setEditedDOB(dateOfBirth);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const saveChanges = async () => {
    if (!editedFirstName || !editedLastName || !editedDOB) {
      alert("All fields are required.");
      return;
    }

    try {
      const updated = await apiClient.updateCustomer({
        version,
        actions: [
          { action: "setFirstName", firstName: editedFirstName },
          { action: "setLastName", lastName: editedLastName },
          { action: "setDateOfBirth", dateOfBirth: editedDOB },
        ],
      });
      setCustomer(updated.body);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update customer", error);
    }
  };

  return (
    <div className="profile-page">
      <h2>User Profile</h2>

      <section className="personal-info">
        <h3>Personal Information</h3>
        {isEditing ? (
          <>
            <input
              type="text"
              value={editedFirstName}
              onChange={(e) => setEditedFirstName(e.target.value)}
              placeholder="First Name"
            />
            <input
              type="text"
              value={editedLastName}
              onChange={(e) => setEditedLastName(e.target.value)}
              placeholder="Last Name"
            />
            <input
              type="date"
              value={editedDOB}
              onChange={(e) => setEditedDOB(e.target.value)}
              placeholder="Date of Birth"
            />
            <button onClick={saveChanges}>Save</button>
            <button onClick={cancelEdit}>Cancel</button>
          </>
        ) : (
          <>
            <p className="p-text"><strong>First Name:</strong> {firstName}</p>
            <p className="p-text"><strong>Last Name:</strong> {lastName}</p>
            <p className="p-text"><strong>Date of Birth:</strong> {dateOfBirth}</p>
            <button onClick={startEdit}>Edit</button>
          </>
        )}
      </section>

      <section className="addresses">
        <h3>Addresses</h3>
        {addresses && addresses.length > 0 ? (
          addresses.map((addr, index) => (
            <div key={addr.id || index} className="address-card">
              <p className="p-text">
                {addr.streetName}, {addr.postalCode}, {addr.city}, {addr.state || ""}, {addr.country}
              </p>
              <p className="address-label">
                {addr.id === defaultBillingAddressId
                  ? "🏷️ Default Billing Address"
                  : "❗ This address is not Default Billing Address"}
              </p>
              <p className="address-label">
                {addr.id === defaultShippingAddressId
                  ? "📦 Default Shipping Address"
                  : "❗ This address is not Default Shipping Address"}
              </p>
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
