import React from "react";
import type { UpsertUserInput, UserDetails, UserRole } from "../Types/users.types";
import { createUserApi, setUserStatusApi, updateUserApi } from "../Api/users.api";
import { useUserDetails } from "../useUserDetails";
import { Button, Card, CardContent, ConfirmDialog, Drawer, EmptyState } from "../../../app/shared";
import UserForm from "./UserForm";
import UserDetailsTabs from "./UserDetailsTabs";
import ProfileCard from "./cards/ProfileCard";

type Mode = "view" | "create";

type Props = {
  open: boolean;
  userId: string | null;
  mode: Mode;
  defaultRole?: UserRole; // for create
  onClose: () => void;
  onSaved: () => void;
};

const UserDrawer: React.FC<Props> = ({ open, userId, mode, defaultRole, onClose, onSaved }) => {
  const { data, isLoading, error, setData } = useUserDetails(open && mode === "view" ? userId : null);

  const [isEditing, setIsEditing] = React.useState(mode === "create");
  const [saving, setSaving] = React.useState(false);

  const [confirmDisableOpen, setConfirmDisableOpen] = React.useState(false);
  const [confirmBanOpen, setConfirmBanOpen] = React.useState(false);

  React.useEffect(() => {
    setIsEditing(mode === "create");
  }, [mode, open]);

  const title =
    mode === "create"
      ? `Add ${defaultRole ? defaultRole[0].toUpperCase() + defaultRole.slice(1) : "User"}`
      : "User Details";

  const handleSaveCreate = async (input: UpsertUserInput) => {
    setSaving(true);
    try {
      await createUserApi(input);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const handleSaveUpdate = async (id: string, input: Partial<UpsertUserInput>) => {
    setSaving(true);
    try {
      const updated = await updateUserApi(id, input);
      setData(updated as unknown as UserDetails);
      setIsEditing(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const handleSetStatus = async (status: "disabled" | "banned" | "active") => {
    if (!data) return;
    setSaving(true);
    try {
      await setUserStatusApi(data.id, status);
      setData({ ...data, status });
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      description={mode === "create" ? "Create a new user account" : "View and manage user profile"}
    >
      <div className="w-full min-w-0">
        {mode === "create" ? (
          <Card>
            <CardContent className="p-4">
              <UserForm
                mode="create"
                defaultRole={defaultRole ?? "student"}
                isSubmitting={saving}
                onCancel={onClose}
                onSubmit={handleSaveCreate}
              />
            </CardContent>
          </Card>
        ) : isLoading ? (
          <div className="space-y-3">
            <div className="h-24 w-full animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-64 w-full animate-pulse rounded-2xl bg-slate-100" />
          </div>
        ) : error ? (
          <EmptyState title="Failed to load user" description={error} />
        ) : data ? (
          <div className="space-y-4">
            <ProfileCard user={data} />

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => setIsEditing((v) => !v)} disabled={saving}>
                {isEditing ? "Cancel Edit" : "Edit"}
              </Button>

              {data.status !== "disabled" ? (
                <Button variant="outline" onClick={() => setConfirmDisableOpen(true)} disabled={saving}>
                  Disable
                </Button>
              ) : (
                <Button variant="outline" onClick={() => handleSetStatus("active")} disabled={saving}>
                  Enable
                </Button>
              )}

              <Button variant="danger" onClick={() => setConfirmBanOpen(true)} disabled={saving}>
                Ban
              </Button>
            </div>

            {isEditing ? (
              <Card>
                <CardContent className="p-4">
                  <UserForm
                    mode="edit"
                    initial={data}
                    isSubmitting={saving}
                    onCancel={() => setIsEditing(false)}
                    onSubmit={(patch) => handleSaveUpdate(data.id, patch)}
                  />
                </CardContent>
              </Card>
            ) : (
              <UserDetailsTabs user={data} />
            )}

            {/* Confirm dialogs */}
            <ConfirmDialog
              open={confirmDisableOpen}
              onClose={() => setConfirmDisableOpen(false)}
              title="Disable user?"
              description="User will not be able to login until enabled again."
              danger
              isLoading={saving}
              onConfirm={async () => {
                setConfirmDisableOpen(false);
                await handleSetStatus("disabled");
              }}
            />

            <ConfirmDialog
              open={confirmBanOpen}
              onClose={() => setConfirmBanOpen(false)}
              title="Ban user?"
              description="This will block the user permanently until manually reverted."
              danger
              isLoading={saving}
              onConfirm={async () => {
                setConfirmBanOpen(false);
                await handleSetStatus("banned");
              }}
            />
          </div>
        ) : null}
      </div>
    </Drawer>
  );
};

export default UserDrawer;
