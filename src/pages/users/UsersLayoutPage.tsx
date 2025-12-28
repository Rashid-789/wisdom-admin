import React from "react";
import { Outlet } from "react-router-dom";

const UsersLayoutPage: React.FC = () => {
  return (
    <div className="px-4 py-6 sm:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-end gap-3"></div>
      <Outlet />
    </div>
  );
};

export default UsersLayoutPage;
