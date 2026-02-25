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

  const [replaceOpen, setReplaceOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"upload" | "link">("upload");
  const [file, setFile] = React.useState<File | null>(null);
  const [link, setLink] = React.useState("");

  const { upload, cancel, state, progress, error } = useFirebaseResumableUpload();
  const isUploading = state === "uploading";

  React.useEffect(() => {
    if (!open || !lectureId) return;

    const loadLecture = async () => {
      setLoading(true);
      try {
        const fetched = await getLecture(lectureId);
        setLecture(fetched);
      } finally {
        setLoading(false);
      }
    };

    void loadLecture();
  }, [open, lectureId]);

  if (!open) return null;

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        title="Edit Lecture"
        description="Video, transcript, and speed points used in the student player."
      >
        {loading || !lecture ? (
          <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
        ) : (
          <Card>
            <CardContent className="space-y-4 p-4">
              <Input
                label="Lecture title"
                value={lecture.title}
                onChange={(event) => setLecture({ ...lecture, title: event.target.value })}
              />

              <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">Video</p>
                    <p className="text-xs text-slate-500">
                      Source: {lecture.videoSource ?? (lecture.videoUrl ? "unknown" : "none")}
                      {lecture.durationSec ? ` - ${lecture.durationSec}s` : ""}
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
                  <Button
                    variant="outline"
                    onClick={() => {
                      setReplaceOpen(true);
                      setMode("upload");
                      setFile(null);
                      setLink("");
                    }}
                  >
                    Replace / Attach
                  </Button>
                </div>
              </div>

              <TranscriptEditor
                value={lecture.transcript ?? ""}
                onChange={(value) => setLecture({ ...lecture, transcript: value })}
              />

              <SpeedPointsEditor
                value={lecture.speedPoints ?? []}
                onChange={(value) => setLecture({ ...lecture, speedPoints: value })}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={onClose} disabled={saving}>
                  Close
                </Button>
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

      <Drawer
        open={replaceOpen}
        onClose={() => setReplaceOpen(false)}
        title="Attach / Replace Video"
        description="Upload from device (resumable) or paste a direct link."
      >
        <Card>
          <CardContent className="space-y-4 p-4">
            <VideoSourcePicker
              mode={mode}
              onModeChange={setMode}
              file={file}
              onFileChange={setFile}
              link={link}
              onLinkChange={setLink}
              disabled={isUploading}
            />

            {isUploading ? (
              <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-slate-900" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={cancel}>
                    Cancel upload
                  </Button>
                </div>
              </div>
            ) : null}

            {error ? <p className="text-xs text-red-600">{error}</p> : null}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setReplaceOpen(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button
                disabled={isUploading || !lecture || (mode === "upload" ? !file : !isValidHttpUrl(link.trim()))}
                onClick={async () => {
                  if (!lecture) return;

                  try {
                    if (mode === "upload" && file) {
                      const durationSec = await getVideoDurationSec(file);
                      const safeName = safeFileName(file.name);
                      const storagePath = `content/lectures/${lecture.id}/${Date.now()}_${safeName}`;
                      const uploaded = await upload(storagePath, file);

                      setLecture({
                        ...lecture,
                        videoUrl: uploaded.downloadUrl,
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
                  } catch (uploadError) {
                    if ((uploadError as { code?: string })?.code !== "storage/canceled") {
                      throw uploadError;
                    }
                  }
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
