import React from "react";
import { Drawer, Card, CardContent, Input, Button } from "../../../../app/shared";
import { grantBookAccess } from "../../Api/books.api";

/**
 * Manual grant access:
 * In Firebase later, you’ll likely select a user from Users module,
 * but we keep it simple now with ID + name + email.
 */
export default function GrantAccessDrawer({
  open,
  bookId,
  onClose,
  onSaved,
}: {
  open: boolean;
  bookId: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [userId, setUserId] = React.useState("");
  const [userName, setUserName] = React.useState("");
  const [userEmail, setUserEmail] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setUserId("");
    setUserName("");
    setUserEmail("");
  }, [open]);

  const canSave = userId.trim() && userName.trim();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Grant Access"
      description="Manually grant this book access to a user."
    >
      <Card>
        <CardContent className="p-4 space-y-3">
          <Input label="User ID" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="u_123" />
          <Input label="User name" value={userName} onChange={(e) => setUserName(e.target.value)} placeholder="Hassan" />
          <Input label="Email (optional)" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} placeholder="user@mail.com" />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button
              disabled={!canSave}
              isLoading={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await grantBookAccess(bookId, {
                    userId: userId.trim(),
                    userName: userName.trim(),
                    userEmail: userEmail.trim() || undefined,
                  });
                  onSaved();
                } finally {
                  setSaving(false);
                }
              }}
            >
              Grant
            </Button>
          </div>
        </CardContent>
      </Card>
    </Drawer>
  );
}

