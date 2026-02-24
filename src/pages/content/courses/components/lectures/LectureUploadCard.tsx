import React from "react";
import { Card, CardContent, Input, Button } from "../../../../../app/shared";
import { upsertLecture } from "../../../Api/content.api";
import { getVideoDurationSec, safeFileName, isValidHttpUrl } from "../../../utils/video.utils";
import { useFirebaseResumableUpload } from "../../../hooks/useFirebaseResumableUpload";
import VideoSourcePicker from "../../../components/video/VideoSourcePicker";

export default function LectureUploadCard({
  courseId,
  onUploaded,
}: {
  courseId: string;
  onUploaded: () => void;
}) {
  const [title, setTitle] = React.useState("");
  const [mode, setMode] = React.useState<"upload" | "link">("upload");
  const [file, setFile] = React.useState<File | null>(null);
  const [link, setLink] = React.useState("");

  const [saving, setSaving] = React.useState(false);

  const { upload, cancel, state, progress, error } = useFirebaseResumableUpload();

  const canCreate =
    title.trim().length > 2 &&
    (mode === "upload" ? !!file : isValidHttpUrl(link.trim()));

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">Add Lecture</p>
          <p className="text-sm text-slate-500">
            Skill course lectures are direct videos. Upload from device or use a link.
          </p>
        </div>

        <Input
          label="Lecture Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Derivatives basics"
          disabled={saving || state === "uploading"}
        />

        <VideoSourcePicker
          mode={mode}
          onModeChange={setMode}
          file={file}
          onFileChange={setFile}
          link={link}
          onLinkChange={setLink}
          disabled={saving || state === "uploading"}
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

        <Button
          isLoading={saving}
          disabled={!canCreate || saving || state === "uploading"}
          onClick={async () => {
            setSaving(true);
            try {
              // 1) Create lecture first (get lectureId)
              const created = await upsertLecture({
                title: title.trim(),
                courseId,
                transcript: "",
                speedPoints: [],
              });

              // 2) Attach video based on mode
              if (mode === "upload" && file) {
                const durationSec = await getVideoDurationSec(file);

                const ext = safeFileName(file.name);
                const storagePath = `content/lectures/${created.id}/${Date.now()}_${ext}`;

                const res = await upload({ storagePath, file });

                await upsertLecture({
                  id: created.id,
                  title: created.title,
                  courseId,
                  videoUrl: res.downloadUrl,
                  videoSource: "upload",
                  durationSec,
                });
              }

              if (mode === "link") {
                await upsertLecture({
                  id: created.id,
                  title: created.title,
                  courseId,
                  videoUrl: link.trim(),
                  videoSource: "link",
                });
              }

              // Reset
              setTitle("");
              setFile(null);
              setLink("");
              setMode("upload");

              onUploaded();
            } finally {
              setSaving(false);
            }
          }}
        >
          Create Lecture
        </Button>
      </CardContent>
    </Card>
  );
}