import React from "react";
import type { UserDetails, UserFormValues, UserRole, UserStatus } from "../Types/users.types";
import { Button, Input, Select } from "../../../app/shared";
import AvatarField from "./AvatarField";

type Props =
  | {
      mode: "create";
      fixedRole?: UserRole;
      isSubmitting?: boolean;
      onCancel: () => void;
      onSubmit: (input: UserFormValues) => void;
    }
  | {
      mode: "edit";
      initial: UserDetails;
      isSubmitting?: boolean;
      onCancel: () => void;
      onSubmit: (patch: Partial<UserFormValues>) => void;
    };

const UserForm: React.FC<Props> = (props) => {
  const isCreate = props.mode === "create";

  const [name, setName] = React.useState(isCreate ? "" : props.initial.name ?? "");
  const [email, setEmail] = React.useState(isCreate ? "" : props.initial.email);
  const [status, setStatus] = React.useState<UserStatus>(isCreate ? "active" : props.initial.status);

  const [grade, setGrade] = React.useState(isCreate ? "" : props.initial.grade ?? "");
  const [verified, setVerified] = React.useState<boolean>(isCreate ? false : !!props.initial.verified);
  const [phone, setPhone] = React.useState(isCreate ? "" : props.initial.phone ?? "");
  const [gender, setGender] = React.useState(isCreate ? "" : String(props.initial.gender ?? ""));
  const [age, setAge] = React.useState(isCreate ? "" : String(props.initial.age ?? ""));
  const [avatarUrl, setAvatarUrl] = React.useState(isCreate ? "" : props.initial.avatarUrl ?? "");
  const [avatarPath, setAvatarPath] = React.useState<string | null>(isCreate ? null : props.initial.avatarPath ?? null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [password, setPassword] = React.useState("");

  const canSubmit = name.trim() && email.trim();
  const role: UserRole = isCreate ? props.fixedRole ?? "student" : props.initial.role;

  const submit = () => {
    if (!canSubmit) return;

    const payload: UserFormValues = {
      name: name.trim(),
      email: email.trim(),
      status,
      grade: role === "student" ? grade.trim() || null : null,
      verified: role === "teacher" || role === "admin" || role === "super_admin" ? verified : null,
      phone: phone.trim() || null,
      gender: gender.trim() || null,
      age: age.trim() || null,
      avatarUrl: avatarUrl.trim() || null,
      avatarPath,
      avatarFile,
      password: isCreate ? (password.trim() || undefined) : undefined,
    };

    if (isCreate) props.onSubmit(payload);
    else {
      const patch: Partial<UserFormValues> = {
        name: payload.name,
        email: payload.email,
        status: payload.status,
        grade: payload.grade,
        verified: payload.verified,
        phone: payload.phone,
        gender: payload.gender,
        age: payload.age,
        avatarUrl: payload.avatarUrl,
        avatarPath: payload.avatarPath,
        avatarFile: payload.avatarFile,
      };

      props.onSubmit(patch);
    }
  };

  return (
    <div className="space-y-3">
      <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. John Doe" />
      <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. john@email.com" />
      <Input label="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 ..." />

      <AvatarField
        value={avatarUrl.trim() ? avatarUrl : null}
        displayName={name.trim() || email.trim()}
        email={email.trim()}
        disabled={props.isSubmitting}
        onChange={(nextUrl, meta) => {
          setAvatarUrl(nextUrl ?? "");
          if (meta && "avatarPath" in meta) {
            setAvatarPath(meta.avatarPath ?? null);
          }
          if (meta && "file" in meta) {
            setAvatarFile(meta.file ?? null);
          }
        }}
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="Gender (optional)" value={gender} onChange={(e) => setGender(e.target.value)} placeholder="e.g. Female" />
        <Input label="Age (optional)" value={age} onChange={(e) => setAge(e.target.value)} placeholder="e.g. 16" />
      </div>

      {isCreate ? (
        <Input
          label="Password (optional)"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Leave empty to auto-generate"
        />
      ) : null}

      {role === "student" ? (
        <Input label="Grade (optional)" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="A Level" />
      ) : null}

      {role === "teacher" || role === "admin" || role === "super_admin" ? (
        <label className="flex min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3">
          <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} />
          <span className="min-w-0 truncate text-sm text-slate-700">Verified</span>
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
