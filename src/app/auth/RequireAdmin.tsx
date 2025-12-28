import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * Placeholder guard for future Firebase auth.
 * Later you’ll replace `isAllowed` using Firebase auth + role claims.
 */
const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  // TODO: integrate Firebase auth and role checks here
  const isAllowed = true;

  if (!isAllowed) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

export default RequireAdmin;
