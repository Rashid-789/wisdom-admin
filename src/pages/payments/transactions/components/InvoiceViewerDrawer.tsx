import React from "react";
import { Drawer, Card, CardContent } from "../../../../app/shared";
import { getInvoiceHtml } from "../../Api/payments.api";

/**
 * InvoiceViewer:
 * - Later (Stripe): you can open hosted invoice url OR render PDF viewer.
 * - For now we render provider HTML in a safe container.
 */
export default function InvoiceViewerDrawer({
  open,
  invoiceId,
  onClose,
}: {
  open: boolean;
  invoiceId: string | null;
  onClose: () => void;
}) {
  const [html, setHtml] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (!open || !invoiceId) return;
    setLoading(true);
    getInvoiceHtml(invoiceId)
      .then(setHtml)
      .finally(() => setLoading(false));
  }, [open, invoiceId]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Invoice"
      description={invoiceId ? `Invoice ID: ${invoiceId}` : "Invoice preview"}
    >
      <Card>
        <CardContent className="p-4">
          {loading ? (
            <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
          ) : (
            <div
              className="rounded-2xl border border-slate-200 bg-white"
              // NOTE: In real app, prefer hosted invoice URL to avoid injecting HTML.
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}
        </CardContent>
      </Card>
    </Drawer>
  );
}

