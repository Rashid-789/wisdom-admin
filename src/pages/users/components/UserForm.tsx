import React from "react";
import type { UpsertUserInput, UserDetails, UserRole, UserStatus } from "../Types/users.types";
import { Button, Input, Select } from "../../../app/shared";

type Props =
  | {
      mode: "create"; // future
      defaultRole: UserRole;
      isSubmitting?: boolean;
      onCancel: () => void;
      onSubmit: (input: UpsertUserInput) => void;
      disableRole?: boolean;
    }
  | {
      mode: "edit";
      initial: UserDetails;
      isSubmitting?: boolean;
      onCancel: () => void;
      onSubmit: (patch: Partial<UpsertUserInput>) => void;
      disableRole?: boolean; // ✅ added
    };

const UserForm: React.FC<Props> = (props) => {
  const isCreate = props.mode === "create";

  const [name, setName] = React.useState(isCreate ? "" : props.initial.name ?? "");
  const [email, setEmail] = React.useState(isCreate ? "" : props.initial.email);
  const [role, setRole] = React.useState<UserRole>(isCreate ? props.defaultRole : props.initial.role);
  const [status, setStatus] = React.useState<UserStatus>(isCreate ? "active" : props.initial.status);

  const [grade, setGrade] = React.useState(isCreate ? "" : props.initial.grade ?? "");
  const [verified, setVerified] = React.useState<boolean>(isCreate ? false : !!props.initial.verified);
  const [phone, setPhone] = React.useState(isCreate ? "" : props.initial.phone ?? "");

  const canSubmit = name.trim() && email.trim();

  const submit = () => {
    if (!canSubmit) return;

    const payload = {
      name: name.trim(),
      email: email.trim(),
      status,
      // role is blocked in edit for now (handled below)
      role,
      grade: role === "student" ? grade.trim() || undefined : undefined,
      verified: role === "teacher" ? verified : undefined,
      phone: phone.trim() || undefined,
    };

    if (isCreate) props.onSubmit(payload as UpsertUserInput);
    else {
      const patch: Partial<UpsertUserInput> = {
        name: payload.name,
        email: payload.email,
        status: payload.status,
        grade: payload.grade,
        verified: payload.verified,
        phone: payload.phone,
      };

      // ✅ Role change disabled (needs Cloud Function for claims)
      props.onSubmit(patch);
    }
  };

  return (
    <div className="space-y-3">
      <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" />
      <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. john@email.com" />
      <Input label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 ..." />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* ✅ Role select disabled for now in edit mode */}
        <Select
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          disabled={!isCreate || !!props.disableRole}
          options={[
            { label: "Student", value: "student" },
            { label: "Teacher", value: "teacher" },
            { label: "Admin", value: "admin" },
          ]}
        />

        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as UserStatus)}
          options={[
            { label: "Active", value: "active" },
            { label: "Disabled", value: "disabled" },
            { label: "Banned", value: "banned" },
          ]}
        />
      </div>

      {role === "student" ? (
        <Input label="Grade (optional)" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="A Level" />
      ) : null}

      {role === "teacher" ? (
        <label className="flex min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3">
          <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
          <span className="min-w-0 truncate text-sm text-slate-700">Verified teacher</span>
        </label>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2 pt-2">
        <Button variant="outline" onClick={props.onCancel} disabled={props.isSubmitting}>
          Cancel
        </Button>
        <Button onClick={submit} isLoading={props.isSubmitting} disabled={!canSubmit}>
          Save
        </Button>
      </div>
    </div>
  );
};

export default UserForm;