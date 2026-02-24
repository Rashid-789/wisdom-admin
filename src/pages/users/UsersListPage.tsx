
import React from "react";
import type { UserRole } from "./Types/users.types";
import UsersTable from "./components/UsersTable";

const UsersListPage: React.FC<{ fixedRole?: UserRole }> = ({ fixedRole }) => {
  return <UsersTable fixedRole={fixedRole} />;
};

export default UsersListPage;
