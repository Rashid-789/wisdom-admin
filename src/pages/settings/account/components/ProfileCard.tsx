import React from "react";
import toast from "react-hot-toast";
import { Card, CardContent, Button, Input } from "../../../../app/shared";
import type { AdminAccount } from "../../Types/settings.types";
import { updateAccount } from "../../Api/settings.api";
import AvatarUploader from "./AvatarUploader";
import { SectionTabs, settingsTabs } from "../../../../app/shared";
export default function ProfileCard({
  account,
  onUpdated,
}: {
  account: AdminAccount;
  onUpdated: () => void;
}) {
  const [displayName, setDisplayName] = React.useState(account.displayName);
  const [username, setUsername] = React.useState(account.username);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setDisplayName(account.displayName);
    setUsername(account.username);
  }, [account.displayName, account.username]);

  const canSave =
    displayName.trim().length >= 2 &&
    username.trim().length >= 3 &&
    (displayName.trim() !== account.displayName || username.trim() !== account.username);

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="mb-4 flex items-end justify-end gap-3">
          <SectionTabs tabs={settingsTabs} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Account</h2>
          <p className="text-sm text-slate-500">Update your profile and avatar</p>
        </div>

        <AvatarUploader avatarUrl={account.avatarUrl ?? null} onUpdated={onUpdated} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Admin"
          />
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="admin"
          />
        </div>

        <Input label="Email" value={account.email} disabled />

        <div className="flex justify-end">
          <Button
            disabled={!canSave}
            isLoading={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await updateAccount({ displayName, username });
                toast.success("Profile updated");
                await onUpdated();
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              } catch (e: any) {
                toast.error(e?.message ?? "Failed to update profile");
              } finally {
                setSaving(false);
              }
            }}
          >
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

