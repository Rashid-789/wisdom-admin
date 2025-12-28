import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "./useAdminAuth";

export default function RequireAdmin({ children }: { children: React.ReactNode }) {
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

  return <>{children}</>;
}

