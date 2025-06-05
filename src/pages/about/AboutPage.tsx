import React from "react";
import "./AboutPage.css";

const AboutPage = () => {
  return (
    <div>
      <section id="about">
        <h2>About the eCommerce Application</h2>
        <p>
          This eCommerce SPA replicates a real-world shopping experience,
          enabling users to browse products, view details, manage a shopping
          basket, and complete purchases. Features include registration, login,
          product search, categorization, and a responsive design for devices
          down to 390px width.
        </p>
        <p>
          Key pages include Login, Registration, Main, Product Catalog, Product
          Details, User Profile, Basket, and About Us. The application is
          powered by CommerceTools and built with React, TypeScript, following
          modern development practices.
        </p>
        <p>
          Developed by teams of three, this project emphasizes custom UI,
          responsive design, and unique data. The goal is to create a
          user-friendly, visually appealing eCommerce platform that showcases
          the capabilities of React and CommerceTools.
        </p>
      </section>
    </div>
  );
};

export default AboutPage;
