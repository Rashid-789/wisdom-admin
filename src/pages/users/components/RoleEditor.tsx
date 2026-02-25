import React from "react";
import type { UserDetails, UserRole } from "../Types/users.types";
import { Button, Card, CardContent, Select } from "../../../app/shared";
import { updateUserApi } from "../Api/users.api";

const IS_SUPER_ADMIN = true;
type EditableRole = Exclude<UserRole, "super_admin">;

const RoleEditor: React.FC<{ user: UserDetails }> = ({ user }) => {
  const [role, setRole] = React.useState<EditableRole>(
    user.role === "super_admin" ? "admin" : user.role
  );
  const [saving, setSaving] = React.useState(false);

  if (!IS_SUPER_ADMIN) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
        Only Super Admin can change roles.
      </div>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <Select
          label="Role"
          value={role}
          onChange={(event) => setRole(event.target.value as EditableRole)}
          options={[
            { label: "Student", value: "student" },
            { label: "Teacher", value: "teacher" },
            { label: "Admin", value: "admin" },
          ]}
        />

        <Button
          isLoading={saving}
          onClick={async () => {
            setSaving(true);
            try {
              await updateUserApi(user.id, { role });
            } finally {
              setSaving(false);
            }
          }}
        >
          Save Role
        </Button>
      </CardContent>
    </Card>
  );
};

export default RoleEditor;
