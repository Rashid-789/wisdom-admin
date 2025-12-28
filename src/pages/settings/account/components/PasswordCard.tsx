import React from "react";
import toast from "react-hot-toast";
import { Card, CardContent, Button, Input } from "../../../../app/shared";
import { changePassword, requestPasswordReset } from "../../Api/settings.api";

export default function PasswordCard({ email }: { email: string }) {
  const [sending, setSending] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");

  const canChange =
    currentPassword.trim().length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirm;

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Password</h2>
          <p className="text-sm text-slate-500">
            Reset or change your password (Firebase-ready)
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-3">
          <p className="text-sm text-slate-700">
            Forgot your password? Send a reset link to <span className="font-medium">{email}</span>
          </p>
          <div className="mt-3">
            <Button
              variant="outline"
              isLoading={sending}
              onClick={async () => {
                setSending(true);
                try {
                  await requestPasswordReset(email);
                  toast.success("Reset link sent");
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (e: any) {
                  toast.error(e?.message ?? "Failed to send reset link");
                } finally {
                  setSending(false);
                }
              }}
            >
              Send Reset Link
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Input
            label="Current password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            hint="Minimum 8 characters"
          />
          <Input
            label="Confirm new password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />

          <div className="flex justify-end">
            <Button
              disabled={!canChange}
              isLoading={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await changePassword({ currentPassword, newPassword });
                  toast.success("Password updated");
                  setCurrentPassword("");
                  setNewPassword("");
                  setConfirm("");
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (e: any) {
                  toast.error(e?.message ?? "Failed to update password");
                } finally {
                  setSaving(false);
                }
              }}
            >
              Update Password
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

