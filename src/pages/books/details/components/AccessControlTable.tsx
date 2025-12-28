import React from "react";
import { Card, CardContent, DataTable, Button } from "../../../../app/shared";
import type { BookAccess } from "../../Types/books.types";
import { revokeBookAccess } from "../../Api/books.api";
import GrantAccessDrawer from "./GrantAccessDrawer";

type Props = {
  bookId: string;
  rows: BookAccess[];
  onChanged: () => void;
};

export default function AccessControlTable({ bookId, rows, onChanged }: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-3">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Access Control</p>
              <p className="text-sm text-slate-500">Users who can access this book</p>
            </div>

            <Button onClick={() => setOpen(true)}>Grant Access</Button>
          </div>

          <DataTable
            rows={rows}
            rowKey={(r) => r.id}
            columns={[
              {
                key: "user",
                header: "User",
                cell: (r) => (
                  <div>
                    <p className="text-sm font-medium text-slate-900">{r.userName}</p>
                    <p className="text-xs text-slate-500">{r.userEmail ?? "-"}</p>
                  </div>
                ),
              },
              { key: "source", header: "Source", cell: (r) => r.source },
              { key: "granted", header: "Granted", cell: (r) => new Date(r.grantedAt).toLocaleString() },
              {
                key: "actions",
                header: "",
                cell: (r) => (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={async () => {
                        await revokeBookAccess(r.id);
                        onChanged();
                      }}
                    >
                      Revoke
                    </Button>
                  </div>
                ),
              },
            ]}
            emptyTitle="No access granted"
            emptyDescription="Grant access manually or via purchases."
          />
        </CardContent>
      </Card>

      <GrantAccessDrawer
        open={open}
        bookId={bookId}
        onClose={() => setOpen(false)}
        onSaved={async () => {
          setOpen(false);
          onChanged();
        }}
      />
    </>
  );
}

