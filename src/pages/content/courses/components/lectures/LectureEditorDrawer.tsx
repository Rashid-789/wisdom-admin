import React from "react";
import { Drawer, Card, CardContent, Input, Button } from "../../../../../app/shared";
import type { Lecture } from "../../../Types/content.types";
import { listLectures, upsertLecture } from "../../../Api/content.api";
import TranscriptEditor from "./TranscriptEditor";
import SpeedPointsEditor from "./SpeedPointsEditor";

type Props = {
  open: boolean;
  lectureId: string | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function LectureEditorDrawer({ open, lectureId, onClose, onSaved }: Props) {
  const [lecture, setLecture] = React.useState<Lecture | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open || !lectureId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await listLectures({ page: 1, pageSize: 50 });
        setLecture(res.rows.find((x) => x.id === lectureId) ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [open, lectureId]);

  if (!open) return null;

  return (
    <Drawer open={open} onClose={onClose} title="Edit Lecture" description="Transcript + speed points are used in the student player.">
      {loading || !lecture ? (
        <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      ) : (
        <Card>
          <CardContent className="p-4 space-y-4">
            <Input
              label="Lecture title"
              value={lecture.title}
              onChange={(e) => setLecture({ ...lecture, title: e.target.value })}
            />

            <TranscriptEditor
              value={lecture.transcript ?? ""}
              onChange={(v) => setLecture({ ...lecture, transcript: v })}
            />

            <SpeedPointsEditor
              value={lecture.speedPoints ?? []}
              onChange={(v) => setLecture({ ...lecture, speedPoints: v })}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose} disabled={saving}>Close</Button>
              <Button
                isLoading={saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    await upsertLecture({
                      id: lecture.id,
                      title: lecture.title.trim(),
                      transcript: lecture.transcript ?? "",
                      speedPoints: lecture.speedPoints ?? [],
                    });
                    onSaved();
                    onClose();
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
      )}
    </Drawer>
  );
}

