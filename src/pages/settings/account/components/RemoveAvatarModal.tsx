import { Modal, Button, Card, CardContent } from "../../../../app/shared";

export default function RemoveAvatarModal({
  open,
  onClose,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Remove avatar" description="This will remove the current avatar.">
      <Card>
        <CardContent className="p-4 space-y-4">
          <p className="text-sm text-slate-700">
            Are you sure you want to remove your avatar?
          </p>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={onConfirm} isLoading={isLoading}>
              Remove
            </Button>
          </div>
        </CardContent>
      </Card>
    </Modal>
  );
}

