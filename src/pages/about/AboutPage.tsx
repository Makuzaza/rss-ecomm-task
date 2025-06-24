import React from "react";
import "./AboutPage.css";
import mariaPhoto from "@/assets/team/maria.jpg";
import ramanPhoto from "@/assets/team/raman.jpg";
import denisPhoto from "@/assets/team/denis.jpg";
import rsschoolLogo from "@/assets/logo/rsschoolLogo.webp";
import teamLeadLogo from "@/assets/logo/teamleadLogo.png";
import apiLogo from "@/assets/logo/apiLogo.png";
import refactorLogo from "@/assets/logo/refactorLogo.png";

const teamMembers = [
  {
    name: "Maria",
    role: "UI/UX Guru",
    bio: "Frontend Developer with expertise in React and TypeScript. Focused on delivering intuitive and responsive user interfaces.",
    contributions:
      "Worked on responsive navigation system (desktop/mobile) with dynamic headers, hamburger menus, and mobile-friendly dropdowns. Implemented Login and Registration form validation, interactive product filters, Product page pagination. Refactored components using custom hooks for reusability. Enhanced focus states, button feedback, and screen reader compatibility.",
    github: "https://github.com/makuzaza",
    photo: mariaPhoto,
    badge: { src: teamLeadLogo, alt: "Team Lead" },
  },
  {
    name: "Raman",
    role: "API Guru",
    bio: "Junior Frontend Developer with initial experience in JavaScript (RS School) and a growing understanding of Angular/React and TypeScript. Eager to improve and contribute to real-world web applications.",
    contributions:
      "Worked on form validation, API integration, User Profile and eCommerce features like shopping cart and authentication using CommerceTools.",
    github: "https://github.com/ramanmilashevich",
    photo: ramanPhoto,
    badge: { src: apiLogo, alt: "API Guru" },
  },
  {
    name: "Denis",
    role: "Refactoring Guru",
    bio: "Junior Full Stack Developer with initial experience in JavaScript, PHP and SQL. ",
    contributions:
      "Worked on project set up, form validation, Product Catalog Page, Product Details Page, Search, and Category implementation. Also, a fan of refactoring and improving code readability.",
    github: "https://github.com/deepcd87",
    photo: denisPhoto,
    badge: { src: refactorLogo, alt: "Refactor Guru" },
  },
];

const AboutPage = () => {
  return (
    <div className="team-container">
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
        <h2>Meet out team</h2>
        <div className="cards-wrapper">
          {teamMembers.map((member) => (
            <div className="team-card" key={member.name}>
              <div className="photo-wrapper">
                <img
                  src={member.photo}
                  alt={member.name}
                  title={member.name}
                  className="team-photo"
                />
                {member.badge && (
                  <img
                    src={member.badge.src}
                    alt={member.badge.alt}
                    title={member.badge.alt}
                    className="member-badge"
                  />
                )}
              </div>

              <div className="team-info">
                <h3>
                  {member.name} <span className="role">({member.role})</span>
                </h3>
                <p className="bio">{member.bio}</p>
                <p className="contributions">
                  <strong>Contributions:</strong> {member.contributions}
                </p>
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="github-link"
                >
                  GitHub Profile
                </a>
              </div>
            </div>
          ))}
        </div>
        <div className="logo-wrapper">
          <a
            href="https://rs.school/courses/javascript"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={rsschoolLogo} alt="RS School Logo" className="rss-logo" />
          </a>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
