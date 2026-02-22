import React from "react";
import { Modal, Button, Card, CardContent, Input } from "../../../../app/shared";

export default function ReauthEmailModal({
  open,
  onClose,
  isLoading,
  onConfirm,
  nextEmail,
}: {
  open: boolean;
  onClose: () => void;
  isLoading: boolean;
  onConfirm: (password: string) => void;
  nextEmail: string;
}) {
  const [password, setPassword] = React.useState("");

  React.useEffect(() => {
    if (!open) setPassword("");
  }, [open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Confirm password"
      description={`For security, please confirm your password to change email to ${nextEmail}.`}
    >
      <Card>
        <CardContent className="p-4 space-y-4">
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={() => onConfirm(password)}
              isLoading={isLoading}
              disabled={password.length < 6}
            >
              Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </Modal>
  );
}