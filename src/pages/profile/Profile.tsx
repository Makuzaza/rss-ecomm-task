import React from "react";
import { useAuth } from "@/context/AuthContext";

const Profile = () => {
  const { customer } = useAuth();

  if (!customer) return <p>Loading...</p>;

  const {
    firstName,
    lastName,
    dateOfBirth,
  } = customer;

  return (
    <div className="profile-page">
      <h2>User Profile</h2>

      <section className="personal-info">
        <h3>Personal Information</h3>
        <p><strong>First Name:</strong> {firstName}</p>
        <p><strong>Last Name:</strong> {lastName}</p>
        <p><strong>Date of Birth:</strong> {dateOfBirth}</p>
      </section>
    </div>
  );
};

export default Profile;
