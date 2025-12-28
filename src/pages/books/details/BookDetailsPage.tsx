import React from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "../../../app/shared";

import type { Book, BookAccess } from "../Types/books.types";
import { getBook, listBookAccess } from "../Api/books.api";

import BookDetailsHeader from "./components/BookDetailsHeader";
import AccessControlTable from "./components/AccessControlTable";

export default function BookDetailsPage() {
  const { id = "" } = useParams();

  const [book, setBook] = React.useState<Book | null>(null);
  const [access, setAccess] = React.useState<BookAccess[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [b, a] = await Promise.all([getBook(id), listBookAccess(id)]);
      setBook(b);
      setAccess(a);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="px-4 py-6 sm:px-6">
        <Card>
          <CardContent className="p-6 text-sm text-slate-600">Book not found.</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 space-y-4">
      <BookDetailsHeader book={book} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardContent className="p-4 sm:p-6 space-y-2">
            <p className="text-sm font-semibold text-slate-900">Metadata</p>
            <div className="text-sm text-slate-700 space-y-1">
              <p><span className="text-slate-500">Author:</span> {book.author ?? "-"}</p>
              <p><span className="text-slate-500">Publisher:</span> {book.publisher ?? "-"}</p>
              <p><span className="text-slate-500">Subject:</span> {book.subjectTitle ?? "-"}</p>
              <p><span className="text-slate-500">Course:</span> {book.courseTitle ?? "-"}</p>
              <p><span className="text-slate-500">Status:</span> {book.status}</p>
            </div>

            {book.description ? (
              <div className="pt-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</p>
                <p className="mt-1 text-sm text-slate-700">{book.description}</p>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <AccessControlTable bookId={book.id} rows={access} onChanged={load} />
      </div>
    </div>
  );
}

