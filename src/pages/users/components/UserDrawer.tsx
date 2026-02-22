/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import toast from "react-hot-toast";

import type { UserDetails } from "../Types/users.types";
import { setUserStatusApi, updateUserApi } from "../Api/users.api";
import { useUserDetails } from "../useUserDetails";
import { Button, Card, CardContent, ConfirmDialog, Drawer, EmptyState } from "../../../app/shared";
import UserForm from "./UserForm";

type Mode = "view"; // ✅ create disabled for now

type Props = {
  open: boolean;
  userId: string | null;
  mode: Mode;
  onClose: () => void;
  onSaved: () => void;
};

function initials(name: string | null, email: string) {
  const base = (name?.trim() || email.trim() || "U").toUpperCase();
  const parts = base.split(" ").filter(Boolean);
  const a = parts[0]?.[0] ?? "U";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

const InfoRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
    <p className="text-sm text-slate-600">{label}</p>
    <p className="text-sm font-medium text-slate-900">{value}</p>
  </div>
);

const UserDrawer: React.FC<Props> = ({ open, userId, onClose, onSaved }) => {
  const { data, isLoading, error, setData } = useUserDetails(open ? userId : null);

  const [isEditing, setIsEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [confirmDisableOpen, setConfirmDisableOpen] = React.useState(false);
  const [confirmBanOpen, setConfirmBanOpen] = React.useState(false);

  React.useEffect(() => {
    if (!open) setIsEditing(false);
  }, [open]);

  const handleSaveUpdate = async (id: string, patch: any) => {
    setSaving(true);
    try {
      const updated = await updateUserApi(id, patch);
      setData(updated as UserDetails);
      setIsEditing(false);
      toast.success("Saved ✅");
      onSaved();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save");
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
      toast.success("Updated ✅");
      onSaved();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="User Details"
      description="View and manage user profile"
    >
      <div className="w-full min-w-0">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-24 w-full animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-64 w-full animate-pulse rounded-2xl bg-slate-100" />
          </div>
        ) : error ? (
          <EmptyState title="Failed to load user" description={error} />
        ) : data ? (
          <div className="space-y-4">
            {/* Profile header (avatar + change picture placeholder) */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {data.avatarUrl ? (
                    <img
                      src={data.avatarUrl}
                      alt={data.name ?? data.email}
                      className="h-16 w-16 rounded-full object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-base font-semibold text-white">
                      {initials(data.name, data.email)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-slate-900">{data.name ?? "—"}</p>
                    <p className="truncate text-sm text-slate-500">{data.email}</p>

                    {/* Future: avatar upload via Storage */}
                    <button
                      type="button"
                      className="mt-1 text-sm font-medium text-slate-900 underline underline-offset-4"
                      onClick={() => toast("Avatar upload will be added with Storage integration.", { icon: "ℹ️" })}
                    >
                      Change Picture
                    </button>
                  </div>
                </div>

                {/* Info card like screenshot */}
                <div className="mt-4 rounded-2xl border border-slate-100 bg-white px-4">
                  <InfoRow label="Username" value={data.name ?? "—"} />
                  <InfoRow label="Email" value={data.email} />
                  <InfoRow label="Phone Number" value={data.phone ?? "—"} />
                  <InfoRow label="Gender" value={data.gender ?? "—"} />
                  <InfoRow label="Age" value={data.age ?? "—"} />
                  <InfoRow label="Grade" value={data.grade ?? "—"} />
                </div>
              </CardContent>
            </Card>

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

              {/* Future:
                  - Reset password (Cloud Function)
                  - Role change (Cloud Function -> claims)
              */}
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
                    disableRole //  prevent role edits for now
                  />
                </CardContent>
              </Card>
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
                {/* Keep details drawer working, but leave advanced tabs for later */}
                Activity/enrollments/tokens/purchases will be enabled after those collections are added.
              </div>
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