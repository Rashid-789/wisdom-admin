import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../auth/useAdminAuth";

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { loading, session } = useAdminAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-slate-300 border-t-slate-900 animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  // extra safety (already enforced via buildAdminSession)
  const allowed = session.user.role === "admin" || session.user.role === "super_admin";
  if (!allowed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Access denied</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your account is signed in but does not have admin permissions.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default RequireAdmin;