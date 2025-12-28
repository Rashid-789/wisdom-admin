import React from "react";
import { Drawer, Card, CardContent, Input, Select, Button } from "../../../../../app/shared";
import type { ExerciseKind } from "../../../Types/content.types";
import { upsertExercise } from "../../../Api/content.api";

export default function ExerciseBuilderDrawer({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = React.useState("");
  const [kind, setKind] = React.useState<ExerciseKind>("mcq");
  const [saving, setSaving] = React.useState(false);

  const canSave = title.trim().length > 2;

  return (
    <Drawer open={open} onClose={onClose} title="Create Exercise" description="Question bank item (MCQ/Short/Long).">
      <Card>
        <CardContent className="p-4 space-y-3">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ratios MCQ" />
          <Select
            label="Type"
            value={kind}
            onChange={(e) => setKind(e.target.value as ExerciseKind)}
            options={[
              { label: "MCQ", value: "mcq" },
              { label: "Short", value: "short" },
              { label: "Long", value: "long" },
            ]}
          />

          <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
            Minimal builder included now.
            Next step: full question editor (options, correct answers, rubric, etc).
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button
              isLoading={saving}
              disabled={!canSave}
              onClick={async () => {
                setSaving(true);
                try {
                  await upsertExercise({
                    title: title.trim(),
                    kind,
                    questions: kind === "mcq"
                      ? [{ type: "mcq", prompt: "New Question", options: ["A", "B"], correctIndex: 0 }]
                      : kind === "short"
                      ? [{ type: "short", prompt: "New Question" }]
                      : [{ type: "long", prompt: "New Question" }],
                  });
                  onSaved();
                } finally {
                  setSaving(false);
                }
              }}
            >
              Create
            </Button>
          </div>
        </CardContent>
      </Card>
    </Drawer>
  );
}

