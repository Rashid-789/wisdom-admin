import React from "react";
import AppRoutes from "./app/routes/AppRoutes";
import ErrorBoundary from "./app/ui/ErrorBoundary";
import { AdminAuthProvider } from "./auth/AdminAuthProvider";
import { Toaster } from "react-hot-toast";

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AdminAuthProvider>
        <AppRoutes />
      </AdminAuthProvider>
      <Toaster position="top-right" />
    </ErrorBoundary>
  );
};

export default App;
