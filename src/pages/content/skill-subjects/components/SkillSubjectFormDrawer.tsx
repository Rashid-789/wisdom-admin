import React from "react";
import { Button, Card, CardContent, Drawer, Input } from "../../../../app/shared";
import { createSkillSubject, updateSkillSubject } from "../../Api/content.api";
import ImageSourcePicker from "../../components/media/ImageSourcePicker";
import { useFirebaseResumableUpload } from "../../hooks/useFirebaseResumableUpload";
import { isValidHttpUrl, safeFileName } from "../../utils/video.utils";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export default function SkillSubjectFormDrawer({ open, onClose, onSaved }: Props) {
  const [title, setTitle] = React.useState("");
  const [lecturerName, setLecturerName] = React.useState("");
  const [coverMode, setCoverMode] = React.useState<"upload" | "link">("upload");
  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [coverUrl, setCoverUrl] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const { upload, cancel, state, progress, error } = useFirebaseResumableUpload();
  const isUploading = state === "uploading";

  React.useEffect(() => {
    if (!open) return;
    setTitle("");
    setLecturerName("");
    setCoverMode("upload");
    setCoverFile(null);
    setCoverUrl("");
  }, [open]);

  const validCoverLink = isValidHttpUrl(coverUrl.trim());
  const hasCoverLink = coverUrl.trim().length > 0;
  const canSave =
    title.trim().length > 2 &&
    !isUploading &&
    (coverMode !== "link" || !hasCoverLink || validCoverLink);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Add Skill Subject"
      description="Create a skill subject that directly contains video topics."
    >
      <Card>
        <CardContent className="space-y-3 p-4">
          <Input
            label="Subject Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Public Speaking"
            disabled={saving}
          />
          <Input
            label="Lecturer Name (optional)"
            value={lecturerName}
            onChange={(event) => setLecturerName(event.target.value)}
            placeholder="John Doe"
            disabled={saving || isUploading}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-900">Cover Thumbnail (optional)</p>
            <ImageSourcePicker
              mode={coverMode}
              onModeChange={setCoverMode}
              file={coverFile}
              onFileChange={setCoverFile}
              link={coverUrl}
              onLinkChange={setCoverUrl}
              disabled={saving || isUploading}
            />
          </div>

          {isUploading ? (
            <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-4">
              <div className="flex items-center justify-between text-sm text-slate-700">
                <span>Uploading thumbnail...</span>
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

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving || isUploading}>
              Cancel
            </Button>
            <Button
              isLoading={saving}
              disabled={!canSave}
              onClick={async () => {
                setSaving(true);
                try {
                  const baseCoverImage =
                    coverMode === "link" && validCoverLink ? coverUrl.trim() : undefined;

                  const created = await createSkillSubject({
                    title: title.trim(),
                    lecturerName: lecturerName.trim() || undefined,
                    coverImage: baseCoverImage,
                    coverImageSource: baseCoverImage ? "link" : undefined,
                  });

                  if (coverMode === "upload" && coverFile) {
                    try {
                      const safeName = safeFileName(coverFile.name);
                      const storagePath = `content/skill/subjects/${created.id}/cover/${Date.now()}_${safeName}`;
                      const uploaded = await upload(storagePath, coverFile);
                      await updateSkillSubject(created.id, {
                        coverImage: uploaded.downloadUrl,
                        coverImageSource: "upload",
                      });
                    } catch (uploadError) {
                      if ((uploadError as { code?: string })?.code !== "storage/canceled") {
                        throw uploadError;
                      }
                    }
                  }

                  onSaved();
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
    </Drawer>
  );
}
