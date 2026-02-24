import React from "react";
import { Drawer, Card, CardContent, Input, Button } from "../../../../../app/shared";
import type { Topic } from "../../../Types/content.types";
import { upsertLecture } from "../../../Api/content.api";
import LectureEditorDrawer from "../lectures/LectureEditorDrawer";

export default function TopicDrawer({
  open,
  onClose,
  courseId,
  topic,
  onChangeTopic,
}: {
  open: boolean;
  onClose: () => void;
  courseId: string;
  chapterId: string;
  topic: Topic | null;
  onChangeTopic: (next: Topic) => void;
}) {
  const [local, setLocal] = React.useState<Topic | null>(topic);
  const [savingLecture, setSavingLecture] = React.useState(false);

  const [editLectureId, setEditLectureId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setLocal(topic);
  }, [topic, open]);

  if (!open || !local) return null;

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title="Topic Content"
        description="This is where you set tokens and attach the topic lecture video."
      >
        <Card>
          <CardContent className="p-4 space-y-4">
            <Input
              label="Topic title"
              value={local.title}
              onChange={(e) => setLocal({ ...local, title: e.target.value })}
            />

            <Input
              label="Reward tokens (for completing this topic)"
              value={String(local.rewardTokens ?? 0)}
              onChange={(e) => {
                const n = Number(e.target.value);
                setLocal({ ...local, rewardTokens: Number.isFinite(n) ? n : 0 });
              }}
              placeholder="30"
            />

            <div className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600">
              <b>Video (Lecture)</b>
              <div className="mt-2 flex flex-wrap gap-2">
                {local.lectureId ? (
                  <>
                    <Button variant="outline" onClick={() => setEditLectureId(local.lectureId!)}>Edit Lecture (Transcript / Speed Points)</Button>
                    <span className="text-xs text-slate-500">Attached: {local.lectureId}</span>
                  </>
                ) : (
                  <Button
                    isLoading={savingLecture}
                    onClick={async () => {
                      setSavingLecture(true);
                      try {
                        const created = await upsertLecture({
                          title: local.title.trim() || "New Topic Lecture",
                          courseId,
                          transcript: "",
                          speedPoints: [],
                        });
                        const next = { ...local, lectureId: created.id };
                        setLocal(next);
                        onChangeTopic(next);
                        setEditLectureId(created.id);
                      } finally {
                        setSavingLecture(false);
                      }
                    }}
                  >
                    Create + Attach Lecture
                  </Button>
                )}
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Uploading the actual video file will be wired via Firebase Storage (resumable upload + processing).
              </p>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>Close</Button>
              <Button
                onClick={() => {
                  const next = {
                    ...local,
                    title: local.title.trim(),
                    rewardTokens: Number(local.rewardTokens ?? 0),
                  };
                  onChangeTopic(next);
                  onClose();
                }}
                disabled={!local.title.trim()}
              >
                Save Topic
              </Button>
            </div>
          </CardContent>
        </Card>
      </Drawer>

      <LectureEditorDrawer
        open={!!editLectureId}
        lectureId={editLectureId}
        onClose={() => setEditLectureId(null)}
        onSaved={() => {}}
      />
    </>
  );
}