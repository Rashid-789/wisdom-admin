import React from "react";
import AppRoutes from "./app/routes/AppRoutes";
import ErrorBoundary from "./app/ui/ErrorBoundary";
import { AdminAuthProvider } from "./auth/AdminAuthProvider";

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AdminAuthProvider>
        <AppRoutes />
      </AdminAuthProvider>
    </ErrorBoundary>
  );
};

export default App;
