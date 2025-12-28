import { Card, CardContent, Button } from "../../../../app/shared";
import type { Book } from "../../Types/books.types";
import { formatMoney } from "../../utils/books.utils";

export default function BookDetailsHeader({ book }: { book: Book }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-14 w-14 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
            {book.coverUrl ? <img src={book.coverUrl} alt="" className="h-full w-full object-cover" /> : null}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-slate-900">{book.title}</h2>
            <p className="text-sm text-slate-500">
              {formatMoney(book.price, book.currency)} • {book.fileType.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => {
              if (book.fileUrl) window.open(book.fileUrl, "_blank");
            }}
            disabled={!book.fileUrl}
          >
            View File
          </Button>

          <Button
            variant="outline"
            onClick={() => {
              if (book.coverUrl) window.open(book.coverUrl, "_blank");
            }}
            disabled={!book.coverUrl}
          >
            View Cover
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

