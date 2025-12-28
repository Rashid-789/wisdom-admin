import React from "react";
import type { UserDetails, UserRole } from "../Types/users.types";
import { Button, Card, CardContent, Select } from "../../../app/shared";
import { updateUserApi } from "../Api/users.api";

// NOTE: For now we assume super admin is true.
// Later: read from Firebase custom claims.
const IS_SUPER_ADMIN = true;

const RoleEditor: React.FC<{ user: UserDetails }> = ({ user }) => {
  const [role, setRole] = React.useState<UserRole>(user.role);
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
          onChange={(e) => setRole(e.target.value as UserRole)}
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
