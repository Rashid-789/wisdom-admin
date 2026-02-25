import React from "react";
import { Button, Card, CardContent, Drawer, Input } from "../../../../app/shared";
import { createSkillSubject } from "../../Api/content.api";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export default function SkillSubjectFormDrawer({ open, onClose, onSaved }: Props) {
  const [title, setTitle] = React.useState("");
  const [lecturerName, setLecturerName] = React.useState("");
  const [coverImage, setCoverImage] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    setTitle("");
    setLecturerName("");
    setCoverImage("");
  }, [open]);

  const canSave = title.trim().length > 2;

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
            disabled={saving}
          />
          <Input
            label="Cover Image URL (optional)"
            value={coverImage}
            onChange={(event) => setCoverImage(event.target.value)}
            placeholder="https://..."
            disabled={saving}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button
              isLoading={saving}
              disabled={!canSave}
              onClick={async () => {
                setSaving(true);
                try {
                  await createSkillSubject({
                    title: title.trim(),
                    lecturerName: lecturerName.trim() || undefined,
                    coverImage: coverImage.trim() || undefined,
                  });
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
