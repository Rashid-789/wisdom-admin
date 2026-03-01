import { Card, CardContent, Button } from "../../../../app/shared";
import type { BookSubject } from "../../Types/books.types";

export default function SubjectHeader({
  subject,
  onEditSubject,
  onAddBook,
}: {
  subject: BookSubject;
  onEditSubject: () => void;
  onAddBook: () => void;
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-14 w-14 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden shrink-0">
            {subject.thumbnailUrl ? (
              <img src={subject.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : null}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-slate-900">{subject.title}</h2>
            <p className="text-sm text-slate-500">
              {subject.gradeLabel ?? "—"} • {subject.status}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={onEditSubject}>Edit Subject</Button>
          <Button onClick={onAddBook}>Upload PDF Book</Button>
        </div>
      </CardContent>
    </Card>
  );
}