/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Drawer, Card, CardContent, Input, Select, Button } from "../../../../app/shared";
import type { BookSubject, SubBook, SubBookUpsertInput } from "../../Types/books.types";
import { createSubBook, updateSubBook } from "../../Api/books.api";

function toForm(book: SubBook | null): SubBookUpsertInput {
  return {
    title: book?.title ?? "",
    author: book?.author ?? "",
    publisher: book?.publisher ?? "",
    description: book?.description ?? "",
    tokenPrice: book?.tokenPrice ?? undefined,
    moneyPrice: book?.moneyPrice ?? undefined,
    currency: book?.currency ?? "PKR",
    status: book?.status ?? "draft",
    pdf: null,
    cover: null,
  };
}

export default function SubBookFormDrawer({
  open,
  subject,
  book,
  onClose,
  onSaved,
}: {
  open: boolean;
  subject: BookSubject;
  book: SubBook | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!book;

  const [value, setValue] = React.useState<SubBookUpsertInput>(() => toForm(book));
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setValue(toForm(book));
  }, [open, book]);

  const canSave = value.title.trim().length > 2;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit PDF Book" : "Upload PDF Book"}
      description={`Subject: ${subject.title} — Upload PDF + cover + pricing (tokens/Rs).`}
    >
      <Card>
        <CardContent className="p-4 space-y-3">
          <Input
            label="Title"
            value={value.title}
            onChange={(e) => setValue({ ...value, title: e.target.value })}
            placeholder="Applied Mathematics — Part 1"
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Author (optional)"
              value={value.author ?? ""}
              onChange={(e) => setValue({ ...value, author: e.target.value })}
              placeholder="Author"
            />
            <Input
              label="Publisher (optional)"
              value={value.publisher ?? ""}
              onChange={(e) => setValue({ ...value, publisher: e.target.value })}
              placeholder="Publisher"
            />
          </div>

          <Input
            label="Description (optional)"
            value={value.description ?? ""}
            onChange={(e) => setValue({ ...value, description: e.target.value })}
            placeholder="Short description..."
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Input
              label="Token price (optional)"
              value={value.tokenPrice === undefined ? "" : String(value.tokenPrice)}
              onChange={(e) => {
                const n = Number(e.target.value);
                setValue({ ...value, tokenPrice: Number.isFinite(n) ? n : undefined });
              }}
              placeholder="150000"
            />
            <Input
              label="Money price (optional)"
              value={value.moneyPrice === undefined ? "" : String(value.moneyPrice)}
              onChange={(e) => {
                const n = Number(e.target.value);
                setValue({ ...value, moneyPrice: Number.isFinite(n) ? n : undefined });
              }}
              placeholder="1500"
            />
            <Select
              label="Currency"
              value={value.currency}
              onChange={(e) => setValue({ ...value, currency: e.target.value as any })}
              options={[
                { label: "PKR", value: "PKR" },
                { label: "USD", value: "USD" },
                { label: "GBP", value: "GBP" },
              ]}
            />
          </div>

          <Select
            label="Status"
            value={value.status}
            onChange={(e) => setValue({ ...value, status: e.target.value as any })}
            options={[
              { label: "Draft", value: "draft" },
              { label: "Published", value: "published" },
            ]}
          />

          {/* Uploads */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-sm font-medium text-slate-900">PDF File</p>
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                onChange={(e) => setValue({ ...value, pdf: e.target.files?.[0] ?? null })}
              />
              <p className="mt-1 text-xs text-slate-500">
                Upload PDF only (Firebase Storage later).
              </p>
            </div>

            <div>
              <p className="mb-1 text-sm font-medium text-slate-900">Cover image (optional)</p>
              <input
                type="file"
                accept="image/*"
                className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
                onChange={(e) => setValue({ ...value, cover: e.target.files?.[0] ?? null })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              disabled={!canSave}
              isLoading={saving}
              onClick={async () => {
                setSaving(true);
                try {
                  if (isEdit) await updateSubBook(subject.id, book!.id, value);
                  else await createSubBook(subject.id, value);
                  onSaved();
                } finally {
                  setSaving(false);
                }
              }}
            >
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </Drawer>
  );
}
