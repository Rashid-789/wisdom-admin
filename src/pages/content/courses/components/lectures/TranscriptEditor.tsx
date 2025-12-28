// import React from "react";

export default function TranscriptEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-sm font-medium text-slate-900">Transcript</p>
      <textarea
        className="min-h-[140px] w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-slate-400"
        placeholder="Paste or write transcript here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <p className="mt-1 text-xs text-slate-500">Used in student lecture screen (Transcript section).</p>
    </div>
  );
}

