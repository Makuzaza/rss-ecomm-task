import React, { Link, Outlet } from "react-router-dom";

export const App = () => {
  // console.log(process.env.VITE_CT_PROJECT_KEY); //  example of usage of env variable
  return (
    <div>
      <Link to={"/about"}>About</Link>
      <br />
      <Link to={"/shop"}>Shop</Link>
      <Outlet />
    </div>
  );
};
