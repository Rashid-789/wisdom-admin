
import React from "react";
import { Drawer, Card, CardContent, Input, Button } from "../../../../app/shared";
import type { Subject } from "../../Types/content.types";
import { createBasicSubject, updateBasicSubject } from "../../Api/content.api";
import ImageSourcePicker from "../../components/media/ImageSourcePicker";
import { useFirebaseResumableUpload } from "../../hooks/useFirebaseResumableUpload";
import { isValidHttpUrl, safeFileName } from "../../utils/video.utils";

type Props = {
  open: boolean;
  subject: Subject | null;
  onClose: () => void;
  onSaved: () => void;
};

export default function SubjectFormDrawer({ open, subject, onClose, onSaved }: Props) {
  const isEdit = !!subject;

  const [title, setTitle] = React.useState(subject?.title ?? "");
  const [gradeRange, setGradeRange] = React.useState(subject?.gradeRange ?? "");
  const [coverMode, setCoverMode] = React.useState<"upload" | "link">("upload");
  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [coverUrl, setCoverUrl] = React.useState(subject?.coverImage ?? "");
  const [saving, setSaving] = React.useState(false);

  const { upload, cancel, state, progress, error } = useFirebaseResumableUpload();
  const isUploading = state === "uploading";

  React.useEffect(() => {
    if (!open) return;
    setTitle(subject?.title ?? "");
    setGradeRange(subject?.gradeRange ?? "");
    setCoverFile(null);
    setCoverUrl(subject?.coverImage ?? "");
    setCoverMode(subject?.coverImage ? "link" : "upload");
  }, [subject, open]);

  const hasCoverLink = coverUrl.trim().length > 0;
  const validCoverLink = isValidHttpUrl(coverUrl.trim());
  const canSave =
    title.trim().length > 2 &&
    !isUploading &&
    (coverMode !== "link" || !hasCoverLink || validCoverLink);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Basic Subject" : "Add Basic Subject"}
      description="Basic subjects contain chapters and topics directly."
    >
      <Card>
        <CardContent className="p-4 space-y-3">
          <Input
            label="Subject Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Applied Mathematics"
            disabled={saving || isUploading}
          />
          <Input
            label="Grade Range (optional)"
            value={gradeRange}
            onChange={(e) => setGradeRange(e.target.value)}
            placeholder="Grade 8-9"
            disabled={saving || isUploading}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-900">Thumbnail / Cover (optional)</p>
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
            <Button variant="outline" onClick={onClose} disabled={saving || isUploading}>Cancel</Button>
            <Button
              isLoading={saving}
              disabled={!canSave}
              onClick={async () => {
                setSaving(true);
                try {
                  const linkCoverPayload =
                    coverMode === "link" && hasCoverLink && validCoverLink
                      ? {
                          coverImage: coverUrl.trim(),
                          coverImageSource: "link" as const,
                        }
                      : {};

                  const basePayload = {
                    title: title.trim(),
                    gradeRange: gradeRange.trim() || undefined,
                  };

                  const savedSubject = isEdit
                    ? await updateBasicSubject(subject.id, {
                        ...basePayload,
                        ...linkCoverPayload,
                      })
                    : await createBasicSubject({
                        ...basePayload,
                        ...linkCoverPayload,
                      });

                  if (coverMode === "upload" && coverFile) {
                    try {
                      const safeName = safeFileName(coverFile.name);
                      const storagePath = `content/basic/subjects/${savedSubject.id}/cover/${Date.now()}_${safeName}`;
                      const uploaded = await upload(storagePath, coverFile);
                      await updateBasicSubject(savedSubject.id, {
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
