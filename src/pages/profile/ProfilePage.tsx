import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApiClient } from "@/context/ApiClientContext";
import { CustomerAddress } from "@/@types/interfaces";
import { Address, MyCustomerUpdateAction } from "@commercetools/platform-sdk";
import europeanCountries from "@/data/europeanCountries.json";
import "./ProfilePage.css";
import { validateEmailFormat } from "../../utils/loginValidation";
import { validateField } from "../../utils/registerValitation";
import { validatePostalCode } from "../../utils/editValidation";

const ProfilePage = () => {
  const { customer, setCustomer } = useAuth();
  const apiClient = useApiClient();
  const [isEditing, setIsEditing] = useState(false);

  // Personal information state
  const [editedFirstName, setEditedFirstName] = useState("");
  const [editedLastName, setEditedLastName] = useState("");
  const [editedDOB, setEditedDOB] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [missingAddressType, setMissingAddressType] = useState<null | "billing" | "shipping">(null);
  const [canAddNewAddress, setCanAddNewAddress] = useState(true);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);

  // console.log("apiClient.customerApiRoot", apiClient["customerApiRoot"]);
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
    email,
  } = customer;

  const isChanged =
    editedFirstName !== firstName ||
    editedLastName !== lastName ||
    editedDOB !== dateOfBirth ||
    editedEmail !== email;  

  const emailError = validateField(
    "email",
    editedEmail,
    {
      email: editedEmail,
      password: "",
      confirmPassword: "",
      firstName: editedFirstName,
      lastName: editedLastName,
      dateOfBirth: editedDOB,
      shippingCountry: "",
      shippingCity: "",
      shippingStreet: "",
      shippingPostalCode: "",
      billingCountry: "",
      billingCity: "",
      billingStreet: "",
      billingPostalCode: "",
    },
    europeanCountries,
    false
  );  

  const isSaveDisabled =
    !editedFirstName.trim() ||
    !editedLastName.trim() ||
    !editedDOB.trim() ||
    !editedEmail.trim() ||
    !!emailError ||
    !isChanged;
  

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
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(
    null
  );

  const [addressErrors, setAddressErrors] = useState<string[]>([]);

  const startEdit = () => {
    setEditedFirstName(firstName);
    setEditedLastName(lastName);
    setEditedDOB(dateOfBirth);
    setEditedEmail(email);
    setErrorMessage("");
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleAddressChange = (
    index: number,
    field: keyof CustomerAddress,
    value: string
  ) => {
    const updatedAddresses = [...editedAddresses];
    const updatedAddress = { ...updatedAddresses[index], [field]: value };

    // Если изменяется страна — сбрасываем почтовый индекс
    if (field === "country") {
      updatedAddress.postalCode = "";
    }

    updatedAddresses[index] = updatedAddress;
    setEditedAddresses(updatedAddresses);

    const newErrors = [...addressErrors];

    // Валидация почтового индекса при изменении индекса или страны
    if (field === "postalCode" || field === "country") {
      const error = validatePostalCode(updatedAddress.country, updatedAddress.postalCode);
      newErrors[index] = error || "";
      setAddressErrors(newErrors);
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

    if (
      !address.streetName ||
      !address.city ||
      !address.country ||
      !address.postalCode
    ) {
      errors[index] = "All fields are required.";
      setAddressErrors((prev) => ({ ...prev, ...errors }));
      return;
    }

    const isValidPostal = validatePostalCode(
      address.postalCode,
      address.country
    );
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
      setCustomer(updated);
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

    if (editedEmail && !validateEmailFormat(editedEmail)) {
      setErrorMessage("Invalid email address format.");
      return;
    }

    try {
      const updated = await apiClient.updateCustomer({
        version,
        actions: [
          { action: "setFirstName", firstName: editedFirstName },
          { action: "setLastName", lastName: editedLastName },
          { action: "setDateOfBirth", dateOfBirth: editedDOB },
          { action: "changeEmail", email: editedEmail || email },
        ],
      });
      setCustomer(updated);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update customer", error);
    }
  };


  const setDefaultAddress = async (
    addressId: string,
    type: "shipping" | "billing"
  ) => {
    const isCurrentlySet =
      type === "shipping"
        ? defaultShippingAddressId === addressId
        : defaultBillingAddressId === addressId;

    const action =
      type === "shipping"
        ? "setDefaultShippingAddress"
        : "setDefaultBillingAddress";

    const payload = {
      action,
      addressId: isCurrentlySet ? null : addressId,
    };

    try {
      const updated = await apiClient.updateCustomer({
        version: customer.version,
        actions: [payload as MyCustomerUpdateAction],
      });

      setCustomer(updated);

      const shippingSet = !!updated.defaultShippingAddressId;
      const billingSet = !!updated.defaultBillingAddressId;
      const isSame =
        updated.defaultShippingAddressId === updated.defaultBillingAddressId;

      setCanAddNewAddress(!isSame && shippingSet !== billingSet);

      if (!shippingSet) setMissingAddressType("shipping");
      else if (!billingSet) setMissingAddressType("billing");
      else setMissingAddressType(null);
    } catch (error) {
      console.error("Failed to update default address", error);
    }
  };


  const [newAddress, setNewAddress] = useState<CustomerAddress>({
    id: "",
    streetName: "",
    postalCode: "",
    city: "",
    state: "",
    country: "",
  });

  const handleAddNewAddress = async () => {
    if (
      !newAddress.streetName ||
      !newAddress.city ||
      !newAddress.country ||
      !newAddress.postalCode
    ) {
      setErrorMessage("Please fill all fields for new address.");
      return;
    }

    const isValidPostal = validatePostalCode(newAddress.postalCode, newAddress.country);
    if (!isValidPostal) {
      setErrorMessage("Invalid postal code for selected country.");
      return;
    }

    try {
      const updated = await apiClient.updateCustomer({
        version: customer.version,
        actions: [
          {
            action: "addAddress",
            address: {
              streetName: newAddress.streetName,
              postalCode: newAddress.postalCode,
              city: newAddress.city,
              state: newAddress.state,
              country: newAddress.country,
            },
          },
        ],
      });

      const newAddrId = updated.addresses[updated.addresses.length - 1].id;

      const setTypeAction: MyCustomerUpdateAction =
        missingAddressType === "billing"
          ? { action: "setDefaultBillingAddress", addressId: newAddrId }
          : { action: "setDefaultShippingAddress", addressId: newAddrId };

      const updatedWithDefault = await apiClient.updateCustomer({
        version: updated.version,
        actions: [setTypeAction],
      });

      setCustomer(updatedWithDefault);
      setShowNewAddressForm(false);
      setNewAddress({ id: "", streetName: "", postalCode: "", city: "", state: "", country: "" });
    } catch (error) {
      console.error("Failed to add new address", error);
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
            {!editedFirstName.trim() && (
              <p className="error-message">First name is required</p>
            )}
            <input
              type="text"
              value={editedLastName}
              onChange={(e) => setEditedLastName(e.target.value)}
              placeholder="Last Name"
              className="edit-input"
            />
            {!editedLastName.trim() && (
              <p className="error-message">Last name is required</p>
            )}
            <input
              type="date"
              value={editedDOB}
              onChange={(e) => setEditedDOB(e.target.value)}
              placeholder="Date of Birth"
              className="edit-input"
            />
            {!editedDOB.trim() && (
              <p className="error-message">Date of birth is required</p>
            )}
            <input
              type="text"
              value={editedEmail}
              onChange={(e) => {
                setEditedEmail(e.target.value);
              }}
              placeholder="Email Address"
              className="edit-input"
            />
            {!editedEmail.trim() && (
              <p className="error-message">Email is required</p>
            )}
            {emailError && <p className="error-message">{emailError}</p>}
            <div className="edit-buttons-container">
              <button
                onClick={saveChanges}
                className={`save-button ${isSaveDisabled ? "disabled" : ""}`}
                disabled={isSaveDisabled}
              >
                Save
              </button>
              <button onClick={cancelEdit} className="close-button">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="p-text">
              <strong>First Name:</strong> {firstName}
            </p>
            <p className="p-text">
              <strong>Last Name:</strong> {lastName}
            </p>
            <p className="p-text">
              <strong>Date of Birth:</strong> {dateOfBirth}
            </p>
            <p className="p-text">
              <strong>Your email address:</strong> {email}
            </p>
            <button onClick={startEdit} className="edit-button">
              Edit
            </button>
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
                    onChange={(e) =>
                      handleAddressChange(index, "streetName", e.target.value)
                    }
                    placeholder="Street Name"
                    className="edit-input"
                  />
                  <input
                    type="text"
                    value={editedAddresses[index].postalCode}
                    onChange={(e) =>
                      handleAddressChange(index, "postalCode", e.target.value)
                    }
                    placeholder="Postal Code"
                    className="edit-input"
                  />
                  {addressErrors[index] && (
                    <p className="error-message">{addressErrors[index]}</p>
                  )}
                  <input
                    type="text"
                    value={editedAddresses[index].city}
                    onChange={(e) =>
                      handleAddressChange(index, "city", e.target.value)
                    }
                    placeholder="City"
                    className="edit-input"
                  />
                  <select
                    value={editedAddresses[index].country}
                    onChange={(e) =>
                      handleAddressChange(index, "country", e.target.value)
                    }
                    className="edit-input"
                  >
                    <option value="">Select a country</option>
                    {europeanCountries.map(({ code, name }) => (
                      <option key={code} value={code}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <div className="edit-button-row">
                    <button
                      onClick={() => saveAddressChanges(index)}
                      className="save-button"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelAddressEdit}
                      className="close-button"
                    >
                      Cancel
                    </button>
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
                    <button
                      onClick={() => startAddressEdit(index)}
                      className="edit-button-address"
                    >
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

        {addresses.length < 2 && canAddNewAddress && !showNewAddressForm && (
          <button
            onClick={() => setShowNewAddressForm(true)}
            className="add-address-button"
          >
            {missingAddressType === "billing"
              ? "Add Billing Address"
              : "Add Shipping Address"}
          </button>
        )}

        {showNewAddressForm && (
          <div className="address-edit-form">
            <input
              type="text"
              value={newAddress.streetName}
              onChange={(e) =>
                setNewAddress({ ...newAddress, streetName: e.target.value })
              }
              placeholder="Street Name"
              className="edit-input"
            />
            <input
              type="text"
              value={newAddress.postalCode}
              onChange={(e) =>
                setNewAddress({ ...newAddress, postalCode: e.target.value })
              }
              placeholder="Postal Code"
              className="edit-input"
            />
            <input
              type="text"
              value={newAddress.city}
              onChange={(e) =>
                setNewAddress({ ...newAddress, city: e.target.value })
              }
              placeholder="City"
              className="edit-input"
            />
            <select
              value={newAddress.country}
              onChange={(e) =>
                setNewAddress({ ...newAddress, country: e.target.value })
              }
              className="edit-input"
            >
              <option value="">Select a country</option>
              {europeanCountries.map(({ code, name }) => (
                <option key={code} value={code}>
                  {name}
                </option>
              ))}
            </select>
            <div className="edit-button-row">
              <button
                onClick={handleAddNewAddress}
                className="save-button"
              >
                Save New Address
              </button>
              <button
                onClick={() => setShowNewAddressForm(false)}
                className="close-button"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );



};

export default ProfilePage;
