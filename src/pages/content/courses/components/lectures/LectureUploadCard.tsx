import React from "react";
import { Card, CardContent, Input, Button } from "../../../../../app/shared";
import { upsertLecture } from "../../../Api/content.api";
import { getVideoDurationSec, safeFileName, isValidHttpUrl } from "../../../utils/video.utils";
import { useFirebaseResumableUpload } from "../../../hooks/useFirebaseResumableUpload";
import VideoSourcePicker from "../../../components/video/VideoSourcePicker";

type Props = {
  courseId: string;
  onUploaded: () => void;
};

export default function LectureUploadCard({ courseId, onUploaded }: Props) {
  const [title, setTitle] = React.useState("");
  const [mode, setMode] = React.useState<"upload" | "link">("upload");
  const [file, setFile] = React.useState<File | null>(null);
  const [link, setLink] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const { upload, cancel, state, progress, error } = useFirebaseResumableUpload();
  const isUploading = state === "uploading";

  const canCreate = title.trim().length > 2 && (mode === "upload" ? Boolean(file) : isValidHttpUrl(link.trim()));

  return (
    <Card>
      <CardContent className="space-y-4 p-4 sm:p-6">
        <div>
          <p className="text-sm font-semibold text-slate-900">Add Lecture</p>
          <p className="text-sm text-slate-500">
            Skill course lectures are direct videos. Upload from device or use a link.
          </p>
        </div>

        <Input
          label="Lecture Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Derivatives basics"
          disabled={saving || isUploading}
        />

        <VideoSourcePicker
          mode={mode}
          onModeChange={setMode}
          file={file}
          onFileChange={setFile}
          link={link}
          onLinkChange={setLink}
          disabled={saving || isUploading}
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

        <Button
          isLoading={saving}
          disabled={!canCreate || saving || isUploading}
          onClick={async () => {
            setSaving(true);
            try {
              const created = await upsertLecture({
                title: title.trim(),
                courseId,
                transcript: "",
                speedPoints: [],
              });

              if (mode === "upload" && file) {
                const durationSec = await getVideoDurationSec(file);
                const safeName = safeFileName(file.name);
                const storagePath = `content/lectures/${created.id}/${Date.now()}_${safeName}`;
                const uploaded = await upload(storagePath, file);

                await upsertLecture({
                  id: created.id,
                  title: created.title,
                  courseId,
                  videoUrl: uploaded.downloadUrl,
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

              setTitle("");
              setFile(null);
              setLink("");
              setMode("upload");
              onUploaded();
            } catch (uploadError) {
              if ((uploadError as { code?: string })?.code !== "storage/canceled") {
                throw uploadError;
              }
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
