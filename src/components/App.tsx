import React, { Link, Outlet } from "react-router-dom";

export const App = () => {
  return (
    <div>
      <Link to={"/about"}>About</Link>
      <br />
      <Link to={"/shop"}>Shop</Link>
      <Outlet />
    </div>
  );
};
