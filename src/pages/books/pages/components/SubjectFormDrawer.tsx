import React from "react";
import { Drawer, Card, CardContent, Input, Select, Button } from "../../../../app/shared";
import type { BookSubject, SubjectUpsertInput } from "../../Types/books.types";
import { createBookSubject, updateBookSubject } from "../../Api/books.api";

function toForm(subject: BookSubject | null): SubjectUpsertInput {
  return {
    title: subject?.title ?? "",
    gradeLabel: subject?.gradeLabel ?? "",
    description: subject?.description ?? "",
    status: subject?.status ?? "draft",
    thumbnail: null,
  };
}

export default function SubjectFormDrawer({
  open,
  subject,
  onClose,
  onSaved,
}: {
  open: boolean;
  subject: BookSubject | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!subject;

  const [value, setValue] = React.useState<SubjectUpsertInput>(() => toForm(subject));
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setValue(toForm(subject));
  }, [open, subject]);

  const canSave = value.title.trim().length > 2;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Subject" : "Add Subject"}
      description="Create a subject (Applied Mathematics, Physics...) then upload PDF books inside it."
    >
      <Card>
        <CardContent className="p-4 space-y-3">
          <Input
            label="Title"
            value={value.title}
            onChange={(e) => setValue({ ...value, title: e.target.value })}
            placeholder="Applied Mathematics"
          />

          <Input
            label="Grade label (optional)"
            value={value.gradeLabel ?? ""}
            onChange={(e) => setValue({ ...value, gradeLabel: e.target.value })}
            placeholder="Grade 8th–9th"
          />

          <Input
            label="Description (optional)"
            value={value.description ?? ""}
            onChange={(e) => setValue({ ...value, description: e.target.value })}
            placeholder="Short description..."
          />

          <Select
            label="Status"
            value={value.status}
            onChange={(e) => setValue({ ...value, status: e.target.value as any })}
            options={[
              { label: "Draft", value: "draft" },
              { label: "Published", value: "published" },
            ]}
          />

          <div>
            <p className="mb-1 text-sm font-medium text-slate-900">Thumbnail (optional)</p>
            <input
              type="file"
              accept="image/*"
              className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
              onChange={(e) => setValue({ ...value, thumbnail: e.target.files?.[0] ?? null })}
            />
            <p className="mt-1 text-xs text-slate-500">Used in app subject list.</p>
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
                  if (isEdit) await updateBookSubject(subject!.id, value);
                  else await createBookSubject(value);
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