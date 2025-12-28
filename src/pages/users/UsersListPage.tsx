
import React from "react";
import type { UserRole } from "./Types/users.types";
import UsersTable from "./components/UsersTable";

type Props = { role: UserRole };

const UsersListPage: React.FC<Props> = ({ role }) => {
  return <UsersTable role={role} />;
};

export default UsersListPage;
