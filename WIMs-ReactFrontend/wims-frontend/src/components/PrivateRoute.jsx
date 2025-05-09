import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAuth = localStorage.getItem("auth") === "true";
  return isAuth ? children : <Navigate to="/" />;
};

export default PrivateRoute;
