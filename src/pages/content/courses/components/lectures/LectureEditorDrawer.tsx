import React from "react";
import { Drawer, Card, CardContent, Input, Button } from "../../../../../app/shared";
import type { Lecture } from "../../../Types/content.types";
import { getLecture, upsertLecture } from "../../../Api/content.api";
import TranscriptEditor from "./TranscriptEditor";
import SpeedPointsEditor from "./SpeedPointsEditor";
import VideoSourcePicker from "../../../components/video/VideoSourcePicker";
import { useFirebaseResumableUpload } from "../../../hooks/useFirebaseResumableUpload";
import { getVideoDurationSec, safeFileName, isValidHttpUrl } from "../../../utils/video.utils";

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

  // Replace video UI
  const [replaceOpen, setReplaceOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"upload" | "link">("upload");
  const [file, setFile] = React.useState<File | null>(null);
  const [link, setLink] = React.useState("");

  const { upload, cancel, state, progress, error } = useFirebaseResumableUpload();

  React.useEffect(() => {
    if (!open || !lectureId) return;
    (async () => {
      setLoading(true);
      try {
        setLecture(await getLecture(lectureId));
      } finally {
        setLoading(false);
      }
    })();
  }, [open, lectureId]);

  if (!open) return null;

  return (
    <>
      <Drawer open={open} onClose={onClose} title="Edit Lecture" description="Video + transcript + speed points used in student player.">
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

              {/* Video section */}
              <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">Video</p>
                    <p className="text-xs text-slate-500">
                      Source: {lecture.videoSource ?? (lecture.videoUrl ? "unknown" : "none")}
                      {lecture.durationSec ? ` • ${lecture.durationSec}s` : ""}
                    </p>
                    {lecture.videoUrl ? (
                      <a
                        href={lecture.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 block truncate text-xs text-slate-700 underline"
                      >
                        {lecture.videoUrl}
                      </a>
                    ) : (
                      <p className="mt-1 text-xs text-slate-500">No video attached.</p>
                    )}
                  </div>

                  <Button variant="outline" onClick={() => {
                    setReplaceOpen(true);
                    setMode("upload");
                    setFile(null);
                    setLink("");
                  }}>
                    Replace / Attach
                  </Button>
                </div>
              </div>

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
                        videoUrl: lecture.videoUrl ?? "",
                        videoSource: lecture.videoSource,
                        durationSec: lecture.durationSec ?? 0,
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

      {/* Replace video drawer */}
      <Drawer
        open={replaceOpen}
        onClose={() => setReplaceOpen(false)}
        title="Attach / Replace Video"
        description="Upload from device (resumable) or paste a link."
      >
        <Card>
          <CardContent className="p-4 space-y-4">
            <VideoSourcePicker
              mode={mode}
              onModeChange={setMode}
              file={file}
              onFileChange={setFile}
              link={link}
              onLinkChange={setLink}
              disabled={state === "uploading"}
            />

            {state === "uploading" ? (
              <div className="rounded-2xl border border-slate-100 bg-white p-4 space-y-2">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>Uploading…</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-slate-900" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={cancel}>Cancel upload</Button>
                </div>
              </div>
            ) : null}

            {error ? <p className="text-xs text-red-600">{error}</p> : null}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReplaceOpen(false)} disabled={state === "uploading"}>
                Cancel
              </Button>
              <Button
                disabled={
                  state === "uploading" ||
                  !lecture ||
                  (mode === "upload" ? !file : !isValidHttpUrl(link.trim()))
                }
                onClick={async () => {
                  if (!lecture) return;

                  if (mode === "upload" && file) {
                    const durationSec = await getVideoDurationSec(file);
                    const ext = safeFileName(file.name);
                    const storagePath = `content/lectures/${lecture.id}/${Date.now()}_${ext}`;
                    const res = await upload({ storagePath, file });

                    setLecture({
                      ...lecture,
                      videoUrl: res.downloadUrl,
                      videoSource: "upload",
                      durationSec,
                    });
                  }

                  if (mode === "link") {
                    setLecture({
                      ...lecture,
                      videoUrl: link.trim(),
                      videoSource: "link",
                    });
                  }

                  setReplaceOpen(false);
                }}
              >
                Attach
              </Button>
            </div>
          </CardContent>
        </Card>
      </Drawer>
    </>
  );
}