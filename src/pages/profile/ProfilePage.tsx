import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useApiClient } from "@/context/ApiClientContext";
import { CustomerAddress, RegisterFormFields } from "@/@types/interfaces";
import { Address, MyCustomerUpdateAction } from "@commercetools/platform-sdk";
import europeanCountries from "@/data/europeanCountries.json";
import "./ProfilePage.css";
import {
  validateEmailFormat,
  validatePassword,
} from "../../utils/loginValidation";
import ValidatedInput from "../../components/profile/ValidatedInput";
import { validateField } from "../../utils/registerValitation";
import { validateAddress } from "../../utils/editValidation";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const fieldNameMap: Record<
      keyof CustomerAddress,
      keyof RegisterFormFields
    > = {
      streetName: "shippingStreet",
      city: "shippingCity",
      postalCode: "shippingPostalCode",
      country: "shippingCountry",
      state: "shippingCity",
      id: "email",
    };

const ProfilePage = () => {
  const { customer, setCustomer, relogin } = useAuth();
  const apiClient = useApiClient();
  const [isEditing, setIsEditing] = useState(false);

  // Personal information state
  const [editedFirstName, setEditedFirstName] = useState("");
  const [editedLastName, setEditedLastName] = useState("");
  const [editedDOB, setEditedDOB] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [missingAddressType, setMissingAddressType] = useState<
    null | "billing" | "shipping"
  >(null);
  const [canAddNewAddress, setCanAddNewAddress] = useState(true);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [touchedAddressFields, setTouchedAddressFields] = useState<
    Record<number, Set<keyof CustomerAddress>>
  >({});
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Success message state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  // Field errors state
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
  });

  useEffect(() => {
    setPasswordError(validatePassword(newPassword));
  }, [newPassword]);

  useEffect(() => {
    setFieldErrors({
      firstName: validateField(
        "firstName",
        editedFirstName,
        formData,
        europeanCountries,
        false,
      ),
      lastName: validateField(
        "lastName",
        editedLastName,
        formData,
        europeanCountries,
        false,
      ),
      dateOfBirth: validateField(
        "dateOfBirth",
        editedDOB,
        formData,
        europeanCountries,
        false,
      ),
      email: validateField(
        "email",
        editedEmail,
        formData,
        europeanCountries,
        false,
      ),
    });
  }, [editedFirstName, editedLastName, editedDOB, editedEmail]);

  const resetPasswordState = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setPasswordError("");
    setErrorMessage("");
    setCurrentPasswordError("");
  };

  const [newAddress, setNewAddress] = useState<CustomerAddress>({
    id: "",
    streetName: "",
    postalCode: "",
    city: "",
    state: "",
    country: "",
  });

  const formData = {
    email: editedEmail,
    password: "",
    confirmPassword: "",
    firstName: editedFirstName,
    lastName: editedLastName,
    dateOfBirth: editedDOB,
    shippingCountry: newAddress.country,
    shippingCity: newAddress.city,
    shippingStreet: newAddress.streetName,
    shippingPostalCode: newAddress.postalCode,
    billingCountry: "",
    billingCity: "",
    billingStreet: "",
    billingPostalCode: "",
  };

  const newAddressFormData = {
    email: editedEmail,
    password: "",
    confirmPassword: "",
    firstName: editedFirstName,
    lastName: editedLastName,
    dateOfBirth: editedDOB,
    shippingCountry: newAddress.country,
    shippingCity: newAddress.city,
    shippingStreet: newAddress.streetName,
    shippingPostalCode: newAddress.postalCode,
    billingCountry: "",
    billingCity: "",
    billingStreet: "",
    billingPostalCode: "",
  };

  const newAddressErrors = {
    streetName: !newAddress.streetName.trim()
      ? "Street address is required"
      : "",
    city: !newAddress.city.trim() ? "City is required" : "",
    country: !newAddress.country.trim() ? "Country is required" : "",
    postalCode: validateField(
      "shippingPostalCode",
      newAddress.postalCode,
      newAddressFormData,
      europeanCountries,
      false,
    ),
  };

  const isNewAddressSaveDisabled =
    Object.values(newAddressErrors).some(Boolean);

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

  useEffect(() => {
    const shippingSet = !!defaultShippingAddressId;
    const billingSet  = !!defaultBillingAddressId;
    const isSame      = defaultShippingAddressId === defaultBillingAddressId;

    setCanAddNewAddress(!isSame && shippingSet !== billingSet);

    if (!shippingSet) setMissingAddressType("shipping");
    else if (!billingSet) setMissingAddressType("billing");
    else setMissingAddressType(null);
  }, [defaultShippingAddressId, defaultBillingAddressId]);

  const isChanged =
    editedFirstName !== firstName ||
    editedLastName !== lastName ||
    editedDOB !== dateOfBirth ||
    editedEmail !== email;

  

  const passwordMismatch =
    (newPassword || confirmNewPassword || currentPassword) &&
    newPassword !== confirmNewPassword;

  const isPersonalSaveDisabled =
    Object.values(fieldErrors).some(Boolean) || !isChanged || passwordMismatch;

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
    false,
  );

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
    normalizeAddresses(customer.addresses),
  );
  const [editingAddressIndex, setEditingAddressIndex] = useState<number | null>(
    null,
  );

  const [addressErrors, setAddressErrors] = useState<
    Record<number, Partial<Record<keyof CustomerAddress, string>>>
  >({});

  const handleAddressChange = (
    index: number,
    field: keyof CustomerAddress,
    value: string,
  ) => {
    const updatedAddresses = [...editedAddresses];
    const updatedAddress = { ...updatedAddresses[index], [field]: value };

    if (field === "country") {
      updatedAddress.postalCode = "";
    }

    updatedAddresses[index] = updatedAddress;
    setEditedAddresses(updatedAddresses);

    setTouchedAddressFields((prev) => {
      const current = new Set(prev[index] || []);
      current.add(field);
      return { ...prev, [index]: current };
    });

    const formData: RegisterFormFields = {
      email: editedEmail,
      password: "",
      confirmPassword: "",
      firstName: editedFirstName,
      lastName: editedLastName,
      dateOfBirth: editedDOB,
      shippingCountry: updatedAddress.country,
      shippingCity: updatedAddress.city,
      shippingStreet: updatedAddress.streetName,
      shippingPostalCode: updatedAddress.postalCode,
      billingCountry: "",
      billingCity: "",
      billingStreet: "",
      billingPostalCode: "",
    };

    const fieldKey = fieldNameMap[field];

    if (!fieldKey) return;

    const error = validateField(
      fieldKey,
      value,
      formData,
      europeanCountries,
      false,
    );

    setAddressErrors((prev) => ({
      ...prev,
      [index]: {
        ...(prev[index] || {}),
        [field]: error || "",
      },
    }));
  };

  const isAddressSaveDisabled = (index: number) => {
    const errors = addressErrors[index];
    const address = editedAddresses[index];
    return (
      !address.streetName ||
      !address.city ||
      !address.country ||
      !address.postalCode ||
      Object.values(errors || {}).some(Boolean)
    );
  };

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

  const startAddressEdit = (index: number) => {
    setEditingAddressIndex(index);
    setAddressErrors((prev) => ({
      ...prev,
      [index]: {},
    }));

    setTouchedAddressFields((prev) => ({
      ...prev,
      [index]: new Set<keyof CustomerAddress>(),
    }));
  };

  const cancelAddressEdit = () => {
    setEditingAddressIndex(null);
    setEditedAddresses(normalizeAddresses(customer.addresses));
    setAddressErrors((prev) => ({
      ...prev,
      [editingAddressIndex!]: {},
    }));

    setTouchedAddressFields((prev) => ({
      ...prev,
      [editingAddressIndex!]: new Set(),
    }));
  };

  const saveAddressChanges = async (index: number) => {
    const address = editedAddresses[index];
    if (!address.id) return;

    const errors = validateAddress(address);

    if (Object.keys(errors).length > 0) {
      setAddressErrors((prev) => ({
        ...prev,
        [index]: {
          ...(prev[index] || {}),
          ...errors,
        },
      }));
      return;
    }

    setAddressErrors((prev) => ({
      ...prev,
      [index]: {},
    }));

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

    const actions: MyCustomerUpdateAction[] = [
      { action: "setFirstName", firstName: editedFirstName },
      { action: "setLastName", lastName: editedLastName },
      { action: "setDateOfBirth", dateOfBirth: editedDOB },
    ];

    const wantsToChangePassword =
      currentPassword || newPassword || confirmNewPassword;

    if (editedEmail !== email) {
      actions.push({ action: "changeEmail", email: editedEmail });
    }

    if (wantsToChangePassword) {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        setErrorMessage("Please fill in all password fields.");
        return;
      }

      if (newPassword !== confirmNewPassword) {
        setErrorMessage("New passwords do not match.");
        return;
      }
    }

    try {
      await apiClient.updateCustomer({
        version,
        actions,
      });

      const updatedCustomer = await apiClient.getCustomerProfile();
      setCustomer(updatedCustomer);

      if (wantsToChangePassword) {
        await apiClient.changePassword(
          currentPassword,
          newPassword,
          updatedCustomer.version,
        );
        const refreshedCustomer = await apiClient.getCustomerProfile();
        setCustomer(refreshedCustomer);
      }

      setIsEditing(false);
      resetPasswordState();
    } catch (error: unknown) {
      console.error("Failed to update customer", error);

      let msg = "Failed to update profile. Please try again.";
      if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message: string }).message === "string"
      ) {
        const errorMessage = (error as { message: string }).message;
        if (
          errorMessage.includes("current password") ||
          errorMessage.includes("InvalidCurrentPassword")
        ) {
          msg = "Incorrect current password.";
        } else {
          msg = errorMessage;
        }
      }

      setErrorMessage(msg);
    }
  };

  const setDefaultAddress = async (
    addressId: string,
    type: "shipping" | "billing",
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

  const handleAddNewAddress = async () => {
    if (isNewAddressSaveDisabled) return;

    try {
      const updated = await apiClient.updateCustomer({
        version: customer.version,
        actions: [
          {
            action: "addAddress",
            address: {
              streetName: newAddress.streetName,
              city: newAddress.city,
              country: newAddress.country,
              postalCode: newAddress.postalCode,
            },
          },
        ],
      });

      setCustomer(updated);
      setNewAddress({
        id: "",
        streetName: "",
        postalCode: "",
        city: "",
        state: "",
        country: "",
      });
      setShowNewAddressForm(false);
    } catch (error) {
      console.error("Failed to add new address", error);
    }
  };

  const handlePasswordChange = async () => {
    try {
      await apiClient.changePassword(currentPassword, newPassword, customer.version);

      localStorage.removeItem("accessToken");
      await relogin({ email, password: newPassword });

      const updatedCustomer = await apiClient.getCustomerProfile();
      setCustomer(updatedCustomer);

      setShowPasswordForm(false);
      resetPasswordState();
      setSuccessMessage("Password was successfully changed!");
      setShowSuccessModal(true);
      setTimeout(() => setShowSuccessModal(false), 3000); // Clear message after 3 seconds
    } catch (err: unknown) {
      if (
        typeof err === "object" &&
        err !== null &&
        "body" in err &&
        typeof (err as { body?: unknown }).body === "object" &&
        (err as { body: { errors?: unknown } }).body?.errors &&
        Array.isArray((err as { body: { errors: unknown } }).body.errors)
      ) {
        const errorList = (err as { body: { errors: { code: string }[] } }).body.errors;

        const isInvalidPassword = errorList.some(
          (e) => e.code === "InvalidCurrentPassword"
        );

        if (isInvalidPassword) {
          setCurrentPasswordError("Current password is incorrect");
          return;
        }
      }
      setErrorMessage("Password change failed. Please try again later.");
    }
  };

  useEffect(() => {
  if (!successMessage) return;

  setShowSuccessModal(true);
  const timer = setTimeout(() => {
    setShowSuccessModal(false);
    setSuccessMessage("");
  }, 3000);

  return () => clearTimeout(timer);
}, [successMessage]);

  return (
  <>
    {showSuccessModal && (
      <div className="success-modal">
        <p className="success-message">{successMessage}</p>
      </div>
    )}
    <div className="profile-page">
      <h2>User Profile</h2>
      
      <section className="personal-info">
        <h3>Personal Information</h3>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {/* 👉 Edit personal info */}
        {isEditing ? (
          <div className="edit-form-container">
            <ValidatedInput
              label="First Name"
              type="text"
              value={editedFirstName}
              placeholder="First Name"
              error={fieldErrors.firstName || (!editedFirstName.trim() ? "First name is required" : undefined)}
              onChange={setEditedFirstName}
            />

            <ValidatedInput
              label="Last Name"
              type="text"
              value={editedLastName}
              placeholder="Last Name"
              error={fieldErrors.lastName || (!editedLastName.trim() ? "Last name is required" : undefined)}
              onChange={setEditedLastName}
            />

            <ValidatedInput
              label="Date of Birth"
              type="date"
              value={editedDOB}
              placeholder="Date of Birth"
              error={fieldErrors.dateOfBirth || (!editedDOB ? "Date of birth is required" : undefined)}
              onChange={setEditedDOB}
            />

            <ValidatedInput
              label="Email Address"
              type="text"
              value={editedEmail}
              placeholder="Email Address"
              error={emailError || (!editedEmail.trim() ? "Email is required" : undefined)}
              onChange={setEditedEmail}
            />

            <div className="edit-buttons-container">
              <button
                onClick={saveChanges}
                className={`save-button ${isPersonalSaveDisabled ? "disabled" : ""}`}
                disabled={isPersonalSaveDisabled}
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

            <div className="edit-buttons-row">
              <button onClick={startEdit} className="edit-button">
                Edit
              </button>
              <button
                onClick={() => setShowPasswordForm((prev) => !prev)}
                className="edit-button"
              >
                {showPasswordForm
                  ? "Cancel Password Change"
                  : "Change Password"}
              </button>
            </div>
          </>
        )}

        {/* ✅ form to change password */}
        {showPasswordForm && (
          <>
            <h4 className="password-change-title">Change Password</h4>
            <div className="edit-form-container">
              {/* Current Password */}
              <div className="password-input-wrapper">
                <p className="p-text-password">Your current password:</p>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    setCurrentPasswordError("");
                  }}
                  placeholder="Current Password"
                  className="edit-input"
                />
                <span
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="eye-icon"
                >
                  {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {!currentPassword && (
                <p className="error-message">Current password is required</p>
              )}
              {currentPasswordError && (
                <p className="error-message">{currentPasswordError}</p>
              )}

              {/* New Password */}
              <div className="password-input-wrapper">
                <p className="p-text-password">Your new password:</p>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New Password"
                  className="edit-input"
                />
                <span
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="eye-icon"
                >
                  {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {passwordError && (
                <p className="error-message">{passwordError}</p>
              )}

              {/* Confirm New Password */}
              <div className="password-input-wrapper">
                <p className="p-text-password">Confirm your new password:</p>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Confirm New Password"
                  className="edit-input"
                />
                <span
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="eye-icon"
                >
                  {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
              {!confirmNewPassword && (
                <p className="error-message">
                  Confirm new password is required
                </p>
              )}
              {newPassword &&
                confirmNewPassword &&
                newPassword !== confirmNewPassword && (
                  <p className="error-message">New passwords do not match</p>
                )}
              {successMessage && <p className="success-message">{successMessage}</p>}

              <div className="edit-buttons-container">
                <button
                  type="button"    
                  className="save-button"
                  disabled={
                    !currentPassword ||
                    !newPassword ||
                    !confirmNewPassword ||
                    newPassword !== confirmNewPassword ||
                    !!passwordError
                  }
                  onClick={handlePasswordChange}
                >
                  Save Password
                </button>
                <button
                  className="close-button"
                  onClick={() => {
                    setShowPasswordForm(false);
                    resetPasswordState();
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
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
                  {touchedAddressFields[index]?.has("streetName") &&
                    addressErrors[index]?.streetName && (
                      <p className="error-message">
                        {addressErrors[index]!.streetName}
                      </p>
                    )}
                  <input
                    type="text"
                    value={editedAddresses[index].postalCode}
                    onChange={(e) =>
                      handleAddressChange(index, "postalCode", e.target.value)
                    }
                    placeholder="Postal Code"
                    className="edit-input"
                  />
                  {touchedAddressFields[index]?.has("postalCode") &&
                    addressErrors[index]?.postalCode && (
                      <p className="error-message">
                        {addressErrors[index]!.postalCode}
                      </p>
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
                  {touchedAddressFields[index]?.has("city") &&
                    addressErrors[index]?.city && (
                      <p className="error-message">
                        {addressErrors[index]!.city}
                      </p>
                    )}
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
                  {touchedAddressFields[index]?.has("country") &&
                    addressErrors[index]?.country && (
                      <p className="error-message">
                        {addressErrors[index]!.country}
                      </p>
                    )}
                  <div className="edit-button-row">
                    <button
                      onClick={() => saveAddressChanges(index)}
                      className="save-button"
                      disabled={isAddressSaveDisabled(index)}
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
                    {addr.streetName}, {addr.postalCode}, {addr.city},{" "}
                    {addr.country}
                  </p>
                  <div className="label-container">
                    <label
                      className={`checkbox-toggle ${
                        addr.id === defaultShippingAddressId ? "active" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={addr.id === defaultShippingAddressId}
                        onChange={() => setDefaultAddress(addr.id!, "shipping")}
                      />
                      Default Shipping address
                    </label>

                    <label
                      className={`checkbox-toggle ${
                        addr.id === defaultBillingAddressId ? "active" : ""
                      }`}
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
                      addr.id !== defaultBillingAddressId
                        ? "not-default"
                        : "default"
                    }`}
                  >
                    {addr.id === defaultBillingAddressId
                      ? "🏷️ Default Billing Address"
                      : "❗ This address is not Default Billing Address"}
                  </p>
                  <p
                    className={`address-label ${
                      addr.id !== defaultShippingAddressId
                        ? "not-default"
                        : "default"
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
          <>
            <h4 className="address-subtitle">
              {missingAddressType === "billing"
                ? "Adding Billing Address"
                : "Adding Shipping Address"}
            </h4>
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
              {newAddressErrors.streetName && (
                <p className="error-message">{newAddressErrors.streetName}</p>
              )}

              <input
                type="text"
                value={newAddress.postalCode}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, postalCode: e.target.value })
                }
                placeholder="Postal Code"
                className="edit-input"
              />
              {newAddressErrors.postalCode && (
                <p className="error-message">{newAddressErrors.postalCode}</p>
              )}

              <input
                type="text"
                value={newAddress.city}
                onChange={(e) =>
                  setNewAddress({ ...newAddress, city: e.target.value })
                }
                placeholder="City"
                className="edit-input"
              />
              {newAddressErrors.city && (
                <p className="error-message">{newAddressErrors.city}</p>
              )}

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
              {newAddressErrors.country && (
                <p className="error-message">{newAddressErrors.country}</p>
              )}

              <div className="edit-button-row">
                <button
                  onClick={handleAddNewAddress}
                  className={`save-button ${isNewAddressSaveDisabled ? "disabled" : ""}`}
                  disabled={isNewAddressSaveDisabled}
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
          </>
        )}
      </section>
    </div>
     </>
  );
};

export default ProfilePage;
