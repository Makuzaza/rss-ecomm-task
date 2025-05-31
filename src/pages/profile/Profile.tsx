import React, { useState } from "react";
import "./Profile.css";
import { useAuth } from "@/context/AuthContext";
import { useApiClient } from "@/context/ApiClientContext";
import { CustomerAddress } from "@/@types/interfaces";
import { Address } from "@commercetools/platform-sdk";
import europeanCountries from "@/data/europeanCountries.json";

const Profile = () => {
  const { customer, setCustomer } = useAuth();
  const apiClient = useApiClient();
  const [isEditing, setIsEditing] = useState(false);

  // Personal information state
  const [editedFirstName, setEditedFirstName] = useState("");
  const [editedLastName, setEditedLastName] = useState("");
  const [editedDOB, setEditedDOB] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  console.log("apiClient.customerApiRoot", apiClient['customerApiRoot']);
  if (!customer || !apiClient) {
    return <p>Loading...</p>;
  }

   const {
    firstName,
    lastName,
    dateOfBirth,
    addresses,
    defaultBillingAddressId,
    defaultShippingAddressId,
    version,
  } = customer;
  

  const normalizeAddresses = (addresses: Address[]): CustomerAddress[] =>
    addresses.map((addr) => ({
      id: addr.id,
      streetName: addr.streetName ?? "",
      postalCode: addr.postalCode ?? "",
      city: addr.city ?? "",
      country: addr.country ?? "",
      state: addr.state ?? "",
    }));

  const [editedAddresses, setEditedAddresses] = useState<CustomerAddress[]>(
    normalizeAddresses(customer.addresses)
  );
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(null);

  const [addressErrors, setAddressErrors] = useState<Record<number, string>>({});

  const validatePostalCode = (postalCode: string, country: string): boolean => {
    if (!postalCode) return false;

    const countryRule = europeanCountries.find(c => c.code === country);
    if (!countryRule) return true;

    try {
      const regex = new RegExp(countryRule.codeRegex);
      return regex.test(postalCode);
    } catch (err) {
      console.warn(`Invalid regex for ${country}`, err);
      return true;
    }
  };

  const startEdit = () => {
    setEditedFirstName(firstName);
    setEditedLastName(lastName);
    setEditedDOB(dateOfBirth);
    setErrorMessage("");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleAddressChange = (index: number, field: keyof CustomerAddress, value: string) => {
    const updated = [...editedAddresses];
    updated[index] = { ...updated[index], [field]: value };
    setEditedAddresses(updated);

    if (field === "postalCode") {
      const country = updated[index].country;
      const isValid = validatePostalCode(value, country);
      setAddressErrors((prev) => ({
        ...prev,
        [index]: isValid ? "" : "Invalid postal code format for selected country.",
      }));
    }

    if (field === "country") {
      updated[index].postalCode = "";
      setEditedAddresses(updated);
      setAddressErrors((prev) => ({ ...prev, [index]: "" }));
    }
  };

  const startAddressEdit = (index: number) => {
    setEditingAddressIndex(index);
  };

  const cancelAddressEdit = () => {
    setEditingAddressIndex(null);
    setEditedAddresses(normalizeAddresses(customer.addresses));
  };

  const saveAddressChanges = async (index: number) => {
    const address = editedAddresses[index];
    if (!address.id) return;

    const errors: Record<number, string> = {};

    if (!address.streetName || !address.city || !address.country || !address.postalCode) {
      errors[index] = "All fields are required.";
      setAddressErrors((prev) => ({ ...prev, ...errors }));
      return;
    }

    const isValidPostal = validatePostalCode(address.postalCode, address.country);
    if (!isValidPostal) {
      errors[index] = "Invalid postal code format for selected country.";
      setAddressErrors((prev) => ({ ...prev, ...errors }));
      return;
    }

    // No errors → clear and proceed
    setAddressErrors((prev) => ({ ...prev, [index]: "" }));

    try {
      const updated = await apiClient.updateCustomer({
        version: customer.version,
        actions: [
          {
            action: "changeAddress",
            addressId: address.id,
            address: {
              streetName: address.streetName,
              postalCode: address.postalCode,
              city: address.city,
              state: address.state,
              country: address.country,
            },
          },
        ],
      });
      setCustomer(updated.body);
      setEditingAddressIndex(null);
    } catch (error) {
      console.error("Failed to update address", error);
    }
  };

  const saveChanges = async () => {
    if (!editedFirstName || !editedLastName || !editedDOB) {
      setErrorMessage("All fields are required.");
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

  const setDefaultAddress = async (
    addressId: string,
    type: "shipping" | "billing"
  ) => {
    try {
      const updated = await apiClient.updateCustomer({
        version: customer.version,
        actions: [
          {
            action:
              type === "shipping"
                ? "setDefaultShippingAddress"
                : "setDefaultBillingAddress",
            addressId,
          },
        ],
      });
      setCustomer(updated.body);
    } catch (error) {
      console.error(`Failed to set default ${type} address`, error);
    }
  };

  return (
    <div className="profile-page">
      <h2>User Profile</h2>

      <section className="personal-info">
        <h3>Personal Information</h3>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {isEditing ? (
          <div className="edit-form-container">
            <input
              type="text"
              value={editedFirstName}
              onChange={(e) => setEditedFirstName(e.target.value)}
              placeholder="First Name"
              className="edit-input"
            />
            <input
              type="text"
              value={editedLastName}
              onChange={(e) => setEditedLastName(e.target.value)}
              placeholder="Last Name"
              className="edit-input"
            />
            <input
              type="date"
              value={editedDOB}
              onChange={(e) => setEditedDOB(e.target.value)}
              placeholder="Date of Birth"
              className="edit-input"
            />
            <div className="edit-buttons-container">
              <button onClick={saveChanges} className="save-button">Save</button>
              <button onClick={cancelEdit} className="close-button">Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <p className="p-text"><strong>First Name:</strong> {firstName}</p>
            <p className="p-text"><strong>Last Name:</strong> {lastName}</p>
            <p className="p-text"><strong>Date of Birth:</strong> {dateOfBirth}</p>
            <button onClick={startEdit} className="edit-button">Edit</button>
          </>
        )}
      </section>

      <section className="addresses">
        <h3 className="h3-addresses">Delivery addresses:</h3>
        {addresses && addresses.length > 0 ? (
          addresses.map((addr, index) => (
            <div key={addr.id || index} className="address-card">
              {editingAddressIndex === index ? (
                <div className="address-edit-form">
                  <input
                    type="text"
                    value={editedAddresses[index].streetName}
                    onChange={(e) => handleAddressChange(index, "streetName", e.target.value)}
                    placeholder="Street Name"
                    className="edit-input"
                  />
                  <input
                    type="text"
                    value={editedAddresses[index].postalCode}
                    onChange={(e) => handleAddressChange(index, "postalCode", e.target.value)}
                    placeholder="Postal Code"
                    className="edit-input"
                  />
                  {addressErrors[index] && (
                      <p className="error-message">{addressErrors[index]}</p>
                    )}
                  <input
                    type="text"
                    value={editedAddresses[index].city}
                    onChange={(e) => handleAddressChange(index, "city", e.target.value)}
                    placeholder="City"
                    className="edit-input"
                  />
                  <select
                    value={editedAddresses[index].country}
                    onChange={(e) => handleAddressChange(index, "country", e.target.value)}
                    className="edit-input"
                  >
                    <option value="">Select a country</option>
                    {europeanCountries.map(({ code, name }) => (
                      <option key={code} value={code}>{name}</option>
                    ))}
                  </select>
                  <div className="edit-button-row">
                    <button onClick={() => saveAddressChanges(index)} className="save-button">Save</button>
                    <button onClick={cancelAddressEdit} className="close-button">Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h4 className="address-title">Address {index + 1}</h4>
                  <p className="p-text">
                    {addr.streetName}, {addr.postalCode}, {addr.city}, {addr.state || ""}, {addr.country}
                  </p>
                  <div className="label-container">
                    <label
                      className={`checkbox-toggle ${addr.id === defaultShippingAddressId ? "active" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={addr.id === defaultShippingAddressId}
                        onChange={() => setDefaultAddress(addr.id!, "shipping")}
                      />
                      Default Shipping address
                    </label>

                    <label
                      className={`checkbox-toggle ${addr.id === defaultBillingAddressId ? "active" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={addr.id === defaultBillingAddressId}
                        onChange={() => setDefaultAddress(addr.id!, "billing")}
                      />
                      Default Billing address
                    </label>
                  </div>
                  <p
                    className={`address-label ${
                      addr.id !== defaultBillingAddressId ? "not-default" : "default"
                    }`}
                  >
                    {addr.id === defaultBillingAddressId
                      ? "🏷️ Default Billing Address"
                      : "❗ This address is not Default Billing Address"}
                  </p>
                  <p
                    className={`address-label ${
                      addr.id !== defaultShippingAddressId ? "not-default" : "default"
                    }`}
                  >
                    {addr.id === defaultShippingAddressId
                      ? "📦 Default Shipping Address"
                      : "❗ This address is not Default Shipping Address"}
                  </p>
                  <div className="button-container">
                    <button onClick={() => startAddressEdit(index)} className="edit-button-address">
                      Edit Address
                    </button>
                  </div>
                </>
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
