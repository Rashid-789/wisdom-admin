import React from "react";
import { Button, Input } from "../../../../../app/shared";
import type { SpeedPoint } from "../../../Types/content.types";

export default function SpeedPointsEditor({
  value,
  onChange,
}: {
  value: SpeedPoint[];
  onChange: (v: SpeedPoint[]) => void;
}) {
  const [time, setTime] = React.useState("");
  const [label, setLabel] = React.useState("");

  const add = () => {
    const t = Number(time);
    if (!Number.isFinite(t) || t < 0 || !label.trim()) return;

    onChange([
      ...value,
      { id: `sp_${Math.random().toString(16).slice(2)}`, timeSec: Math.floor(t), label: label.trim() },
    ]);

    setTime("");
    setLabel("");
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-slate-900">Speed Points</p>
      <p className="text-xs text-slate-500">Timestamp + label (student UI “Speed Points” list)</p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[140px_1fr_auto] sm:items-end">
        <Input label="Time (sec)" value={time} onChange={(e) => setTime(e.target.value)} placeholder="120" />
        <Input label="Label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Derivatives rule" />
        <Button onClick={add} disabled={!time || !label.trim()} className="h-10">Add</Button>
      </div>

      <div className="space-y-2">
        {value.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-3 text-sm text-slate-600">
            No speed points yet.
          </div>
        ) : (
          value
            .slice()
            .sort((a, b) => a.timeSec - b.timeSec)
            .map((sp) => (
              <div key={sp.id} className="flex items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-white px-3 py-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">{sp.label}</p>
                  <p className="text-xs text-slate-500">{sp.timeSec}s</p>
                </div>
                <button
                  className="rounded-xl px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
                  onClick={() => onChange(value.filter((x) => x.id !== sp.id))}
                >
                  Remove
                </button>
              </div>
            ))
        )}
      </div>
    </div>
  );
}

