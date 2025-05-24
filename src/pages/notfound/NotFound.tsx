import React from "react";
import { Link } from 'react-router-dom';
import './NotFound.css'; // Optional styling

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
      <Link to="/" className="home-link">
        ← Return to Home
      </Link>
    </div>
  );
};

export default NotFound;