import React from "react";
import Modal from "./Modal";
import Button from "./Button";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

const ConfirmDialog: React.FC<Props> = ({
  open,
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  danger,
  isLoading,
  onConfirm,
  onClose,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button variant={danger ? "danger" : "primary"} onClick={onConfirm} isLoading={isLoading}>
            {confirmText}
          </Button>
        </div>
      }
    >
      {description ? <p className="text-sm text-slate-600">{description}</p> : null}
    </Modal>
  );
};

export default ConfirmDialog;

