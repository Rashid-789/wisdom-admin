/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import toast from "react-hot-toast";
import { Card, CardContent, Button, Input } from "../../../../app/shared";
import type { AdminAccount } from "../../Types/settings.types";
import { updateAccount, updateAccountEmail } from "../../Api/settings.api";
import AvatarUploader from "./AvatarUploader";
import { SectionTabs, settingsTabs } from "../../../../app/shared";
import ReauthEmailModal from "./ReauthEmailModal";
import { useAdminAuth } from "../../../../auth/useAdminAuth";

export default function ProfileCard({
  account,
  onUpdated,
}: {
  account: AdminAccount;
  onUpdated: () => void;
}) {
  const { refresh } = useAdminAuth();

  const [displayName, setDisplayName] = React.useState(account.displayName);
  const [username, setUsername] = React.useState(account.username);
  const [email, setEmail] = React.useState(account.email);

  const [saving, setSaving] = React.useState(false);

  // reauth modal
  const [reauthOpen, setReauthOpen] = React.useState(false);
  const [reauthLoading, setReauthLoading] = React.useState(false);
  const pendingEmailRef = React.useRef<string>("");

  React.useEffect(() => {
    setDisplayName(account.displayName);
    setUsername(account.username);
    setEmail(account.email);
  }, [account.displayName, account.username, account.email]);

  const canSave =
    displayName.trim().length >= 2 &&
    username.trim().length >= 3 &&
    (displayName.trim() !== account.displayName ||
      username.trim() !== account.username ||
      email.trim().toLowerCase() !== account.email.trim().toLowerCase());

  async function saveAll() {
    setSaving(true);
    try {
      // Save displayName + username
      await updateAccount({ displayName, username });

      // Save email (if changed)
      const nextEmail = email.trim().toLowerCase();
      const prevEmail = account.email.trim().toLowerCase();

      if (nextEmail !== prevEmail) {
        try {
          await updateAccountEmail({ nextEmail });
          toast.success("Email updated (verification sent if enabled)");
        } catch (e: any) {
          // requires recent login → open modal
          if (String(e?.code) === "auth/requires-recent-login" || e?.message === "REAUTH_REQUIRED") {
            pendingEmailRef.current = nextEmail;
            setReauthOpen(true);
          } else {
            throw e;
          }
        }
      }

      toast.success("Profile updated");
      await refresh();
      await onUpdated();
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

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

        <AvatarUploader
          avatarUrl={account.avatarUrl ?? null}
          displayName={displayName}
          onUpdated={onUpdated}
        />

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

        <Input
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@domain.com"
        />

        <div className="flex justify-end">
          <Button disabled={!canSave} isLoading={saving} onClick={saveAll}>
            Save Changes
          </Button>
        </div>

        <ReauthEmailModal
          open={reauthOpen}
          onClose={() => {
            setReauthOpen(false);
            pendingEmailRef.current = "";
          }}
          isLoading={reauthLoading}
          nextEmail={pendingEmailRef.current}
          onConfirm={async (password) => {
            const nextEmail = pendingEmailRef.current;
            if (!nextEmail) return;

            setReauthLoading(true);
            try {
              await updateAccountEmail({ nextEmail, currentPassword: password });
              toast.success("Email updated ✅");
              setReauthOpen(false);
              pendingEmailRef.current = "";
              await refresh();
              await onUpdated();
            } catch (e: any) {
              toast.error(e?.message ?? "Failed to update email");
            } finally {
              setReauthLoading(false);
            }
          }}
        />
      </CardContent>
    </Card>
  );
}