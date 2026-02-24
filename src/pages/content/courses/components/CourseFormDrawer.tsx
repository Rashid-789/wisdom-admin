import React from "react";
import { Drawer, Card, CardContent, Input, Button, Select } from "../../../../app/shared";
import type { Course, CourseCategory, PublishStatus, Subject } from "../../Types/content.types";
import { createCourse, updateCourse } from "../../Api/content.api";

type Props = {
  open: boolean;
  course: Course | null;
  subjects: Subject[];
  defaultSubjectId?: string;
  lockSubject?: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export default function CourseFormDrawer({
  open,
  course,
  subjects,
  defaultSubjectId,
  lockSubject,
  onClose,
  onSaved,
}: Props) {
  const isEdit = !!course;

  const [title, setTitle] = React.useState(course?.title ?? "");
  const [description, setDescription] = React.useState(course?.description ?? "");
  const [subjectId, setSubjectId] = React.useState(course?.subjectId ?? (defaultSubjectId ?? subjects[0]?.id ?? ""));
  const [category, setCategory] = React.useState<CourseCategory>(course?.category ?? "basic");
  const [status, setStatus] = React.useState<PublishStatus>(course?.status ?? "draft");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    setTitle(course?.title ?? "");
    setDescription(course?.description ?? "");
    setSubjectId(course?.subjectId ?? (defaultSubjectId ?? subjects[0]?.id ?? ""));
    setCategory(course?.category ?? "basic");
    setStatus(course?.status ?? "draft");
  }, [course, subjects, defaultSubjectId]);

  const canSave = title.trim().length > 2 && subjectId;

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Course" : "Add Course"}
      description="Basic = Chapters/Topics. Skill = Direct lecture videos."
    >
      <Card>
        <CardContent className="p-4 space-y-3">
          <Input label="Course Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Trigonometry" />
          <Input label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short summary..." />

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Select
              label="Subject"
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={!!lockSubject}
              options={subjects.map((s) => ({ label: s.title, value: s.id }))}
            />

            <Select
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as CourseCategory)}
              options={[
                { label: "Basic", value: "basic" },
                { label: "Skill", value: "skill" },
              ]}
            />
          </div>

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PublishStatus)}
            options={[
              { label: "Draft", value: "draft" },
              { label: "Published", value: "published" },
              { label: "Scheduled", value: "scheduled" },
            ]}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
            <Button
              isLoading={saving}
              disabled={!canSave}
              onClick={async () => {
                setSaving(true);
                try {
                  if (isEdit) {
                    await updateCourse(course!.id, {
                      title: title.trim(),
                      description: description.trim() || undefined,
                      subjectId,
                      category,
                      status,
                    });
                  } else {
                    await createCourse({
                      title: title.trim(),
                      description: description.trim() || undefined,
                      subjectId,
                      category,
                      status,
                    });
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