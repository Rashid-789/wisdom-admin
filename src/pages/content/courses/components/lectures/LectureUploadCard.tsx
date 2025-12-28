import React from "react";
import { Card, CardContent, Input, Button } from "../../../../../app/shared";
import { upsertLecture } from "../../../Api/content.api";

/**
 * Later you will:
 * - upload file to Firebase Storage
 * - store videoUrl + metadata in Firestore
 */
export default function LectureUploadCard({
  courseId,
  onUploaded,
}: {
  courseId: string;
  onUploaded: () => void;
}) {
  const [title, setTitle] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  return (
    <Card>
      <CardContent className="p-4 sm:p-6 space-y-3">
        <p className="text-sm font-semibold text-slate-900">Upload Lecture</p>
        <p className="text-sm text-slate-500">Create a lecture record (video upload can be wired later).</p>

        <Input label="Lecture Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Derivatives basics" />

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-900">Video file (optional)</span>
          <input type="file" className="block w-full text-sm" />
          <span className="mt-1 block text-xs text-slate-500">Firebase Storage integration later.</span>
        </label>

        <Button
          isLoading={saving}
          disabled={!title.trim()}
          onClick={async () => {
            setSaving(true);
            try {
              await upsertLecture({ title: title.trim(), courseId, transcript: "", speedPoints: [] });
              setTitle("");
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

