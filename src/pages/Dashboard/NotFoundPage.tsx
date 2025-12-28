import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Page not found</h2>
        <p className="mt-2 text-sm text-slate-600">
          The page you’re looking for doesn’t exist.
        </p>
        <Link
          to="/admin"
          className="mt-5 inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white"
        >
          Go to Admin
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
