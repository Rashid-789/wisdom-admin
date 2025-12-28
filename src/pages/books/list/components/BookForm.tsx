/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input, Select } from "../../../../app/shared";
import type { BookUpsertInput } from "../../Types/books.types";

type Props = {
  value: BookUpsertInput;
  onChange: (next: BookUpsertInput) => void;
};

export default function BookForm({ value, onChange }: Props) {
  return (
    <div className="space-y-3">
      <Input
        label="Title"
        value={value.title}
        onChange={(e) => onChange({ ...value, title: e.target.value })}
        placeholder="Applied Mathematics — Grade 8-9"
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Author (optional)"
          value={value.author ?? ""}
          onChange={(e) => onChange({ ...value, author: e.target.value })}
          placeholder="Author name"
        />
        <Input
          label="Publisher (optional)"
          value={value.publisher ?? ""}
          onChange={(e) => onChange({ ...value, publisher: e.target.value })}
          placeholder="Publisher"
        />
      </div>

      <Input
        label="Description (optional)"
        value={value.description ?? ""}
        onChange={(e) => onChange({ ...value, description: e.target.value })}
        placeholder="Short description..."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Input
          label="Price"
          value={String(value.price)}
          onChange={(e) => onChange({ ...value, price: Number(e.target.value) || 0 })}
          placeholder="1500"
        />
        <Select
          label="Currency"
          value={value.currency}
          onChange={(e) => onChange({ ...value, currency: e.target.value as any })}
          options={[
            { label: "PKR", value: "PKR" },
            { label: "USD", value: "USD" },
            { label: "GBP", value: "GBP" },
          ]}
        />
        <Select
          label="File Type"
          value={value.fileType}
          onChange={(e) => onChange({ ...value, fileType: e.target.value as any })}
          options={[
            { label: "PDF", value: "pdf" },
            { label: "EPUB", value: "epub" },
          ]}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Select
          label="Status"
          value={value.status}
          onChange={(e) => onChange({ ...value, status: e.target.value as any })}
          options={[
            { label: "Draft", value: "draft" },
            { label: "Published", value: "published" },
          ]}
        />

        {/* Linking placeholders (later pull from Content module dropdowns) */}
        <Input
          label="Subject (optional)"
          value={value.subjectTitle ?? ""}
          onChange={(e) => onChange({ ...value, subjectTitle: e.target.value })}
          placeholder="Applied Mathematics"
        />
      </div>

      <Input
        label="Course (optional)"
        value={value.courseTitle ?? ""}
        onChange={(e) => onChange({ ...value, courseTitle: e.target.value })}
        placeholder="Trigonometry"
      />

      {/* Uploads */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <p className="mb-1 text-sm font-medium text-slate-900">Book file</p>
          <input
            type="file"
            accept=".pdf,.epub"
            className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
            onChange={(e) => onChange({ ...value, file: e.target.files?.[0] ?? null })}
          />
          <p className="mt-1 text-xs text-slate-500">Upload PDF/EPUB (Firebase Storage later)</p>
        </div>

        <div>
          <p className="mb-1 text-sm font-medium text-slate-900">Cover image</p>
          <input
            type="file"
            accept="image/*"
            className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-slate-800"
            onChange={(e) => onChange({ ...value, cover: e.target.files?.[0] ?? null })}
          />
          <p className="mt-1 text-xs text-slate-500">Upload cover (optional)</p>
        </div>
      </div>
    </div>
  );
}

