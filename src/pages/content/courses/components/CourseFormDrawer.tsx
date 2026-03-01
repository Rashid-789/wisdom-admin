import React from "react";
import toast from "react-hot-toast";
import { Button, Card, CardContent, Drawer, Input, Select } from "../../../../app/shared";
import { createCourse, updateCourse } from "../../Api/content.api";
import type { Course, CourseCategory, PublishStatus, SubjectOption } from "../../Types/content.types";
import { useAsyncLock } from "../../hooks/useAsyncLock";
import { getApiErrorMessage } from "../../utils/curriculum.utils";
import ImageSourcePicker from "../../components/media/ImageSourcePicker";
import { useFirebaseResumableUpload } from "../../hooks/useFirebaseResumableUpload";
import { isValidHttpUrl, safeFileName } from "../../utils/video.utils";

type Props = {
  open: boolean;
  course: Course | null;
  defaultCategory?: CourseCategory;
  lockCategory?: boolean;
  onClose: () => void;
  onSaved: () => void | Promise<void>;

  // Legacy props kept optional for compatibility with older callers.
  subjects?: SubjectOption[];
  defaultSubjectId?: string;
  lockSubject?: boolean;
};

export default function CourseFormDrawer({
  open,
  course,
  defaultCategory,
  lockCategory,
  onClose,
  onSaved,
}: Props) {
  const isEdit = Boolean(course);

  const [title, setTitle] = React.useState(course?.title ?? "");
  const [description, setDescription] = React.useState(course?.description ?? "");
  const [category, setCategory] = React.useState<CourseCategory>(course?.category ?? defaultCategory ?? "basic");
  const [status, setStatus] = React.useState<PublishStatus>(course?.status ?? "draft");
  const [gradeRange, setGradeRange] = React.useState(course?.gradeRange ?? "");
  const [lecturerName, setLecturerName] = React.useState(course?.lecturerName ?? "");

  const [coverMode, setCoverMode] = React.useState<"upload" | "link">(
    course?.coverImageSource ?? (course?.coverImage ? "link" : "upload")
  );
  const [coverFile, setCoverFile] = React.useState<File | null>(null);
  const [coverUrl, setCoverUrl] = React.useState(course?.coverImage ?? "");

  const { busy: savingCourse, run: runSaveCourse } = useAsyncLock();

  const { upload, cancel, state, progress, error } = useFirebaseResumableUpload();
  const isUploading = state === "uploading";

  React.useEffect(() => {
    if (!open) return;
    setTitle(course?.title ?? "");
    setDescription(course?.description ?? "");
    setCategory(course?.category ?? defaultCategory ?? "basic");
    setStatus(course?.status ?? "draft");
    setGradeRange(course?.gradeRange ?? "");
    setLecturerName(course?.lecturerName ?? "");
    setCoverMode(course?.coverImageSource ?? (course?.coverImage ? "link" : "upload"));
    setCoverFile(null);
    setCoverUrl(course?.coverImage ?? "");
  }, [open, course, defaultCategory]);

  const hasCoverLink = coverUrl.trim().length > 0;
  const validCoverLink = isValidHttpUrl(coverUrl.trim());
  const busy = savingCourse || isUploading;

  const canSave = title.trim().length > 2 && !busy && (coverMode !== "link" || !hasCoverLink || validCoverLink);

  const handleSave = React.useCallback(async () => {
    if (savingCourse) return;

    try {
      const savedResult = await runSaveCourse(async () => {
        const basePayload: Omit<Course, "id" | "createdAt"> = {
          title: title.trim(),
          description: description.trim() || undefined,
          category,
          status,
          scheduledFor: course?.scheduledFor,
          coverImage: coverMode === "link" && hasCoverLink && validCoverLink ? coverUrl.trim() : undefined,
          coverImageSource: coverMode === "link" && hasCoverLink && validCoverLink ? "link" : undefined,
          gradeRange: category === "basic" ? gradeRange.trim() || undefined : undefined,
          lecturerName: category === "skill" ? lecturerName.trim() || undefined : undefined,
        };

        let saved: Course;

        if (isEdit && course) {
          saved = await updateCourse(course.id, {
            ...basePayload,
            coverImage:
              coverMode === "link"
                ? coverUrl.trim() || undefined
                : !coverFile && !coverUrl.trim()
                  ? undefined
                  : course.coverImage,
            coverImageSource:
              coverMode === "link"
                ? coverUrl.trim()
                  ? "link"
                  : undefined
                : !coverFile && !coverUrl.trim()
                  ? undefined
                  : course.coverImageSource,
          });
        } else {
          saved = await createCourse(basePayload);
        }

        if (coverMode === "upload" && coverFile) {
          const safeName = safeFileName(coverFile.name);
          const storagePath = `content/${saved.category}/courses/${saved.id}/cover/${Date.now()}_${safeName}`;
          const uploaded = await upload(storagePath, coverFile);

          await updateCourse(saved.id, {
            coverImage: uploaded.downloadUrl,
            coverImageSource: "upload",
          });
        }

        await onSaved();
        onClose();
        return true;
      });

      if (savedResult) {
        toast.success("Course saved");
      }
    } catch (saveError) {
      toast.error(getApiErrorMessage(saveError, "Failed to save course"));
    }
  }, [
    category,
    course,
    coverFile,
    coverMode,
    coverUrl,
    description,
    gradeRange,
    hasCoverLink,
    isEdit,
    lecturerName,
    onClose,
    onSaved,
    runSaveCourse,
    savingCourse,
    status,
    title,
    upload,
    validCoverLink,
  ]);

  return (
    <Drawer
      open={open}
      onClose={() => {
        if (savingCourse) return;
        onClose();
      }}
      title={isEdit ? "Edit Course" : "Add Course"}
      description="Create and manage courses with chapters and topics."
    >
      <Card>
        <CardContent className="space-y-3 p-4">
          <Input
            label="Course Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Trigonometry"
            disabled={busy}
          />

          <Input
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Short summary..."
            disabled={busy}
          />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as CourseCategory)}
              disabled={Boolean(lockCategory) || isEdit || busy}
              options={[
                { label: "Basic", value: "basic" },
                { label: "Skill", value: "skill" },
              ]}
            />

            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as PublishStatus)}
              disabled={busy}
              options={[
                { label: "Draft", value: "draft" },
                { label: "Published", value: "published" },
                { label: "Scheduled", value: "scheduled" },
              ]}
            />
          </div>

          {category === "basic" ? (
            <Input
              label="Grade Range (optional)"
              value={gradeRange}
              onChange={(e) => setGradeRange(e.target.value)}
              placeholder="Grade 7-8"
              disabled={busy}
            />
          ) : (
            <Input
              label="Lecturer Name (optional)"
              value={lecturerName}
              onChange={(e) => setLecturerName(e.target.value)}
              placeholder="John Doe"
              disabled={busy}
            />
          )}

          <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-4">
            <p className="text-sm font-medium text-slate-900">Cover Thumbnail (optional)</p>

            <ImageSourcePicker
              mode={coverMode}
              onModeChange={setCoverMode}
              file={coverFile}
              onFileChange={setCoverFile}
              link={coverUrl}
              onLinkChange={setCoverUrl}
              disabled={busy}
            />

            {coverUrl ? (
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <img src={coverUrl} alt="Course cover" className="h-16 w-16 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-600">
                      Source: <span className="font-medium">{coverMode}</span>
                    </p>
                    <a
                      href={coverUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block truncate text-xs text-slate-600 underline"
                    >
                      {coverUrl}
                    </a>
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <Button
                    variant="outline"
                    disabled={busy}
                    onClick={() => {
                      setCoverUrl("");
                      setCoverFile(null);
                    }}
                  >
                    Remove cover
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No cover attached yet.</p>
            )}

            {isUploading ? (
              <div className="space-y-2 rounded-2xl border border-slate-100 bg-white p-4">
                <div className="flex items-center justify-between text-sm text-slate-700">
                  <span>Uploading cover...</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-slate-900" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={cancel} disabled={savingCourse}>
                    Cancel upload
                  </Button>
                </div>
              </div>
            ) : null}

            {error ? <p className="text-xs text-red-600">{error}</p> : null}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button isLoading={savingCourse} disabled={!canSave} onClick={() => void handleSave()}>
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </Drawer>
  );
}
