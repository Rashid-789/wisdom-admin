import React from "react";
import { Drawer, Card, CardContent, Button } from "../../../../app/shared";
import type { Book, BookUpsertInput } from "../../Types/books.types";
import { createBook, updateBook } from "../../Api/books.api";

import BookForm from "./BookForm";

type Props = {
  open: boolean;
  book: Book | null;
  onClose: () => void;
  onSaved: () => void;
};

function toForm(book: Book | null): BookUpsertInput {
  return {
    title: book?.title ?? "",
    author: book?.author ?? "",
    publisher: book?.publisher ?? "",
    description: book?.description ?? "",
    price: book?.price ?? 0,
    currency: book?.currency ?? "PKR",
    fileType: book?.fileType ?? "pdf",
    subjectId: book?.subjectId,
    subjectTitle: book?.subjectTitle,
    courseId: book?.courseId,
    courseTitle: book?.courseTitle,
    status: book?.status ?? "draft",
    file: null,
    cover: null,
  };
}

export default function BookFormDrawer({ open, book, onClose, onSaved }: Props) {
  const isEdit = !!book;

  const [value, setValue] = React.useState<BookUpsertInput>(() => toForm(book));
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setValue(toForm(book));
  }, [open, book]);

  const canSave = value.title.trim().length > 2 && value.price >= 0;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Book" : "Upload Book"}
      description="Upload book file, cover image and configure price + access."
    >
      <Card>
        <CardContent className="p-4 space-y-4">
          <BookForm value={value} onChange={setValue} />

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
                  if (isEdit) await updateBook(book!.id, value);
                  else await createBook(value);

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

