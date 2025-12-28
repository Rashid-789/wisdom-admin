
import React from "react";
import { Drawer, Card, CardContent, Input, Button } from "../../../../app/shared";
import type { Subject } from "../../Types/content.types";
import { createSubject, updateSubject } from "../../Api/content.api";

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
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setTitle(subject?.title ?? "");
    setGradeRange(subject?.gradeRange ?? "");
  }, [subject]);

  const canSave = title.trim().length > 2;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Subject" : "Add Subject"}
      description="Subjects group courses (e.g., Mathematics, Physics)"
    >
      <Card>
        <CardContent className="p-4 space-y-3">
          <Input label="Subject Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Applied Mathematics" />
          <Input label="Grade Range (optional)" value={gradeRange} onChange={(e) => setGradeRange(e.target.value)} placeholder="Grade 8-9" />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button
              isLoading={saving}
              disabled={!canSave}
              onClick={async () => {
                setSaving(true);
                try {
                  if (isEdit) await updateSubject(subject!.id, { title: title.trim(), gradeRange: gradeRange.trim() || undefined });
                  else await createSubject({ title: title.trim(), gradeRange: gradeRange.trim() || undefined });
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
