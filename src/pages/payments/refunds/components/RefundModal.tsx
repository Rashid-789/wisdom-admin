import React from "react";
import { Modal, Card, CardContent, Button, Textarea } from "../../../../app/shared";
import type { RefundRequest } from "../../Types/payments.types";
import { updateRefundStatus } from "../../Api/payments.api";
import { formatMoney } from "../../Utils/payments.utils";

/**
 * RefundModal:
 * - Uses your app's modal pattern (confirm-like UI).
 * - Later: integrate with Stripe refunds + Firestore updates.
 */
export default function RefundModal({
  open,
  refund,
  onClose,
  onUpdated,
}: {
  open: boolean;
  refund: RefundRequest | null;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [note, setNote] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setNote(refund?.reason ?? "");
  }, [open, refund]);

  if (!refund) return null;

  const canAct = refund.status === "requested";

  return (
    <Modal open={open} onClose={onClose} title="Review Refund" description="Approve or reject this refund request.">
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 text-sm text-slate-700 space-y-1">
            <p><span className="text-slate-500">User:</span> {refund.userName}</p>
            <p><span className="text-slate-500">Amount:</span> {formatMoney(refund.amount, refund.currency)}</p>
            <p><span className="text-slate-500">Transaction:</span> {refund.transactionId}</p>
            <p><span className="text-slate-500">Status:</span> {refund.status}</p>
          </div>

          <Textarea
            label="Admin note / reason"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Optional note..."
          />

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Close
            </Button>

            <Button
              variant="outline"
              disabled={!canAct}
              isLoading={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await updateRefundStatus(refund.id, "rejected", note);
                  onUpdated();
                } finally {
                  setSaving(false);
                }
              }}
            >
              Reject
            </Button>

            <Button
              disabled={!canAct}
              isLoading={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  await updateRefundStatus(refund.id, "approved", note);
                  onUpdated();
                } finally {
                  setSaving(false);
                }
              }}
            >
              Approve
            </Button>
          </div>
        </CardContent>
      </Card>
    </Modal>
  );
}

